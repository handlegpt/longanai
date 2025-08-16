from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
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
import openai
from concurrent.futures import ThreadPoolExecutor
import threading

from app.core.database import get_db
from app.core.config import settings
from app.models.podcast import Podcast
from app.models.user import User

router = APIRouter()

# Voice mapping
VOICE_MAPPING = {
    "young-lady": "zh-HK-HiuGaaiNeural",
    "young-man": "zh-HK-WanLungNeural", 
    "grandma": "zh-HK-HiuGaaiNeural",
    "elderly-woman": "zh-HK-HiuGaaiNeural",
    # 普通话语音映射
    "mandarin-young-lady": "zh-CN-XiaoxiaoNeural",
    "mandarin-young-man": "zh-CN-YunxiNeural",
    "mandarin-grandma": "zh-CN-XiaoyiNeural",
    "mandarin-elderly-woman": "zh-CN-YunyangNeural",
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
    description: str = ""
    cover_image_url: str = ""
    tags: str = ""
    is_public: bool = True
    title: str = ""  # 添加标题字段
    is_translated: bool = False  # 添加字段指示文本是否已经翻译过
    language: str = "cantonese"  # 播客语言：cantonese, mandarin, english

class UserProfileUpdateRequest(BaseModel):
    display_name: str = None
    bio: str = None
    preferred_voice: str = None
    preferred_language: str = None

class PodcastUpdateRequest(BaseModel):
    title: str = None
    description: str = None
    tags: str = None
    is_public: bool = None

# 添加并发控制
MAX_CONCURRENT_GENERATIONS = settings.MAX_CONCURRENT_GENERATIONS  # 最大并发生成数
generation_semaphore = asyncio.Semaphore(MAX_CONCURRENT_GENERATIONS)
executor = ThreadPoolExecutor(max_workers=settings.THREAD_POOL_WORKERS)  # 线程池

@router.post("/generate")
async def generate_podcast(
    request: PodcastGenerateRequest,
    db: Session = Depends(get_db)
):
    """Generate podcast from text"""
    async with generation_semaphore:  # 限制并发数
        try:
            print(f"🎤 Starting podcast generation with voice: {request.voice}")
            print(f"📊 Current active generations: {MAX_CONCURRENT_GENERATIONS - generation_semaphore._value}")
            
            # Check user and their generation limits
            user = db.query(User).filter(User.email == request.user_email).first()
            if not user:
                raise HTTPException(status_code=404, detail="用户不存在，请重新登录")
            
            if not user.is_verified:
                raise HTTPException(status_code=403, detail="请先验证邮箱后再生成播客")
            
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
            
            # Validate voice based on language
            valid_voices = []
            if request.language == "mandarin":
                valid_voices = ["young-lady", "young-man", "grandma", "elderly-woman"]
                # 对于普通话，使用对应的普通话TTS语音
                voice_key = f"mandarin-{request.voice}"
            else:
                valid_voices = ["young-lady", "young-man", "grandma", "elderly-woman"]
                voice_key = request.voice
            
            if request.voice not in valid_voices:
                print(f"❌ Invalid voice: {request.voice} for language: {request.language}")
                raise HTTPException(status_code=400, detail="无效的声音选择")
            
            # Validate text length
            if not request.text or len(request.text.strip()) == 0:
                raise HTTPException(status_code=400, detail="请输入要转换的文本内容")
            
            if len(request.text) > 10000:  # 限制文本长度
                raise HTTPException(status_code=400, detail="文本内容过长，请控制在10000字符以内")
            
            # Get TTS voice
            tts_voice = VOICE_MAPPING.get(voice_key, VOICE_MAPPING[request.voice])
            print(f"🎵 Using TTS voice: {tts_voice} for language: {request.language}")
            
            # 增加中文检测逻辑
            def is_chinese(text):
                # 简单判断是否包含中文字符
                for ch in text:
                    if '\u4e00' <= ch <= '\u9fff':
                        return True
                return False
            # 增加粤语检测逻辑
            def is_cantonese(text):
                # 常见粤语字/词，可根据需要扩展
                cantonese_keywords = [
                    '咗', '冇', '啱', '嘅', '咩', '啦', '喺', '嚟', '咁', '佢', '乜', '唔', '嘢', '呢', '噉', '啲', '嗰', '喂', '咩', '哋', '咗', '嚟', '冇', '咩', '啱', '嘅', '啦', '喺', '佢', '乜', '嘢', '噉', '啲', '嗰', '哋', '咗', '嚟', '冇', '咩', '啱', '嘅', '啦', '喺', '佢', '乜', '嘢', '噉', '啲', '嗰', '哋'
                ]
                return any(word in text for word in cantonese_keywords)

            tts_text = request.text
            # 只有当文本未翻译过且是中文但不是粤语时，才进行翻译
            # 但是，如果用户明确选择了普通话语言，则不进行翻译
            if (not request.is_translated and 
                is_chinese(request.text) and 
                not is_cantonese(request.text) and 
                request.language != "mandarin"):  # 添加语言检查
                print("🔄 检测到普通话且未翻译，自动调用翻译服务...")
                try:
                    # 直接调用翻译函数，避免HTTP请求
                    from app.routers.translate import translate_text
                    from app.routers.translate import TranslationRequest
                    
                    translation_request = TranslationRequest(
                        text=request.text,
                        targetLanguage="cantonese"
                    )
                    
                    translation_response = await translate_text(translation_request)
                    tts_text = translation_response.translatedText
                    print(f"✅ 后端翻译成功: {tts_text}")
                    
                except Exception as e:
                    print(f"⚠️ 后端翻译异常，使用原文: {str(e)}")
                    tts_text = request.text
            else:
                print(f"✅ 使用前端提供的文本（已翻译: {request.is_translated}, 语言: {request.language}）")
                tts_text = request.text
            
            # Validate text length and duration
            estimated_duration = len(request.text) * 0.1  # 粗略估算：每个字符0.1秒
            if estimated_duration > settings.MAX_AUDIO_DURATION:
                raise HTTPException(
                    status_code=400, 
                    detail=f"文本过长，预计音频时长 {estimated_duration:.1f} 秒，超过最大限制 {settings.MAX_AUDIO_DURATION} 秒"
                )

            # Generate audio using Edge TTS in thread pool with timeout
            print("🔄 Creating Edge TTS communicate object...")
            communicate = edge_tts.Communicate(tts_text, tts_voice)
            
            # Create unique filename
            filename = f"podcast_{uuid.uuid4()}.mp3"
            filepath = os.path.join("static", filename)
            print(f"📁 Audio file path: {filepath}")
            
            # Ensure static directory exists
            os.makedirs("static", exist_ok=True)
            print("✅ Static directory ensured")
            
            # Generate audio file in thread pool with timeout
            print("🎵 Generating audio file...")
            try:
                loop = asyncio.get_event_loop()
                # 设置180秒超时
                await asyncio.wait_for(
                    loop.run_in_executor(executor, lambda: asyncio.run(communicate.save(filepath))),
                    timeout=180.0
                )
                print("✅ Audio file generated successfully")
            except asyncio.TimeoutError:
                raise HTTPException(status_code=408, detail="生成超时，请稍后重试或减少文本长度")
            except Exception as e:
                print(f"❌ Audio generation failed: {e}")
                raise HTTPException(status_code=500, detail="音频生成失败，请稍后重试")
            
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
            
            # Generate title from content if not provided
            def generate_title_from_content(content: str) -> str:
                # Remove special characters and get first meaningful sentence or phrase
                import re
                clean_content = re.sub(r'[^\u4e00-\u9fa5a-zA-Z0-9\s]', '', content).strip()
                
                # Try to find the first sentence (ending with 。！？.!?)
                sentence_match = re.match(r'^[^。！？.!?]+[。！？.!?]', clean_content)
                if sentence_match:
                    sentence = sentence_match.group(0).rstrip('。！？.!?')
                    return sentence[:50] + '...' if len(sentence) > 50 else sentence
                
                # If no sentence found, take first 30-50 characters
                title = clean_content[:50] + '...' if len(clean_content) > 50 else clean_content
                return title or '我的播客'
            
            # Generate title if not provided
            podcast_title = request.title if request.title else generate_title_from_content(request.text)

            # Create podcast record
            podcast = Podcast(
                title=podcast_title,  # 使用生成的标题
                description=request.description,
                content=tts_text,
                voice=request.voice,
                emotion=request.emotion,
                speed=request.speed,
                audio_url=f"/static/{filename}",
                cover_image_url=request.cover_image_url,
                duration=duration_str,
                file_size=file_size,
                user_email=request.user_email,
                tags=request.tags,
                is_public=request.is_public,
                language=request.language # 设置播客语言
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
        "is_unlimited": user_limit == -1,
        "display_name": user.display_name,
        "bio": user.bio,
        "preferred_voice": user.preferred_voice,
        "preferred_language": user.preferred_language,
        "avatar_url": user.avatar_url
    }

@router.put("/user/profile")
def update_user_profile(
    request: UserProfileUpdateRequest,
    user_email: str,
    db: Session = Depends(get_db)
):
    """Update user profile information"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    if request.display_name is not None:
        user.display_name = request.display_name
    if request.bio is not None:
        user.bio = request.bio
    if request.preferred_voice is not None:
        user.preferred_voice = request.preferred_voice
    if request.preferred_language is not None:
        user.preferred_language = request.preferred_language
    
    db.commit()
    db.refresh(user)
    
    return {"message": "用户资料更新成功"}

@router.get("/user/podcasts")
def get_user_podcasts(
    user_email: str,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get user's podcasts with pagination"""
    query = db.query(Podcast).filter(Podcast.user_email == user_email)
    total = query.count()
    podcasts = query.order_by(Podcast.created_at.desc()).offset((page-1)*size).limit(size).all()
    
    return {
        "total": total,
        "page": page,
        "size": size,
        "podcasts": [
            {
                "id": podcast.id,
                "title": podcast.title,
                "description": podcast.description,
                "audio_url": podcast.audio_url,
                "cover_image_url": podcast.cover_image_url,
                "duration": podcast.duration,
                "voice": podcast.voice,
                "emotion": podcast.emotion,
                "speed": podcast.speed,
                "tags": podcast.tags,
                "is_public": podcast.is_public,
                "created_at": podcast.created_at.isoformat() if podcast.created_at else None
            } for podcast in podcasts
        ]
    }

@router.put("/podcast/{podcast_id}")
def update_podcast(
    podcast_id: int,
    request: PodcastUpdateRequest,
    user_email: str,
    db: Session = Depends(get_db)
):
    """Update podcast information"""
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id, Podcast.user_email == user_email).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="播客不存在或无权限")
    
    if request.title is not None:
        podcast.title = request.title
    if request.description is not None:
        podcast.description = request.description
    if request.tags is not None:
        podcast.tags = request.tags
    if request.is_public is not None:
        podcast.is_public = request.is_public
    
    db.commit()
    db.refresh(podcast)
    
    return {"message": "播客更新成功"}

