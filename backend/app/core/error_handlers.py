from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
import logging
import traceback
from typing import Union

from app.core.exceptions import LonganAIException, convert_to_http_exception

logger = logging.getLogger(__name__)

async def longan_ai_exception_handler(request: Request, exc: LonganAIException):
    """处理龍眼AI自定义异常"""
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict()
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """处理请求验证异常"""
    error_details = []
    for error in exc.errors():
        error_details.append({
            "field": " -> ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    error_response = {
        "error": True,
        "message": "数据验证失败",
        "error_code": "VALIDATION_ERROR",
        "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
        "details": {
            "validation_errors": error_details
        }
    }
    
    logger.warning(f"Validation error: {error_details}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response
    )

async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """处理数据库异常"""
    error_response = {
        "error": True,
        "message": "数据库操作失败",
        "error_code": "DATABASE_ERROR",
        "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
        "details": {
            "error_type": type(exc).__name__,
            "message": str(exc)
        }
    }
    
    logger.error(f"Database error: {str(exc)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response
    )

async def general_exception_handler(request: Request, exc: Exception):
    """处理通用异常"""
    # 记录详细的错误信息
    logger.error(f"Unhandled exception: {type(exc).__name__}: {str(exc)}")
    logger.error(f"Request URL: {request.url}")
    logger.error(f"Request method: {request.method}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    # 在生产环境中，不要暴露详细的错误信息
    error_response = {
        "error": True,
        "message": "服务器内部错误",
        "error_code": "INTERNAL_SERVER_ERROR",
        "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
        "details": {
            "error_type": type(exc).__name__
        }
    }
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response
    )

async def http_exception_handler(request: Request, exc: Union[int, Exception]):
    """处理HTTP异常"""
    if hasattr(exc, 'status_code'):
        status_code = exc.status_code
        detail = exc.detail
    else:
        status_code = exc
        detail = "HTTP错误"
    
    error_response = {
        "error": True,
        "message": detail if isinstance(detail, str) else "HTTP错误",
        "error_code": f"HTTP_{status_code}",
        "status_code": status_code,
        "details": {}
    }
    
    logger.warning(f"HTTP error {status_code}: {detail}")
    
    return JSONResponse(
        status_code=status_code,
        content=error_response
    )

# 错误响应格式统一化
def create_error_response(
    message: str,
    error_code: str,
    status_code: int,
    details: dict = None
) -> dict:
    """创建统一的错误响应格式"""
    return {
        "error": True,
        "message": message,
        "error_code": error_code,
        "status_code": status_code,
        "details": details or {}
    }

# 成功响应格式统一化
def create_success_response(
    data: any = None,
    message: str = "操作成功",
    status_code: int = 200
) -> dict:
    """创建统一的成功响应格式"""
    response = {
        "error": False,
        "message": message,
        "status_code": status_code
    }
    
    if data is not None:
        response["data"] = data
    
    return response
