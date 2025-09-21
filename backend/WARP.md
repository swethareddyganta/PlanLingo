# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Daily Flow is a FastAPI-based backend service that transforms vague daily intentions into structured timetables using AI. It provides APIs for user authentication, intent parsing, plan generation, goal tracking, and progress visualization.

## Development Commands

### Running the Application

```bash
# Development server with hot reload
npm run dev
# or directly with Python
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production server
npm run start
# or with multiple workers
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Simple test server (for quick testing)
python simple_main.py
# or
python working_server.py
```

### Testing

```bash
# Run all tests
npm run test
# or
python -m pytest tests/

# Run specific test file
python -m pytest tests/test_auth.py -v

# Run with coverage
python -m pytest tests/ --cov=app --cov-report=html
```

### Code Quality

```bash
# Lint code
npm run lint
# or
python -m flake8 app/ tests/

# Format code
npm run format
# or
python -m black app/ tests/

# Type checking (if mypy is installed)
python -m mypy app/
```

### Database Operations

```bash
# Create new migration (when using Alembic)
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Access database directly (SQLite in development)
sqlite3 dailyflow.db
```

### Docker Operations

```bash
# Build Docker image
docker build -t daily-flow-backend .

# Run container
docker run -p 8000:8000 --env-file .env daily-flow-backend

# Development with Docker
docker build -f Dockerfile.dev -t daily-flow-backend-dev .
docker run -p 8000:8000 -v $(pwd):/app --env-file .env daily-flow-backend-dev
```

## Architecture

### Core Components

The application follows a layered architecture with clear separation of concerns:

1. **API Layer** (`app/api/`)
   - `routes.py`: Main API router aggregating all endpoint routers
   - `endpoints/`: Individual endpoint modules (auth, users, intents, plans, goals)

2. **Models Layer** (`app/models/`)
   - `base.py`: Base model class with common fields (id, created_at, updated_at)
   - `user.py`: User model with OAuth support and preferences
   - `intent.py`: Raw user intention storage with parsing metadata
   - `plan.py`: Generated daily plans with time blocks
   - `goal.py`: Goal definitions and daily check-ins
   - `misc.py`: Additional models (reminders, reports, event logs)

3. **Core Layer** (`app/core/`)
   - `config.py`: Centralized configuration using Pydantic settings
   - `database.py`: Database connection and session management

4. **Services Layer** (`app/services/`)
   - Business logic for authentication, AI processing, and data operations

### Key Data Flow

1. **Intent Processing Pipeline**:
   - User submits raw text intention → stored in `intents` table
   - Background job processes with OpenAI API → generates parsed JSON
   - Parsed data transforms into `Plan` with time-blocked `Block` entries
   - Plans link back to original intent for traceability

2. **Authentication Flow**:
   - Supports both local (email/password) and OAuth (Google) authentication
   - JWT tokens for session management with refresh token support
   - User preferences and timezone stored for personalization

3. **Goal Tracking System**:
   - Goals define targets (duration, boolean, value, count types)
   - Daily `GoalCheck` entries track progress
   - Streak counting and completion statistics maintained

### Database Schema

The application uses SQLAlchemy ORM with PostgreSQL (production) or SQLite (development):

- **Users**: Central user entity with auth details and preferences
- **Intents**: Raw user input with AI parsing results
- **Plans**: Daily schedules with version tracking
- **Blocks**: Individual time blocks within plans
- **Goals**: User-defined objectives with tracking metadata
- **GoalChecks**: Daily progress entries for goals

All models inherit from `BaseModel` providing:
- Auto-incrementing primary key
- Created/updated timestamps
- Soft delete capability (if implemented)

### AI Integration

The system integrates with OpenAI API for:
- Natural language intent parsing
- Schedule optimization
- Intelligent break insertion
- Wellness suggestions

API key configured via `OPENAI_API_KEY` environment variable.

## Configuration

### Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Key configuration variables:
- `DATABASE_URL`: PostgreSQL connection string (defaults to SQLite)
- `REDIS_URL`: Redis connection for caching/sessions
- `SECRET_KEY`: JWT signing key (auto-generated if not set)
- `OPENAI_API_KEY`: Required for AI features
- `GOOGLE_CLIENT_ID/SECRET`: OAuth configuration
- `SMTP_*`: Email service configuration

### Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- CORS middleware with configurable origins
- Trusted host validation
- OAuth 2.0 integration ready

## API Documentation

When running, access interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI Schema: `http://localhost:8000/api/v1/openapi.json`

## Development Workflow

1. **Adding New Features**:
   - Create model in `app/models/`
   - Add schema in `app/schemas/`
   - Implement service logic in `app/services/`
   - Create endpoint in `app/api/endpoints/`
   - Register router in `app/api/routes.py`

2. **Database Changes**:
   - Modify model files
   - Generate migration (if using Alembic)
   - Test locally with SQLite
   - Apply to production PostgreSQL

3. **Testing Strategy**:
   - Unit tests for services
   - Integration tests for API endpoints
   - Use `pytest-asyncio` for async code
   - Mock external services (OpenAI, email)

## Dependencies

Core dependencies managed in `requirements.txt`:
- FastAPI for web framework
- SQLAlchemy for ORM
- Pydantic for data validation
- Celery for background tasks
- Redis for caching
- OpenAI for AI features

Development tools available via npm scripts for convenience.
