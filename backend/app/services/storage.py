import os
import uuid
from datetime import datetime
from typing import Optional, BinaryIO
from abc import ABC, abstractmethod
import boto3
from botocore.exceptions import ClientError
import aiofiles
from fastapi import UploadFile
import oss2  # 阿里云OSS SDK

class StorageProvider(ABC):
    """存储提供者抽象基类"""
    
    @abstractmethod
    async def upload_file(self, file_content: bytes, file_path: str) -> str:
        """上传文件"""
        pass
    
    @abstractmethod
    async def download_file(self, file_path: str) -> bytes:
        """下载文件"""
        pass
    
    @abstractmethod
    async def delete_file(self, file_path: str) -> bool:
        """删除文件"""
        pass
    
    @abstractmethod
    def get_file_url(self, file_path: str) -> str:
        """获取文件访问URL"""
        pass

class LocalStorageProvider(StorageProvider):
    """本地存储提供者"""
    
    def __init__(self, base_path: str = "static"):
        self.base_path = base_path
        os.makedirs(base_path, exist_ok=True)
    
    async def upload_file(self, file_content: bytes, file_path: str) -> str:
        """上传文件到本地"""
        full_path = os.path.join(self.base_path, file_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        async with aiofiles.open(full_path, 'wb') as f:
            await f.write(file_content)
        
        return file_path
    
    async def download_file(self, file_path: str) -> bytes:
        """从本地下载文件"""
        full_path = os.path.join(self.base_path, file_path)
        async with aiofiles.open(full_path, 'rb') as f:
            return await f.read()
    
    async def delete_file(self, file_path: str) -> bool:
        """删除本地文件"""
        try:
            full_path = os.path.join(self.base_path, file_path)
            if os.path.exists(full_path):
                os.remove(full_path)
                return True
            return False
        except Exception:
            return False
    
    def get_file_url(self, file_path: str) -> str:
        """获取本地文件URL"""
        return f"/static/{file_path}"

class S3StorageProvider(StorageProvider):
    """AWS S3存储提供者"""
    
    def __init__(self, bucket_name: str, region: str = "ap-southeast-1"):
        self.bucket_name = bucket_name
        self.s3_client = boto3.client('s3', region_name=region)
    
    async def upload_file(self, file_content: bytes, file_path: str) -> str:
        """上传文件到S3"""
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_path,
                Body=file_content,
                ContentType=self._get_content_type(file_path)
            )
            return file_path
        except ClientError as e:
            raise Exception(f"S3上传失败: {e}")
    
    async def download_file(self, file_path: str) -> bytes:
        """从S3下载文件"""
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=file_path
            )
            return response['Body'].read()
        except ClientError as e:
            raise Exception(f"S3下载失败: {e}")
    
    async def delete_file(self, file_path: str) -> bool:
        """删除S3文件"""
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=file_path
            )
            return True
        except ClientError:
            return False
    
    def get_file_url(self, file_path: str) -> str:
        """获取S3文件URL"""
        return f"https://{self.bucket_name}.s3.amazonaws.com/{file_path}"
    
    def _get_content_type(self, file_path: str) -> str:
        """根据文件扩展名获取Content-Type"""
        ext = os.path.splitext(file_path)[1].lower()
        content_types = {
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.pdf': 'application/pdf',
            '.txt': 'text/plain',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif'
        }
        return content_types.get(ext, 'application/octet-stream')

class AliyunOSSProvider(StorageProvider):
    """阿里云OSS存储提供者"""
    
    def __init__(self, bucket_name: str, endpoint: str, access_key_id: str, access_key_secret: str):
        self.bucket_name = bucket_name
        self.auth = oss2.Auth(access_key_id, access_key_secret)
        self.bucket = oss2.Bucket(self.auth, endpoint, bucket_name)
    
    async def upload_file(self, file_content: bytes, file_path: str) -> str:
        """上传文件到阿里云OSS"""
        try:
            # 注意：oss2是同步库，这里用线程池处理
            import asyncio
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None, 
                lambda: self.bucket.put_object(file_path, file_content)
            )
            return file_path
        except Exception as e:
            raise Exception(f"OSS上传失败: {e}")
    
    async def download_file(self, file_path: str) -> bytes:
        """从阿里云OSS下载文件"""
        try:
            import asyncio
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: self.bucket.get_object(file_path)
            )
            return result.read()
        except Exception as e:
            raise Exception(f"OSS下载失败: {e}")
    
    async def delete_file(self, file_path: str) -> bool:
        """删除阿里云OSS文件"""
        try:
            import asyncio
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.bucket.delete_object(file_path)
            )
            return True
        except Exception:
            return False
    
    def get_file_url(self, file_path: str) -> str:
        """获取阿里云OSS文件URL"""
        return f"https://{self.bucket_name}.{self.bucket.endpoint.replace('http://', '').replace('https://', '')}/{file_path}"

class StorageService:
    """统一存储服务"""
    
    def __init__(self, provider: StorageProvider):
        self.provider = provider
    
    def generate_file_path(self, user_id: str, file_type: str, original_name: str) -> str:
        """生成文件路径"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_id = str(uuid.uuid4())[:8]
        extension = os.path.splitext(original_name)[1]
        
        return f"{file_type}/{datetime.now().year}/{datetime.now().month:02d}/{user_id}/{timestamp}_{file_id}{extension}"
    
    async def upload_file(self, file: UploadFile, user_id: str, file_type: str = "audio") -> dict:
        """上传文件"""
        content = await file.read()
        file_path = self.generate_file_path(user_id, file_type, file.filename)
        
        await self.provider.upload_file(content, file_path)
        
        return {
            "file_path": file_path,
            "file_url": self.provider.get_file_url(file_path),
            "file_size": len(content),
            "original_name": file.filename
        }
    
    async def upload_audio(self, audio_content: bytes, user_id: str, title: str = "") -> dict:
        """上传音频文件"""
        file_path = self.generate_file_path(user_id, "audio", f"{title or 'podcast'}.mp3")
        
        await self.provider.upload_file(audio_content, file_path)
        
        return {
            "file_path": file_path,
            "file_url": self.provider.get_file_url(file_path),
            "file_size": len(audio_content)
        }
    
    async def delete_file(self, file_path: str) -> bool:
        """删除文件"""
        return await self.provider.delete_file(file_path)
    
    def get_file_url(self, file_path: str) -> str:
        """获取文件URL"""
        return self.provider.get_file_url(file_path)

# 存储服务实例
def get_storage_service() -> StorageService:
    """获取存储服务实例"""
    # 根据环境变量选择存储提供者
    storage_type = os.getenv("STORAGE_TYPE", "local")
    
    if storage_type == "s3":
        bucket_name = os.getenv("S3_BUCKET_NAME", "longanai-audio")
        region = os.getenv("AWS_REGION", "ap-southeast-1")
        provider = S3StorageProvider(bucket_name, region)
    elif storage_type == "aliyun_oss":
        bucket_name = os.getenv("OSS_BUCKET_NAME", "longanai-audio")
        endpoint = os.getenv("OSS_ENDPOINT", "oss-cn-hangzhou.aliyuncs.com")
        access_key_id = os.getenv("OSS_ACCESS_KEY_ID", "")
        access_key_secret = os.getenv("OSS_ACCESS_KEY_SECRET", "")
        provider = AliyunOSSProvider(bucket_name, endpoint, access_key_id, access_key_secret)
    else:
        base_path = os.getenv("LOCAL_STORAGE_PATH", "static")
        provider = LocalStorageProvider(base_path)
    
    return StorageService(provider) 