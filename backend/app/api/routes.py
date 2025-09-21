from fastapi import APIRouter
from app.api.endpoints import intents, plans, goals, users, auth, ai

api_router = APIRouter()

# Include endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(intents.router, prefix="/intents", tags=["intents"])
api_router.include_router(plans.router, prefix="/plans", tags=["plans"])
api_router.include_router(goals.router, prefix="/goals", tags=["goals"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
