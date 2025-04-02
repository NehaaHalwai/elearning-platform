from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import google.generativeai as genai
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AI Chatbot Service",
    description="GPT-based chatbot for educational Q&A assistance",
    version="1.0.0"
)

# Configure Gemini AI
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.phn_platform

class ChatMessage(BaseModel):
    user_id: str
    message: str
    course_id: Optional[str] = None
    context: Optional[List[str]] = None

class ChatResponse(BaseModel):
    message: str
    sources: Optional[List[str]] = None
    confidence: float

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Chatbot Service"}

@app.post("/api/chat")
async def chat(message: ChatMessage):
    try:
        # Get course context if course_id is provided
        context = ""
        if message.course_id:
            course = await db.courses.find_one({"_id": message.course_id})
            if course:
                context = f"Course: {course['title']}\nDescription: {course['description']}\nTopics: {', '.join(course['topics'])}\n\n"
        
        # Add previous context if provided
        if message.context:
            context += "Previous conversation:\n" + "\n".join(message.context) + "\n\n"
        
        # Prepare prompt
        prompt = f"""
        {context}
        You are an educational AI assistant. Please provide a helpful and accurate response to the following question:
        {message.message}
        
        If you need to reference specific course materials or concepts, please do so explicitly.
        If you're not sure about something, please say so rather than making assumptions.
        """
        
        # Generate response using Gemini
        response = model.generate_content(prompt)
        
        # Extract sources from response if any
        sources = []
        if "source:" in response.text.lower():
            # Simple source extraction - can be improved
            for line in response.text.split('\n'):
                if "source:" in line.lower():
                    sources.append(line.strip())
        
        return ChatResponse(
            message=response.text,
            sources=sources if sources else None,
            confidence=0.9  # Placeholder confidence score
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/summarize")
async def summarize_content(content: str):
    try:
        prompt = f"""
        Please provide a concise summary of the following educational content:
        {content}
        
        Focus on the key points and main concepts. Use bullet points for better readability.
        """
        
        response = model.generate_content(prompt)
        
        return {
            "summary": response.text,
            "confidence": 0.9
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/generate-flashcards")
async def generate_flashcards(content: str, num_cards: int = 5):
    try:
        prompt = f"""
        Generate {num_cards} flashcards from the following educational content:
        {content}
        
        Format each flashcard as:
        Front: [Question/Concept]
        Back: [Answer/Explanation]
        
        Make the questions challenging but fair, and ensure the answers are clear and concise.
        """
        
        response = model.generate_content(prompt)
        
        # Parse flashcards from response
        flashcards = []
        current_card = {"front": "", "back": ""}
        
        for line in response.text.split('\n'):
            if line.startswith("Front:"):
                if current_card["front"] and current_card["back"]:
                    flashcards.append(current_card)
                current_card = {"front": line[6:].strip(), "back": ""}
            elif line.startswith("Back:"):
                current_card["back"] = line[5:].strip()
        
        if current_card["front"] and current_card["back"]:
            flashcards.append(current_card)
        
        return {
            "flashcards": flashcards,
            "confidence": 0.9
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002) 