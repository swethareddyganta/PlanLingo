from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_goals():
    """Get user goals"""
    return {"message": "Goals retrieval endpoint - to be implemented"}

@router.post("/")
async def create_goal():
    """Create new goal"""
    return {"message": "Goal creation endpoint - to be implemented"}
