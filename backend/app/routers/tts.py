from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
import io
import logging
import time

# from app.core.security import get_current_user  # 临时注释掉认证
from app.core.database import get_db
from app.models.user import User
from app.services.google_tts import GoogleTTSService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["TTS"])

# 初始化Google TTS服务
tts_service = GoogleTTSService()

class TTSRequest(BaseModel):
    text: str
    language: str = "english"  # cantonese, mandarin, english
    voice_name: Optional[str] = None
    speaking_rate: float = 1.0
    pitch: float = 0.0

class TTSResponse(BaseModel):
    success: bool
    message: str
    audio_url: Optional[str] = None
    duration: Optional[str] = None  # 改为字符串类型以支持 HH:MM:SS 格式

@router.post("/synthesize", response_model=TTSResponse)
async def synthesize_speech(
    request: TTSRequest,
    # current_user: User = Depends(get_current_user)  # 临时移除认证
):
    """
    将文本转换为语音
    
    Args:
        request: TTS请求参数
        # current_user: 当前用户  # 临时注释掉
        
    Returns:
        TTS响应，包含音频URL
    """
    try:
        logger.info(f"TTS synthesis request: text_length={len(request.text)}, language={request.language}, voice_name={request.voice_name}")
        
        # 验证文本长度
        if len(request.text) > 5000:
            raise HTTPException(status_code=400, detail="Text too long. Maximum 5000 characters.")
        
        if len(request.text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Text cannot be empty.")
        
        # 验证语言参数
        valid_languages = ["cantonese", "mandarin", "english"]
        if request.language not in valid_languages:
            raise HTTPException(status_code=400, detail=f"Invalid language. Must be one of: {valid_languages}")
        
        # 验证语速和音调
        if not (0.25 <= request.speaking_rate <= 4.0):
            raise HTTPException(status_code=400, detail="Speaking rate must be between 0.25 and 4.0")
        
        if not (-20.0 <= request.pitch <= 20.0):
            raise HTTPException(status_code=400, detail="Pitch must be between -20.0 and 20.0")
        
        logger.info("Starting Google TTS synthesis...")
        
        # 执行TTS转换
        audio_content = tts_service.text_to_speech(
            text=request.text,
            language=request.language,
            voice_name=request.voice_name,
            speaking_rate=request.speaking_rate,
            pitch=request.pitch
        )
        
        logger.info(f"TTS synthesis completed, audio_content_size={len(audio_content)}")
        
        # 保存音频文件并获取URL
        file_name = f"tts_{int(time.time())}.mp3"
        logger.info(f"Saving audio file: {file_name}")
        
        audio_url = tts_service.save_audio_to_file(audio_content, file_name)
        
        logger.info(f"Audio file saved successfully: {audio_url}")
        
        # 计算音频时长（估算：假设每分钟150个字符）
        estimated_duration = len(request.text) / 150  # 分钟
        duration_seconds = estimated_duration * 60
        
        # 格式化时长为 HH:MM:SS 格式
        hours = int(duration_seconds // 3600)
        minutes = int((duration_seconds % 3600) // 60)
        seconds = int(duration_seconds % 60)
        formatted_duration = f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        
        logger.info(f"Estimated duration: {duration_seconds} seconds ({formatted_duration})")
        
        return TTSResponse(
            success=True,
            message="TTS synthesis completed successfully",
            audio_url=audio_url,
            duration=formatted_duration
        )
        
    except Exception as e:
        logger.error(f"TTS synthesis error: {e}")
        logger.error(f"Exception type: {type(e)}")
        logger.error(f"Exception details: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"TTS synthesis failed: {str(e)}")

@router.post("/synthesize-stream")
async def synthesize_speech_stream(
    request: TTSRequest,
    # current_user: User = Depends(get_current_user)  # 临时移除认证
):
    """
    将文本转换为语音并直接返回音频流
    
    Args:
        request: TTS请求参数
        # current_user: 当前用户  # 临时注释掉
        
    Returns:
        音频流响应
    """
    try:
        # 验证文本长度
        if len(request.text) > 5000:
            raise HTTPException(status_code=400, detail="Text too long. Maximum 5000 characters.")
        
        if len(request.text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Text cannot be empty.")
        
        # 执行TTS转换
        audio_content = tts_service.text_to_speech(
            text=request.text,
            language=request.language,
            voice_name=request.voice_name,
            speaking_rate=request.speaking_rate,
            pitch=request.pitch
        )
        
        # 返回音频流
        return StreamingResponse(
            io.BytesIO(audio_content),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"attachment; filename=tts_audio.mp3",
                "Content-Length": str(len(audio_content))
            }
        )
        
    except Exception as e:
        logger.error(f"TTS stream error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS synthesis failed: {str(e)}")

@router.get("/voices")
async def get_available_voices(
    language_code: Optional[str] = None,
    # current_user: User = Depends(get_current_user)  # 临时移除认证
):
    """
    获取可用的声音列表
    
    Args:
        language_code: 语言代码 (可选)
        # current_user: 当前用户  # 临时注释掉
        
    Returns:
        可用声音列表
    """
    try:
        voices = tts_service.get_available_voices(language_code)
        return {
            "success": True,
            "voices": voices,
            "count": len(voices)
        }
    except Exception as e:
        logger.error(f"Error getting voices: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get voices: {str(e)}")

@router.get("/voices/{language}")
async def get_language_voices(
    language: str,
    # current_user: User = Depends(get_current_user)  # 临时移除认证
):
    """
    获取指定语言的可用音色列表
    
    Args:
        language: 语言代码 (cantonese, mandarin, english)
        # current_user: 当前用户  # 临时注释掉
        
    Returns:
        该语言的可用音色列表
    """
    try:
        # 验证语言参数
        valid_languages = ["cantonese", "mandarin", "english"]
        if language not in valid_languages:
            raise HTTPException(status_code=400, detail=f"Invalid language. Must be one of: {valid_languages}")
        
        # 直接返回硬编码的语音列表，避免Google Cloud API调用
        voice_mapping = {
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
                ]
            },
            'mandarin': {
                'voices': [
                    {
                        'name': 'cmn-CN-Standard-A',
                        'display_name': '小美',
                        'description': '温柔甜美的普通话女声',
                        'gender': 'FEMALE'
                    },
                    {
                        'name': 'cmn-CN-Standard-B',
                        'display_name': '阿强', 
                        'description': '成熟稳重的普通话男声',
                        'gender': 'MALE'
                    }
                ]
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
                        'display_name': 'John',
                        'description': 'Clear and professional English male voice',
                        'gender': 'MALE'
                    }
                ]
            }
        }
        
        voices = voice_mapping.get(language, {}).get('voices', [])
        
        return {
            "success": True,
            "language": language,
            "voices": voices,
            "count": len(voices)
        }
        
    except Exception as e:
        logger.error(f"Error getting voices for language {language}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get voices: {str(e)}")

