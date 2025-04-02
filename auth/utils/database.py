from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from dotenv import load_dotenv
import os
from typing import Any

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

# Create Motor client
client = None  
database = None  

async def connect_to_mongo():
    global client, database
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        if client is not None:
            database = client.elearning_db
            await client.admin.command('ping')
        print("Connected to MongoDB!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("MongoDB connection closed!")

def get_database():  
    global database
    if database is None:
        raise Exception("Database not initialized")
    return database

def get_collection(collection_name: str) -> Any:
    db = get_database()
    return db[collection_name]