"""
AI endpoints for enhanced natural language processing
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from services.ai_service import ai_service

router = APIRouter()

class EnhancedScheduleRequest(BaseModel):
    text: str
    user_id: Optional[str] = None

class GoalRecommendationsRequest(BaseModel):
    current_goals: List[Dict[str, Any]]
    user_id: Optional[str] = None

@router.post("/enhance-schedule")
async def enhance_schedule(request: EnhancedScheduleRequest):
    """Generate an enhanced schedule using AI"""
    try:
        enhanced_schedule = await ai_service.enhance_schedule_generation(request.text)
        return {
            "status": "success",
            "data": enhanced_schedule
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/goal-recommendations")
async def get_goal_recommendations(request: GoalRecommendationsRequest):
    """Get AI-powered goal recommendations"""
    try:
        recommendations = await ai_service.generate_goal_recommendations(request.current_goals)
        return {
            "status": "success",
            "data": recommendations
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
