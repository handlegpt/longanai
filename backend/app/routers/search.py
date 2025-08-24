from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.models.user import User
from app.models.podcast import Podcast
from app.models.social import Community, CommunityPost

router = APIRouter()

# ==================== 请求/响应模型 ====================

class SearchResult(BaseModel):
    type: str  # 'user', 'podcast', 'community'
    id: int
    title: str
    description: Optional[str] = None
    user_email: Optional[str] = None
    user_display_name: Optional[str] = None
    created_at: str
    score: Optional[float] = None

# ==================== 搜索功能 ====================

@router.get("/search")
async def search_all(
    q: str = Query(..., description="搜索关键词"),
    type: Optional[str] = Query(None, description="搜索类型: user, podcast, community"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    """综合搜索功能"""
    if not q.strip():
        raise HTTPException(status_code=400, detail="搜索关键词不能为空")
    
    results = []
    total = 0
    
    # 用户搜索
    if not type or type == 'user':
        user_results = search_users(db, q, page, size)
        results.extend(user_results['results'])
        total += user_results['total']
    
    # 播客搜索
    if not type or type == 'podcast':
        podcast_results = search_podcasts(db, q, page, size)
        results.extend(podcast_results['results'])
        total += podcast_results['total']
    
    # 社区搜索
    if not type or type == 'community':
        community_results = search_communities(db, q, page, size)
        results.extend(community_results['results'])
        total += community_results['total']
    
    # 按相关度排序
    results.sort(key=lambda x: x.score or 0, reverse=True)
    
    return {
        "results": results,
        "total": total,
        "page": page,
        "size": size,
        "query": q
    }

@router.get("/search/users")
async def search_users_endpoint(
    q: str = Query(..., description="搜索关键词"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    """搜索用户"""
    if not q.strip():
        raise HTTPException(status_code=400, detail="搜索关键词不能为空")
    
    return search_users(db, q, page, size)

@router.get("/search/podcasts")
async def search_podcasts_endpoint(
    q: str = Query(..., description="搜索关键词"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    language: Optional[str] = Query(None, description="播客语言"),
    db: Session = Depends(get_db)
):
    """搜索播客"""
    if not q.strip():
        raise HTTPException(status_code=400, detail="搜索关键词不能为空")
    
    return search_podcasts(db, q, page, size, language)

@router.get("/search/communities")
async def search_communities_endpoint(
    q: str = Query(..., description="搜索关键词"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    """搜索社区"""
    if not q.strip():
        raise HTTPException(status_code=400, detail="搜索关键词不能为空")
    
    return search_communities(db, q, page, size)

# ==================== 搜索辅助函数 ====================

def search_users(db: Session, query: str, page: int, size: int):
    """搜索用户"""
    # 构建搜索条件
    search_conditions = or_(
        User.display_name.ilike(f"%{query}%"),
        User.email.ilike(f"%{query}%"),
        User.bio.ilike(f"%{query}%") if User.bio else False
    )
    
    # 查询用户
    users_query = db.query(User).filter(search_conditions)
    total = users_query.count()
    users = users_query.offset((page - 1) * size).limit(size).all()
    
    results = []
    for user in users:
        # 计算相关度分数
        score = calculate_user_score(user, query)
        
        results.append({
            "type": "user",
            "id": user.id,
            "title": user.display_name or user.email.split('@')[0],
            "description": user.bio or f"用户 {user.email.split('@')[0]}",
            "user_email": user.email,
            "user_display_name": user.display_name,
            "created_at": user.created_at.isoformat(),
            "score": score
        })
    
    return {
        "results": results,
        "total": total,
        "page": page,
        "size": size
    }

def search_podcasts(db: Session, query: str, page: int, size: int, language: Optional[str] = None):
    """搜索播客"""
    # 构建搜索条件
    search_conditions = or_(
        Podcast.title.ilike(f"%{query}%"),
        Podcast.description.ilike(f"%{query}%") if Podcast.description else False,
        Podcast.tags.ilike(f"%{query}%") if Podcast.tags else False
    )
    
    # 添加语言过滤
    if language:
        search_conditions = and_(search_conditions, Podcast.language == language)
    
    # 只搜索公开的播客
    search_conditions = and_(search_conditions, Podcast.is_public == True)
    
    # 查询播客
    podcasts_query = db.query(Podcast).filter(search_conditions)
    total = podcasts_query.count()
    podcasts = podcasts_query.offset((page - 1) * size).limit(size).all()
    
    results = []
    for podcast in podcasts:
        # 计算相关度分数
        score = calculate_podcast_score(podcast, query)
        
        results.append({
            "type": "podcast",
            "id": podcast.id,
            "title": podcast.title,
            "description": podcast.description or f"播客时长: {podcast.duration}",
            "user_email": podcast.user_email,
            "user_display_name": podcast.user.display_name if podcast.user else None,
            "created_at": podcast.created_at.isoformat(),
            "score": score,
            "duration": podcast.duration,
            "language": podcast.language
        })
    
    return {
        "results": results,
        "total": total,
        "page": page,
        "size": size
    }

def search_communities(db: Session, query: str, page: int, size: int):
    """搜索社区"""
    # 构建搜索条件
    search_conditions = or_(
        Community.name.ilike(f"%{query}%"),
        Community.description.ilike(f"%{query}%") if Community.description else False
    )
    
    # 只搜索公开的社区
    search_conditions = and_(search_conditions, Community.is_public == True)
    
    # 查询社区
    communities_query = db.query(Community).filter(search_conditions)
    total = communities_query.count()
    communities = communities_query.offset((page - 1) * size).limit(size).all()
    
    results = []
    for community in communities:
        # 计算相关度分数
        score = calculate_community_score(community, query)
        
        results.append({
            "type": "community",
            "id": community.id,
            "title": community.name,
            "description": community.description or f"成员数: {community.member_count}",
            "user_email": community.creator_email,
            "user_display_name": community.creator.display_name if community.creator else None,
            "created_at": community.created_at.isoformat(),
            "score": score,
            "member_count": community.member_count
        })
    
    return {
        "results": results,
        "total": total,
        "page": page,
        "size": size
    }

# ==================== 相关度计算 ====================

def calculate_user_score(user: User, query: str) -> float:
    """计算用户搜索相关度分数"""
    score = 0.0
    query_lower = query.lower()
    
    # 显示名称匹配
    if user.display_name:
        if query_lower in user.display_name.lower():
            score += 10.0
        if user.display_name.lower().startswith(query_lower):
            score += 5.0
    
    # 邮箱匹配
    if query_lower in user.email.lower():
        score += 3.0
    
    # 个人简介匹配
    if user.bio and query_lower in user.bio.lower():
        score += 2.0
    
    return score

def calculate_podcast_score(podcast: Podcast, query: str) -> float:
    """计算播客搜索相关度分数"""
    score = 0.0
    query_lower = query.lower()
    
    # 标题匹配
    if query_lower in podcast.title.lower():
        score += 10.0
    if podcast.title.lower().startswith(query_lower):
        score += 5.0
    
    # 描述匹配
    if podcast.description and query_lower in podcast.description.lower():
        score += 3.0
    
    # 标签匹配
    if podcast.tags and query_lower in podcast.tags.lower():
        score += 2.0
    
    # 时间衰减因子（越新的播客分数越高）
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    days_old = (now - podcast.created_at).days
    time_factor = max(0.5, 1.0 - (days_old / 365.0))  # 一年内的时间衰减
    score *= time_factor
    
    return score

def calculate_community_score(community: Community, query: str) -> float:
    """计算社区搜索相关度分数"""
    score = 0.0
    query_lower = query.lower()
    
    # 名称匹配
    if query_lower in community.name.lower():
        score += 10.0
    if community.name.lower().startswith(query_lower):
        score += 5.0
    
    # 描述匹配
    if community.description and query_lower in community.description.lower():
        score += 3.0
    
    # 成员数因子（成员越多的社区分数越高）
    member_factor = min(2.0, 1.0 + (community.member_count / 100.0))
    score *= member_factor
    
    return score
