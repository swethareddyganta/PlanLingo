from fastapi import APIRouter, HTTPException, status, Header
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import Optional, Dict, Any
import sys
import os
from datetime import timedelta

# Add services directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../../../"))
from services.auth import AuthService

router = APIRouter()
security = HTTPBearer()

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

@router.options("/signup")
async def options_signup():
    """Handle CORS preflight for signup"""
    return {}

@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    """Alias for register to support /signup route used by frontend"""
    # Reuse the same logic as /register
    try:
        user = AuthService.create_user(request.email, request.password, request.name)
        access_token = AuthService.create_access_token(
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

@router.post("/register", response_model=AuthResponse)
async def register(request: SignupRequest):
    """Register a new user"""
    try:
        user = AuthService.create_user(request.email, request.password, request.name)
        
        # Create access token
        access_token = AuthService.create_access_token(
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

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """Login user and return tokens"""
    user = AuthService.authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = AuthService.create_access_token(
        data={"sub": user["id"], "email": user["email"]}
    )
    
    return AuthResponse(
        token=access_token,
        user=user,
        message="Login successful"
    )

@router.get("/me")
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current user from token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    
    try:
        payload = AuthService.decode_token(token)
        user = AuthService.get_user_by_id(payload["sub"])
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

@router.post("/logout")
async def logout():
    """Logout user"""
    # In a stateless JWT system, logout is handled client-side
    # In production, you might want to implement token blacklisting
    return {"message": "Successfully logged out"}
