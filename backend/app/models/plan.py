from sqlalchemy import Column, Integer, String, JSON, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import date

from app.models.base import BaseModel

class Plan(BaseModel):
    __tablename__ = "plans"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    intent_id = Column(Integer, ForeignKey("intents.id"), nullable=True)
    day_date = Column(Date, nullable=False, default=date.today)
    
    # Plan data
    blocks_json = Column(JSON, nullable=False, default=list)
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    
    # Plan metadata
    total_duration_minutes = Column(Integer, default=0)
    completion_score = Column(Integer, default=0)  # 0-100
    
    # Relationships
    user = relationship("User", back_populates="plans")
    intent = relationship("Intent", back_populates="plans")
    blocks = relationship("Block", back_populates="plan", cascade="all, delete-orphan")

class Block(BaseModel):
    __tablename__ = "blocks"
    
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    
    # Block details
    type = Column(String, nullable=False)  # task, break, walk, meditation, meal
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    
    # Timing
    start_time = Column(String, nullable=False)  # HH:MM format
    end_time = Column(String, nullable=False)    # HH:MM format
    duration_minutes = Column(Integer, nullable=False)
    
    # Block metadata
    source = Column(String, default="user")  # user, ai, system
    confidence = Column(Integer, default=100)  # 0-100
    is_completed = Column(Boolean, default=False)
    priority = Column(String, default="medium")  # low, medium, high
    
    # Relationships
    plan = relationship("Plan", back_populates="blocks")
