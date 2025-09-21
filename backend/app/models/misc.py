from sqlalchemy import Column, Integer, String, Boolean, JSON, Date, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import date, datetime

from app.models.base import BaseModel

class Reminder(BaseModel):
    __tablename__ = "reminders"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True)
    
    # Reminder details
    type = Column(String, nullable=False)  # break, hydration, meditation, custom
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    
    # Scheduling
    schedule_cron = Column(String, nullable=True)  # Cron expression
    scheduled_time = Column(DateTime, nullable=True)
    
    # Delivery channels
    channels = Column(JSON, default=list)  # push, email, sms
    
    # Status
    status = Column(String, default="active")  # active, paused, completed
    is_recurring = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="reminders")

class Report(BaseModel):
    __tablename__ = "reports"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Report details
    type = Column(String, default="weekly")  # daily, weekly, monthly
    week_start_date = Column(Date, nullable=False)
    
    # Report content
    summary_json = Column(JSON, nullable=False, default=dict)
    pdf_path = Column(String, nullable=True)
    
    # Report metadata
    total_goals = Column(Integer, default=0)
    completed_goals = Column(Integer, default=0)
    completion_rate = Column(Integer, default=0)  # 0-100
    
    # Status
    is_generated = Column(Boolean, default=False)
    generation_status = Column(String, default="pending")  # pending, generating, completed, failed
    
    # Relationships
    user = relationship("User", back_populates="reports")

class EventLog(BaseModel):
    __tablename__ = "event_logs"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Event details
    event_type = Column(String, nullable=False)  # auth, plan_create, goal_update, etc.
    action = Column(String, nullable=False)      # create, update, delete, login, etc.
    entity_type = Column(String, nullable=True)  # user, plan, goal, etc.
    entity_id = Column(String, nullable=True)
    
    # Event data
    payload = Column(JSON, nullable=True)
    event_metadata = Column(JSON, nullable=True)
    
    # Context
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    session_id = Column(String, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="event_logs")
