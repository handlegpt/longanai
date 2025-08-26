import time
import hashlib
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import logging
from app.core.config import settings
from app.services.cache_service import cache_service

logger = logging.getLogger(__name__)

class RateLimiter:
    """速率限制器"""
    
    def __init__(self):
        self.rate_limits = {
            # API端点限制
            "api": {"requests": 100, "window": 3600},  # 每小时100次
            "auth": {"requests": 10, "window": 3600},  # 每小时10次
            "podcast_generation": {"requests": 20, "window": 3600},  # 每小时20次
            "file_upload": {"requests": 50, "window": 3600},  # 每小时50次
            "search": {"requests": 200, "window": 3600},  # 每小时200次
            "social": {"requests": 300, "window": 3600},  # 每小时300次
        }
    
    def get_client_identifier(self, request: Request) -> str:
        """获取客户端标识符"""
        # 优先使用用户邮箱（如果已登录）
        user_email = request.headers.get("X-User-Email")
        if user_email:
            return f"user:{user_email}"
        
        # 使用IP地址作为备选
        client_ip = request.client.host
        return f"ip:{client_ip}"
    
    def get_rate_limit_key(self, client_id: str, endpoint: str) -> str:
        """生成速率限制缓存键"""
        return f"rate_limit:{endpoint}:{client_id}"
    
    def get_endpoint_type(self, request: Request) -> str:
        """根据请求路径确定端点类型"""
        path = request.url.path
        
        if path.startswith("/api/auth"):
            return "auth"
        elif path.startswith("/api/podcast/generate"):
            return "podcast_generation"
        elif path.startswith("/api/files/upload"):
            return "file_upload"
        elif path.startswith("/api/search"):
            return "search"
        elif path.startswith("/api/social"):
            return "social"
        else:
            return "api"
    
    def check_rate_limit(self, request: Request) -> Tuple[bool, Dict]:
        """检查速率限制"""
        client_id = self.get_client_identifier(request)
        endpoint_type = self.get_endpoint_type(request)
        
        # 获取速率限制配置
        rate_limit_config = self.rate_limits.get(endpoint_type, self.rate_limits["api"])
        max_requests = rate_limit_config["requests"]
        window = rate_limit_config["window"]
        
        # 生成缓存键
        cache_key = self.get_rate_limit_key(client_id, endpoint_type)
        
        # 获取当前时间窗口
        current_window = int(time.time() / window)
        window_key = f"{cache_key}:{current_window}"
        
        # 获取当前窗口的请求次数
        current_requests = cache_service.get(window_key, 0)
        
        if current_requests >= max_requests:
            # 计算重置时间
            reset_time = (current_window + 1) * window
            
            return False, {
                "limit": max_requests,
                "remaining": 0,
                "reset_time": reset_time,
                "window": window
            }
        
        # 增加请求计数
        cache_service.set(window_key, current_requests + 1, window)
        
        return True, {
            "limit": max_requests,
            "remaining": max_requests - current_requests - 1,
            "reset_time": (current_window + 1) * window,
            "window": window
        }

# 全局速率限制器实例
rate_limiter = RateLimiter()

async def rate_limit_middleware(request: Request, call_next):
    """速率限制中间件"""
    try:
        # 检查速率限制
        allowed, rate_info = rate_limiter.check_rate_limit(request)
        
        if not allowed:
            # 返回速率限制错误
            error_response = {
                "error": True,
                "message": "请求过于频繁，请稍后重试",
                "error_code": "RATE_LIMIT_EXCEEDED",
                "status_code": status.HTTP_429_TOO_MANY_REQUESTS,
                "details": {
                    "limit": rate_info["limit"],
                    "reset_time": rate_info["reset_time"],
                    "window_seconds": rate_info["window"]
                }
            }
            
            response = JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content=error_response
            )
            
            # 添加速率限制头
            response.headers["X-RateLimit-Limit"] = str(rate_info["limit"])
            response.headers["X-RateLimit-Remaining"] = "0"
            response.headers["X-RateLimit-Reset"] = str(rate_info["reset_time"])
            
            return response
        
        # 继续处理请求
        response = await call_next(request)
        
        # 添加速率限制头
        response.headers["X-RateLimit-Limit"] = str(rate_info["limit"])
        response.headers["X-RateLimit-Remaining"] = str(rate_info["remaining"])
        response.headers["X-RateLimit-Reset"] = str(rate_info["reset_time"])
        
        return response
        
    except Exception as e:
        logger.error(f"Rate limit middleware error: {e}")
        # 如果速率限制检查失败，允许请求继续
        return await call_next(request)

# 装饰器形式的速率限制
def rate_limit(endpoint_type: str = "api"):
    """速率限制装饰器"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # 这里可以添加更细粒度的速率限制逻辑
            return await func(*args, **kwargs)
        return wrapper
    return decorator
