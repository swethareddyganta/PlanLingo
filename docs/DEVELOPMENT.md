# Development Guide

## Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Python 3.11+
- Git

## Quick Start

1. **Clone and navigate to project:**
   ```bash
   git clone <repository-url>
   cd daily-flow
   ```

2. **Start development environment:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Local Development (without Docker)

### Backend

1. **Setup virtual environment:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server:**
   ```bash
   python -m uvicorn app.main:app --reload
   ```

### Frontend

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

## Database Setup

The docker-compose setup includes PostgreSQL and Redis. For local development:

1. **Install PostgreSQL and Redis locally**
2. **Create database:**
   ```sql
   CREATE DATABASE dailyflow;
   CREATE USER dailyflow_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE dailyflow TO dailyflow_user;
   ```

3. **Update DATABASE_URL in .env file**

## API Documentation

- Interactive API docs: http://localhost:8000/docs
- ReDoc documentation: http://localhost:8000/redoc
- OpenAPI schema: http://localhost:8000/api/v1/openapi.json

## Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Code Quality

### Backend
```bash
cd backend
python -m flake8 app/
python -m black app/
```

### Frontend
```bash
cd frontend
npm run lint
npm run type-check
```

## Project Structure

```
daily-flow/
├── frontend/          # React TypeScript application
├── backend/           # FastAPI Python server
├── infrastructure/    # Deployment configurations
├── docs/             # Documentation
├── .github/          # CI/CD workflows
├── docker-compose.yml # Development environment
└── README.md         # Project overview
```

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY`: JWT secret key
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `GOOGLE_CLIENT_ID`: OAuth client ID
- `GOOGLE_CLIENT_SECRET`: OAuth client secret

### Frontend
- `VITE_API_URL`: Backend API URL (default: http://localhost:8000)

## Contributing

1. Create feature branch from `develop`
2. Make changes with tests
3. Run quality checks
4. Submit pull request
5. Ensure CI passes
