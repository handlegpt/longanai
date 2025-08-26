import os
import logging
import hashlib
from typing import Optional, Dict, Any, List
import requests
from datetime import datetime, timedelta
import json
from app.core.config import settings

logger = logging.getLogger(__name__)

class CDNService:
    """CDN服务管理器"""
    
    def __init__(self):
        self.cdn_config = {
            'enabled': settings.CDN_ENABLED,
            'provider': settings.CDN_PROVIDER,
            'base_url': settings.CDN_BASE_URL,
            'api_key': settings.CDN_API_KEY,
            'zone_id': settings.CDN_ZONE_ID,
            'cache_headers': {
                'Cache-Control': 'public, max-age=31536000',  # 1年缓存
                'Expires': None,
                'ETag': None
            }
        }
        
        # 缓存配置
        self.cache_rules = {
            'images': {
                'max_age': 31536000,  # 1年
                'headers': {
                    'Cache-Control': 'public, max-age=31536000, immutable',
                    'Vary': 'Accept-Encoding'
                }
            },
            'audio': {
                'max_age': 604800,  # 1周
                'headers': {
                    'Cache-Control': 'public, max-age=604800',
                    'Accept-Ranges': 'bytes'
                }
            },
            'static': {
                'max_age': 86400,  # 1天
                'headers': {
                    'Cache-Control': 'public, max-age=86400'
                }
            }
        }
    
    def get_cdn_url(self, file_path: str, file_type: str = 'static') -> str:
        """获取CDN URL"""
        if not self.cdn_config['enabled'] or not self.cdn_config['base_url']:
            # 返回本地URL
            return f"/static/{file_path}"
        
        # 生成CDN URL
        cdn_url = f"{self.cdn_config['base_url'].rstrip('/')}/{file_path}"
        
        # 添加缓存破坏参数（可选）
        if file_type in ['images', 'static']:
            file_hash = self._get_file_hash(file_path)
            if file_hash:
                cdn_url += f"?v={file_hash[:8]}"
        
        return cdn_url
    
    def _get_file_hash(self, file_path: str) -> Optional[str]:
        """获取文件哈希值"""
        try:
            full_path = os.path.join("static", file_path)
            if os.path.exists(full_path):
                with open(full_path, 'rb') as f:
                    content = f.read()
                    return hashlib.md5(content).hexdigest()
        except Exception as e:
            logger.error(f"获取文件哈希失败: {e}")
        return None
    
    def get_cache_headers(self, file_type: str = 'static') -> Dict[str, str]:
        """获取缓存头信息"""
        if file_type in self.cache_rules:
            return self.cache_rules[file_type]['headers'].copy()
        return self.cache_rules['static']['headers'].copy()
    
    async def purge_cache(self, file_paths: List[str]) -> bool:
        """清除CDN缓存"""
        if not self.cdn_config['enabled']:
            logger.info("CDN未启用，跳过缓存清除")
            return True
        
        try:
            if self.cdn_config['provider'] == 'cloudflare':
                return await self._purge_cloudflare_cache(file_paths)
            elif self.cdn_config['provider'] == 'aliyun':
                return await self._purge_aliyun_cache(file_paths)
            else:
                logger.warning(f"不支持的CDN提供商: {self.cdn_config['provider']}")
                return False
                
        except Exception as e:
            logger.error(f"清除CDN缓存失败: {e}")
            return False
    
    async def _purge_cloudflare_cache(self, file_paths: List[str]) -> bool:
        """清除Cloudflare缓存"""
        try:
            url = f"https://api.cloudflare.com/client/v4/zones/{self.cdn_config['zone_id']}/purge_cache"
            
            headers = {
                'Authorization': f'Bearer {self.cdn_config["api_key"]}',
                'Content-Type': 'application/json'
            }
            
            # 构建要清除的文件列表
            files_to_purge = []
            for file_path in file_paths:
                cdn_url = self.get_cdn_url(file_path)
                files_to_purge.append(cdn_url)
            
            payload = {
                'files': files_to_purge
            }
            
            response = requests.post(url, headers=headers, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    logger.info(f"✅ Cloudflare缓存清除成功: {len(file_paths)} 个文件")
                    return True
                else:
                    logger.error(f"❌ Cloudflare缓存清除失败: {result.get('errors')}")
                    return False
            else:
                logger.error(f"❌ Cloudflare API请求失败: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Cloudflare缓存清除异常: {e}")
            return False
    
    async def _purge_aliyun_cache(self, file_paths: List[str]) -> bool:
        """清除阿里云CDN缓存"""
        try:
            # 这里需要根据阿里云CDN API进行实现
            # 由于阿里云CDN API比较复杂，这里提供一个基础框架
            logger.info(f"阿里云CDN缓存清除请求: {len(file_paths)} 个文件")
            
            # TODO: 实现阿里云CDN API调用
            # 需要根据阿里云CDN的具体API文档进行实现
            
            return True
            
        except Exception as e:
            logger.error(f"❌ 阿里云CDN缓存清除异常: {e}")
            return False
    
    def optimize_image_url(self, image_path: str, width: Optional[int] = None, 
                          height: Optional[int] = None, quality: Optional[int] = None) -> str:
        """优化图片URL（支持图片处理参数）"""
        if not self.cdn_config['enabled']:
            return f"/static/{image_path}"
        
        cdn_url = self.get_cdn_url(image_path, 'images')
        
        # 添加图片处理参数
        params = []
        if width:
            params.append(f"w={width}")
        if height:
            params.append(f"h={height}")
        if quality:
            params.append(f"q={quality}")
        
        if params:
            separator = '&' if '?' in cdn_url else '?'
            cdn_url += f"{separator}{'&'.join(params)}"
        
        return cdn_url
    
    def get_audio_stream_url(self, audio_path: str) -> str:
        """获取音频流URL"""
        if not self.cdn_config['enabled']:
            return f"/static/{audio_path}"
        
        cdn_url = self.get_cdn_url(audio_path, 'audio')
        
        # 添加音频流参数
        separator = '&' if '?' in cdn_url else '?'
        cdn_url += f"{separator}stream=true"
        
        return cdn_url
    
    def get_file_info(self, file_path: str) -> Dict[str, Any]:
        """获取文件信息（包括CDN信息）"""
        info = {
            'file_path': file_path,
            'local_url': f"/static/{file_path}",
            'cdn_enabled': self.cdn_config['enabled'],
            'cdn_provider': self.cdn_config['provider']
        }
        
        if self.cdn_config['enabled']:
            info['cdn_url'] = self.get_cdn_url(file_path)
            info['cache_headers'] = self.get_cache_headers()
        
        return info
    
    def is_cdn_enabled(self) -> bool:
        """检查CDN是否启用"""
        return self.cdn_config['enabled'] and bool(self.cdn_config['base_url'])
    
    def get_cdn_stats(self) -> Dict[str, Any]:
        """获取CDN统计信息"""
        return {
            'enabled': self.cdn_config['enabled'],
            'provider': self.cdn_config['provider'],
            'base_url': self.cdn_config['base_url'],
            'cache_rules': list(self.cache_rules.keys())
        }

class CDNMiddleware:
    """CDN中间件"""
    
    def __init__(self, cdn_service: CDNService):
        self.cdn_service = cdn_service
    
    async def add_cdn_headers(self, response, file_path: str, file_type: str = 'static'):
        """添加CDN相关头信息"""
        if self.cdn_service.is_cdn_enabled():
            # 添加缓存头
            cache_headers = self.cdn_service.get_cache_headers(file_type)
            for key, value in cache_headers.items():
                response.headers[key] = value
            
            # 添加CDN信息头
            response.headers['X-CDN-Provider'] = self.cdn_service.cdn_config['provider']
            response.headers['X-CDN-Enabled'] = 'true'
        else:
            response.headers['X-CDN-Enabled'] = 'false'
        
        return response

# 全局CDN服务实例
cdn_service = CDNService()
cdn_middleware = CDNMiddleware(cdn_service)
