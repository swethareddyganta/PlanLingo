# PlanLingo

**"Duolingo taught you to speak languages. PlanLingo teaches you to speak productivity."**

A production-ready web application that transforms vague daily intentions into structured timetables, helpful reminders, rich visualizations, and goal tracking with weekly reports.

## Overview

PlanLingo helps users convert loose daily planning language like "workout 30 min, meditate 15 min, work 8 hours, me time at night" into optimized schedules with intelligent break insertion, wellness suggestions, and comprehensive progress tracking.

## Features

- **Natural Language Parsing**: Convert vague daily intentions into structured schedules using AI
- **Intelligent Planning**: Automatically optimize task placement with conflict resolution and wellness breaks
- **Goal Tracking**: Daily checklist system with scoring and historical progress
- **Smart Reminders**: Configurable notifications for breaks, hydration, meditation, and movement
- **Rich Visualizations**: Timeline views, progress charts, calendar heatmaps, and productivity trends
- **Weekly Reports**: Automated motivational reports with actionable insights and PDF export
- **Enterprise Security**: OAuth 2.0, JWT tokens, encryption, audit logging, and OWASP compliance

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS + shadcn/ui for styling
- Zustand for state management
- React Query for server state
- Recharts for data visualization

### Backend
- Python FastAPI
- PostgreSQL with SQLAlchemy
- Redis for caching and sessions
- Celery for background jobs
- OpenAI API for natural language processing

### Infrastructure
- Docker containers
- GitHub Actions CI/CD
- Terraform for IaC
- HTTPS/TLS everywhere

## Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd daily-flow
npm install

# Start development environment
npm run dev
```

## Project Structure

```
daily-flow/
├── frontend/          # React TypeScript app
├── backend/           # FastAPI Python server
├── infrastructure/    # Terraform and deployment configs
├── docs/             # Documentation and API specs
├── docker-compose.yml # Local development setup
└── README.md         # This file
```


**Created with ❤️ by [Swetha](https://linkedin.com/in/swetha-reddy-ganta)**
