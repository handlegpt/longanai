from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import edge_tts
import asyncio
import os
import uuid
import traceback
from datetime import datetime, timedelta
from pydub import AudioSegment

from app.core.database import get_db
from app.core.config import settings
from app.models.podcast import Podcast
from app.models.user import User

router = APIRouter()

# Voice mapping
VOICE_MAPPING = {
    "young-lady": "zh-HK-HiuGaaiNeural",
    "young-man": "zh-HK-WanLungNeural", 
}

# Subscription limits
SUBSCRIPTION_LIMITS = {
    "free": 10,      # 免费用户每月10个
    "pro": 50,       # 专业版每月50个
    "enterprise": -1  # 企业版无限制 (-1表示无限制)
}

class PodcastGenerateRequest(BaseModel):
    text: str
    voice: str = "young-lady"
    emotion: str = "normal"
    speed: float = 1.0
    user_email: str  # 添加用户邮箱字段

def format_duration(seconds):
    """Format duration in seconds to HH:MM:SS"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds = int(seconds % 60)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

@router.post("/generate")
async def generate_podcast(
    request: PodcastGenerateRequest,
    db: Session = Depends(get_db)
):
    """Generate podcast from text"""
    try:
        print(f"🎤 Starting podcast generation with voice: {request.voice}")
        
        # Check user and their generation limits
        user = db.query(User).filter(User.email == request.user_email).first()
        if not user:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        if not user.is_verified:
            raise HTTPException(status_code=403, detail="请先验证邮箱")
        
        # Check if monthly count needs to be reset
        now = datetime.utcnow()
        if user.last_generation_reset is None or user.last_generation_reset.month != now.month or user.last_generation_reset.year != now.year:
            user.monthly_generation_count = 0
            user.last_generation_reset = now
        
        # Check generation limits
        user_limit = SUBSCRIPTION_LIMITS.get(user.subscription_plan, 10)
        if user_limit != -1 and user.monthly_generation_count >= user_limit:
            raise HTTPException(
                status_code=429, 
                detail=f"已达到本月生成限制 ({user_limit} 个)。请升级到专业版获得更多生成次数。"
            )
        
        # Validate voice
        if request.voice not in VOICE_MAPPING:
            print(f"❌ Invalid voice: {request.voice}")
            raise HTTPException(status_code=400, detail="Invalid voice selection")
        
        # Get TTS voice
        tts_voice = VOICE_MAPPING[request.voice]
        print(f"🎵 Using TTS voice: {tts_voice}")
        
        # Generate audio using Edge TTS
        print("🔄 Creating Edge TTS communicate object...")
        communicate = edge_tts.Communicate(request.text, tts_voice)
        
        # Create unique filename
        filename = f"podcast_{uuid.uuid4()}.mp3"
        filepath = os.path.join("static", filename)
        print(f"📁 Audio file path: {filepath}")
        
        # Ensure static directory exists
        os.makedirs("static", exist_ok=True)
        print("✅ Static directory ensured")
        
        # Generate audio file
        print("🎵 Generating audio file...")
        await communicate.save(filepath)
        print("✅ Audio file generated successfully")
        
        # Calculate audio duration
        try:
            audio = AudioSegment.from_mp3(filepath)
            duration_seconds = len(audio) / 1000.0  # Convert milliseconds to seconds
            duration_str = format_duration(duration_seconds)
            print(f"⏱️ Audio duration: {duration_str}")
        except Exception as e:
            print(f"⚠️ Could not calculate duration: {e}")
            duration_str = "00:00:00"
        
        # Get file size
        file_size = os.path.getsize(filepath)
        print(f"📊 File size: {file_size} bytes")
        
        # Create podcast record
        podcast = Podcast(
            title=f"播客_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            content=request.text,
            voice=request.voice,
            emotion=request.emotion,
            speed=request.speed,
            audio_url=f"/static/{filename}",
            duration=duration_str,
            file_size=file_size
        )
        
        print("💾 Saving podcast record to database...")
        db.add(podcast)
        
        # Update user's generation count
        user.monthly_generation_count += 1
        db.commit()
        db.refresh(podcast)
        print(f"✅ Podcast saved with ID: {podcast.id}")
        
        return {
            "id": podcast.id,
            "audioUrl": podcast.audio_url,
            "title": podcast.title,
            "duration": duration_str,
            "message": "播客生成成功",
            "remainingGenerations": user_limit - user.monthly_generation_count if user_limit != -1 else -1
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error during podcast generation: {str(e)}")
        print(f"🔍 Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"生成失败: {str(e)}")

@router.get("/history")
def get_podcast_history(db: Session = Depends(get_db)):
    """Get podcast history"""
    podcasts = db.query(Podcast).order_by(Podcast.created_at.desc()).limit(50).all()
    
    return {
        "history": [
            {
                "id": podcast.id,
                "title": podcast.title,
                "voice": podcast.voice,
                "duration": podcast.duration,
                "createdAt": podcast.created_at.isoformat(),
                "audioUrl": podcast.audio_url
            }
            for podcast in podcasts
        ]
    }

@router.delete("/history/{podcast_id}")
def delete_podcast(podcast_id: int, db: Session = Depends(get_db)):
    """Delete a podcast"""
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    
    if not podcast:
        raise HTTPException(status_code=404, detail="播客不存在")
    
    # Delete audio file if exists
    if podcast.audio_url:
        filepath = os.path.join(settings.UPLOAD_DIR, os.path.basename(podcast.audio_url))
        if os.path.exists(filepath):
            os.remove(filepath)
    
    db.delete(podcast)
    db.commit()
    
    return {"message": "删除成功"} 

@router.get("/user/stats")
def get_user_stats(user_email: str, db: Session = Depends(get_db)):
    """Get user's podcast generation statistics"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # Check if monthly count needs to be reset
    now = datetime.utcnow()
    if user.last_generation_reset is None or user.last_generation_reset.month != now.month or user.last_generation_reset.year != now.year:
        user.monthly_generation_count = 0
        user.last_generation_reset = now
        db.commit()
    
    user_limit = SUBSCRIPTION_LIMITS.get(user.subscription_plan, 10)
    remaining = user_limit - user.monthly_generation_count if user_limit != -1 else -1
    
    return {
        "subscription_plan": user.subscription_plan,
        "monthly_generation_count": user.monthly_generation_count,
        "monthly_generation_limit": user_limit,
        "remaining_generations": remaining,
        "is_unlimited": user_limit == -1
    } 