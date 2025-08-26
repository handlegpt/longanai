import redis
import json
import pickle
from typing import Any, Optional, Union
from datetime import timedelta
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class CacheService:
    """Redis缓存服务"""
    
    def __init__(self):
        self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=False)
        self.default_ttl = 3600  # 默认1小时过期
    
    def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """设置缓存"""
        try:
            if isinstance(value, (dict, list)):
                serialized_value = json.dumps(value, ensure_ascii=False)
            else:
                serialized_value = pickle.dumps(value)
            
            ttl = ttl or self.default_ttl
            return self.redis_client.setex(key, ttl, serialized_value)
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    def get(self, key: str, default: Any = None) -> Any:
        """获取缓存"""
        try:
            value = self.redis_client.get(key)
            if value is None:
                return default
            
            # 尝试JSON反序列化
            try:
                return json.loads(value)
            except:
                # 尝试pickle反序列化
                try:
                    return pickle.loads(value)
                except:
                    return value.decode('utf-8')
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return default
    
    def delete(self, key: str) -> bool:
        """删除缓存"""
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """检查缓存是否存在"""
        try:
            return bool(self.redis_client.exists(key))
        except Exception as e:
            logger.error(f"Cache exists error: {e}")
            return False
    
    def expire(self, key: str, ttl: int) -> bool:
        """设置过期时间"""
        try:
            return bool(self.redis_client.expire(key, ttl))
        except Exception as e:
            logger.error(f"Cache expire error: {e}")
            return False
    
    def clear_pattern(self, pattern: str) -> int:
        """清除匹配模式的缓存"""
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache clear pattern error: {e}")
            return 0

# 全局缓存实例
cache_service = CacheService()

# 缓存装饰器
def cache_result(ttl: int = 3600, key_prefix: str = ""):
    """缓存装饰器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # 生成缓存键
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # 尝试从缓存获取
            cached_result = cache_service.get(cache_key)
            if cached_result is not None:
                logger.info(f"Cache hit for {cache_key}")
                return cached_result
            
            # 执行函数并缓存结果
            result = func(*args, **kwargs)
            cache_service.set(cache_key, result, ttl)
            logger.info(f"Cache miss for {cache_key}, cached result")
            
            return result
        return wrapper
    return decorator
