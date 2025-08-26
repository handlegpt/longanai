import os
import logging
from typing import Optional, Dict, Any
from abc import ABC, abstractmethod
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
import oss2
from PIL import Image
import io
import mimetypes
from app.core.config import settings

logger = logging.getLogger(__name__)

class CloudStorageProvider(ABC):
    """云存储提供者抽象基类"""
    
    @abstractmethod
    async def upload_file(self, file_content: bytes, file_path: str, content_type: Optional[str] = None) -> str:
        """上传文件到云存储"""
        pass
    
    @abstractmethod
    async def download_file(self, file_path: str) -> bytes:
        """从云存储下载文件"""
        pass
    
    @abstractmethod
    async def delete_file(self, file_path: str) -> bool:
        """删除云存储文件"""
        pass
    
    @abstractmethod
    def get_file_url(self, file_path: str, expires_in: int = 3600) -> str:
        """获取文件访问URL"""
        pass
    
    @abstractmethod
    async def file_exists(self, file_path: str) -> bool:
        """检查文件是否存在"""
        pass

class AWSS3Provider(CloudStorageProvider):
    """AWS S3存储提供者"""
    
    def __init__(self, bucket_name: str, region: str = None):
        self.bucket_name = bucket_name
        self.region = region or 'us-east-1'
        
        # 初始化S3客户端
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=self.region
        )
        
        self.s3_resource = boto3.resource(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=self.region
        )
    
    async def upload_file(self, file_content: bytes, file_path: str, content_type: Optional[str] = None) -> str:
        """上传文件到S3"""
        try:
            # 自动检测内容类型
            if not content_type:
                content_type = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
            
            # 上传文件
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_path,
                Body=file_content,
                ContentType=content_type,
                ACL='public-read'  # 公开读取权限
            )
            
            logger.info(f"✅ 文件上传到S3成功: {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"❌ S3上传失败: {e}")
            raise Exception(f"S3上传失败: {str(e)}")
    
    async def download_file(self, file_path: str) -> bytes:
        """从S3下载文件"""
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=file_path)
            return response['Body'].read()
        except Exception as e:
            logger.error(f"❌ S3下载失败: {e}")
            raise Exception(f"S3下载失败: {str(e)}")
    
    async def delete_file(self, file_path: str) -> bool:
        """删除S3文件"""
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=file_path)
            logger.info(f"✅ S3文件删除成功: {file_path}")
            return True
        except Exception as e:
            logger.error(f"❌ S3删除失败: {e}")
            return False
    
    def get_file_url(self, file_path: str, expires_in: int = 3600) -> str:
        """获取S3文件URL"""
        try:
            # 生成预签名URL
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': file_path},
                ExpiresIn=expires_in
            )
            return url
        except Exception as e:
            logger.error(f"❌ 生成S3 URL失败: {e}")
            # 返回公共URL作为备选
            return f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{file_path}"
    
    async def file_exists(self, file_path: str) -> bool:
        """检查S3文件是否存在"""
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=file_path)
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return False
            raise e

class AliyunOSSProvider(CloudStorageProvider):
    """阿里云OSS存储提供者"""
    
    def __init__(self, bucket_name: str, endpoint: str):
        self.bucket_name = bucket_name
        self.endpoint = endpoint
        
        # 初始化OSS客户端
        self.auth = oss2.Auth(settings.ALIYUN_ACCESS_KEY_ID, settings.ALIYUN_ACCESS_KEY_SECRET)
        self.bucket = oss2.Bucket(self.auth, endpoint, bucket_name)
    
    async def upload_file(self, file_content: bytes, file_path: str, content_type: Optional[str] = None) -> str:
        """上传文件到OSS"""
        try:
            # 自动检测内容类型
            if not content_type:
                content_type = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
            
            # 设置元数据
            headers = {'Content-Type': content_type}
            
            # 上传文件
            result = self.bucket.put_object(file_path, file_content, headers=headers)
            
            if result.status == 200:
                logger.info(f"✅ 文件上传到OSS成功: {file_path}")
                return file_path
            else:
                raise Exception(f"OSS上传失败，状态码: {result.status}")
                
        except Exception as e:
            logger.error(f"❌ OSS上传失败: {e}")
            raise Exception(f"OSS上传失败: {str(e)}")
    
    async def download_file(self, file_path: str) -> bytes:
        """从OSS下载文件"""
        try:
            result = self.bucket.get_object(file_path)
            return result.read()
        except Exception as e:
            logger.error(f"❌ OSS下载失败: {e}")
            raise Exception(f"OSS下载失败: {str(e)}")
    
    async def delete_file(self, file_path: str) -> bool:
        """删除OSS文件"""
        try:
            result = self.bucket.delete_object(file_path)
            if result.status == 204:
                logger.info(f"✅ OSS文件删除成功: {file_path}")
                return True
            else:
                logger.error(f"❌ OSS删除失败，状态码: {result.status}")
                return False
        except Exception as e:
            logger.error(f"❌ OSS删除失败: {e}")
            return False
    
    def get_file_url(self, file_path: str, expires_in: int = 3600) -> str:
        """获取OSS文件URL"""
        try:
            # 生成签名URL
            url = self.bucket.sign_url('GET', file_path, expires_in)
            return url
        except Exception as e:
            logger.error(f"❌ 生成OSS URL失败: {e}")
            # 返回公共URL作为备选
            return f"https://{self.bucket_name}.{self.endpoint.replace('http://', '').replace('https://', '')}/{file_path}"
    
    async def file_exists(self, file_path: str) -> bool:
        """检查OSS文件是否存在"""
        try:
            result = self.bucket.head_object(file_path)
            return result.status == 200
        except oss2.exceptions.NoSuchKey:
            return False
        except Exception as e:
            logger.error(f"❌ 检查OSS文件存在性失败: {e}")
            return False

