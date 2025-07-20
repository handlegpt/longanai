from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from sqlalchemy.sql import func
from app.core.database import Base

class Podcast(Base):
    __tablename__ = "podcasts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    voice = Column(String(50), nullable=False)  # young-lady, young-man, grandma
    emotion = Column(String(50), default="normal")
    speed = Column(Float, default=1.0)
    audio_url = Column(String(500), nullable=True)
    duration = Column(String(20), nullable=True)
    file_size = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 