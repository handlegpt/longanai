from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from contextlib import asynccontextmanager
import uvicorn
from app.routers import podcast, auth, files, translate, admin, tts, social, notifications, search, user
from app.core.config import settings
from app.core.database import init_db
from app.core.exceptions import LonganAIException
from app.core.error_handlers import (
    longan_ai_exception_handler,
    validation_exception_handler,
    sqlalchemy_exception_handler,
    general_exception_handler,
    http_exception_handler
)
from app.middleware.rate_limit import rate_limit_middleware
from app.services.cdn_service import cdn_middleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Longan AI Backend Starting...")
    try:
        # Initialize database tables
        init_db()
    except Exception as e:
        print(f"❌ Failed to initialize database: {e}")
        raise
    yield
    # Shutdown
    print("👋 Longan AI Backend Shutting down...")

app = FastAPI(
    title="Longan AI API",
    description="智能粤语播客生成平台 API",
    version="1.0.0",
    lifespan=lifespan
)

# Session middleware (required for OAuth)
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://longan.ai"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 添加中间件
app.middleware("http")(rate_limit_middleware)
# 暂时禁用CDN中间件，避免初始化问题
# app.middleware("http")(cdn_middleware)

# 注册异常处理器
app.add_exception_handler(LonganAIException, longan_ai_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
# 在现有的路由注册后面添加：
# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(podcast.router, prefix="/api/podcast", tags=["播客"])
app.include_router(files.router, prefix="/api/files", tags=["文件"])
app.include_router(translate.router, prefix="/api", tags=["翻译"])
app.include_router(admin.router, prefix="/api/admin", tags=["管理员"])
app.include_router(tts.router, prefix="/api/tts", tags=["TTS"])
app.include_router(social.router, prefix="/api/social", tags=["社交功能"])
app.include_router(notifications.router, prefix="/api", tags=["通知系统"])
app.include_router(search.router, prefix="/api", tags=["搜索功能"])
app.include_router(user.router, prefix="/api/user", tags=["用户管理"])

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return {
        "message": "龍眼AI - 智能粤语播客生成平台",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 