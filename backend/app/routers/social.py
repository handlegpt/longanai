from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models.social import (
    UserFollow, PodcastComment, PodcastLike, PodcastShare,
    Community, CommunityMember, CommunityPost
)
from app.models.user import User
from app.models.podcast import Podcast

router = APIRouter()

# ==================== 请求/响应模型 ====================

class FollowRequest(BaseModel):
    following_email: str

class CommentRequest(BaseModel):
    content: str
    rating: Optional[float] = None

class CommunityCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = True

class CommunityPostRequest(BaseModel):
    title: str
    content: str
    podcast_id: Optional[int] = None

class ShareRequest(BaseModel):
    share_type: str  # 'link', 'twitter', 'facebook', 'wechat'

# ==================== 用户关注功能 ====================

@router.post("/follow")
async def follow_user(
    request: FollowRequest,
    user_email: str = Query(..., description="当前用户邮箱"),
    db: Session = Depends(get_db)
):
    """关注用户"""
    # 检查当前用户是否存在
    current_user = db.query(User).filter(User.email == user_email).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 检查要关注的用户是否存在
    target_user = db.query(User).filter(User.email == request.following_email).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="要关注的用户不存在")
    
    # 不能关注自己
    if user_email == request.following_email:
        raise HTTPException(status_code=400, detail="不能关注自己")
    
    # 检查是否已经关注
    existing_follow = db.query(UserFollow).filter(
        UserFollow.follower_id == current_user.id,
        UserFollow.following_id == target_user.id
    ).first()
    
    if existing_follow:
        raise HTTPException(status_code=400, detail="已经关注该用户")
    
    # 创建关注关系
    follow = UserFollow(
        follower_id=current_user.id,
        following_id=target_user.id
    )
    db.add(follow)
    db.commit()
    
    return {"message": "关注成功"}

@router.delete("/unfollow")
async def unfollow_user(
    following_email: str = Query(..., description="要取消关注的用户邮箱"),
    user_email: str = Query(..., description="当前用户邮箱"),
    db: Session = Depends(get_db)
):
    """取消关注用户"""
    current_user = db.query(User).filter(User.email == user_email).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    target_user = db.query(User).filter(User.email == following_email).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="要取消关注的用户不存在")
    
    # 删除关注关系
    follow = db.query(UserFollow).filter(
        UserFollow.follower_id == current_user.id,
        UserFollow.following_id == target_user.id
    ).first()
    
    if not follow:
        raise HTTPException(status_code=400, detail="未关注该用户")
    
    db.delete(follow)
    db.commit()
    
    return {"message": "取消关注成功"}

@router.get("/following")
async def get_following(
    user_email: str = Query(..., description="用户邮箱"),
    db: Session = Depends(get_db)
):
    """获取用户关注列表"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    following = db.query(UserFollow).filter(UserFollow.follower_id == user.id).all()
    
    return {
        "following": [
            {
                "email": follow.following.email,
                "display_name": follow.following.display_name,
                "avatar_url": follow.following.avatar_url,
                "followed_at": follow.created_at.isoformat()
            }
            for follow in following
        ]
    }

@router.get("/followers")
async def get_followers(
    user_email: str = Query(..., description="用户邮箱"),
    db: Session = Depends(get_db)
):
    """获取用户粉丝列表"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    followers = db.query(UserFollow).filter(UserFollow.following_id == user.id).all()
    
    return {
        "followers": [
            {
                "email": follower.follower.email,
                "display_name": follower.follower.display_name,
                "avatar_url": follower.follower.avatar_url,
                "followed_at": follower.created_at.isoformat()
            }
            for follower in followers
        ]
    }

# ==================== 播客评论功能 ====================

