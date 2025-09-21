# Daily Flow - Deployment Guide

## Prerequisites

### Required Software
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose (usually included with Docker Desktop)
- 4GB+ available RAM
- 10GB+ available disk space

### Installation Links
- **Docker Desktop**: https://www.docker.com/products/docker-desktop
- **Docker Engine (Linux)**: https://docs.docker.com/engine/install/

## Quick Start (5 minutes)

### 1. Setup Environment
```bash
# Copy the example environment file
cp .env.production.example .env

# Edit the .env file with your settings
# IMPORTANT: Change POSTGRES_PASSWORD and SECRET_KEY!
```

### 2. Build and Start Application
```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready (about 30 seconds)
docker-compose -f docker-compose.prod.yml ps
```

### 3. Initialize Database (First time only)
```bash
# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

### 4. Access Application
- **Frontend**: http://localhost (or http://localhost:80)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Configuration

### Required Settings
Edit `.env` file and set:
1. `POSTGRES_PASSWORD` - Strong database password
2. `SECRET_KEY` - Random secret key for JWT tokens
3. `OPENAI_API_KEY` - Your OpenAI API key for AI features

### Optional Settings
- `GOOGLE_CLIENT_ID/SECRET` - For Google OAuth login
- `FRONTEND_PORT` - Change from 80 if needed
- `BACKEND_PORT` - Change from 8000 if needed

## Common Commands

### Start Application
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Stop Application
```bash
docker-compose -f docker-compose.prod.yml down
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Restart Service
```bash
docker-compose -f docker-compose.prod.yml restart backend
docker-compose -f docker-compose.prod.yml restart frontend
```

### Database Backup
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U dailyflow_user dailyflow > backup.sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U dailyflow_user dailyflow < backup.sql
```

## Troubleshooting

### Services Not Starting
```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# View error logs
docker-compose -f docker-compose.prod.yml logs
```

### Port Already in Use
- Change ports in `.env` file:
  - `FRONTEND_PORT=3000` (instead of 80)
  - `BACKEND_PORT=8001` (instead of 8000)

### Database Connection Issues
```bash
# Test database connection
docker-compose -f docker-compose.prod.yml exec postgres psql -U dailyflow_user -d dailyflow -c "SELECT 1"
```

### Reset Everything
```bash
# Stop and remove all containers, volumes, and data
docker-compose -f docker-compose.prod.yml down -v

# Start fresh
docker-compose -f docker-compose.prod.yml up -d
```

## Production Deployment Options

### Option 1: Single Server
- Use this Docker setup on a VPS (DigitalOcean, AWS EC2, etc.)
- Recommended: 2+ CPU cores, 4GB+ RAM
- Add SSL with nginx-proxy or Traefik

### Option 2: Cloud Platforms
- **AWS ECS**: Use task definitions from Docker Compose
- **Google Cloud Run**: Deploy containers directly
- **Azure Container Instances**: Similar to Cloud Run

### Option 3: Kubernetes
- Convert docker-compose to Kubernetes manifests
- Use Helm charts for easier deployment

## Security Checklist

✅ Change default passwords in `.env`
✅ Use strong SECRET_KEY (32+ random characters)
✅ Enable HTTPS in production (use reverse proxy)
✅ Restrict database ports (only expose if needed)
✅ Regular backups of PostgreSQL data
✅ Keep Docker images updated
✅ Use firewall rules on production server

## Support

For issues or questions:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify `.env` configuration
3. Ensure Docker is running: `docker version`
4. Check available resources: `docker system df`

## System Requirements

- **Minimum**: 2 CPU cores, 4GB RAM, 10GB disk
- **Recommended**: 4 CPU cores, 8GB RAM, 20GB disk
- **OS**: Linux, macOS, Windows 10/11 with WSL2
