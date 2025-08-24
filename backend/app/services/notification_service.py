from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationSetting
from app.models.user import User
from app.models.podcast import Podcast
from app.models.social import PodcastComment, PodcastLike, PodcastShare
from typing import Optional
import json

class NotificationService:
    """通知服务类"""
    
    @staticmethod
    def create_notification(
        db: Session,
        user_email: str,
        notification_type: str,
        title: str,
        content: Optional[str] = None,
        sender_email: Optional[str] = None,
        related_id: Optional[int] = None,
        related_type: Optional[str] = None
    ) -> Notification:
        """创建通知"""
        # 检查用户的通知设置
        settings = db.query(NotificationSetting).filter(
            NotificationSetting.user_email == user_email
        ).first()
        
        # 如果没有设置，创建默认设置
        if not settings:
            settings = NotificationSetting(user_email=user_email)
            db.add(settings)
            db.commit()
            db.refresh(settings)
        
        # 检查是否启用该类型通知
        if notification_type == 'follow' and not settings.follow_notifications:
            return None
        elif notification_type == 'comment' and not settings.comment_notifications:
            return None
        elif notification_type == 'like' and not settings.like_notifications:
            return None
        elif notification_type == 'share' and not settings.share_notifications:
            return None
        elif notification_type == 'community' and not settings.community_notifications:
            return None
        
        # 创建通知
        notification = Notification(
            user_email=user_email,
            sender_email=sender_email,
            notification_type=notification_type,
            title=title,
            content=content,
            related_id=related_id,
            related_type=related_type
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        return notification
    
    @staticmethod
    def send_follow_notification(db: Session, follower_email: str, following_email: str):
        """发送关注通知"""
        follower = db.query(User).filter(User.email == follower_email).first()
        if not follower:
            return
        
        title = f"{follower.display_name or follower.email.split('@')[0]} 关注了你"
        content = f"{follower.display_name or follower.email.split('@')[0]} 开始关注你，查看他们的播客吧！"
        
        return NotificationService.create_notification(
            db=db,
            user_email=following_email,
            notification_type='follow',
            title=title,
            content=content,
            sender_email=follower_email
        )
    
    @staticmethod
    def send_comment_notification(db: Session, commenter_email: str, podcast_id: int):
        """发送评论通知"""
        commenter = db.query(User).filter(User.email == commenter_email).first()
        podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
        
        if not commenter or not podcast:
            return
        
        # 只给播客创建者发送通知
        if commenter_email == podcast.user_email:
            return
        
        title = f"{commenter.display_name or commenter.email.split('@')[0]} 评论了你的播客"
        content = f"{commenter.display_name or commenter.email.split('@')[0]} 对播客「{podcast.title}」发表了评论"
        
        return NotificationService.create_notification(
            db=db,
            user_email=podcast.user_email,
            notification_type='comment',
            title=title,
            content=content,
            sender_email=commenter_email,
            related_id=podcast_id,
            related_type='podcast'
        )
    
    @staticmethod
    def send_like_notification(db: Session, liker_email: str, podcast_id: int):
        """发送点赞通知"""
        liker = db.query(User).filter(User.email == liker_email).first()
        podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
        
        if not liker or not podcast:
            return
        
        # 只给播客创建者发送通知
        if liker_email == podcast.user_email:
            return
        
        title = f"{liker.display_name or liker.email.split('@')[0]} 点赞了你的播客"
        content = f"{liker.display_name or liker.email.split('@')[0]} 点赞了播客「{podcast.title}」"
        
        return NotificationService.create_notification(
            db=db,
            user_email=podcast.user_email,
            notification_type='like',
            title=title,
            content=content,
            sender_email=liker_email,
            related_id=podcast_id,
            related_type='podcast'
        )
    
    @staticmethod
    def send_share_notification(db: Session, sharer_email: str, podcast_id: int):
        """发送分享通知"""
        sharer = db.query(User).filter(User.email == sharer_email).first()
        podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
        
        if not sharer or not podcast:
            return
        
        # 只给播客创建者发送通知
        if sharer_email == podcast.user_email:
            return
        
        title = f"{sharer.display_name or sharer.email.split('@')[0]} 分享了你的播客"
        content = f"{sharer.display_name or sharer.email.split('@')[0]} 分享了播客「{podcast.title}」"
        
        return NotificationService.create_notification(
            db=db,
            user_email=podcast.user_email,
            notification_type='share',
            title=title,
            content=content,
            sender_email=sharer_email,
            related_id=podcast_id,
            related_type='podcast'
        )
    
    @staticmethod
    def send_community_notification(db: Session, user_email: str, community_id: int, action: str):
        """发送社区通知"""
        user = db.query(User).filter(User.email == user_email).first()
        
        if not user:
            return
        
        if action == 'join':
            title = f"{user.display_name or user.email.split('@')[0]} 加入了社区"
            content = f"{user.display_name or user.email.split('@')[0]} 加入了社区"
        elif action == 'post':
            title = f"{user.display_name or user.email.split('@')[0]} 在社区发布了新帖子"
            content = f"{user.display_name or user.email.split('@')[0]} 在社区发布了新帖子"
        else:
            return
        
        return NotificationService.create_notification(
            db=db,
            user_email=user_email,
            notification_type='community',
            title=title,
            content=content,
            sender_email=user_email,
            related_id=community_id,
            related_type='community'
        )
    
    @staticmethod
    def mark_as_read(db: Session, notification_id: int, user_email: str) -> bool:
        """标记通知为已读"""
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_email == user_email
        ).first()
        
        if notification:
            notification.is_read = True
            db.commit()
            return True
        
        return False
    
    @staticmethod
    def mark_all_as_read(db: Session, user_email: str) -> bool:
        """标记所有通知为已读"""
        notifications = db.query(Notification).filter(
            Notification.user_email == user_email,
            Notification.is_read == False
        ).all()
        
        for notification in notifications:
            notification.is_read = True
        
        db.commit()
        return True
    
    @staticmethod
    def get_unread_count(db: Session, user_email: str) -> int:
        """获取未读通知数量"""
        return db.query(Notification).filter(
            Notification.user_email == user_email,
            Notification.is_read == False
        ).count()
    
    @staticmethod
    def delete_notification(db: Session, notification_id: int, user_email: str) -> bool:
        """删除通知"""
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_email == user_email
        ).first()
        
        if notification:
            db.delete(notification)
            db.commit()
            return True
        
        return False