@router.post("/podcasts/{podcast_id}/comments")
async def add_comment(
    podcast_id: int,
    request: CommentRequest,
    user_email: str = Query(..., description="用户邮箱"),
    db: Session = Depends(get_db)
):
    """添加播客评论"""
    # 检查播客是否存在
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="播客不存在")
    
    # 检查用户是否存在
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 验证评分
    if request.rating is not None and (request.rating < 1 or request.rating > 5):
        raise HTTPException(status_code=400, detail="评分必须在1-5之间")
    
    # 创建评论
    comment = PodcastComment(
        podcast_id=podcast_id,
        user_email=user_email,
        content=request.content,
        rating=request.rating
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    return {
        "id": comment.id,
        "content": comment.content,
        "rating": comment.rating,
        "user_email": comment.user_email,
        "created_at": comment.created_at.isoformat()
    }

@router.get("/podcasts/{podcast_id}/comments")
async def get_comments(
    podcast_id: int,
    db: Session = Depends(get_db)
):
    """获取播客评论"""
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="播客不存在")
    
    comments = db.query(PodcastComment).filter(
        PodcastComment.podcast_id == podcast_id
    ).order_by(PodcastComment.created_at.desc()).all()
    
    return {
        "comments": [
            {
                "id": comment.id,
                "content": comment.content,
                "rating": comment.rating,
                "user_email": comment.user_email,
                "user_display_name": comment.user.display_name,
                "created_at": comment.created_at.isoformat()
            }
            for comment in comments
        ]
    }

# ==================== 播客点赞功能 ====================

@router.post("/podcasts/{podcast_id}/like")
async def like_podcast(
    podcast_id: int,
    user_email: str = Query(..., description="用户邮箱"),
    db: Session = Depends(get_db)
):
    """点赞播客"""
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="播客不存在")
    
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 检查是否已经点赞
    existing_like = db.query(PodcastLike).filter(
        PodcastLike.podcast_id == podcast_id,
        PodcastLike.user_email == user_email
    ).first()
    
    if existing_like:
        raise HTTPException(status_code=400, detail="已经点赞过该播客")
    
    # 创建点赞
    like = PodcastLike(
        podcast_id=podcast_id,
        user_email=user_email
    )
    db.add(like)
    db.commit()
    
    return {"message": "点赞成功"}

@router.delete("/podcasts/{podcast_id}/unlike")
async def unlike_podcast(
    podcast_id: int,
    user_email: str = Query(..., description="用户邮箱"),
    db: Session = Depends(get_db)
):
    """取消点赞播客"""
    like = db.query(PodcastLike).filter(
        PodcastLike.podcast_id == podcast_id,
        PodcastLike.user_email == user_email
    ).first()
    
    if not like:
        raise HTTPException(status_code=400, detail="未点赞该播客")
    
    db.delete(like)
    db.commit()
    
    return {"message": "取消点赞成功"}

@router.get("/podcasts/{podcast_id}/likes")
async def get_podcast_likes(
    podcast_id: int,
    db: Session = Depends(get_db)
):
    """获取播客点赞数"""
    likes_count = db.query(PodcastLike).filter(
        PodcastLike.podcast_id == podcast_id
    ).count()
    
    return {"likes_count": likes_count}

# ==================== 播客分享功能 ====================

@router.post("/podcasts/{podcast_id}/share")
async def share_podcast(
    podcast_id: int,
    request: ShareRequest,
    user_email: str = Query(..., description="用户邮箱"),
    db: Session = Depends(get_db)
):
    """分享播客"""
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="播客不存在")
    
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 生成分享链接
    share_url = f"https://longan.ai/podcast/{podcast_id}"
    
    # 记录分享
    share = PodcastShare(
        podcast_id=podcast_id,
        user_email=user_email,
        share_type=request.share_type,
        share_url=share_url
    )
    db.add(share)
    db.commit()
    
    return {
        "share_url": share_url,
        "share_type": request.share_type,
        "message": "分享成功"
    }

# ==================== 社区功能 ====================

