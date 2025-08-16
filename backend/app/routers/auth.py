from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from typing import Optional
from pydantic import BaseModel
import httpx

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.services.email import EmailService

router = APIRouter()

class EmailRequest(BaseModel):
    email: str
    lang: str = None

class TokenRequest(BaseModel):
    token: str

def get_email_service():
    return EmailService()

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

@router.get("/google/login")
async def google_login(request: Request):
    client_id = settings.GOOGLE_CLIENT_ID
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    scope = "openid email profile"
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"response_type=code&"
        f"scope={scope}&"
        f"access_type=offline"
    )
    return RedirectResponse(url=google_auth_url)

@router.get("/callback/google")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        code = request.query_params.get("code")
        if not code:
            return JSONResponse(status_code=400, content={"success": False, "message": "缺少授权码"})
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.GOOGLE_REDIRECT_URI
        }
        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, data=token_data)
            token_info = token_response.json()
            if "access_token" not in token_info:
                return JSONResponse(status_code=400, content={"success": False, "message": "获取 access token 失败"})
            userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            headers = {"Authorization": f"Bearer {token_info['access_token']}"}
            userinfo_response = await client.get(userinfo_url, headers=headers)
            userinfo = userinfo_response.json()
            if not userinfo or "email" not in userinfo:
                return JSONResponse(status_code=400, content={"success": False, "message": "获取用户信息失败"})
            email = userinfo.get("email")
            google_id = userinfo.get("id")
            if not email or not google_id:
                return JSONResponse(status_code=400, content={"success": False, "message": "Google 用户信息获取失败"})
            user = db.query(User).filter((User.email == email) | (User.google_id == google_id)).first()
            if not user:
                user = User(email=email, is_verified=True, google_id=google_id)
                db.add(user)
                db.commit()
                db.refresh(user)
            else:
                if not user.google_id:
                    user.google_id = google_id
                    db.commit()
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user.email}, expires_delta=access_token_expires
            )
            # 重定向到前端页面，携带token和email参数
            frontend_url = "https://longan.ai/auth/callback"
            redirect_url = f"{frontend_url}?access_token={access_token}&email={email}"
            return RedirectResponse(url=redirect_url)
    except Exception as e:
        print(f"Google OAuth error: {e}")
        return JSONResponse(status_code=500, content={"success": False, "message": f"Google 登录失败: {str(e)}"})

@router.post("/send-verification")
def send_verification_email(request: EmailRequest, db: Session = Depends(get_db), fastapi_request: Request = None):
    if not request.email or '@' not in request.email:
        raise HTTPException(status_code=400, detail="Invalid email format")
    user = db.query(User).filter(User.email == request.email).first()
    if user and user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    email_service = get_email_service()
    verification_token = email_service.create_verification_token(request.email)
    if user:
        user.verification_token = verification_token
        user.verification_expires = datetime.now(timezone.utc) + timedelta(hours=24)
    else:
        user = User(
            email=request.email,
            is_verified=False,
            verification_token=verification_token,
            verification_expires=datetime.now(timezone.utc) + timedelta(hours=24)
        )
        db.add(user)
    db.commit()
    lang_code = request.lang
    if not lang_code and fastapi_request:
        accept_language = fastapi_request.headers.get('Accept-Language')
        if accept_language:
            if 'zh-HK' in accept_language or 'yue' in accept_language:
                lang_code = 'yue'
            elif 'en' in accept_language:
                lang_code = 'en'
            else:
                lang_code = 'zh'
        else:
            lang_code = 'yue'
    email_sent = email_service.send_verification_email(request.email, request.email.split('@')[0], verification_token, lang=lang_code)
    if email_sent:
        return {"success": True, "message": "Verification email sent successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email, please try again later")

@router.post("/verify-email")
def verify_email(request: TokenRequest, db: Session = Depends(get_db)):
    token = request.token
    email_service = get_email_service()
    email = email_service.verify_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    user.is_verified = True
    user.verification_token = None
    user.verification_expires = None
    db.commit()
    email_service.send_welcome_email(user.email, user.email.split('@')[0])
    return {"success": True, "message": "Email verified successfully"}

@router.post("/login")
def login_with_email(request: EmailRequest, db: Session = Depends(get_db)):
    if not request.email or '@' not in request.email:
        raise HTTPException(status_code=400, detail="Invalid email format")
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_verified:
        raise HTTPException(status_code=400, detail="Email not verified")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer",
        "email": user.email,
        "is_verified": user.is_verified
    }

@router.post("/send-login-code")
def send_login_code(request: EmailRequest, db: Session = Depends(get_db)):
    """发送登录验证码（适用于所有用户，包括已验证用户）"""
    if not request.email or '@' not in request.email:
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # 如果用户不存在，创建新用户
        user = User(
            email=request.email,
            is_verified=False,
            verification_token=None,
            verification_expires=None
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # 生成6位数字验证码
    import random
    verification_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    # 存储验证码到用户记录
    user.verification_token = verification_code
    user.verification_expires = datetime.now(timezone.utc) + timedelta(minutes=10)  # 10分钟过期
    db.commit()
    
    # 检查Resend配置
    print(f"DEBUG: RESEND_API_KEY = {settings.RESEND_API_KEY[:10]}..." if settings.RESEND_API_KEY else "DEBUG: RESEND_API_KEY = None")
    print(f"DEBUG: RESEND_FROM = {settings.RESEND_FROM}")
    
    if not settings.RESEND_API_KEY or settings.RESEND_API_KEY == "":
        print("Warning: RESEND_API_KEY not configured")
        # 在开发环境中，直接返回验证码（仅用于测试）
        if settings.DEBUG:
            return {
                "success": True, 
                "message": f"Login verification code sent successfully (DEV MODE: {verification_code})",
                "debug_code": verification_code
            }
        else:
            raise HTTPException(status_code=500, detail="Email service not configured")
    
    # 发送验证码邮件
    try:
        email_service = get_email_service()
        email_sent = email_service.send_verification_code_email(
            request.email,
            request.email.split('@')[0],
            verification_code
        )
        
        if email_sent:
            return {"success": True, "message": "Login verification code sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send verification code")
    except Exception as e:
        print(f"Error sending verification code: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Email service error: {str(e)}")

@router.post("/verify-login-code")
def verify_login_code(request: dict, db: Session = Depends(get_db)):
    """验证登录验证码"""
    email = request.get("email")
    code = request.get("code")
    
    if not email or not code:
        raise HTTPException(status_code=400, detail="Email and verification code required")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 检查验证码是否匹配且未过期
    if (user.verification_token != code or 
        not user.verification_expires or 
        user.verification_expires < datetime.now(timezone.utc)):
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    
    # 清除验证码
    user.verification_token = None
    user.verification_expires = None
    
    # 如果是新用户，标记为已验证
    if not user.is_verified:
        user.is_verified = True
    
    db.commit()
    
    # 生成访问令牌
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer",
        "email": user.email,
        "is_verified": user.is_verified
    }

@router.post("/resend-verification")
def resend_verification(request: EmailRequest, db: Session = Depends(get_db)):
    if not request.email or '@' not in request.email:
        raise HTTPException(status_code=400, detail="Invalid email format")
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    email_service = get_email_service()
    verification_token = email_service.create_verification_token(request.email)
    user.verification_token = verification_token
    user.verification_expires = datetime.now(timezone.utc) + timedelta(hours=24)
    db.commit()
    email_sent = email_service.send_verification_email(request.email, request.email.split('@')[0], verification_token)
    if email_sent:
        return {"success": True, "message": "Verification email resent successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email, please try again later")