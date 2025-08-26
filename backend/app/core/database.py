from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database tables
def init_db():
    """Initialize database tables"""
    try:
        # Import all models to ensure they are registered
        from app.models.podcast import Podcast
        from app.models.user import User
        # 暂时禁用社交模型导入，避免关系定义冲突
        # from app.models.social import (
        #     UserFollow, PodcastComment, PodcastLike, PodcastShare,
        #     Community, CommunityMember, CommunityPost
        # )
        # from app.models.notification import Notification, NotificationSetting
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        raise 