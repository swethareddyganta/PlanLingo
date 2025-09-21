from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import sys
import os

# Add services directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../../../"))
from services.plan_generator import PlanGenerator

router = APIRouter()

# Initialize the plan generator
plan_generator = PlanGenerator()

class PlanRequest(BaseModel):
    intent: Dict[str, Any]
    config: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = None

class PlanResponse(BaseModel):
    message: str
    blocks: List[Dict[str, Any]]
    stats: Dict[str, Any]
    status: str = "success"

@router.post("/", response_model=PlanResponse)
async def create_plan(request: PlanRequest):
    """Create optimized daily plan"""
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
        
        return PlanResponse(
            message="Plan generated successfully",
            blocks=plan['blocks'],
            stats=plan['stats'],
            status="success"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate plan: {str(e)}"
        )

@router.get("/{plan_id}")
async def get_plan(plan_id: str):
    """Get specific plan"""
    # TODO: Implement database lookup for stored plans
    return {"message": f"Get plan {plan_id} - to be implemented"}
