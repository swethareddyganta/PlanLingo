from sqlalchemy import Column, Integer, String, Boolean, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.base import BaseModel

class User(BaseModel):
    __tablename__ = "users"
    
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth users
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # OAuth fields
    auth_provider = Column(String, default="local")  # local, google, etc.
    oauth_id = Column(String, nullable=True)
    
    # User preferences
    timezone = Column(String, default="UTC")
    preferences = Column(JSON, default=dict)
    
    # Profile fields
    avatar_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    
    # Relationships
    intents = relationship("Intent", back_populates="user", cascade="all, delete-orphan")
    plans = relationship("Plan", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    goal_checks = relationship("GoalCheck", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    event_logs = relationship("EventLog", back_populates="user", cascade="all, delete-orphan")
