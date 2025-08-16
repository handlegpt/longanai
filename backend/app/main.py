from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from contextlib import asynccontextmanager
import uvicorn
from app.routers import podcast, auth, files, translate, admin, tts
from app.core.config import settings
from app.core.database import init_db

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
# 在现有的路由注册后面添加：
# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(podcast.router, prefix="/api/podcast", tags=["播客"])
app.include_router(files.router, prefix="/api/files", tags=["文件"])
app.include_router(translate.router, prefix="/api", tags=["翻译"])
app.include_router(admin.router, prefix="/api/admin", tags=["管理员"])
app.include_router(tts.router, prefix="/api/tts", tags=["TTS"])  # 添加在这里

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