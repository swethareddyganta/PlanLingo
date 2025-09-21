from fastapi import APIRouter

router = APIRouter()

@router.get("/me")
async def get_current_user():
    """Get current user profile"""
    return {"message": "User profile endpoint - to be implemented"}
