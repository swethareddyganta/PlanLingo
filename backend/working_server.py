#!/usr/bin/env python3
"""
Daily Flow - Minimal Working Backend
Run: python working_server.py
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import sys
import os

# Add services directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), "./"))
from services.intent_parser import IntentParser
from services.plan_generator import PlanGenerator

app = FastAPI(
    title="Daily Flow API",
    description="AI-powered daily planning assistant",
    version="1.0.0"
)

# Initialize services
intent_parser = IntentParser()
plan_generator = PlanGenerator()

class IntentRequest(BaseModel):
    text: str
    user_id: Optional[str] = None

class PlanRequest(BaseModel):
    intent: Dict[str, Any]

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Daily Flow API is running!",
        "status": "success",
        "features": ["Intent parsing", "Plan generation", "Goal tracking"]
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "daily-flow-api"}

@app.get("/api/v1/test")
async def test():
    return {"message": "API working!", "data": {"test": True}}

# Real endpoints for frontend
@app.post("/api/v1/intents")
async def create_intent(request: IntentRequest):
    """Parse daily intention into structured data"""
    try:
        # Validate input
        if not request.text or len(request.text.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="Intent text must be at least 10 characters long"
            )
        
        # Parse intent
        parsed_intent = intent_parser.parse_intent(request.text)
        
        # Return the parsed data in the format expected by frontend
        return {
            "parsed": parsed_intent,
            "message": "Intent parsed successfully",
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse intent: {str(e)}"
        )

@app.post("/api/v1/plans")
async def create_plan(request: PlanRequest):
    """Generate a daily plan from parsed intent"""
    try:
        if not request.intent:
            raise HTTPException(
                status_code=400,
                detail="Intent data is required"
            )
        
        # Generate plan
        plan = plan_generator.generate_plan(request.intent)
        
        return plan
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate plan: {str(e)}"
        )

@app.get("/api/v1/goals")
async def get_goals():
    return {"goals": [{"id": 1, "title": "Sample Goal", "completed": False}]}

if __name__ == "__main__":
    print("🚀 Starting Daily Flow Backend...")
    print("📍 API will be available at: http://localhost:8000")
    print("📚 API docs at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