@router.delete("/podcast/{podcast_id}")
def delete_podcast(
    podcast_id: int,
    user_email: str,
    db: Session = Depends(get_db)
):
    """Delete a podcast"""
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id, Podcast.user_email == user_email).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="播客不存在或无权限")
    
    # Delete audio file if exists
    if podcast.audio_url and os.path.exists(podcast.audio_url):
        try:
            os.remove(podcast.audio_url)
        except Exception as e:
            print(f"Error deleting audio file: {e}")
    
    db.delete(podcast)
    db.commit()
    
    return {"message": "播客删除成功"}

@router.get("/user/analytics")
def get_user_analytics(user_email: str, db: Session = Depends(get_db)):
    """Get user's podcast generation analytics"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # Get user's podcasts
    podcasts = db.query(Podcast).filter(Podcast.user_email == user_email).all()
    
    # Calculate analytics
    total_podcasts = len(podcasts)
    public_podcasts = len([p for p in podcasts if p.is_public])
    private_podcasts = total_podcasts - public_podcasts
    
    # Voice usage statistics
    voice_stats = {}
    for podcast in podcasts:
        voice = podcast.voice
        voice_stats[voice] = voice_stats.get(voice, 0) + 1
    
    # Duration statistics
    total_duration = 0
    for podcast in podcasts:
        if podcast.duration:
            try:
                # Parse duration (format: HH:MM:SS)
                time_parts = podcast.duration.split(':')
                if len(time_parts) == 3:
                    hours = int(time_parts[0])
                    minutes = int(time_parts[1])
                    seconds = int(time_parts[2])
                    total_duration += hours * 3600 + minutes * 60 + seconds
            except:
                pass
    
    # Recent activity (last 30 days) - Fix timezone comparison
    thirty_days_ago = datetime.utcnow().replace(tzinfo=None) - timedelta(days=30)
    recent_podcasts = len([p for p in podcasts if p.created_at and p.created_at.replace(tzinfo=None) >= thirty_days_ago])
    
    return {
        "total_podcasts": total_podcasts,
        "public_podcasts": public_podcasts,
        "private_podcasts": private_podcasts,
        "voice_statistics": voice_stats,
        "total_duration_seconds": total_duration,
        "recent_podcasts_30_days": recent_podcasts,
        "average_duration": total_duration / total_podcasts if total_podcasts > 0 else 0
    }

# 新增：公开广场 API
@router.get("/public")
def get_public_podcasts(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str = "",
    tag: str = "",
    language: str = ""  # 添加语言筛选参数
):
    """分页获取所有公开播客，支持搜索、标签和语言筛选"""
    # 使用JOIN查询获取用户昵称
    query = db.query(Podcast, User.display_name).join(User, Podcast.user_email == User.email).filter(Podcast.is_public == True)
    if search:
        query = query.filter(Podcast.title.ilike(f"%{search}%"))
    if tag:
        query = query.filter(Podcast.tags.ilike(f"%{tag}%"))
    if language:  # 添加语言筛选
        query = query.filter(Podcast.language == language)
    total = query.count()
    results = query.order_by(Podcast.created_at.desc()).offset((page-1)*size).limit(size).all()
    
    return {
        "total": total,
        "page": page,
        "size": size,
        "podcasts": [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "audioUrl": p.audio_url,
                "coverImageUrl": p.cover_image_url,
                "duration": p.duration,
                "createdAt": p.created_at.isoformat() if p.created_at else None,
                "userEmail": p.user_email,
                "userDisplayName": display_name,  # 添加用户昵称
                "tags": p.tags,
                "language": p.language,  # 添加语言字段到返回结果
            } for p, display_name in results
        ]
    }

# 新增：获取某用户所有播客
@router.get("/user")
def get_user_podcasts(user_email: str, db: Session = Depends(get_db)):
    podcasts = db.query(Podcast).filter(Podcast.user_email == user_email).order_by(Podcast.created_at.desc()).all()
    return {
        "podcasts": [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "audioUrl": p.audio_url,
                "coverImageUrl": p.cover_image_url,
                "duration": p.duration,
                "createdAt": p.created_at.isoformat() if p.created_at else None,
                "tags": p.tags,
                "isPublic": p.is_public,
            } for p in podcasts
        ]
    }

# 新增：获取单个播客详情
@router.get("/{podcast_id}")
def get_podcast_detail(podcast_id: int, db: Session = Depends(get_db)):
    # 使用JOIN查询获取用户显示名称
    result = db.query(Podcast, User.display_name).join(User, Podcast.user_email == User.email).filter(Podcast.id == podcast_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="播客不存在")
    
    podcast, display_name = result
    
    return {
        "id": podcast.id,
        "title": podcast.title,
        "description": podcast.description,
        "content": podcast.content,
        "audioUrl": podcast.audio_url,
        "coverImageUrl": podcast.cover_image_url,
        "duration": podcast.duration,
        "createdAt": podcast.created_at.isoformat() if podcast.created_at else None,
        "userEmail": podcast.user_email,
        "userDisplayName": display_name,  # 添加用户显示名称
        "tags": podcast.tags,
        "isPublic": podcast.is_public,
    } 

# 管理员权限依赖
from fastapi import Request

def admin_required(request: Request):
    # 这里建议用 JWT 或 session 校验，示例用环境变量模拟
    # 实际生产应替换为更安全的权限校验
    if request.headers.get("x-admin") != "true":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="无管理员权限")
    return True

# 后台分页获取所有播客（支持搜索、用户、审核状态筛选）
@router.get("/admin/list")
def admin_list_podcasts(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str = "",
    user: str = "",
    review_status: str = "",
    admin: None = Depends(admin_required)
):
    query = db.query(Podcast)
    if search:
        query = query.filter(Podcast.title.ilike(f"%{search}%") | Podcast.description.ilike(f"%{search}%") | Podcast.tags.ilike(f"%{search}%"))
    if user:
        query = query.filter(Podcast.user_email == user)
    if review_status:
        query = query.filter(Podcast.review_status == review_status)
    total = query.count()
    podcasts = query.order_by(Podcast.created_at.desc()).offset((page-1)*size).limit(size).all()
    return {
        "total": total,
        "page": page,
        "size": size,
        "podcasts": [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "audioUrl": p.audio_url,
                "coverImageUrl": p.cover_image_url,
                "duration": p.duration,
                "createdAt": p.created_at.isoformat() if p.created_at else None,
                "user_email": p.user_email,
                "tags": p.tags,
                "is_public": p.is_public,
                "review_status": getattr(p, "review_status", "pending"),
            } for p in podcasts
        ]
    }

# 后台下架播客
@router.post("/admin/unpublish/{podcast_id}")
def admin_unpublish_podcast(podcast_id: int, db: Session = Depends(get_db), admin: None = Depends(admin_required)):
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="播客不存在")
    podcast.is_public = False
    db.commit()
    return {"message": "下架成功"}

# 后台审核状态切换
class ReviewStatusRequest(BaseModel):
    review_status: str

@router.post("/admin/review/{podcast_id}")
def admin_review_podcast(podcast_id: int, req: ReviewStatusRequest, db: Session = Depends(get_db), admin: None = Depends(admin_required)):
    podcast = db.query(Podcast).filter(Podcast.id == podcast_id).first()
    if not podcast:
        raise HTTPException(status_code=404, detail="播客不存在")
    podcast.review_status = req.review_status
    db.commit()
    return {"message": "审核状态已更新"} 

# 添加系统状态API
@router.get("/system/status")
async def get_system_status():
    """获取系统当前状态"""
    return {
        "max_concurrent_generations": MAX_CONCURRENT_GENERATIONS,
        "current_active_generations": MAX_CONCURRENT_GENERATIONS - generation_semaphore._value,
        "available_slots": generation_semaphore._value,
        "thread_pool_workers": executor._max_workers,
        "system_health": "healthy"
    } 

# 工具函数：格式化秒为HH:MM:SS

def format_duration(seconds: float) -> str:
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"

# 新增：自动清理无效音频记录的API（可定时调用）
@router.delete("/admin/cleanup-invalid-podcasts")
def cleanup_invalid_podcasts(db: Session = Depends(get_db)):
    """自动清理数据库中指向不存在音频文件的播客记录"""
    podcasts = db.query(Podcast).all()
    removed = 0
    for podcast in podcasts:
        if podcast.audio_url:
            # 兼容/static/前缀和绝对路径
            filename = os.path.basename(podcast.audio_url)
            filepath = os.path.join("static", filename)
            if not os.path.exists(filepath):
                db.delete(podcast)
                removed += 1
    db.commit()
    return {"message": f"已清理无效音频记录 {removed} 条"} 