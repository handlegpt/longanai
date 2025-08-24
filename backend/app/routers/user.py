from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.models.user import User
from app.models.podcast import Podcast
from app.models.social import UserFollow, PodcastLike, PodcastComment

router = APIRouter()

# ==================== 请求/响应模型 ====================

class UserProfileResponse(BaseModel):
    email: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: str
    podcast_count: int
    follower_count: int
    following_count: int
    total_likes: int
    total_views: int

class UserPodcastResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    audio_url: str
    duration: str
    cover_image_url: Optional[str] = None
    created_at: str
    language: str
    tags: Optional[str] = None
    is_public: bool
    like_count: int
    comment_count: int
    view_count: int

# ==================== 用户资料 ====================

@router.get("/{user_email}/profile")
async def get_user_profile(
    user_email: str,
    db: Session = Depends(get_db)
):
    """获取用户资料"""
    # 解码邮箱
    user_email = user_email.replace('%40', '@')
    
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 获取播客数量
    podcast_count = db.query(Podcast).filter(Podcast.user_email == user_email).count()
    
    # 获取粉丝数量
    follower_count = db.query(UserFollow).filter(UserFollow.following_id == user.id).count()
    
    # 获取关注数量
    following_count = db.query(UserFollow).filter(UserFollow.follower_id == user.id).count()
    
    # 获取总点赞数
    total_likes = db.query(func.sum(PodcastLike.id)).filter(
        PodcastLike.podcast_id.in_(
            db.query(Podcast.id).filter(Podcast.user_email == user_email)
        )
    ).scalar() or 0
    
    # 获取总观看数（这里用评论数作为观看数的代理）
    total_views = db.query(func.sum(PodcastComment.id)).filter(
        PodcastComment.podcast_id.in_(
            db.query(Podcast.id).filter(Podcast.user_email == user_email)
        )
    ).scalar() or 0
    
    return UserProfileResponse(
        email=user.email,
        display_name=user.display_name,
        bio=user.bio,
        avatar_url=user.avatar_url,
        created_at=user.created_at.isoformat(),
        podcast_count=podcast_count,
        follower_count=follower_count,
        following_count=following_count,
        total_likes=total_likes,
        total_views=total_views
    )

@router.get("/{user_email}/podcasts")
async def get_user_podcasts(
    user_email: str,
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    """获取用户的播客列表"""
    # 解码邮箱
    user_email = user_email.replace('%40', '@')
    
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 查询用户的播客
    podcasts_query = db.query(Podcast).filter(Podcast.user_email == user_email)
    
    # 只返回公开的播客
    podcasts_query = podcasts_query.filter(Podcast.is_public == True)
    
    # 按创建时间倒序排列
    podcasts_query = podcasts_query.order_by(Podcast.created_at.desc())
    
    # 分页
    total = podcasts_query.count()
    podcasts = podcasts_query.offset((page - 1) * size).limit(size).all()
    
    # 获取每个播客的点赞数和评论数
    podcast_responses = []
    for podcast in podcasts:
        like_count = db.query(PodcastLike).filter(PodcastLike.podcast_id == podcast.id).count()
        comment_count = db.query(PodcastComment).filter(PodcastComment.podcast_id == podcast.id).count()
        
        podcast_responses.append(UserPodcastResponse(
            id=podcast.id,
            title=podcast.title,
            description=podcast.description,
            audio_url=podcast.audio_url,
            duration=podcast.duration,
            cover_image_url=podcast.cover_image_url,
            created_at=podcast.created_at.isoformat(),
            language=podcast.language,
            tags=podcast.tags,
            is_public=podcast.is_public,
            like_count=like_count,
            comment_count=comment_count,
            view_count=comment_count  # 暂时用评论数作为观看数
        ))
    
    return {
        "podcasts": podcast_responses,
        "total": total,
        "page": page,
        "size": size,
        "has_more": total > page * size
    }

@router.get("/{user_email}/podcasts/all")
async def get_user_all_podcasts(
    user_email: str,
    current_user_email: str = Query(..., description="当前用户邮箱"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    """获取用户的所有播客（包括私密的，仅限自己查看）"""
    # 解码邮箱
    user_email = user_email.replace('%40', '@')
    
    # 检查权限
    if current_user_email != user_email:
        raise HTTPException(status_code=403, detail="只能查看自己的所有播客")
    
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 查询用户的所有播客（包括私密的）
    podcasts_query = db.query(Podcast).filter(Podcast.user_email == user_email)
    
    # 按创建时间倒序排列
    podcasts_query = podcasts_query.order_by(Podcast.created_at.desc())
    
    # 分页
    total = podcasts_query.count()
    podcasts = podcasts_query.offset((page - 1) * size).limit(size).all()
    
    # 获取每个播客的点赞数和评论数
    podcast_responses = []
    for podcast in podcasts:
        like_count = db.query(PodcastLike).filter(PodcastLike.podcast_id == podcast.id).count()
        comment_count = db.query(PodcastComment).filter(PodcastComment.podcast_id == podcast.id).count()
        
        podcast_responses.append(UserPodcastResponse(
            id=podcast.id,
            title=podcast.title,
            description=podcast.description,
            audio_url=podcast.audio_url,
            duration=podcast.duration,
            cover_image_url=podcast.cover_image_url,
            created_at=podcast.created_at.isoformat(),
            language=podcast.language,
            tags=podcast.tags,
            is_public=podcast.is_public,
            like_count=like_count,
            comment_count=comment_count,
            view_count=comment_count  # 暂时用评论数作为观看数
        ))
    
    return {
        "podcasts": podcast_responses,
        "total": total,
        "page": page,
        "size": size,
        "has_more": total > page * size
    }

# ==================== 用户统计 ====================

@router.get("/{user_email}/stats")
async def get_user_stats(
    user_email: str,
    db: Session = Depends(get_db)
):
    """获取用户统计信息"""
    # 解码邮箱
    user_email = user_email.replace('%40', '@')
    
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 获取各种统计信息
    public_podcast_count = db.query(Podcast).filter(
        Podcast.user_email == user_email,
        Podcast.is_public == True
    ).count()
    
    private_podcast_count = db.query(Podcast).filter(
        Podcast.user_email == user_email,
        Podcast.is_public == False
    ).count()
    
    total_podcast_count = public_podcast_count + private_podcast_count
    
    follower_count = db.query(UserFollow).filter(UserFollow.following_id == user.id).count()
    following_count = db.query(UserFollow).filter(UserFollow.follower_id == user.id).count()
    
    # 获取用户播客的总点赞数
    user_podcast_ids = db.query(Podcast.id).filter(Podcast.user_email == user_email).subquery()
    total_likes = db.query(PodcastLike).filter(PodcastLike.podcast_id.in_(user_podcast_ids)).count()
    
    # 获取用户播客的总评论数
    total_comments = db.query(PodcastComment).filter(PodcastComment.podcast_id.in_(user_podcast_ids)).count()
    
    return {
        "total_podcasts": total_podcast_count,
        "public_podcasts": public_podcast_count,
        "private_podcasts": private_podcast_count,
        "followers": follower_count,
        "following": following_count,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "member_since": user.created_at.isoformat()
    }
