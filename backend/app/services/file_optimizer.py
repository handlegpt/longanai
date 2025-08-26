import os
import logging
from typing import Tuple, Optional, Dict, Any
from PIL import Image, ImageOps
import io
import mimetypes
from pydub import AudioSegment
import tempfile
import subprocess
from app.core.config import settings

logger = logging.getLogger(__name__)

class FileOptimizer:
    """文件优化服务"""
    
    def __init__(self):
        # 图片优化配置
        self.image_config = {
            'max_width': 1920,
            'max_height': 1080,
            'quality': 85,
            'formats': ['JPEG', 'PNG', 'WEBP'],
            'thumbnail_sizes': [150, 300, 600]
        }
        
        # 音频优化配置
        self.audio_config = {
            'target_bitrate': '128k',
            'sample_rate': 44100,
            'channels': 2,
            'format': 'mp3'
        }
    
    async def optimize_image(self, image_content: bytes, filename: str) -> Tuple[bytes, Dict[str, Any]]:
        """优化图片文件"""
        try:
            # 打开图片
            image = Image.open(io.BytesIO(image_content))
            
            # 获取原始信息
            original_format = image.format
            original_size = image.size
            original_mode = image.mode
            
            # 转换为RGB模式（如果需要）
            if image.mode in ('RGBA', 'LA', 'P'):
                # 创建白色背景
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            
            # 调整尺寸
            image = self._resize_image(image)
            
            # 优化质量
            optimized_content = self._optimize_image_quality(image, filename)
            
            # 生成缩略图
            thumbnails = self._generate_thumbnails(image, filename)
            
            # 计算压缩率
            original_size_bytes = len(image_content)
            optimized_size_bytes = len(optimized_content)
            compression_ratio = (1 - optimized_size_bytes / original_size_bytes) * 100
            
            optimization_info = {
                'original_size': original_size_bytes,
                'optimized_size': optimized_size_bytes,
                'compression_ratio': round(compression_ratio, 2),
                'original_dimensions': original_size,
                'optimized_dimensions': image.size,
                'thumbnails': thumbnails
            }
            
            logger.info(f"✅ 图片优化完成: {filename}, 压缩率: {compression_ratio:.2f}%")
            return optimized_content, optimization_info
            
        except Exception as e:
            logger.error(f"❌ 图片优化失败: {e}")
            raise Exception(f"图片优化失败: {str(e)}")
    
    def _resize_image(self, image: Image.Image) -> Image.Image:
        """调整图片尺寸"""
        width, height = image.size
        max_width = self.image_config['max_width']
        max_height = self.image_config['max_height']
        
        # 计算缩放比例
        scale = min(max_width / width, max_height / height, 1.0)
        
        if scale < 1.0:
            new_width = int(width * scale)
            new_height = int(height * scale)
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        return image
    
    def _optimize_image_quality(self, image: Image.Image, filename: str) -> bytes:
        """优化图片质量"""
        output = io.BytesIO()
        
        # 根据文件扩展名选择格式
        ext = os.path.splitext(filename)[1].lower()
        
        if ext in ['.jpg', '.jpeg']:
            image.save(output, format='JPEG', quality=self.image_config['quality'], optimize=True)
        elif ext == '.png':
            image.save(output, format='PNG', optimize=True)
        elif ext == '.webp':
            image.save(output, format='WEBP', quality=self.image_config['quality'])
        else:
            # 默认使用JPEG
            image.save(output, format='JPEG', quality=self.image_config['quality'], optimize=True)
        
        output.seek(0)
        return output.getvalue()
    
    def _generate_thumbnails(self, image: Image.Image, filename: str) -> Dict[str, bytes]:
        """生成缩略图"""
        thumbnails = {}
        
        for size in self.image_config['thumbnail_sizes']:
            # 创建缩略图
            thumbnail = image.copy()
            thumbnail.thumbnail((size, size), Image.Resampling.LANCZOS)
            
            # 保存缩略图
            output = io.BytesIO()
            thumbnail.save(output, format='JPEG', quality=80, optimize=True)
            output.seek(0)
            
            thumbnails[f"thumb_{size}"] = output.getvalue()
        
        return thumbnails
    
    async def optimize_audio(self, audio_content: bytes, filename: str) -> Tuple[bytes, Dict[str, Any]]:
        """优化音频文件"""
        try:
            # 创建临时文件
            with tempfile.NamedTemporaryFile(suffix=os.path.splitext(filename)[1], delete=False) as temp_in:
                temp_in.write(audio_content)
                temp_in_path = temp_in.name
            
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_out:
                temp_out_path = temp_out.name
            
            try:
                # 使用pydub加载音频
                audio = AudioSegment.from_file(temp_in_path)
                
                # 获取原始信息
                original_duration = len(audio)
                original_channels = audio.channels
                original_sample_rate = audio.frame_rate
                
                # 优化音频
                optimized_audio = self._optimize_audio_quality(audio)
                
                # 导出优化后的音频
                optimized_audio.export(
                    temp_out_path,
                    format='mp3',
                    bitrate=self.audio_config['target_bitrate'],
                    parameters=['-q:a', '2']  # 高质量设置
                )
                
                # 读取优化后的内容
                with open(temp_out_path, 'rb') as f:
                    optimized_content = f.read()
                
                # 计算压缩率
                original_size_bytes = len(audio_content)
                optimized_size_bytes = len(optimized_content)
                compression_ratio = (1 - optimized_size_bytes / original_size_bytes) * 100
                
                optimization_info = {
                    'original_size': original_size_bytes,
                    'optimized_size': optimized_size_bytes,
                    'compression_ratio': round(compression_ratio, 2),
                    'original_duration': original_duration,
                    'original_channels': original_channels,
                    'original_sample_rate': original_sample_rate,
                    'optimized_duration': len(optimized_audio),
                    'optimized_channels': optimized_audio.channels,
                    'optimized_sample_rate': optimized_audio.frame_rate
                }
                
                logger.info(f"✅ 音频优化完成: {filename}, 压缩率: {compression_ratio:.2f}%")
                return optimized_content, optimization_info
                
            finally:
                # 清理临时文件
                os.unlink(temp_in_path)
                os.unlink(temp_out_path)
                
        except Exception as e:
            logger.error(f"❌ 音频优化失败: {e}")
            raise Exception(f"音频优化失败: {str(e)}")
    
    def _optimize_audio_quality(self, audio: AudioSegment) -> AudioSegment:
        """优化音频质量"""
        # 标准化音量
        audio = audio.normalize()
        
        # 调整采样率
        if audio.frame_rate != self.audio_config['sample_rate']:
            audio = audio.set_frame_rate(self.audio_config['sample_rate'])
        
        # 调整声道数
        if audio.channels != self.audio_config['channels']:
            if self.audio_config['channels'] == 1:
                audio = audio.set_channels(1)
            else:
                audio = audio.set_channels(2)
        
        return audio
    
    async def optimize_file(self, file_content: bytes, filename: str) -> Tuple[bytes, Dict[str, Any]]:
        """通用文件优化"""
        try:
            # 检测文件类型
            content_type = mimetypes.guess_type(filename)[0]
            
            if content_type and content_type.startswith('image/'):
                return await self.optimize_image(file_content, filename)
            elif content_type and content_type.startswith('audio/'):
                return await self.optimize_audio(file_content, filename)
            else:
                # 不支持的文件类型，返回原文件
                logger.warning(f"⚠️ 不支持的文件类型: {content_type}")
                return file_content, {
                    'original_size': len(file_content),
                    'optimized_size': len(file_content),
                    'compression_ratio': 0,
                    'message': '不支持的文件类型，未进行优化'
                }
                
        except Exception as e:
            logger.error(f"❌ 文件优化失败: {e}")
            # 返回原文件作为备选
            return file_content, {
                'original_size': len(file_content),
                'optimized_size': len(file_content),
                'compression_ratio': 0,
                'error': str(e)
            }
    
    def get_file_info(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """获取文件信息"""
        try:
            content_type = mimetypes.guess_type(filename)[0]
            file_size = len(file_content)
            
            info = {
                'filename': filename,
                'content_type': content_type,
                'size_bytes': file_size,
                'size_mb': round(file_size / (1024 * 1024), 2)
            }
            
            if content_type and content_type.startswith('image/'):
                # 获取图片信息
                image = Image.open(io.BytesIO(file_content))
                info.update({
                    'width': image.size[0],
                    'height': image.size[1],
                    'format': image.format,
                    'mode': image.mode
                })
            
            elif content_type and content_type.startswith('audio/'):
                # 获取音频信息
                audio = AudioSegment.from_file(io.BytesIO(file_content))
                info.update({
                    'duration_ms': len(audio),
                    'duration_seconds': round(len(audio) / 1000, 2),
                    'channels': audio.channels,
                    'sample_rate': audio.frame_rate,
                    'frame_width': audio.frame_width
                })
            
            return info
            
        except Exception as e:
            logger.error(f"❌ 获取文件信息失败: {e}")
            return {
                'filename': filename,
                'error': str(e)
            }

# 全局文件优化器实例
file_optimizer = FileOptimizer()
