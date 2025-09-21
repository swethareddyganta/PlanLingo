from sqlalchemy import Column, Integer, String, Boolean, Float, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import date

from app.models.base import BaseModel

class Goal(BaseModel):
    __tablename__ = "goals"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Goal details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Goal type and target
    target_type = Column(String, nullable=False)  # duration, boolean, value, count
    target_value = Column(Float, nullable=True)   # Target amount
    unit = Column(String, nullable=True)          # minutes, hours, grams, etc.
    
    # Goal settings
    is_active = Column(Boolean, default=True)
    is_daily = Column(Boolean, default=True)
    priority = Column(String, default="medium")  # low, medium, high
    category = Column(String, nullable=True)     # health, work, personal, etc.
    
    # Goal metadata
    streak_count = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    total_completions = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User", back_populates="goals")
    goal_checks = relationship("GoalCheck", back_populates="goal", cascade="all, delete-orphan")

class GoalCheck(BaseModel):
    __tablename__ = "goal_checks"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    date = Column(Date, nullable=False, default=date.today)
    
    # Check results
    is_met = Column(Boolean, default=False)
    actual_value = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Metadata
    completion_percentage = Column(Integer, default=0)  # 0-100
    
    # Relationships
    user = relationship("User", back_populates="goal_checks")
    goal = relationship("Goal", back_populates="goal_checks")
