from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.services.email import EmailService

router = APIRouter()

# Request models
class EmailRequest(BaseModel):
    email: str

class TokenRequest(BaseModel):
    token: str

# Email service
email_service = EmailService()

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/send-verification")
def send_verification_email(request: EmailRequest, db: Session = Depends(get_db)):
    """Send verification email to user"""
    # Validate email format
    if not request.email or '@' not in request.email:
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Check if user already exists
    user = db.query(User).filter(User.email == request.email).first()
    
    if user and user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    
    # Create verification token
    verification_token = email_service.create_verification_token(request.email)
    
    if user:
        # Update existing user
        user.verification_token = verification_token
        user.verification_expires = datetime.utcnow() + timedelta(hours=24)
    else:
        # Create new user
        user = User(
            email=request.email,
            is_verified=False,
            verification_token=verification_token,
            verification_expires=datetime.utcnow() + timedelta(hours=24)
        )
        db.add(user)
    
    db.commit()
    
    # Send verification email
    email_sent = email_service.send_verification_email(request.email, request.email.split('@')[0], verification_token)
    
    if email_sent:
        return {
            "success": True,
            "message": "Verification email sent successfully",
            "email_sent": True
        }
    else:
        return {
            "success": False,
            "message": "Failed to send verification email",
            "email_sent": False
        }

@router.post("/verify-email")
def verify_email(request: TokenRequest, db: Session = Depends(get_db)):
    """Verify email address"""
    # Verify token
    email = email_service.verify_token(request.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link")
    
    # Find user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    
    # Update user
    user.is_verified = True
    user.verification_token = None
    user.verification_expires = None
    db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Send welcome email
    email_service.send_welcome_email(email, email.split('@')[0])
    
    return {
        "success": True,
        "message": "Email verified successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "email": user.email
    }

@router.post("/login")
def login_with_email(request: EmailRequest, db: Session = Depends(get_db)):
    """Login with email (Gmail style)"""
    # Validate email format
    if not request.email or '@' not in request.email:
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found, please verify email first"
        )
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please verify your email address first"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "success": True,
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "email": user.email,
        "is_verified": user.is_verified
    }

@router.post("/resend-verification")
def resend_verification(request: EmailRequest, db: Session = Depends(get_db)):
    """Resend verification email"""
    # Validate email format
    if not request.email or '@' not in request.email:
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    
    # Create new verification token
    verification_token = email_service.create_verification_token(request.email)
    user.verification_token = verification_token
    user.verification_expires = datetime.utcnow() + timedelta(hours=24)
    db.commit()
    
    # Send verification email
    email_sent = email_service.send_verification_email(request.email, request.email.split('@')[0], verification_token)
    
    if email_sent:
        return {
            "success": True,
            "message": "Verification email resent successfully"
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to send email, please try again later")

@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return {
        "success": True,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "is_verified": current_user.is_verified
        }
    } 