@router.post("/communities")
async def create_community(
    request: CommunityCreateRequest,
    user_email: str = Query(..., description="创建者邮箱"),
    db: Session = Depends(get_db)
):
    """创建社区"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 检查社区名称是否已存在
    existing_community = db.query(Community).filter(
        Community.name == request.name
    ).first()
    
    if existing_community:
        raise HTTPException(status_code=400, detail="社区名称已存在")
    
    # 创建社区
    community = Community(
        name=request.name,
        description=request.description,
        creator_email=user_email,
        is_public=request.is_public,
        member_count=1  # 创建者自动成为成员
    )
    db.add(community)
    db.commit()
    db.refresh(community)
    
    # 创建者自动成为管理员
    member = CommunityMember(
        community_id=community.id,
        user_email=user_email,
        role="admin"
    )
    db.add(member)
    db.commit()
    
    return {
        "id": community.id,
        "name": community.name,
        "description": community.description,
        "creator_email": community.creator_email,
        "is_public": community.is_public,
        "member_count": community.member_count,
        "created_at": community.created_at.isoformat()
    }

@router.get("/communities")
async def get_communities(
    db: Session = Depends(get_db)
):
    """获取公开社区列表"""
    communities = db.query(Community).filter(
        Community.is_public == True
    ).order_by(Community.member_count.desc()).all()
    
    return {
        "communities": [
            {
                "id": community.id,
                "name": community.name,
                "description": community.description,
                "creator_email": community.creator_email,
                "member_count": community.member_count,
                "created_at": community.created_at.isoformat()
            }
            for community in communities
        ]
    }

@router.post("/communities/{community_id}/join")
async def join_community(
    community_id: int,
    user_email: str = Query(..., description="用户邮箱"),
    db: Session = Depends(get_db)
):
    """加入社区"""
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(status_code=404, detail="社区不存在")
    
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 检查是否已经是成员
    existing_member = db.query(CommunityMember).filter(
        CommunityMember.community_id == community_id,
        CommunityMember.user_email == user_email
    ).first()
    
    if existing_member:
        raise HTTPException(status_code=400, detail="已经是社区成员")
    
    # 加入社区
    member = CommunityMember(
        community_id=community_id,
        user_email=user_email,
        role="member"
    )
    db.add(member)
    
    # 更新成员数
    community.member_count += 1
    db.commit()
    
    return {"message": "加入社区成功"}

@router.post("/communities/{community_id}/posts")
async def create_community_post(
    community_id: int,
    request: CommunityPostRequest,
    user_email: str = Query(..., description="用户邮箱"),
    db: Session = Depends(get_db)
):
    """创建社区帖子"""
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(status_code=404, detail="社区不存在")
    
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 检查用户是否是社区成员
    member = db.query(CommunityMember).filter(
        CommunityMember.community_id == community_id,
        CommunityMember.user_email == user_email
    ).first()
    
    if not member:
        raise HTTPException(status_code=403, detail="需要先加入社区")
    
    # 创建帖子
    post = CommunityPost(
        community_id=community_id,
        user_email=user_email,
        title=request.title,
        content=request.content,
        podcast_id=request.podcast_id
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "user_email": post.user_email,
        "podcast_id": post.podcast_id,
        "created_at": post.created_at.isoformat()
    }

@router.get("/communities/{community_id}/posts")
async def get_community_posts(
    community_id: int,
    db: Session = Depends(get_db)
):
    """获取社区帖子"""
    community = db.query(Community).filter(Community.id == community_id).first()
    if not community:
        raise HTTPException(status_code=404, detail="社区不存在")
    
    posts = db.query(CommunityPost).filter(
        CommunityPost.community_id == community_id
    ).order_by(CommunityPost.created_at.desc()).all()
    
    return {
        "posts": [
            {
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "user_email": post.user_email,
                "user_display_name": post.user.display_name,
                "podcast_id": post.podcast_id,
                "is_pinned": post.is_pinned,
                "created_at": post.created_at.isoformat()
            }
            for post in posts
        ]
    }