class CloudStorageService:
    """云存储服务管理器"""
    
    def __init__(self):
        self.provider = None
        self._initialize_provider()
    
    def _initialize_provider(self):
        """初始化存储提供者"""
        storage_type = settings.STORAGE_TYPE.lower()
        
        if storage_type == 's3':
            self.provider = AWSS3Provider(
                bucket_name=settings.AWS_S3_BUCKET,
                region=settings.AWS_S3_REGION
            )
            logger.info("✅ 初始化AWS S3存储提供者")
            
        elif storage_type == 'oss':
            self.provider = AliyunOSSProvider(
                bucket_name=settings.ALIYUN_OSS_BUCKET,
                endpoint=settings.ALIYUN_OSS_ENDPOINT
            )
            logger.info("✅ 初始化阿里云OSS存储提供者")
            
        else:
            logger.warning("⚠️ 未配置云存储，使用本地存储")
            self.provider = None
    
    async def upload_file(self, file_content: bytes, file_path: str, content_type: Optional[str] = None) -> str:
        """上传文件"""
        if self.provider:
            return await self.provider.upload_file(file_content, file_path, content_type)
        else:
            # 回退到本地存储
            return await self._save_to_local(file_content, file_path)
    
    async def download_file(self, file_path: str) -> bytes:
        """下载文件"""
        if self.provider:
            return await self.provider.download_file(file_path)
        else:
            # 从本地读取
            return await self._read_from_local(file_path)
    
    async def delete_file(self, file_path: str) -> bool:
        """删除文件"""
        if self.provider:
            return await self.provider.delete_file(file_path)
        else:
            # 删除本地文件
            return await self._delete_local_file(file_path)
    
    def get_file_url(self, file_path: str, expires_in: int = 3600) -> str:
        """获取文件URL"""
        if self.provider:
            return self.provider.get_file_url(file_path, expires_in)
        else:
            # 返回本地文件URL
            return f"/static/{file_path}"
    
    async def file_exists(self, file_path: str) -> bool:
        """检查文件是否存在"""
        if self.provider:
            return await self.provider.file_exists(file_path)
        else:
            # 检查本地文件
            return os.path.exists(os.path.join("static", file_path))
    
    async def _save_to_local(self, file_content: bytes, file_path: str) -> str:
        """保存到本地"""
        try:
            os.makedirs("static", exist_ok=True)
            full_path = os.path.join("static", file_path)
            
            with open(full_path, 'wb') as f:
                f.write(file_content)
            
            logger.info(f"✅ 文件保存到本地: {file_path}")
            return file_path
        except Exception as e:
            logger.error(f"❌ 本地保存失败: {e}")
            raise Exception(f"本地保存失败: {str(e)}")
    
    async def _read_from_local(self, file_path: str) -> bytes:
        """从本地读取"""
        try:
            full_path = os.path.join("static", file_path)
            with open(full_path, 'rb') as f:
                return f.read()
        except Exception as e:
            logger.error(f"❌ 本地读取失败: {e}")
            raise Exception(f"本地读取失败: {str(e)}")
    
    async def _delete_local_file(self, file_path: str) -> bool:
        """删除本地文件"""
        try:
            full_path = os.path.join("static", file_path)
            if os.path.exists(full_path):
                os.remove(full_path)
                logger.info(f"✅ 本地文件删除成功: {file_path}")
                return True
            return False
        except Exception as e:
            logger.error(f"❌ 本地删除失败: {e}")
            return False

# 全局云存储服务实例
cloud_storage_service = CloudStorageService()
