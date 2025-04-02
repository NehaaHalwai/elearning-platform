from fastapi import FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict, Optional
import numpy as np
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Analytics Service",
    description="AI-powered analytics for student performance tracking and insights",
    version="1.0.0"
)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.phn_platform

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Analytics Service"}

@app.get("/api/analytics/student/{student_id}")
async def get_student_analytics(student_id: str):
    try:
        # Get student's progress across all courses
        progress = await db.student_progress.find(
            {"student_id": student_id}
        ).to_list(length=None)
        
        if not progress:
            return {
                "message": "No progress data found for this student",
                "overall_progress": 0,
                "courses": []
            }
        
        # Calculate overall progress
        overall_progress = np.mean([p["overall_progress"] for p in progress])
        
        # Get detailed course analytics
        courses = []
        for p in progress:
            course = await db.courses.find_one({"_id": p["course_id"]})
            if course:
                courses.append({
                    "course_id": course["_id"],
                    "title": course["title"],
                    "progress": p["overall_progress"],
                    "completed_modules": len(p["completed_modules"]),
                    "quiz_scores": p["quiz_scores"],
                    "average_quiz_score": np.mean([q["score"] for q in p["quiz_scores"]]) if p["quiz_scores"] else 0
                })
        
        return {
            "overall_progress": float(overall_progress),
            "courses": courses
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/course/{course_id}")
async def get_course_analytics(course_id: str):
    try:
        # Get all student progress for this course
        progress = await db.student_progress.find(
            {"course_id": course_id}
        ).to_list(length=None)
        
        if not progress:
            return {
                "message": "No progress data found for this course",
                "total_students": 0,
                "average_progress": 0,
                "completion_rate": 0
            }
        
        # Calculate course statistics
        total_students = len(progress)
        average_progress = np.mean([p["overall_progress"] for p in progress])
        completion_rate = len([p for p in progress if p["overall_progress"] >= 0.8]) / total_students
        
        # Get course details
        course = await db.courses.find_one({"_id": course_id})
        
        return {
            "course_id": course_id,
            "title": course["title"] if course else "Unknown Course",
            "total_students": total_students,
            "average_progress": float(average_progress),
            "completion_rate": float(completion_rate),
            "progress_distribution": {
                "0-20%": len([p for p in progress if 0 <= p["overall_progress"] < 0.2]),
                "20-40%": len([p for p in progress if 0.2 <= p["overall_progress"] < 0.4]),
                "40-60%": len([p for p in progress if 0.4 <= p["overall_progress"] < 0.6]),
                "60-80%": len([p for p in progress if 0.6 <= p["overall_progress"] < 0.8]),
                "80-100%": len([p for p in progress if p["overall_progress"] >= 0.8])
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/student-clusters")
async def get_student_clusters(n_clusters: int = 3):
    try:
        # Get all student progress
        progress = await db.student_progress.find().to_list(length=None)
        
        if not progress:
            return {
                "message": "No progress data found",
                "clusters": []
            }
        
        # Prepare data for clustering
        features = []
        student_ids = []
        
        for p in progress:
            features.append([
                p["overall_progress"],
                len(p["completed_modules"]),
                np.mean([q["score"] for q in p["quiz_scores"]]) if p["quiz_scores"] else 0
            ])
            student_ids.append(p["student_id"])
        
        # Normalize features
        scaler = StandardScaler()
        features_normalized = scaler.fit_transform(features)
        
        # Perform clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        clusters = kmeans.fit_predict(features_normalized)
        
        # Analyze clusters
        cluster_analysis = []
        for i in range(n_clusters):
            cluster_students = [student_ids[j] for j in range(len(clusters)) if clusters[j] == i]
            cluster_features = [features[j] for j in range(len(clusters)) if clusters[j] == i]
            
            cluster_analysis.append({
                "cluster_id": i,
                "size": len(cluster_students),
                "average_progress": float(np.mean([f[0] for f in cluster_features])),
                "average_completed_modules": float(np.mean([f[1] for f in cluster_features])),
                "average_quiz_score": float(np.mean([f[2] for f in cluster_features])),
                "student_ids": cluster_students
            })
        
        return {
            "clusters": cluster_analysis
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/performance-predictions/{student_id}")
async def get_performance_predictions(student_id: str):
    try:
        # Get student's historical progress
        progress = await db.student_progress.find(
            {"student_id": student_id}
        ).to_list(length=None)
        
        if not progress:
            return {
                "message": "No progress data found for this student",
                "predictions": []
            }
        
        # Calculate historical performance metrics
        historical_data = []
        for p in progress:
            course = await db.courses.find_one({"_id": p["course_id"]})
            if course:
                historical_data.append({
                    "course_difficulty": len(course["topics"]),  # Simple difficulty metric
                    "completion_rate": p["overall_progress"],
                    "quiz_scores": [q["score"] for q in p["quiz_scores"]]
                })
        
        # Simple prediction model (can be replaced with more sophisticated ML models)
        predictions = []
        for course in await db.courses.find().to_list(length=None):
            if course["_id"] not in [p["course_id"] for p in progress]:
                # Calculate predicted performance based on historical data
                avg_completion = np.mean([d["completion_rate"] for d in historical_data])
                avg_quiz_score = np.mean([np.mean(d["quiz_scores"]) for d in historical_data])
                
                # Adjust prediction based on course difficulty
                difficulty_factor = len(course["topics"]) / np.mean([d["course_difficulty"] for d in historical_data])
                
                predicted_completion = avg_completion * (1 / difficulty_factor)
                predicted_quiz_score = avg_quiz_score * (1 / difficulty_factor)
                
                predictions.append({
                    "course_id": course["_id"],
                    "title": course["title"],
                    "predicted_completion_rate": float(min(predicted_completion, 1.0)),
                    "predicted_quiz_score": float(min(predicted_quiz_score, 100.0))
                })
        
        return {
            "predictions": predictions
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003) 