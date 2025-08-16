from pydantic_settings import BaseSettings
from typing import Optional, Dict, ClassVar
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@db:5432/longanai"
    
    # Redis
    REDIS_URL: str = "redis://redis:6379"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Email Settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = "your-email@gmail.com"
    SMTP_PASSWORD: str = "your-app-password"
    SMTP_TLS: bool = True
    SMTP_SSL: bool = False
    FROM_EMAIL: str = "noreply@longan.ai"
    FROM_NAME: str = "龍眼AI"
    
    # OpenAI Settings (for GPT translation)
    OPENAI_API_KEY: Optional[str] = None
    
    # TTS Settings
    EDGE_TTS_VOICES: ClassVar[Dict[str, str]] = {
        "young-lady": "zh-HK-HiuGaaiNeural",  # Young lady voice
        "young-man": "zh-HK-WanLungNeural",   # Young man voice  
        "elderly-woman": "zh-HK-HiuGaaiNeural",     # Grandma voice (temporarily using young lady)
    }
    
    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Longan AI"
    
    # Concurrency Settings
    MAX_CONCURRENT_GENERATIONS: int = 20  # 最大并发生成数
    THREAD_POOL_WORKERS: int = 10  # 线程池工作线程数
    MAX_AUDIO_DURATION: int = 3600  # 最大音频时长（秒）
    
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    RESEND_FROM: str = os.getenv("RESEND_FROM", "noreply@yourdomain.com")
    
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "your-google-client-id")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "your-google-client-secret")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://longan.ai/api/auth/callback/google")
    
    # Storage Settings
    STORAGE_TYPE: str = os.getenv("STORAGE_TYPE", "local")  # local, s3, aliyun_oss
    LOCAL_STORAGE_PATH: str = os.getenv("LOCAL_STORAGE_PATH", "static")
    
    # AWS S3 Settings
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "longanai-audio")
    AWS_REGION: str = os.getenv("AWS_REGION", "ap-southeast-1")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    
    # Aliyun OSS Settings
    OSS_BUCKET_NAME: str = os.getenv("OSS_BUCKET_NAME", "longanai-audio")
    OSS_ENDPOINT: str = os.getenv("OSS_ENDPOINT", "oss-cn-hangzhou.aliyuncs.com")
    OSS_ACCESS_KEY_ID: str = os.getenv("OSS_ACCESS_KEY_ID", "")
    OSS_ACCESS_KEY_SECRET: str = os.getenv("OSS_ACCESS_KEY_SECRET", "")
    
    # CDN Settings
    CDN_DOMAIN: str = os.getenv("CDN_DOMAIN", "")
    
    # File Retention Settings
    AUDIO_RETENTION_DAYS: int = int(os.getenv("AUDIO_RETENTION_DAYS", "365"))
    UPLOAD_RETENTION_DAYS: int = int(os.getenv("AUDIO_RETENTION_DAYS", "30"))
    
    # Debug Settings
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    class Config:
        env_file = ".env"

settings = Settings()
