from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt, JWTError
from pydantic import BaseModel
from typing import Optional
import hashlib

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.models.podcast import Podcast
from app.core.security import (
    admin_security, 
    verify_admin_password, 
    check_admin_security,
    get_current_admin_user_secure
)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class AdminPasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class AdminUserUpdateRequest(BaseModel):
    is_admin: bool = None
    subscription_plan: str = None
    monthly_generation_limit: int = None
    display_name: str = None
    bio: str = None
    is_verified: bool = None

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限"
        )
    return current_user

@router.post("/login")
def admin_login(request: AdminLoginRequest, db: Session = Depends(get_db), client_request: Request = None):
    """管理员登录（增强安全版本）"""
    # 检查用户是否存在且为管理员
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="无管理员权限")
    
    # 安全检查
    if client_request:
        check_admin_security(client_request, request.email)
    
    # 验证密码（使用哈希验证）
    if not verify_admin_password(request.password):
        # 记录失败的登录尝试
        if client_request:
            admin_security.record_login_attempt(request.email, client_request.client.host, False)
        raise HTTPException(status_code=401, detail="密码错误")
    
    # 记录成功的登录尝试
    if client_request:
        admin_security.record_login_attempt(request.email, client_request.client.host, True)
        admin_security.log_admin_action(
            user.email, 
            "admin_login", 
            f"管理员登录成功", 
            client_request.client.host
        )
    
    # 生成管理员token（使用更短的过期时间）
    access_token_expires = timedelta(minutes=30)  # 30分钟过期
    access_token = create_access_token(
        data={"sub": user.email, "is_admin": True}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "is_admin": user.is_admin
        }
    }

@router.post("/change-password")
def admin_change_password(
    request: AdminPasswordChangeRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user_secure),
    client_request: Request = None
):
    """管理员修改密码（增强安全版本）"""
    # 验证当前密码
    if not verify_admin_password(request.current_password):
        raise HTTPException(status_code=401, detail="当前密码错误")
    
    # 验证新密码长度
    if len(request.new_password) < 8:
        raise HTTPException(status_code=400, detail="新密码至少需要8个字符")
    
    # 检查密码强度
    if not any(c.isupper() for c in request.new_password):
        raise HTTPException(status_code=400, detail="新密码必须包含大写字母")
    if not any(c.islower() for c in request.new_password):
        raise HTTPException(status_code=400, detail="新密码必须包含小写字母")
    if not any(c.isdigit() for c in request.new_password):
        raise HTTPException(status_code=400, detail="新密码必须包含数字")
    
    # 记录密码修改操作
    if client_request:
        admin_security.log_admin_action(
            current_admin.email,
            "change_password",
            "管理员密码修改",
            client_request.client.host
        )
    
    return {"message": "密码修改成功，请重新登录"}

@router.get("/users")
def admin_get_users(
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user_secure),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str = ""
):
    """管理员获取所有用户列表（增强安全版本）"""
    query = db.query(User)
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
    
    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page-1)*size).limit(size).all()
    
    # 记录访问日志
    admin_security.log_admin_action(
        current_admin.email,
        "view_users",
        f"查看用户列表，搜索: {search}",
        request.client.host
    )
    
    return {
        "total": total,
        "page": page,
        "size": size,
        "users": [
            {
                "id": user.id,
                "email": user.email,
                "is_verified": user.is_verified,
                "is_admin": user.is_admin,
                "subscription_plan": user.subscription_plan,
                "monthly_generation_count": user.monthly_generation_count,
                "monthly_generation_limit": user.monthly_generation_limit,
                "display_name": user.display_name,
                "avatar_url": user.avatar_url,
                "bio": user.bio,
                "created_at": user.created_at.isoformat() if user.created_at else None
            } for user in users
        ]
    }

@router.put("/users/{user_id}")
def admin_update_user(
    user_id: int,
    request: AdminUserUpdateRequest,
    client_request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user_secure)
):
    """管理员更新用户信息（增强安全版本）"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 防止管理员修改自己的权限
    if user.id == current_admin.id and request.is_admin is not None:
        raise HTTPException(status_code=400, detail="不能修改自己的管理员权限")
    
    changes = []
    if request.is_admin is not None:
        user.is_admin = request.is_admin
        changes.append(f"管理员权限: {request.is_admin}")
    if request.subscription_plan is not None:
        user.subscription_plan = request.subscription_plan
        changes.append(f"订阅计划: {request.subscription_plan}")
    if request.monthly_generation_limit is not None:
        user.monthly_generation_limit = request.monthly_generation_limit
        changes.append(f"生成限制: {request.monthly_generation_limit}")
    if request.display_name is not None:
        user.display_name = request.display_name
        changes.append(f"显示名称: {request.display_name}")
    if request.bio is not None:
        user.bio = request.bio
        changes.append(f"个人简介: {request.bio}")
    if request.is_verified is not None:
        user.is_verified = request.is_verified
        changes.append(f"验证状态: {request.is_verified}")
    
    db.commit()
    db.refresh(user)
    
    # 记录操作日志
    admin_security.log_admin_action(
        current_admin.email,
        "update_user",
        f"更新用户 {user.email}: {', '.join(changes)}",
        client_request.client.host
    )
    
    return {"message": "用户信息更新成功"}

@router.delete("/users/{user_id}")
def admin_delete_user(
    user_id: int,
    client_request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user_secure)
):
    """管理员删除用户（增强安全版本）"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 防止删除自己
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="不能删除自己的账户")
    
    # 记录删除操作
    admin_security.log_admin_action(
        current_admin.email,
        "delete_user",
        f"删除用户 {user.email}",
        client_request.client.host
    )
    
    # 删除用户相关的播客
    user_podcasts = db.query(Podcast).filter(Podcast.user_email == user.email).all()
    for podcast in user_podcasts:
        db.delete(podcast)
    
    # 删除用户
    db.delete(user)
    db.commit()
    
    return {"message": "用户删除成功"}

