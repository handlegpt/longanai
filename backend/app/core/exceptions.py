from fastapi import HTTPException, status
from typing import Any, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class LonganAIException(Exception):
    """龍眼AI基础异常类"""
    
    def __init__(
        self,
        message: str,
        error_code: str = None,
        status_code: int = 500,
        details: Dict[str, Any] = None,
        log_level: str = "ERROR"
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        self.log_level = log_level
        
        # 记录错误日志
        self._log_error()
        
        super().__init__(self.message)
    
    def _log_error(self):
        """记录错误日志"""
        log_message = f"Error {self.error_code}: {self.message}"
        if self.details:
            log_message += f" | Details: {self.details}"
        
        if self.log_level == "DEBUG":
            logger.debug(log_message)
        elif self.log_level == "INFO":
            logger.info(log_message)
        elif self.log_level == "WARNING":
            logger.warning(log_message)
        else:
            logger.error(log_message)
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "error": True,
            "message": self.message,
            "error_code": self.error_code,
            "status_code": self.status_code,
            "details": self.details
        }

# 认证相关异常
class AuthenticationError(LonganAIException):
    """认证错误"""
    def __init__(self, message: str = "认证失败", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code="AUTH_ERROR",
            status_code=status.HTTP_401_UNAUTHORIZED,
            details=details
        )

class AuthorizationError(LonganAIException):
    """授权错误"""
    def __init__(self, message: str = "权限不足", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code="FORBIDDEN",
            status_code=status.HTTP_403_FORBIDDEN,
            details=details
        )

class EmailNotVerifiedError(LonganAIException):
    """邮箱未验证错误"""
    def __init__(self, message: str = "请先验证邮箱", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code="EMAIL_NOT_VERIFIED",
            status_code=status.HTTP_403_FORBIDDEN,
            details=details
        )

# 用户相关异常
class UserNotFoundError(LonganAIException):
    """用户不存在错误"""
    def __init__(self, message: str = "用户不存在", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code="USER_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details=details
        )

class UserAlreadyExistsError(LonganAIException):
    """用户已存在错误"""
    def __init__(self, message: str = "用户已存在", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code="USER_EXISTS",
            status_code=status.HTTP_409_CONFLICT,
            details=details
        )

# 播客相关异常
class PodcastGenerationError(LonganAIException):
    """播客生成错误"""
    def __init__(self, message: str = "播客生成失败", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code="PODCAST_GENERATION_ERROR",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=details
        )

class PodcastNotFoundError(LonganAIException):
    """播客不存在错误"""
    def __init__(self, message: str = "播客不存在", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code="PODCAST_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details=details
        )

class GenerationLimitExceededError(LonganAIException):
    """生成次数超限错误"""
    def __init__(self, message: str = "已达到生成限制", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code="GENERATION_LIMIT_EXCEEDED",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            details=details
        )

# 文件相关异常
class FileUploadError(LonganAIException):
    """文件上传错误"""
    def __init__(self, message: str = "文件上传失败", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code="FILE_UPLOAD_ERROR",
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details
        )

class FileTooLargeError(LonganAIException):
    """文件过大错误"""
    def __init__(self, message: str = "文件过大", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code="FILE_TOO_LARGE",
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            details=details
        )

class UnsupportedFileTypeError(LonganAIException):
    """不支持的文件类型错误"""
    def __init__(self, message: str = "不支持的文件类型", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code="UNSUPPORTED_FILE_TYPE",
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details
        )

# TTS相关异常
class TTSError(LonganAIException):
    """TTS错误"""
    def __init__(self, message: str = "语音合成失败", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code="TTS_ERROR",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=details
        )

class TTSTimeoutError(LonganAIException):
    """TTS超时错误"""
    def __init__(self, message: str = "语音合成超时", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code="TTS_TIMEOUT",
            status_code=status.HTTP_408_REQUEST_TIMEOUT,
            details=details
        )

# 速率限制异常
class RateLimitExceededError(LonganAIException):
    """速率限制超限错误"""
    def __init__(self, message: str = "请求过于频繁，请稍后重试", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code="RATE_LIMIT_EXCEEDED",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            details=details
        )

# 数据库相关异常
class DatabaseError(LonganAIException):
    """数据库错误"""
    def __init__(self, message: str = "数据库操作失败", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code="DATABASE_ERROR",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=details
        )

# 外部服务异常
class ExternalServiceError(LonganAIException):
    """外部服务错误"""
    def __init__(self, message: str = "外部服务调用失败", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code="EXTERNAL_SERVICE_ERROR",
            status_code=status.HTTP_502_BAD_GATEWAY,
            details=details
        )

# 验证相关异常
class ValidationError(LonganAIException):
    """数据验证错误"""
    def __init__(self, message: str = "数据验证失败", details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details
        )

# 异常转换函数
def convert_to_http_exception(exception: LonganAIException) -> HTTPException:
    """将自定义异常转换为HTTPException"""
    return HTTPException(
        status_code=exception.status_code,
        detail=exception.to_dict()
    )
