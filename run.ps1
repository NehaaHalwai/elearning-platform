# Start MongoDB (if not already running)
Write-Host "Starting MongoDB..."
Start-Process mongod -ArgumentList "--dbpath ./data/db" -NoNewWindow

# Start Redis (if not already running)
Write-Host "Starting Redis..."
Start-Process redis-server -NoNewWindow

# Start backend services
Write-Host "Starting backend services..."
Start-Process python -ArgumentList "-m uvicorn main:app --reload --port 8000" -WorkingDirectory "./backend" -NoNewWindow
Start-Process python -ArgumentList "-m uvicorn service:app --reload --port 8001" -WorkingDirectory "./recommendations" -NoNewWindow
Start-Process python -ArgumentList "-m uvicorn service:app --reload --port 8002" -WorkingDirectory "./chatbot" -NoNewWindow
Start-Process python -ArgumentList "-m uvicorn service:app --reload --port 8003" -WorkingDirectory "./analytics" -NoNewWindow

# Start frontend
Write-Host "Starting frontend..."
Set-Location "./frontend"
npm start

# Update pip first
python -m pip install --upgrade pip

# Install dependencies for each service
cd backend
pip install -r requirements.txt
cd ../recommendations
pip install -r requirements.txt
cd ../chatbot
pip install -r requirements.txt
cd ../analytics
pip install -r requirements.txt 