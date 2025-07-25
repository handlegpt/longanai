from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
import re
import hashlib
from app.core.config import settings
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.models.user import User

# JWT Token 安全配置
security = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """创建访问令牌"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    """验证令牌并返回用户邮箱"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        return None

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """获取当前用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        email = verify_token(token)
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return user

# 文件上传安全配置
class FileSecurityConfig:
    """文件安全配置类"""
    
    # 允许的文件扩展名
    ALLOWED_EXTENSIONS = {
        '.txt': 'text/plain',
        '.pdf': 'application/pdf', 
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.md': 'text/markdown'
    }
    
    # 危险文件扩展名黑名单
    DANGEROUS_EXTENSIONS = {
        '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
        '.php', '.asp', '.aspx', '.jsp', '.py', '.pl', '.rb', '.sh', '.cgi',
        '.dll', '.so', '.dylib', '.sys', '.drv', '.bin', '.msi', '.app',
        '.ps1', '.psm1', '.psd1', '.psc1', '.psc2', '.pssc', '.ps1xml',
        '.hta', '.msp', '.msu', '.mst', '.msi', '.msp', '.msu', '.mst'
    }
    
    # 文件大小限制（10MB）
    MAX_FILE_SIZE = 10 * 1024 * 1024
    
    # 文件名长度限制
    MAX_FILENAME_LENGTH = 100
    
    @classmethod
    def validate_file_extension(cls, filename: str) -> bool:
        """验证文件扩展名是否安全"""
        if not filename:
            return False
        
        # 获取文件扩展名
        file_ext = os.path.splitext(filename.lower())[1]
        
        # 检查是否在黑名单中
        if file_ext in cls.DANGEROUS_EXTENSIONS:
            return False
        
        # 检查是否在允许列表中
        return file_ext in cls.ALLOWED_EXTENSIONS
    
    @classmethod
    def sanitize_filename(cls, filename: str) -> str:
        """清理文件名，防止路径遍历攻击"""
        # 移除路径分隔符
        filename = os.path.basename(filename)
        
        # 移除危险字符
        filename = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '_', filename)
        
        # 限制长度
        if len(filename) > cls.MAX_FILENAME_LENGTH:
            name, ext = os.path.splitext(filename)
            filename = name[:cls.MAX_FILENAME_LENGTH-len(ext)] + ext
        
        return filename
    
    @classmethod
    def validate_file_path(cls, filepath: str, upload_dir: str) -> bool:
        """验证文件路径安全性"""
        # 确保路径在允许的目录内
        upload_dir = os.path.abspath(upload_dir)
        filepath = os.path.abspath(filepath)
        
        return filepath.startswith(upload_dir)
    
    @classmethod
    def calculate_file_hash(cls, content: bytes) -> str:
        """计算文件哈希值"""
        return hashlib.sha256(content).hexdigest()
    
    @classmethod
    def check_file_size(cls, content: bytes) -> bool:
        """检查文件大小"""
        return len(content) <= cls.MAX_FILE_SIZE

# 内容安全策略
class ContentSecurityPolicy:
    """内容安全策略配置"""
    
    @staticmethod
    def get_csp_headers() -> dict:
        """获取内容安全策略头"""
        return {
            "Content-Security-Policy": (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self' data:; "
                "connect-src 'self' https:; "
                "media-src 'self' blob:; "
                "object-src 'none'; "
                "base-uri 'self'; "
                "form-action 'self'; "
                "frame-ancestors 'none'; "
                "upgrade-insecure-requests;"
            ),
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
        }

# 速率限制配置
class RateLimitConfig:
    """速率限制配置"""
    
    # 文件上传限制
    UPLOAD_RATE_LIMIT = 10  # 每小时最多10个文件
    UPLOAD_RATE_WINDOW = 3600  # 1小时窗口
    
    # API 调用限制
    API_RATE_LIMIT = 100  # 每小时最多100次API调用
    API_RATE_WINDOW = 3600  # 1小时窗口
    
    @staticmethod
    def get_rate_limit_headers(remaining: int, reset_time: int) -> dict:
        """获取速率限制头"""
        return {
            "X-RateLimit-Limit": str(RateLimitConfig.API_RATE_LIMIT),
            "X-RateLimit-Remaining": str(remaining),
            "X-RateLimit-Reset": str(reset_time)
        } 