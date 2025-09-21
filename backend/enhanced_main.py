#!/usr/bin/env python3
"""
Daily Flow - Enhanced Backend with Intent Parsing and Plan Generation
Run: python enhanced_main.py
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import uvicorn
import sys
import os

# Add services directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.intent_parser import IntentParser
from services.plan_generator import PlanGenerator
from services.auth import AuthService

# Initialize FastAPI app
app = FastAPI(
    title="Daily Flow API",
    description="AI-powered daily planning assistant",
    version="2.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize services
intent_parser = IntentParser()
plan_generator = PlanGenerator()
auth_service = AuthService()

# Request/Response Models
class IntentRequest(BaseModel):
    text: str
    user_id: Optional[str] = None
    
class IntentResponse(BaseModel):
    message: str
    parsed: Dict[str, Any]
    status: str = "success"

class PlanRequest(BaseModel):
    intent: Dict[str, Any]
    config: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = None

class PlanResponse(BaseModel):
    message: str
    blocks: List[Dict[str, Any]]
    stats: Dict[str, Any]
    status: str = "success"

class TaskBlock(BaseModel):
    id: str
    title: str
    duration: int
    startTime: str
    endTime: str
    type: str
    priority: Optional[str] = "medium"
    energy_level: Optional[int] = 5

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str

class AuthResponse(BaseModel):
    token: str
    user: Dict[str, Any]
    message: str = "Success"

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Daily Flow API is running!",
        "status": "success",
        "version": "2.0.0",
        "features": [
            "Natural language intent parsing",
            "Intelligent plan generation",
            "Wellness-focused scheduling",
            "Energy-optimized time blocks"
        ],
        "endpoints": {
            "POST /api/v1/intents": "Parse natural language daily intentions",
            "POST /api/v1/plans": "Generate optimized daily plans",
            "GET /health": "Check API health status"
        }
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "daily-flow-api",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "intent_parser": "operational",
            "plan_generator": "operational"
        }
    }

# Authentication Endpoints
@app.options("/api/v1/auth/login")
async def login_options():
    """Handle preflight OPTIONS request for login"""
    return {"message": "OK"}

@app.post("/api/v1/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Authenticate user and return JWT token
    """
    user = auth_service.authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = auth_service.create_access_token(
        data={"sub": user["id"], "email": user["email"]}
    )
    
    return AuthResponse(
        token=access_token,
        user=user,
        message="Login successful"
    )

@app.options("/api/v1/auth/signup")
async def signup_options():
    """Handle preflight OPTIONS request for signup"""
    return {"message": "OK"}

