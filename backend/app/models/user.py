from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    is_verified = Column(Boolean, default=False)  # Email verification status
    verification_token = Column(String(255), nullable=True)  # Verification token
    verification_expires = Column(DateTime(timezone=True), nullable=True)  # Token expiration time
    
    google_id = Column(String(128), unique=True, nullable=True)  # Google OAuth 用户唯一ID
    
    # Subscription and usage tracking
    subscription_plan = Column(String(50), default="free")  # free, pro, enterprise
    monthly_generation_count = Column(Integer, default=0)  # Current month's generation count
    monthly_generation_limit = Column(Integer, default=10)  # Monthly generation limit
    last_generation_reset = Column(DateTime(timezone=True), nullable=True)  # Last time monthly count was reset
    
    # 新增管理员标记
    is_admin = Column(Boolean, default=False)  # 是否为管理员
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 