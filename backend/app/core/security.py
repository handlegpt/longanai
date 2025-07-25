from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, List
import os
import re
import hashlib
import time
import redis

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

# 管理员安全配置
class AdminSecurityConfig:
    # 登录尝试限制
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION = 300  # 5分钟锁定
    
    # 会话超时
    SESSION_TIMEOUT = 1800  # 30分钟
    
    # IP白名单（可选）
    ALLOWED_IPS = os.getenv("ADMIN_ALLOWED_IPS", "").split(",") if os.getenv("ADMIN_ALLOWED_IPS") else []
    
    # 管理员密码哈希
    ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "")
    
    # 敏感操作需要二次确认
    SENSITIVE_OPERATIONS = ["delete_user", "delete_podcast", "change_password"]

class AdminSecurityService:
    def __init__(self):
        self.redis_client = redis.from_url(settings.REDIS_URL) if settings.REDIS_URL else None
    
    def hash_password(self, password: str) -> str:
        """哈希密码"""
        salt = os.getenv("ADMIN_PASSWORD_SALT", "longanai_admin_salt")
        return hashlib.sha256((password + salt).encode()).hexdigest()
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """验证密码"""
        return self.hash_password(password) == hashed
    
    def check_ip_whitelist(self, client_ip: str) -> bool:
        """检查IP白名单"""
        if not AdminSecurityConfig.ALLOWED_IPS:
            return True  # 如果没有设置白名单，则允许所有IP
        return client_ip in AdminSecurityConfig.ALLOWED_IPS
    
    def check_login_attempts(self, email: str, client_ip: str) -> bool:
        """检查登录尝试次数"""
        if not self.redis_client:
            return True
        
        key = f"admin_login_attempts:{email}:{client_ip}"
        attempts = self.redis_client.get(key)
        
        if attempts and int(attempts) >= AdminSecurityConfig.MAX_LOGIN_ATTEMPTS:
            return False
        
        return True
    
    def record_login_attempt(self, email: str, client_ip: str, success: bool):
        """记录登录尝试"""
        if not self.redis_client:
            return
        
        key = f"admin_login_attempts:{email}:{client_ip}"
        
        if success:
            self.redis_client.delete(key)
        else:
            attempts = self.redis_client.get(key)
            current_attempts = int(attempts) if attempts else 0
            self.redis_client.setex(key, AdminSecurityConfig.LOCKOUT_DURATION, current_attempts + 1)
    
    def check_session_validity(self, token: str) -> bool:
        """检查会话有效性"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            exp = payload.get("exp")
            if not exp:
                return False
            
            # 检查是否超过会话超时时间
            token_time = datetime.fromtimestamp(exp)
            if datetime.utcnow() > token_time:
                return False
            
            return True
        except JWTError:
            return False
    
    def log_admin_action(self, admin_email: str, action: str, details: str, client_ip: str):
        """记录管理员操作日志"""
        if not self.redis_client:
            return
        
        log_entry = {
            "admin_email": admin_email,
            "action": action,
            "details": details,
            "client_ip": client_ip,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # 存储到Redis（保留最近1000条记录）
        self.redis_client.lpush("admin_audit_log", str(log_entry))
        self.redis_client.ltrim("admin_audit_log", 0, 999)
    
    def require_second_factor(self, operation: str) -> bool:
        """检查是否需要二次确认"""
        return operation in AdminSecurityConfig.SENSITIVE_OPERATIONS

# 创建安全服务实例
admin_security = AdminSecurityService()

def get_admin_password_hash() -> str:
    """获取管理员密码哈希"""
    if not AdminSecurityConfig.ADMIN_PASSWORD_HASH:
        # 如果没有设置环境变量，使用默认密码的哈希
        return admin_security.hash_password("admin123")
    return AdminSecurityConfig.ADMIN_PASSWORD_HASH

def verify_admin_password(password: str) -> bool:
    """验证管理员密码"""
    return admin_security.verify_password(password, get_admin_password_hash())

def check_admin_security(request: Request, email: str) -> bool:
    """检查管理员安全策略"""
    client_ip = request.client.host
    
    # 检查IP白名单
    if not admin_security.check_ip_whitelist(client_ip):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="IP地址不在允许列表中"
        )
    
    # 检查登录尝试次数
    if not admin_security.check_login_attempts(email, client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="登录尝试次数过多，请稍后再试"
        )
    
    return True

def get_current_admin_user_secure(
    request: Request,
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="token")),
    db: Session = Depends(get_db)
) -> User:
    """安全的管理员用户验证"""
    # 检查会话有效性
    if not admin_security.check_session_validity(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="会话已过期，请重新登录"
        )
    
    # 验证用户
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="无效的令牌")
    except JWTError:
        raise HTTPException(status_code=401, detail="无效的令牌")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="用户不存在")
    
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="需要管理员权限")
    
    # 记录访问日志
    admin_security.log_admin_action(
        user.email, 
        "admin_access", 
        f"访问管理员面板", 
        request.client.host
    )
    
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