@router.get("/languages")
async def get_supported_languages():
    """
    获取支持的语言列表
    
    Returns:
        支持的语言列表
    """
    languages = [
        {
            "code": "cantonese",
            "name": "粤语",
            "voice_count": 4,
            "voices": [
                {"name": "yue-HK-Standard-A", "display_name": "龍眼妹", "description": "温柔甜美的粤语女声，适合生活分享和情感内容", "gender": "FEMALE"},
                {"name": "yue-HK-Standard-B", "display_name": "大佬", "description": "成熟稳重的粤语男声，适合新闻播报和正式内容", "gender": "MALE"},
                {"name": "yue-HK-Standard-C", "display_name": "阿姐", "description": "亲切自然的粤语女声，适合日常对话和轻松内容", "gender": "FEMALE"},
                {"name": "yue-HK-Standard-D", "display_name": "收数佬", "description": "活力四射的粤语男声，适合娱乐节目和动感内容", "gender": "MALE"}
            ]
        },
        {
            "code": "mandarin", 
            "name": "普通话",
            "voice_count": 2,
            "voices": [
                {"name": "cmn-CN-Standard-A", "display_name": "小美", "description": "温柔甜美的普通话女声", "gender": "FEMALE"},
                {"name": "cmn-CN-Standard-B", "display_name": "阿强", "description": "成熟稳重的普通话男声", "gender": "MALE"}
            ]
        },
        {
            "code": "english",
            "name": "English",
            "voice_count": 2,
            "voices": [
                {"name": "en-US-Standard-A", "display_name": "Sarah", "description": "Clear and professional English female voice", "gender": "FEMALE"},
                {"name": "en-US-Standard-B", "display_name": "Mike", "description": "Friendly and energetic English male voice", "gender": "MALE"}
            ]
        }
    ]
    
    return {
        "success": True,
        "languages": languages,
        "count": len(languages)
    } 