from pydantic_settings import BaseSettings
from typing import Optional, Dict, ClassVar

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./longanai.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
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
    FROM_NAME: str = "龙眼AI"
    
    # TTS Settings
    EDGE_TTS_VOICES: ClassVar[Dict[str, str]] = {
        "young-lady": "zh-HK-HiuGaaiNeural",  # Young lady voice
        "young-man": "zh-HK-WanLungNeural",   # Young man voice  
        "grandma": "zh-HK-HiuGaaiNeural",     # Grandma voice (temporarily using young lady)
    }
    
    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Longan AI"
    
    class Config:
        env_file = ".env"

settings = Settings() 