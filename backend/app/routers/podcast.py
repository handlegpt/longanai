from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import edge_tts
import asyncio
import os
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.config import settings
from app.models.podcast import Podcast

router = APIRouter()

# Voice mapping
VOICE_MAPPING = {
    "young-lady": "zh-HK-HiuGaaiNeural",
    "young-man": "zh-HK-WanLungNeural", 
    "grandma": "zh-HK-HiuGaaiNeural",  # 暂时用靓女声音
}

@router.post("/generate")
async def generate_podcast(
    text: str,
    voice: str = "young-lady",
    emotion: str = "normal",
    speed: float = 1.0,
    db: Session = Depends(get_db)
):
    """Generate podcast from text"""
    try:
        # Validate voice
        if voice not in VOICE_MAPPING:
            raise HTTPException(status_code=400, detail="Invalid voice selection")
        
        # Get TTS voice
        tts_voice = VOICE_MAPPING[voice]
        
        # Generate audio using Edge TTS
        communicate = edge_tts.Communicate(text, tts_voice)
        
        # Create unique filename
        filename = f"podcast_{uuid.uuid4()}.mp3"
        filepath = os.path.join("static", filename)
        
        # Ensure static directory exists
        os.makedirs("static", exist_ok=True)
        
        # Generate audio file
        await communicate.save(filepath)
        
        # Create podcast record
        podcast = Podcast(
            title=f"播客_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            content=text,
            voice=voice,
            emotion=emotion,
            speed=speed,
            audio_url=f"/static/{filename}",
            duration="00:00:00",  # TODO: Calculate actual duration
            file_size=os.path.getsize(filepath)
        )
        
        db.add(podcast)
        db.commit()
        db.refresh(podcast)
        
        return {
            "id": podcast.id,
            "audioUrl": podcast.audio_url,
            "message": "播客生成成功"
        }
        
    except Exception as e:
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