from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import sys
import os

# Add services directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../../../"))
from services.intent_parser import IntentParser

router = APIRouter()

# Initialize the intent parser
intent_parser = IntentParser()

class IntentRequest(BaseModel):
    text: str
    user_id: Optional[str] = None

class IntentResponse(BaseModel):
    message: str
    parsed: Dict[str, Any]
    status: str = "success"

@router.post("/")
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
        
        # Return the parsed data directly in the format expected by frontend
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
