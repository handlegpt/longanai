from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt, JWTError
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.models.podcast import Podcast

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class AdminUserUpdateRequest(BaseModel):
    is_admin: bool = None
    subscription_plan: str = None
    monthly_generation_limit: int = None

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
def admin_login(request: AdminLoginRequest, db: Session = Depends(get_db)):
    """管理员登录"""
    # 检查用户是否存在且为管理员
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="无管理员权限")
    
    # 这里应该验证密码，暂时简化处理
    # 实际应该使用 bcrypt 等加密方式
    if request.password != "admin123":  # 临时密码，生产环境应该更安全
        raise HTTPException(status_code=401, detail="密码错误")
    
    # 生成管理员token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
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

@router.get("/users")
def admin_get_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str = ""
):
    """管理员获取所有用户列表"""
    query = db.query(User)
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
    
    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page-1)*size).limit(size).all()
    
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
                "created_at": user.created_at.isoformat() if user.created_at else None
            } for user in users
        ]
    }

@router.put("/users/{user_id}")
def admin_update_user(
    user_id: int,
    request: AdminUserUpdateRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """管理员更新用户信息"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    if request.is_admin is not None:
        user.is_admin = request.is_admin
    if request.subscription_plan is not None:
        user.subscription_plan = request.subscription_plan
    if request.monthly_generation_limit is not None:
        user.monthly_generation_limit = request.monthly_generation_limit
    
    db.commit()
    db.refresh(user)
    
    return {"message": "用户信息更新成功"}

@router.get("/podcasts")
def admin_get_podcasts(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str = "",
    user: str = ""
):
    """管理员获取所有播客"""
    query = db.query(Podcast)
    if search:
        query = query.filter(Podcast.title.ilike(f"%{search}%") | Podcast.description.ilike(f"%{search}%"))
    if user:
        query = query.filter(Podcast.user_email == user)
    
    total = query.count()
    podcasts = query.order_by(Podcast.created_at.desc()).offset((page-1)*size).limit(size).all()
    
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
    db: Session = Depends(get_db), 
    current_admin: User = Depends(get_current_admin_user)
):
    """管理员下架播客"""
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="播客不存在")
    podcast.is_public = False
    db.commit()
    return {"message": "下架成功"}

@router.get("/stats")
def admin_get_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """管理员获取系统统计"""
    total_users = db.query(User).count()
    total_podcasts = db.query(Podcast).count()
    public_podcasts = db.query(Podcast).filter(Podcast.is_public == True).count()
    admin_users = db.query(User).filter(User.is_admin == True).count()
    
    return {
        "total_users": total_users,
        "total_podcasts": total_podcasts,
        "public_podcasts": public_podcasts,
        "admin_users": admin_users
    } 