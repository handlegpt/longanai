from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
import os
import uuid
import magic
import hashlib
import re
from typing import List
from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User

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
    
    # 6. 计算文件哈希（用于去重和审计）
    file_hash = calculate_file_hash(content)
    
    # 7. 生成安全的文件名
    original_name = sanitize_filename(file.filename)
    file_extension = os.path.splitext(original_name)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # 8. 确保上传目录存在且安全
    upload_dir = os.path.abspath(settings.UPLOAD_DIR)
    os.makedirs(upload_dir, exist_ok=True)
    
    # 9. 验证最终路径安全性
    filepath = os.path.join(upload_dir, unique_filename)
    if not filepath.startswith(upload_dir):
        raise HTTPException(status_code=400, detail="文件路径不安全")
    
    # 10. 保存文件
    try:
        with open(filepath, "wb") as buffer:
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件保存失败: {str(e)}")
    
    # 11. 记录上传日志（可选）
    print(f"📁 File uploaded: {original_name} -> {unique_filename} (User: {current_user.email})")
    
    return {
        "filename": unique_filename,
        "original_name": original_name,
        "size": len(content),
        "hash": file_hash,
        "url": f"/static/{unique_filename}",
        "message": "文件上传成功"
    }

@router.get("/download/{filename}")
async def download_file(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """安全下载上传的文件"""
    
    # 1. 验证文件名安全性
    if not filename or '..' in filename or '/' in filename:
        raise HTTPException(status_code=400, detail="无效的文件名")
    
    # 2. 构建安全路径
    upload_dir = os.path.abspath(settings.UPLOAD_DIR)
    filepath = os.path.join(upload_dir, filename)
    
    # 3. 验证路径安全性
    if not filepath.startswith(upload_dir):
        raise HTTPException(status_code=400, detail="文件路径不安全")
    
    # 4. 检查文件是否存在
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="文件不存在")
    
    # 5. 记录下载日志
    print(f"📥 File downloaded: {filename} (User: {current_user.email})")
    
    return FileResponse(filepath, filename=filename)

@router.delete("/files/{filename}")
async def delete_file(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """删除上传的文件"""
    
    # 1. 验证文件名安全性
    if not filename or '..' in filename or '/' in filename:
        raise HTTPException(status_code=400, detail="无效的文件名")
    
    # 2. 构建安全路径
    upload_dir = os.path.abspath(settings.UPLOAD_DIR)
    filepath = os.path.join(upload_dir, filename)
    
    # 3. 验证路径安全性
    if not filepath.startswith(upload_dir):
        raise HTTPException(status_code=400, detail="文件路径不安全")
    
    # 4. 检查文件是否存在
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="文件不存在")
    
    # 5. 删除文件
    try:
        os.remove(filepath)
        print(f"🗑️ File deleted: {filename} (User: {current_user.email})")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件删除失败: {str(e)}")
    
    return {"message": "文件删除成功"}

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
        }
    } 