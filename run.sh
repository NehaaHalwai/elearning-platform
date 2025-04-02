#!/bin/bash

# Start MongoDB (if not already running)
echo "Starting MongoDB..."
mongod --dbpath ./data/db &

# Start Redis (if not already running)
echo "Starting Redis..."
redis-server &

# Start backend services
echo "Starting backend services..."
cd backend && python -m uvicorn main:app --reload --port 8000 &
cd ../recommendations && python -m uvicorn service:app --reload --port 8001 &
cd ../chatbot && python -m uvicorn service:app --reload --port 8002 &
cd ../analytics && python -m uvicorn service:app --reload --port 8003 &

# Start frontend
echo "Starting frontend..."
cd ../frontend && npm start

# Wait for all background processes
wait 