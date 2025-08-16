import os
import tempfile
from typing import Optional
from google.cloud import texttospeech
from google.cloud.texttospeech import SynthesisInput, VoiceSelectionParams, AudioConfig
import logging

logger = logging.getLogger(__name__)

class GoogleTTSService:
    def __init__(self):
        """初始化Google TTS服务"""
        logger.info("Initializing Google TTS Service...")
        
        # 检查是否有Google Cloud凭证
        credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        logger.info(f"Google Cloud credentials path: {credentials_path}")
        
        if not credentials_path:
            logger.warning("Google Cloud credentials not found. Please set GOOGLE_APPLICATION_CREDENTIALS environment variable.")
        else:
            logger.info(f"Google Cloud credentials file exists: {os.path.exists(credentials_path)}")
        
        try:
            self.client = texttospeech.TextToSpeechClient()
            logger.info("Google TTS client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Google TTS client: {e}")
            raise Exception(f"Google TTS client initialization failed: {str(e)}")
        
        # 语言和声音映射
        self.voice_mapping = {
            'cantonese': {
                'voices': [
                    {
                        'name': 'yue-HK-Standard-A',
                        'display_name': '龍眼妹',
                        'description': '温柔甜美的粤语女声，适合生活分享和情感内容',
                        'gender': 'FEMALE'
                    },
                    {
                        'name': 'yue-HK-Standard-B', 
                        'display_name': '大佬',
                        'description': '成熟稳重的粤语男声，适合新闻播报和正式内容',
                        'gender': 'MALE'
                    },
                    {
                        'name': 'yue-HK-Standard-C',
                        'display_name': '阿姐', 
                        'description': '亲切自然的粤语女声，适合日常对话和轻松内容',
                        'gender': 'FEMALE'
                    },
                    {
                        'name': 'yue-HK-Standard-D',
                        'display_name': '收数佬',
                        'description': '活力四射的粤语男声，适合娱乐节目和动感内容',
                        'gender': 'MALE'
                    }
                ],
                'language_code': 'yue-HK',
                'default_voice': 'yue-HK-Standard-A',
                'name': '粤语'
            },
            'mandarin': {
                'voices': [
                    {
                        'name': 'cmn-CN-Standard-A',
                        'display_name': '小芳',
                        'description': '温柔甜美的普通话女声',
                        'gender': 'FEMALE'
                    },
                    {
                        'name': 'cmn-CN-Standard-B',
                        'display_name': '阿强', 
                        'description': '成熟稳重的普通话男声',
                        'gender': 'MALE'
                    },
                    {
                        'name': 'cmn-CN-Standard-C',
                        'display_name': '小丽',
                        'description': '亲切自然的普通话女声，适合生活分享',
                        'gender': 'FEMALE'
                    },
                    {
                        'name': 'cmn-CN-Standard-D',
                        'display_name': '老李',
                        'description': '成熟稳重的普通话男声，适合正式内容',
                        'gender': 'MALE'
                    }
                ],
                'language_code': 'cmn-CN',
                'default_voice': 'cmn-CN-Standard-A',
                'name': '普通话'
            },
            'english': {
                'voices': [
                    {
                        'name': 'en-US-Standard-A',
                        'display_name': 'Sarah',
                        'description': 'Clear and professional English female voice',
                        'gender': 'FEMALE'
                    },
                    {
                        'name': 'en-US-Standard-B',
                        'display_name': 'Mike',
                        'description': 'Friendly and energetic English male voice',
                        'gender': 'MALE'
                    }
                ],
                'language_code': 'en-US',
                'default_voice': 'en-US-Standard-A',
                'name': 'English'
            }
        }
    
    def text_to_speech(self, text: str, language: str = 'english', 
                       voice_name: Optional[str] = None, 
                       speaking_rate: float = 1.0,
                       pitch: float = 0.0) -> bytes:
        """
        将文本转换为语音
        
        Args:
            text: 要转换的文本
            language: 语言代码 (cantonese, mandarin, english)
            voice_name: 特定的声音名称
            speaking_rate: 语速 (0.25-4.0)
            pitch: 音调 (-20.0-20.0)
            
        Returns:
            音频数据的字节
        """
        try:
            # 获取语言配置
            if language not in self.voice_mapping:
                language = 'english'  # 默认使用英语
            
            voice_config = self.voice_mapping[language]
            
            # 设置合成输入
            synthesis_input = SynthesisInput(text=text)
            
            # 设置声音参数
            voice = VoiceSelectionParams(
                language_code=voice_config['language_code'],
                name=voice_name or voice_config['default_voice']
            )
            
            # 设置音频配置
            audio_config = AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=speaking_rate,
                pitch=pitch
            )
            
            # 执行文本转语音
            response = self.client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
            
            return response.audio_content
            
        except Exception as e:
            logger.error(f"Google TTS error: {e}")
            raise Exception(f"TTS conversion failed: {str(e)}")
    
    def get_available_voices(self, language_code: str = None) -> list:
        """
        获取可用的声音列表
        
        Args:
            language_code: 语言代码 (可选)
            
        Returns:
            可用声音的列表
        """
        try:
            voices = self.client.list_voices(language_code=language_code)
            return [
                {
                    'name': voice.name,
                    'language_code': voice.language_codes[0],
                    'ssml_gender': voice.ssml_gender.name,
                    'natural_sample_rate_hertz': voice.natural_sample_rate_hertz
                }
                for voice in voices.voices
            ]
        except Exception as e:
            logger.error(f"Error getting voices: {e}")
            return []
    
    def save_audio_to_file(self, audio_content: bytes, file_path: str) -> str:
        """
        将音频内容保存到文件并返回可访问的URL
        
        Args:
            audio_content: 音频字节数据
            file_path: 文件路径
            
        Returns:
            可访问的音频URL
        """
        try:
            # 创建uploads目录（如果不存在）
            uploads_dir = "uploads/tts"
            os.makedirs(uploads_dir, exist_ok=True)
            
            # 保存文件到uploads目录
            full_path = os.path.join(uploads_dir, file_path)
            with open(full_path, 'wb') as f:
                f.write(audio_content)
            
            # 返回可访问的URL
            return f"/uploads/tts/{file_path}"
        except Exception as e:
            logger.error(f"Error saving audio file: {e}")
            raise Exception(f"Failed to save audio file: {str(e)}")
    
    def create_temp_audio_file(self, audio_content: bytes, suffix: str = '.mp3') -> str:
        """
        创建临时音频文件
        
        Args:
            audio_content: 音频字节数据
            suffix: 文件后缀
            
        Returns:
            临时文件路径
        """
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        temp_file.write(audio_content)
        temp_file.close()
        return temp_file.name 