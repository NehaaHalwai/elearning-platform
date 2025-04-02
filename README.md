# PHN Platform - AI-Powered E-Learning Platform

An intelligent e-learning platform that provides personalized learning experiences using AI and machine learning.

## Features

- AI-Driven Course Recommendations
- Automated Content Summarization & Notes Generation
- AI-Based Chatbot for Tutoring & Q&A
- Real-Time Student Performance Analytics
- Gamification & Reward System

## Tech Stack

- Frontend: React with TypeScript
- Backend: Python FastAPI
- Database: MongoDB
- Caching: Redis
- AI/ML: TensorFlow, Scikit-Learn, Hugging Face Transformers
- Containerization: Docker & Docker Compose
- Authentication: JWT with OAuth

## Prerequisites

- Docker and Docker Compose
- Python 3.11+
- Node.js 16+
- MongoDB
- Redis
- Google Cloud API Key (for Gemini AI)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URL=mongodb://localhost:27017
REDIS_URL=redis://localhost:6379
GOOGLE_API_KEY=your_google_api_key
JWT_SECRET=your_jwt_secret
```

## Project Structure

```
phn-platform/
├── frontend/           # React frontend application
├── backend/           # Main backend service
├── recommendations/   # AI course recommendations service
├── chatbot/          # AI chatbot service
├── analytics/        # Student analytics service
├── common/           # Shared utilities and models
├── infrastructure/   # Infrastructure configurations
└── docs/            # Documentation
```

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/phn-platform.git
cd phn-platform
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Build and run the services using Docker Compose:
```bash
docker-compose up --build
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Recommendations API: http://localhost:8001
- Chatbot API: http://localhost:8002
- Analytics API: http://localhost:8003

## Development

### Frontend Development

```bash
cd frontend
npm install
npm start
```

### Backend Development

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
pytest
```

## API Documentation

Once the services are running, you can access the API documentation at:
- Backend: http://localhost:8000/docs
- Recommendations: http://localhost:8001/docs
- Chatbot: http://localhost:8002/docs
- Analytics: http://localhost:8003/docs

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- FastAPI for the backend framework
- React for the frontend framework
- MongoDB for the database
- Google Cloud for the Gemini AI model
- All other open-source libraries used in this project 