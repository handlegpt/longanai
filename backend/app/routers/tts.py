from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import io
import logging
from ..services.google_tts import GoogleTTSService
from ..core.auth import get_current_user
from ..models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tts", tags=["TTS"])

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
    duration: Optional[float] = None

@router.post("/synthesize", response_model=TTSResponse)
async def synthesize_speech(
    request: TTSRequest,
    current_user: User = Depends(get_current_user)
):
    """
    将文本转换为语音
    
    Args:
        request: TTS请求参数
        current_user: 当前用户
        
    Returns:
        TTS响应，包含音频URL
    """
    try:
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
        
        # 执行TTS转换
        audio_content = tts_service.text_to_speech(
            text=request.text,
            language=request.language,
            voice_name=request.voice_name,
            speaking_rate=request.speaking_rate,
            pitch=request.pitch
        )
        
        # 这里可以集成到你的存储服务中
        # 暂时返回成功状态，实际项目中需要保存到云存储
        return TTSResponse(
            success=True,
            message="TTS synthesis completed successfully",
            audio_url=None,  # 需要集成存储服务
            duration=None
        )
        
    except Exception as e:
        logger.error(f"TTS synthesis error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS synthesis failed: {str(e)}")

@router.post("/synthesize-stream")
async def synthesize_speech_stream(
    request: TTSRequest,
    current_user: User = Depends(get_current_user)
):
    """
    将文本转换为语音并直接返回音频流
    
    Args:
        request: TTS请求参数
        current_user: 当前用户
        
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
    current_user: User = Depends(get_current_user)
):
    """
    获取可用的声音列表
    
    Args:
        language_code: 语言代码 (可选)
        current_user: 当前用户
        
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
            "voice_name": "yue-HK-Standard-A",
            "language_code": "yue-HK"
        },
        {
            "code": "mandarin", 
            "name": "普通话",
            "voice_name": "cmn-CN-Standard-A",
            "language_code": "cmn-CN"
        },
        {
            "code": "english",
            "name": "English",
            "voice_name": "en-US-Standard-A", 
            "language_code": "en-US"
        }
    ]
    
    return {
        "success": True,
        "languages": languages,
        "count": len(languages)
    } 