from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserFollow(Base):
    """用户关注关系表"""
    __tablename__ = "user_follows"
    
    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # 关注者
    following_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # 被关注者
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    follower = relationship("User", foreign_keys=[follower_id], back_populates="following")
    following = relationship("User", foreign_keys=[following_id], back_populates="followers")

class PodcastComment(Base):
    """播客评论表"""
    __tablename__ = "podcast_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    podcast_id = Column(Integer, ForeignKey("podcasts.id"), nullable=False)
    user_email = Column(String(100), ForeignKey("users.email"), nullable=False)
    content = Column(Text, nullable=False)
    rating = Column(Float, nullable=True)  # 评分 1-5
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    podcast = relationship("Podcast", back_populates="comments")
    user = relationship("User", back_populates="comments")

class PodcastLike(Base):
    """播客点赞表"""
    __tablename__ = "podcast_likes"
    
    id = Column(Integer, primary_key=True, index=True)
    podcast_id = Column(Integer, ForeignKey("podcasts.id"), nullable=False)
    user_email = Column(String(100), ForeignKey("users.email"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    podcast = relationship("Podcast", back_populates="likes")
    user = relationship("User", back_populates="likes")

class PodcastShare(Base):
    """播客分享表"""
    __tablename__ = "podcast_shares"
    
    id = Column(Integer, primary_key=True, index=True)
    podcast_id = Column(Integer, ForeignKey("podcasts.id"), nullable=False)
    user_email = Column(String(100), ForeignKey("users.email"), nullable=False)
    share_type = Column(String(50), nullable=False)  # 'link', 'twitter', 'facebook', 'wechat'
    share_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    podcast = relationship("Podcast", back_populates="shares")
    user = relationship("User", back_populates="shares")

class Community(Base):
    """播客社区表"""
    __tablename__ = "communities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    creator_email = Column(String(100), ForeignKey("users.email"), nullable=False)
    is_public = Column(Boolean, default=True)
    member_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    creator = relationship("User", back_populates="created_communities")
    members = relationship("CommunityMember", back_populates="community")
    posts = relationship("CommunityPost", back_populates="community")

class CommunityMember(Base):
    """社区成员表"""
    __tablename__ = "community_members"
    
    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)
    user_email = Column(String(100), ForeignKey("users.email"), nullable=False)
    role = Column(String(20), default="member")  # 'admin', 'moderator', 'member'
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    community = relationship("Community", back_populates="members")
    user = relationship("User", back_populates="community_memberships")

class CommunityPost(Base):
    """社区帖子表"""
    __tablename__ = "community_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"), nullable=False)
    user_email = Column(String(100), ForeignKey("users.email"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    podcast_id = Column(Integer, ForeignKey("podcasts.id"), nullable=True)  # 关联的播客
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    community = relationship("Community", back_populates="posts")
    user = relationship("User", back_populates="community_posts")
    podcast = relationship("Podcast", back_populates="community_posts")
