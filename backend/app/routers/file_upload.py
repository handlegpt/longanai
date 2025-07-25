from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from fastapi.responses import FileResponse
import os
import uuid
import magic
import hashlib
import re
from typing import List, Optional
import io
from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User
from app.utils.file_processor import extract_text_from_file, validate_extracted_text, clean_extracted_text

router = APIRouter()

# 安全的文件类型配置
ALLOWED_EXTENSIONS = {
    '.txt': 'text/plain',
    '.pdf': 'application/pdf', 
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.md': 'text/markdown'
}

# 文件大小限制（字节）
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# 危险文件扩展名黑名单
DANGEROUS_EXTENSIONS = {
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.php', '.asp', '.aspx', '.jsp', '.py', '.pl', '.rb', '.sh', '.cgi',
    '.dll', '.so', '.dylib', '.sys', '.drv', '.bin', '.msi', '.app'
}

def validate_file_extension(filename: str) -> bool:
    """验证文件扩展名是否安全"""
    if not filename:
        return False
    
    # 获取文件扩展名
    file_ext = os.path.splitext(filename.lower())[1]
    
    # 检查是否在黑名单中
    if file_ext in DANGEROUS_EXTENSIONS:
        return False
    
    # 检查是否在允许列表中
    return file_ext in ALLOWED_EXTENSIONS

def validate_file_content(file_content: bytes) -> bool:
    """验证文件内容类型"""
    try:
        # 使用 python-magic 检测文件类型
        mime_type = magic.from_buffer(file_content, mime=True)
        
        # 检查是否为允许的 MIME 类型
        allowed_mime_types = set(ALLOWED_EXTENSIONS.values())
        return mime_type in allowed_mime_types
    except Exception:
        return False

def sanitize_filename(filename: str) -> str:
    """清理文件名，防止路径遍历攻击"""
    # 移除路径分隔符
    filename = os.path.basename(filename)
    
    # 移除危险字符
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    
    # 限制长度
    if len(filename) > 100:
        name, ext = os.path.splitext(filename)
        filename = name[:100-len(ext)] + ext
    
    return filename

def calculate_file_hash(content: bytes) -> str:
    """计算文件哈希值"""
    return hashlib.sha256(content).hexdigest()

def check_file_size(content: bytes) -> bool:
    """检查文件大小"""
    return len(content) <= MAX_FILE_SIZE

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """安全上传文件用于播客生成"""
    
    # 1. 基础验证
    if not file.filename:
        raise HTTPException(status_code=400, detail="文件名不能为空")
    
    # 2. 文件扩展名验证
    if not validate_file_extension(file.filename):
        raise HTTPException(
            status_code=400, 
            detail=f"不支持的文件格式。支持格式: {', '.join(ALLOWED_EXTENSIONS.keys())}"
        )
    
    # 3. 读取文件内容
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"文件读取失败: {str(e)}")
    
    # 4. 文件大小验证
    if not check_file_size(content):
        raise HTTPException(
            status_code=400, 
            detail=f"文件太大。最大允许: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # 5. 文件内容类型验证
    if not validate_file_content(content):
        raise HTTPException(
            status_code=400, 
            detail="文件内容类型不匹配，可能包含恶意内容"
        )
    
    # 6. 提取文件文本内容
    extracted_text = extract_text_from_file(content, file.filename)
    if extracted_text is None:
        raise HTTPException(
            status_code=400, 
            detail="无法从文件中提取文本内容，请检查文件格式"
        )
    
    # 7. 清理和验证提取的文本内容
    cleaned_text = clean_extracted_text(extracted_text)
    if not validate_extracted_text(cleaned_text):
        raise HTTPException(
            status_code=400, 
            detail="文件中没有可用的文本内容"
        )
    
    # 8. 计算文件哈希（用于去重和审计）
    file_hash = calculate_file_hash(content)
    
    # 9. 生成安全的文件名
    original_name = sanitize_filename(file.filename)
    file_extension = os.path.splitext(original_name)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # 10. 确保上传目录存在且安全
    upload_dir = os.path.abspath(settings.UPLOAD_DIR)
    os.makedirs(upload_dir, exist_ok=True)
    
    # 11. 验证最终路径安全性
    filepath = os.path.join(upload_dir, unique_filename)
    if not filepath.startswith(upload_dir):
        raise HTTPException(status_code=400, detail="文件路径不安全")
    
    # 12. 保存文件
    try:
        with open(filepath, "wb") as buffer:
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件保存失败: {str(e)}")
    
    # 13. 记录上传日志（可选）
    print(f"📁 File uploaded: {original_name} -> {unique_filename} (User: {current_user.email})")
    print(f"📝 Extracted text length: {len(cleaned_text)} characters")
    
    return {
        "filename": unique_filename,
        "original_name": original_name,
        "size": len(content),
        "hash": file_hash,
        "url": f"/static/{unique_filename}",
        "extracted_text": cleaned_text,  # 返回清理后的文本内容
        "text_length": len(cleaned_text),
        "message": "文件上传成功，文本内容已提取"
    }

@router.post("/upload-and-generate")
async def upload_and_generate_podcast(
    file: UploadFile = File(...),
    voice: str = Form("young-lady"),
    emotion: str = Form("normal"),
    speed: float = Form(1.0),
    current_user: User = Depends(get_current_user)
):
    """上传文件并直接生成播客"""
    
    # 1. 上传文件并提取内容
    upload_result = await upload_file(file, current_user)
    extracted_text = upload_result["extracted_text"]
    
    # 2. 调用播客生成API
    from app.routers.podcast import generate_podcast
    from app.routers.podcast import PodcastGenerateRequest
    
    # 创建播客生成请求
    podcast_request = PodcastGenerateRequest(
        text=extracted_text,
        voice=voice,
        emotion=emotion,
        speed=speed,
        user_email=current_user.email,
        title=f"来自文件: {upload_result['original_name']}",
        description=f"从文件 {upload_result['original_name']} 生成的播客",
        tags="文件生成",
        is_public=True
    )
    
    # 3. 生成播客
    from app.core.database import get_db
    from sqlalchemy.orm import Session
    
    db = next(get_db())
    try:
        podcast_result = await generate_podcast(podcast_request, db)
        return {
            "upload_info": upload_result,
            "podcast_info": podcast_result,
            "message": "文件上传并生成播客成功"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"播客生成失败: {str(e)}")

@router.get("/files/info")
async def get_upload_info():
    """获取文件上传信息"""
    return {
        "allowed_extensions": list(ALLOWED_EXTENSIONS.keys()),
        "max_file_size_mb": MAX_FILE_SIZE // (1024 * 1024),
        "supported_formats": {
            "TXT": "纯文本文件",
            "PDF": "PDF文档", 
            "DOC": "Word 97-2003文档",
            "DOCX": "Word 2007+文档",
            "MD": "Markdown文档"
        },
        "features": {
            "text_extraction": "支持从PDF、DOCX等文件中提取文本",
            "content_validation": "验证文件内容安全性",
            "direct_generation": "上传文件后可直接生成播客"
        }
    } 