# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Daily Flow is a full-stack web application that transforms vague daily intentions into structured timetables using AI. It consists of a React TypeScript frontend, FastAPI Python backend, and PostgreSQL/Redis infrastructure, all containerized with Docker.

## Quick Start Commands

### Full-Stack Development

```bash
# Start entire development stack with Docker
docker-compose up -d

# Start both frontend and backend locally (requires npm dependencies)
npm run dev

# Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Backend Commands

```bash
# Run backend server
cd backend && npm run dev
# or directly
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
cd backend && npm run test
# or specific test
python -m pytest tests/test_auth.py -v

# Run with coverage
python -m pytest tests/ --cov=app --cov-report=html

# Lint and format
cd backend && npm run lint
cd backend && npm run format
```

### Frontend Commands

```bash
# Run frontend development server
cd frontend && npm run dev

# Build production bundle
cd frontend && npm run build

# Run linting and type checking
cd frontend && npm run lint

# Preview production build
cd frontend && npm run preview
```

### Database Operations

```bash
# Create Alembic migration
cd backend && alembic revision --autogenerate -m "Description"

# Apply migrations
cd backend && alembic upgrade head

# Rollback migration
cd backend && alembic downgrade -1

# Access SQLite database (development)
sqlite3 backend/dailyflow.db

# Access PostgreSQL (Docker)
docker exec -it dailyflow-postgres psql -U dailyflow_user -d dailyflow
```

### Docker Operations

```bash
# Build and start all services
docker-compose up --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Stop and remove volumes (clean reset)
docker-compose down -v
```

## Architecture

### System Overview

The application follows a microservices architecture with clear separation between frontend, backend, and data layers:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend    │────▶│  PostgreSQL │
│   (React)   │     │   (FastAPI)  │     └─────────────┘
└─────────────┘     └──────────────┘            │
                           │                     ▼
                           ▼              ┌─────────────┐
                    ┌──────────────┐     │    Redis    │
                    │  OpenAI API  │     └─────────────┘
                    └──────────────┘
```

### Backend Architecture

**Core Layers:**

1. **API Layer** (`app/api/`)
   - Main router aggregation in `routes.py`
   - RESTful endpoints: `/auth`, `/users`, `/intents`, `/plans`, `/goals`
   - JWT authentication with refresh tokens
   - CORS middleware for frontend integration

2. **Models Layer** (`app/models/`)
   - SQLAlchemy ORM models with base inheritance
   - Key entities: User, Intent, Plan, Block, Goal, GoalCheck
   - Automatic timestamps and soft-delete support

3. **Services Layer** (`app/services/`)
   - Business logic separated from API endpoints
   - OpenAI integration for NLP processing
   - Authentication service with OAuth support

4. **Core Layer** (`app/core/`)
   - Centralized configuration via Pydantic settings
   - Database session management
   - Security utilities

### Frontend Architecture

**Tech Stack:**
- React 18 with TypeScript
- Vite for blazing fast HMR
- Tailwind CSS with shadcn/ui components
- Zustand for state management
- React Query for server state synchronization
- Recharts for data visualization

**Key Components:**
- `Dashboard.tsx`: Main application view
- `PlannerInterface.tsx`: Daily planning UI
- `GoalTracker.tsx`: Goal progress visualization
- `ui/`: Reusable component library

### Data Flow

1. **Intent Processing Pipeline:**
   ```
   User Input → Intent Storage → OpenAI Processing → 
   Plan Generation → Time Block Creation → UI Rendering
   ```

2. **Goal Tracking System:**
   ```
   Goal Definition → Daily Check-ins → Streak Calculation → 
   Progress Visualization → Weekly Reports
   ```

## Configuration

### Environment Setup

```bash
# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/dailyflow
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Frontend (env variables)
VITE_API_URL=http://localhost:8000
```

### Key Configuration Files

- `backend/.env`: Backend environment variables
- `frontend/.env`: Frontend environment variables
- `docker-compose.yml`: Container orchestration
- `backend/requirements.txt`: Python dependencies
- `frontend/package.json`: JavaScript dependencies

## Development Workflow

### Adding New Features

1. **Backend Feature:**
   - Create model in `app/models/`
   - Define schema in `app/schemas/`
   - Implement service logic in `app/services/`
   - Create endpoint in `app/api/endpoints/`
   - Register router in `app/api/routes.py`
   - Write tests in `tests/`

2. **Frontend Feature:**
   - Create component in `src/components/`
   - Add state management in Zustand store
   - Integrate API calls with React Query
   - Style with Tailwind CSS
   - Update routing if needed

### Testing Strategy

- Backend: pytest with async support, mock external services
- Frontend: Vitest for unit tests, React Testing Library for components
- E2E: Playwright for critical user flows
- Coverage: Maintain >80% code coverage

### Code Quality Standards

- Python: Black formatting, Flake8 linting, type hints with mypy
- TypeScript: ESLint, Prettier, strict TypeScript config
- Git: Conventional commits, feature branches from `develop`
- CI/CD: GitHub Actions for automated testing and deployment

## API Integration

### Authentication Flow
```
POST /api/v1/auth/login → JWT access + refresh tokens
POST /api/v1/auth/refresh → New access token
GET /api/v1/auth/me → Current user info
```

### Core Endpoints
```
POST /api/v1/intents → Submit raw intention text
GET /api/v1/plans → Retrieve generated plans
POST /api/v1/goals → Create tracking goals
POST /api/v1/goals/{id}/checkin → Record progress
```

## Security Features

- JWT authentication with refresh token rotation
- Password hashing with bcrypt
- CORS protection with whitelist
- SQL injection prevention via ORM
- XSS protection in React
- HTTPS enforcement in production
- Rate limiting on API endpoints
- Input validation with Pydantic

## Performance Optimization

- Redis caching for frequent queries
- Database connection pooling
- Lazy loading in frontend
- Code splitting with dynamic imports
- Image optimization with Next.js Image
- Background job processing with Celery
- Database query optimization with indexes

## Deployment

Production deployment uses:
- Docker containers for all services
- GitHub Actions for CI/CD
- Terraform for infrastructure as code
- PostgreSQL for persistent data
- Redis for caching and sessions
- Nginx for reverse proxy
- SSL/TLS certificates via Let's Encrypt
