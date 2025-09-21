"""
Authentication service for Daily Flow
Handles user registration, login, and JWT token management
"""

from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
import uuid
from fastapi import HTTPException, status

# In production, load from environment variables
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Simple in-memory user storage (replace with database in production)
users_db = {
    "demo@dailyflow.com": {
        "id": "demo-user-123",
        "email": "demo@dailyflow.com",
        "name": "Demo User",
        "password_hash": bcrypt.hashpw("demo123".encode(), bcrypt.gensalt()).decode(),
        "created_at": datetime.now().isoformat()
    }
}

class AuthService:
    """Handle authentication operations"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def decode_token(token: str) -> dict:
        """Decode and verify a JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    
    @staticmethod
    def authenticate_user(email: str, password: str) -> dict:
        """Authenticate a user and return user data"""
        user = users_db.get(email)
        if not user:
            return None
        
        if not AuthService.verify_password(password, user["password_hash"]):
            return None
        
        # Return user without password hash
        user_data = {k: v for k, v in user.items() if k != "password_hash"}
        return user_data
    
    @staticmethod
    def create_user(email: str, password: str, name: str) -> dict:
        """Create a new user"""
        # Check if user already exists
        if email in users_db:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create new user
        user_id = str(uuid.uuid4())
        password_hash = AuthService.hash_password(password)
        
        new_user = {
            "id": user_id,
            "email": email,
            "name": name,
            "password_hash": password_hash,
            "created_at": datetime.now().isoformat()
        }
        
        # Store user
        users_db[email] = new_user
        
        # Return user without password hash
        user_data = {k: v for k, v in new_user.items() if k != "password_hash"}
        return user_data
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[dict]:
        """Get user by email"""
        user = users_db.get(email)
        if user:
            # Return user without password hash
            return {k: v for k, v in user.items() if k != "password_hash"}
        return None
    
    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[dict]:
        """Get user by ID"""
        for email, user in users_db.items():
            if user["id"] == user_id:
                # Return user without password hash
                return {k: v for k, v in user.items() if k != "password_hash"}
        return None
