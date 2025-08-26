import os
import logging
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.services.cloud_storage import cloud_storage_service
from app.services.file_optimizer import file_optimizer
from app.services.cdn_service import cdn_service
from app.services.file_security import FileSecurityService
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/files", tags=["files"])

# 文件安全服务实例
file_security = FileSecurityService()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    file_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """上传文件到云存储"""
    try:
        # 读取文件内容
        file_content = await file.read()
        
        # 文件安全检查
        security_result = file_security.validate_file(
            file_content, 
            file.filename, 
            file.content_type
        )
        
        if not security_result['valid']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"文件安全检查失败: {security_result['reason']}"
            )
        
        # 生成唯一文件名
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # 确定文件类型
        if not file_type:
            if file.content_type and file.content_type.startswith('image/'):
                file_type = 'images'
            elif file.content_type and file.content_type.startswith('audio/'):
                file_type = 'audio'
            else:
                file_type = 'documents'
        
        # 构建存储路径
        timestamp = datetime.now().strftime("%Y/%m/%d")
        storage_path = f"{file_type}/{timestamp}/{unique_filename}"
        
        # 优化文件
        logger.info(f"🔧 Optimizing file: {file.filename}")
        optimized_content, optimization_info = await file_optimizer.optimize_file(
            file_content, 
            unique_filename
        )
        
        # 上传到云存储
        logger.info(f"☁️ Uploading to cloud storage: {storage_path}")
        uploaded_path = await cloud_storage_service.upload_file(
            optimized_content,
            storage_path,
            file.content_type
        )
        
        # 获取CDN URL
        cdn_url = cdn_service.get_cdn_url(storage_path, file_type)
        
        # 获取文件信息
        file_info = file_optimizer.get_file_info(optimized_content, unique_filename)
        
        # 构建响应
        response_data = {
            "success": True,
            "file_info": {
                "original_name": file.filename,
                "filename": unique_filename,
                "file_path": storage_path,
                "file_type": file_type,
                "content_type": file.content_type,
                "size_bytes": len(optimized_content),
                "size_mb": round(len(optimized_content) / (1024 * 1024), 2),
                "local_url": f"/static/{storage_path}",
                "cdn_url": cdn_url,
                "uploaded_at": datetime.now().isoformat()
            },
            "optimization_info": optimization_info,
            "cdn_info": cdn_service.get_file_info(storage_path)
        }
        
        # 添加文件特定信息
        if file_type == 'images':
            response_data["file_info"].update({
                "width": file_info.get('width'),
                "height": file_info.get('height'),
                "format": file_info.get('format')
            })
        elif file_type == 'audio':
            response_data["file_info"].update({
                "duration_seconds": file_info.get('duration_seconds'),
                "channels": file_info.get('channels'),
                "sample_rate": file_info.get('sample_rate')
            })
        
        logger.info(f"✅ File uploaded successfully: {storage_path}")
        return JSONResponse(content=response_data, status_code=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"❌ File upload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"文件上传失败: {str(e)}"
        )

