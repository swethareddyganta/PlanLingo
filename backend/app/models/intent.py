from sqlalchemy import Column, Integer, String, Text, JSON, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import date

from app.models.base import BaseModel

class Intent(BaseModel):
    __tablename__ = "intents"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    raw_text = Column(Text, nullable=False)
    parsed_json = Column(JSON, nullable=True)
    day_date = Column(Date, nullable=False, default=date.today)
    confidence_score = Column(Integer, default=0)  # 0-100
    
    # Processing status
    status = Column(String, default="pending")  # pending, processed, failed
    error_message = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="intents")
    plans = relationship("Plan", back_populates="intent")
