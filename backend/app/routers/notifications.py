from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.models.notification import Notification, NotificationSetting
from app.models.user import User
from app.services.notification_service import NotificationService

router = APIRouter()

# ==================== 请求/响应模型 ====================

class NotificationSettingRequest(BaseModel):
    follow_notifications: bool = True
    comment_notifications: bool = True
    like_notifications: bool = True
    share_notifications: bool = True
    community_notifications: bool = True
    email_notifications: bool = True
    push_notifications: bool = True

# ==================== 通知管理 ====================

@router.get("/notifications")
async def get_notifications(
    user_email: str = Query(..., description="用户邮箱"),
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页数量"),
    unread_only: bool = Query(False, description="只获取未读通知"),
    db: Session = Depends(get_db)
):
    """获取用户通知列表"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 构建查询
    query = db.query(Notification).filter(Notification.user_email == user_email)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    # 分页
    total = query.count()
    notifications = query.order_by(Notification.created_at.desc()).offset((page - 1) * size).limit(size).all()
    
    return {
        "notifications": [
            {
                "id": notification.id,
                "type": notification.notification_type,
                "title": notification.title,
                "content": notification.content,
                "sender_email": notification.sender_email,
                "sender_name": notification.sender.display_name if notification.sender else None,
                "related_id": notification.related_id,
                "related_type": notification.related_type,
                "is_read": notification.is_read,
                "created_at": notification.created_at.isoformat()
            }
            for notification in notifications
        ],
        "total": total,
        "page": page,
        "size": size,
        "has_more": total > page * size
    }

@router.get("/notifications/unread-count")
async def get_unread_count(
    user_email: str = Query(..., description="用户邮箱"),
    db: Session = Depends(get_db)
):
    """获取未读通知数量"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    count = NotificationService.get_unread_count(db, user_email)
    
    return {"unread_count": count}

@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    user_email: str = Query(..., description="用户邮箱"),
    db: Session = Depends(get_db)
):
    """标记通知为已读"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    success = NotificationService.mark_as_read(db, notification_id, user_email)
    
    if not success:
        raise HTTPException(status_code=404, detail="通知不存在")
    
    return {"message": "通知已标记为已读"}

@router.post("/notifications/mark-all-read")
async def mark_all_notifications_read(
    user_email: str = Query(..., description="用户邮箱"),
    db: Session = Depends(get_db)
):
    """标记所有通知为已读"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    NotificationService.mark_all_as_read(db, user_email)
    
    return {"message": "所有通知已标记为已读"}

@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: int,
    user_email: str = Query(..., description="用户邮箱"),
    db: Session = Depends(get_db)
):
    """删除通知"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    success = NotificationService.delete_notification(db, notification_id, user_email)
    
    if not success:
        raise HTTPException(status_code=404, detail="通知不存在")
    
    return {"message": "通知已删除"}

# ==================== 通知设置 ====================

@router.get("/notification-settings")
async def get_notification_settings(
    user_email: str = Query(..., description="用户邮箱"),
    db: Session = Depends(get_db)
):
    """获取用户通知设置"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    settings = db.query(NotificationSetting).filter(
        NotificationSetting.user_email == user_email
    ).first()
    
    if not settings:
        # 创建默认设置
        settings = NotificationSetting(user_email=user_email)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return {
        "follow_notifications": settings.follow_notifications,
        "comment_notifications": settings.comment_notifications,
        "like_notifications": settings.like_notifications,
        "share_notifications": settings.share_notifications,
        "community_notifications": settings.community_notifications,
        "email_notifications": settings.email_notifications,
        "push_notifications": settings.push_notifications
    }

@router.put("/notification-settings")
async def update_notification_settings(
    request: NotificationSettingRequest,
    user_email: str = Query(..., description="用户邮箱"),
    db: Session = Depends(get_db)
):
    """更新用户通知设置"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    settings = db.query(NotificationSetting).filter(
        NotificationSetting.user_email == user_email
    ).first()
    
    if not settings:
        settings = NotificationSetting(user_email=user_email)
        db.add(settings)
    
    # 更新设置
    settings.follow_notifications = request.follow_notifications
    settings.comment_notifications = request.comment_notifications
    settings.like_notifications = request.like_notifications
    settings.share_notifications = request.share_notifications
    settings.community_notifications = request.community_notifications
    settings.email_notifications = request.email_notifications
    settings.push_notifications = request.push_notifications
    
    db.commit()
    db.refresh(settings)
    
    return {"message": "通知设置已更新"}
