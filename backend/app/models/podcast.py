from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Podcast(Base):
    __tablename__ = "podcasts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)  # 新增简介
    content = Column(Text, nullable=False)
    voice = Column(String(50), nullable=False)  # young-lady, young-man, grandma
    emotion = Column(String(50), default="normal")
    speed = Column(Float, default=1.0)
    audio_url = Column(String(500), nullable=True)
    cover_image_url = Column(String(500), nullable=True)  # 新增封面
    duration = Column(String(20), nullable=True)
    file_size = Column(Integer, nullable=True)
    user_email = Column(String(100), nullable=False, index=True)  # 新增作者
    tags = Column(String(200), nullable=True)  # 新增标签
    is_public = Column(Boolean, default=True)  # 是否公开
    language = Column(String(20), default="cantonese")  # 播客语言：cantonese, mandarin, english
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 暂时禁用社交功能关系，避免数据库表不存在的问题
    # comments = relationship("PodcastComment", back_populates="podcast")
    # likes = relationship("PodcastLike", back_populates="podcast")
    # shares = relationship("PodcastShare", back_populates="podcast")
    # community_posts = relationship("CommunityPost", back_populates="podcast") 