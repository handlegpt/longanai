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
        # 检查是否有Google Cloud凭证
        if not os.getenv('GOOGLE_APPLICATION_CREDENTIALS'):
            logger.warning("Google Cloud credentials not found. Please set GOOGLE_APPLICATION_CREDENTIALS environment variable.")
        
        self.client = texttospeech.TextToSpeechClient()
        
        # 语言和声音映射
        self.voice_mapping = {
            'cantonese': {
                'language_code': 'yue-HK',
                'voice_name': 'yue-HK-Standard-A',
                'name': '粤语'
            },
            'mandarin': {
                'language_code': 'cmn-CN',
                'voice_name': 'cmn-CN-Standard-A',
                'name': '普通话'
            },
            'english': {
                'language_code': 'en-US',
                'voice_name': 'en-US-Standard-A',
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
                name=voice_name or voice_config['voice_name']
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
        将音频内容保存到文件
        
        Args:
            audio_content: 音频字节数据
            file_path: 文件路径
            
        Returns:
            保存的文件路径
        """
        try:
            with open(file_path, 'wb') as f:
                f.write(audio_content)
            return file_path
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