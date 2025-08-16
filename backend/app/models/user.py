from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # 新增密码哈希字段
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    verification_token = Column(String(500), nullable=True)
    verification_expires = Column(DateTime, nullable=True)
    google_id = Column(String(100), nullable=True)
    subscription_plan = Column(String(50), default='free')  # 订阅计划
    monthly_generation_count = Column(Integer, default=0)  # 本月生成次数
    last_generation_reset = Column(DateTime, nullable=True)  # 上次重置生成次数的时间
    display_name = Column(String(100), nullable=True)  # 显示名称
    avatar_url = Column(String(500), nullable=True)  # 头像URL
    bio = Column(Text, nullable=True)  # 个人简介
    preferred_voice = Column(String(50), nullable=True, server_default='young-lady')  # 偏好声音
    preferred_language = Column(String(20), nullable=True, server_default='cantonese')  # 偏好语言
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 