@router.get("/users/{user_id}")
def admin_get_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user_secure)
):
    """管理员获取单个用户详情（增强安全版本）"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 记录访问日志
    admin_security.log_admin_action(
        current_admin.email,
        "view_user",
        f"查看用户详情: {user.email}",
        request.client.host
    )
    
    return {
        "id": user.id,
        "email": user.email,
        "is_verified": user.is_verified,
        "is_admin": user.is_admin,
        "subscription_plan": user.subscription_plan,
        "monthly_generation_count": user.monthly_generation_count,
        "monthly_generation_limit": user.monthly_generation_limit,
        "display_name": user.display_name,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
        "preferred_voice": user.preferred_voice,
        "preferred_language": user.preferred_language,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None
    }

@router.get("/audit-log")
def admin_get_audit_log(
    request: Request,
    current_admin: User = Depends(get_current_admin_user_secure),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100)
):
    """获取管理员操作日志"""
    if not admin_security.redis_client:
        return {"logs": [], "total": 0}
    
    # 获取日志
    logs = admin_security.redis_client.lrange("admin_audit_log", (page-1)*size, page*size-1)
    total = admin_security.redis_client.llen("admin_audit_log")
    
    return {
        "logs": [eval(log.decode()) for log in logs],
        "total": total,
        "page": page,
        "size": size
    }

@router.get("/podcasts")
def admin_get_podcasts(
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user_secure),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str = "",
    user: str = ""
):
    """管理员获取所有播客（增强安全版本）"""
    query = db.query(Podcast)
    if search:
        query = query.filter(Podcast.title.ilike(f"%{search}%") | Podcast.description.ilike(f"%{search}%"))
    if user:
        query = query.filter(Podcast.user_email == user)
    
    total = query.count()
    podcasts = query.order_by(Podcast.created_at.desc()).offset((page-1)*size).limit(size).all()
    
    # 记录访问日志
    admin_security.log_admin_action(
        current_admin.email,
        "view_podcasts",
        f"查看播客列表，搜索: {search}",
        request.client.host
    )
    
    return {
        "total": total,
        "page": page,
        "size": size,
        "podcasts": [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "audioUrl": p.audio_url,
                "coverImageUrl": p.cover_image_url,
                "duration": p.duration,
                "createdAt": p.created_at.isoformat() if p.created_at else None,
                "user_email": p.user_email,
                "tags": p.tags,
                "is_public": p.is_public,
            } for p in podcasts
        ]
    }

@router.post("/podcasts/{podcast_id}/unpublish")
def admin_unpublish_podcast(
    podcast_id: int, 
    request: Request,
    db: Session = Depends(get_db), 
    current_admin: User = Depends(get_current_admin_user_secure)
):
    """管理员下架播客（增强安全版本）"""
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="播客不存在")
    
    podcast.is_public = False
    db.commit()
    
    # 记录操作日志
    admin_security.log_admin_action(
        current_admin.email,
        "unpublish_podcast",
        f"下架播客: {podcast.title}",
        request.client.host
    )
    
    return {"message": "下架成功"}

@router.get("/stats")
def admin_get_stats(
    request: Request,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user_secure)
):
    """管理员获取系统统计（增强安全版本）"""
    total_users = db.query(User).count()
    total_podcasts = db.query(Podcast).count()
    public_podcasts = db.query(Podcast).filter(Podcast.is_public == True).count()
    admin_users = db.query(User).filter(User.is_admin == True).count()
    
    # 记录访问日志
    admin_security.log_admin_action(
        current_admin.email,
        "view_stats",
        "查看系统统计",
        request.client.host
    )
    
    return {
        "total_users": total_users,
        "total_podcasts": total_podcasts,
        "public_podcasts": public_podcasts,
        "admin_users": admin_users
    } 