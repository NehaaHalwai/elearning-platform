from fastapi import FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import torch
import torch.nn as nn
from typing import List, Dict
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Course Recommendations Service",
    description="AI-powered course recommendations using collaborative filtering and deep learning",
    version="1.0.0"
)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.phn_platform

# Neural Network for Collaborative Filtering
class CourseRecommender(nn.Module):
    def __init__(self, n_users, n_courses, n_factors=100):
        super().__init__()
        self.user_factors = nn.Embedding(n_users, n_factors)
        self.course_factors = nn.Embedding(n_courses, n_factors)
        self.dropout = nn.Dropout(0.1)
        self.fc = nn.Linear(n_factors * 2, 1)
        
    def forward(self, user_ids, course_ids):
        user_embeds = self.user_factors(user_ids)
        course_embeds = self.course_factors(course_ids)
        x = torch.cat([user_embeds, course_embeds], dim=1)
        x = self.dropout(x)
        return self.fc(x).squeeze()

# Initialize the model
model = CourseRecommender(1000, 1000)  # Placeholder dimensions
model.load_state_dict(torch.load('recommendations/model_weights.pth'))
model.eval()

# TF-IDF Vectorizer for content-based filtering
vectorizer = TfidfVectorizer(stop_words='english')

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Course Recommendations Service"}

@app.get("/api/recommendations/{user_id}")
async def get_recommendations(user_id: str, limit: int = 10):
    try:
        # Get user's course history
        user_progress = await db.student_progress.find(
            {"student_id": user_id}
        ).to_list(length=None)
        
        if not user_progress:
            # If no history, return popular courses
            popular_courses = await db.courses.find().sort(
                "enrollment_count", -1
            ).limit(limit).to_list(length=None)
            return {"recommendations": popular_courses}
        
        # Get all courses
        all_courses = await db.courses.find().to_list(length=None)
        
        # Prepare course descriptions for content-based filtering
        course_descriptions = [course["description"] for course in all_courses]
        tfidf_matrix = vectorizer.fit_transform(course_descriptions)
        
        # Calculate cosine similarity
        cosine_sim = cosine_similarity(tfidf_matrix)
        
        # Get user's completed courses
        completed_courses = [progress["course_id"] for progress in user_progress]
        
        # Get course indices
        course_indices = {course["_id"]: idx for idx, course in enumerate(all_courses)}
        
        # Calculate recommendation scores
        scores = []
        for idx, course in enumerate(all_courses):
            if course["_id"] not in completed_courses:
                # Content-based score
                content_score = np.mean([
                    cosine_sim[course_indices[course["_id"]]][course_indices[comp_course]]
                    for comp_course in completed_courses
                ]) if completed_courses else 0
                
                # Collaborative filtering score
                collab_score = model(
                    torch.tensor([int(user_id)]),
                    torch.tensor([idx])
                ).item()
                
                # Combined score
                combined_score = 0.7 * content_score + 0.3 * collab_score
                scores.append((course, combined_score))
        
        # Sort by score and get top recommendations
        recommendations = [
            course for course, _ in sorted(scores, key=lambda x: x[1], reverse=True)
        ][:limit]
        
        return {"recommendations": recommendations}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/similar-courses/{course_id}")
async def get_similar_courses(course_id: str, limit: int = 5):
    try:
        # Get all courses
        all_courses = await db.courses.find().to_list(length=None)
        
        # Get target course
        target_course = next(
            (course for course in all_courses if course["_id"] == course_id),
            None
        )
        
        if not target_course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Prepare course descriptions
        course_descriptions = [course["description"] for course in all_courses]
        tfidf_matrix = vectorizer.fit_transform(course_descriptions)
        
        # Calculate cosine similarity
        cosine_sim = cosine_similarity(tfidf_matrix)
        
        # Get course index
        course_indices = {course["_id"]: idx for idx, course in enumerate(all_courses)}
        target_idx = course_indices[course_id]
        
        # Get similar courses
        similar_scores = list(enumerate(cosine_sim[target_idx]))
        similar_scores = sorted(similar_scores, key=lambda x: x[1], reverse=True)
        similar_scores = similar_scores[1:limit+1]
        
        similar_courses = [
            all_courses[idx] for idx, _ in similar_scores
        ]
        
        return {"similar_courses": similar_courses}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 