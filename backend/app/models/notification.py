from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Notification(Base):
    """通知表"""
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(100), ForeignKey("users.email"), nullable=False)  # 接收通知的用户
    sender_email = Column(String(100), ForeignKey("users.email"), nullable=True)  # 发送通知的用户
    notification_type = Column(String(50), nullable=False)  # 'follow', 'comment', 'like', 'share', 'community'
    title = Column(String(200), nullable=False)  # 通知标题
    content = Column(Text, nullable=True)  # 通知内容
    related_id = Column(Integer, nullable=True)  # 相关ID（播客ID、评论ID等）
    related_type = Column(String(50), nullable=True)  # 相关类型（podcast, comment等）
    is_read = Column(Boolean, default=False)  # 是否已读
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    user = relationship("User", foreign_keys=[user_email], back_populates="notifications")
    sender = relationship("User", foreign_keys=[sender_email], back_populates="sent_notifications")

class NotificationSetting(Base):
    """通知设置表"""
    __tablename__ = "notification_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(100), ForeignKey("users.email"), nullable=False)
    follow_notifications = Column(Boolean, default=True)  # 关注通知
    comment_notifications = Column(Boolean, default=True)  # 评论通知
    like_notifications = Column(Boolean, default=True)  # 点赞通知
    share_notifications = Column(Boolean, default=True)  # 分享通知
    community_notifications = Column(Boolean, default=True)  # 社区通知
    email_notifications = Column(Boolean, default=True)  # 邮件通知
    push_notifications = Column(Boolean, default=True)  # 推送通知
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    user = relationship("User", back_populates="notification_settings")