@app.post("/api/v1/auth/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    """
    Create new user account
    """
    try:
        user = auth_service.create_user(request.email, request.password, request.name)
        
        # Create access token
        access_token = auth_service.create_access_token(
            data={"sub": user["id"], "email": user["email"]}
        )
        
        return AuthResponse(
            token=access_token,
            user=user,
            message="Account created successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@app.get("/api/v1/auth/me")
async def get_current_user(authorization: str = None):
    """
    Get current user from token
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    
    try:
        payload = auth_service.decode_token(token)
        user = auth_service.get_user_by_id(payload["sub"])
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        return user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

@app.post("/api/v1/intents", response_model=IntentResponse)
async def parse_intent(request: IntentRequest):
    """
    Parse natural language intent into structured tasks
    
    Example input:
    {
        "text": "I want to workout for 30 minutes in the morning, work for 8 hours with breaks, meditate for 15 minutes, and have 2 hours of me time in the evening."
    }
    """
    try:
        # Validate input
        if not request.text or len(request.text.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="Intent text must be at least 10 characters long"
            )
        
        # Parse intent
        parsed_intent = intent_parser.parse_intent(request.text)
        
        # Log for debugging
        print(f"Parsed intent: {parsed_intent}")
        
        return IntentResponse(
            message="Intent parsed successfully",
            parsed=parsed_intent,
            status="success"
        )
        
    except Exception as e:
        print(f"Error parsing intent: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse intent: {str(e)}"
        )

@app.post("/api/v1/plans", response_model=PlanResponse)
async def generate_plan(request: PlanRequest):
    """
    Generate time-blocked daily plan from parsed intent
    
    Example input:
    {
        "intent": {
            "tasks": [
                {"title": "Workout", "duration": 30, "type": "wellness", "priority": "high"},
                {"title": "Work", "duration": 480, "type": "work", "priority": "high"},
                {"title": "Meditation", "duration": 15, "type": "wellness", "priority": "medium"},
                {"title": "Me time", "duration": 120, "type": "personal", "priority": "low"}
            ]
        },
        "config": {
            "start_time": "07:00",
            "end_time": "22:00"
        }
    }
    """
    try:
        # Validate intent
        if not request.intent or 'tasks' not in request.intent:
            raise HTTPException(
                status_code=400,
                detail="Intent must contain tasks"
            )
        
        if not request.intent['tasks']:
            raise HTTPException(
                status_code=400,
                detail="Intent must contain at least one task"
            )
        
        # Generate plan
        plan = plan_generator.generate_plan(request.intent, request.config)
        
        # Log for debugging
        print(f"Generated plan with {len(plan['blocks'])} blocks")
        
        return PlanResponse(
            message="Plan generated successfully",
            blocks=plan['blocks'],
            stats=plan['stats'],
            status="success"
        )
        
    except Exception as e:
        print(f"Error generating plan: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate plan: {str(e)}"
        )

@app.post("/api/v1/intents/", response_model=IntentResponse)
async def parse_intent_alt(intent_data: Dict[str, Any]):
    """
    Alternative endpoint for intent parsing (matches frontend)
    """
    if 'text' not in intent_data:
        raise HTTPException(
            status_code=400,
            detail="Request must contain 'text' field"
        )
    
    request = IntentRequest(text=intent_data['text'])
    return await parse_intent(request)

@app.post("/api/v1/plans/", response_model=PlanResponse)
async def generate_plan_alt(plan_data: Dict[str, Any]):
    """
    Alternative endpoint for plan generation (matches frontend)
    """
    if 'intent' not in plan_data:
        raise HTTPException(
            status_code=400,
            detail="Request must contain 'intent' field"
        )
    
    request = PlanRequest(
        intent=plan_data['intent'],
        config=plan_data.get('config')
    )
    return await generate_plan(request)

# Demo endpoints for testing
@app.get("/api/v1/demo/intent")
async def demo_intent():
    """Get a demo parsed intent for testing"""
    return {
        "parsed": {
            "tasks": [
                {"title": "Morning Workout", "duration": 30, "type": "wellness", "priority": "high"},
                {"title": "Deep Work Session", "duration": 240, "type": "work", "priority": "high"},
                {"title": "Lunch Break", "duration": 45, "type": "break", "priority": "medium"},
                {"title": "Afternoon Work", "duration": 180, "type": "work", "priority": "high"},
                {"title": "Meditation", "duration": 15, "type": "wellness", "priority": "medium"},
                {"title": "Personal Time", "duration": 120, "type": "personal", "priority": "low"}
            ],
            "total_duration_hours": 10.5,
            "includes_wellness": True
        }
    }

@app.get("/api/v1/demo/plan")
async def demo_plan():
    """Get a demo plan for testing"""
    demo_intent = {
        "tasks": [
            {"title": "Morning Workout", "duration": 30, "type": "wellness", "priority": "high"},
            {"title": "Deep Work Session", "duration": 240, "type": "work", "priority": "high"},
            {"title": "Meditation", "duration": 15, "type": "wellness", "priority": "medium"},
            {"title": "Personal Time", "duration": 120, "type": "personal", "priority": "low"}
        ]
    }
    
    plan = plan_generator.generate_plan({"tasks": demo_intent["tasks"]})
    return plan

if __name__ == "__main__":
    print("Starting Daily Flow Enhanced Backend...")
    print("API will be available at: http://localhost:8000")
    print("API docs at: http://localhost:8000/docs")
    print("Test endpoints:")
    print("   - POST http://localhost:8000/api/v1/intents")
    print("   - POST http://localhost:8000/api/v1/plans")
    print("   - GET http://localhost:8000/api/v1/demo/intent")
    print("   - GET http://localhost:8000/api/v1/demo/plan")
    uvicorn.run(app, host="0.0.0.0", port=8000)