@router.post("/upload/multiple")
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    file_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """批量上传文件"""
    try:
        uploaded_files = []
        
        for file in files:
            try:
                # 读取文件内容
                file_content = await file.read()
                
                # 文件安全检查
                security_result = file_security.validate_file(
                    file_content, 
                    file.filename, 
                    file.content_type
                )
                
                if not security_result['valid']:
                    uploaded_files.append({
                        "filename": file.filename,
                        "success": False,
                        "error": f"文件安全检查失败: {security_result['reason']}"
                    })
                    continue
                
                # 生成唯一文件名
                file_extension = os.path.splitext(file.filename)[1]
                unique_filename = f"{uuid.uuid4()}{file_extension}"
                
                # 确定文件类型
                if not file_type:
                    if file.content_type and file.content_type.startswith('image/'):
                        file_type = 'images'
                    elif file.content_type and file.content_type.startswith('audio/'):
                        file_type = 'audio'
                    else:
                        file_type = 'documents'
                
                # 构建存储路径
                timestamp = datetime.now().strftime("%Y/%m/%d")
                storage_path = f"{file_type}/{timestamp}/{unique_filename}"
                
                # 优化文件
                optimized_content, optimization_info = await file_optimizer.optimize_file(
                    file_content, 
                    unique_filename
                )
                
                # 上传到云存储
                uploaded_path = await cloud_storage_service.upload_file(
                    optimized_content,
                    storage_path,
                    file.content_type
                )
                
                # 获取CDN URL
                cdn_url = cdn_service.get_cdn_url(storage_path, file_type)
                
                # 获取文件信息
                file_info = file_optimizer.get_file_info(optimized_content, unique_filename)
                
                uploaded_files.append({
                    "filename": file.filename,
                    "success": True,
                    "file_info": {
                        "original_name": file.filename,
                        "filename": unique_filename,
                        "file_path": storage_path,
                        "file_type": file_type,
                        "content_type": file.content_type,
                        "size_bytes": len(optimized_content),
                        "size_mb": round(len(optimized_content) / (1024 * 1024), 2),
                        "local_url": f"/static/{storage_path}",
                        "cdn_url": cdn_url,
                        "uploaded_at": datetime.now().isoformat()
                    },
                    "optimization_info": optimization_info
                })
                
            except Exception as e:
                logger.error(f"❌ Failed to upload file {file.filename}: {e}")
                uploaded_files.append({
                    "filename": file.filename,
                    "success": False,
                    "error": str(e)
                })
        
        # 统计上传结果
        successful_uploads = [f for f in uploaded_files if f["success"]]
        failed_uploads = [f for f in uploaded_files if not f["success"]]
        
        response_data = {
            "success": True,
            "total_files": len(files),
            "successful_uploads": len(successful_uploads),
            "failed_uploads": len(failed_uploads),
            "files": uploaded_files
        }
        
        logger.info(f"✅ Batch upload completed: {len(successful_uploads)}/{len(files)} files uploaded")
        return JSONResponse(content=response_data, status_code=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"❌ Batch upload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"批量上传失败: {str(e)}"
        )

@router.delete("/{file_path:path}")
async def delete_file(
    file_path: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除文件"""
    try:
        # 检查文件是否存在
        if not await cloud_storage_service.file_exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="文件不存在"
            )
        
        # 删除文件
        success = await cloud_storage_service.delete_file(file_path)
        
        if success:
            # 清除CDN缓存
            await cdn_service.purge_cache([file_path])
            
            logger.info(f"✅ File deleted successfully: {file_path}")
            return JSONResponse(content={
                "success": True,
                "message": "文件删除成功"
            })
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="文件删除失败"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ File deletion failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"文件删除失败: {str(e)}"
        )

@router.get("/info/{file_path:path}")
async def get_file_info(
    file_path: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取文件信息"""
    try:
        # 检查文件是否存在
        if not await cloud_storage_service.file_exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="文件不存在"
            )
        
        # 获取文件内容
        file_content = await cloud_storage_service.download_file(file_path)
        
        # 获取文件信息
        filename = os.path.basename(file_path)
        file_info = file_optimizer.get_file_info(file_content, filename)
        
        # 获取CDN信息
        cdn_info = cdn_service.get_file_info(file_path)
        
        response_data = {
            "success": True,
            "file_info": file_info,
            "cdn_info": cdn_info,
            "storage_info": {
                "provider": cloud_storage_service.provider.__class__.__name__ if cloud_storage_service.provider else "local",
                "file_path": file_path
            }
        }
        
        return JSONResponse(content=response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Get file info failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取文件信息失败: {str(e)}"
        )

@router.get("/cdn/stats")
async def get_cdn_stats(
    current_user: User = Depends(get_current_user)
):
    """获取CDN统计信息"""
    try:
        stats = cdn_service.get_cdn_stats()
        return JSONResponse(content={
            "success": True,
            "cdn_stats": stats
        })
    except Exception as e:
        logger.error(f"❌ Get CDN stats failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取CDN统计信息失败: {str(e)}"
        )

@router.post("/cdn/purge")
async def purge_cdn_cache(
    file_paths: List[str],
    current_user: User = Depends(get_current_user)
):
    """清除CDN缓存"""
    try:
        success = await cdn_service.purge_cache(file_paths)
        
        if success:
            return JSONResponse(content={
                "success": True,
                "message": f"成功清除 {len(file_paths)} 个文件的CDN缓存"
            })
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="CDN缓存清除失败"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ CDN cache purge failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"CDN缓存清除失败: {str(e)}"
        ) 