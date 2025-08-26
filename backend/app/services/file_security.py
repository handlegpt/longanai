import os
import magic
import hashlib
from typing import List, Dict, Tuple
import logging
from fastapi import UploadFile
import mimetypes
import re

logger = logging.getLogger(__name__)

class FileSecurityService:
    """文件安全检查服务"""
    
    def __init__(self):
        # 允许的文件类型
        self.allowed_extensions = {
            '.txt': 'text/plain',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.md': 'text/markdown',
            '.rtf': 'application/rtf'
        }
        
        # 允许的MIME类型
        self.allowed_mime_types = [
            'text/plain',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/markdown',
            'application/rtf'
        ]
        
        # 文件大小限制（字节）
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        
        # 危险文件特征
        self.dangerous_patterns = [
            rb'<script',
            rb'javascript:',
            rb'vbscript:',
            rb'data:text/html',
            rb'data:application/x-javascript',
            rb'<?php',
            rb'<%@',
            rb'<%',
            rb'<%=',
            rb'exec(',
            rb'eval(',
            rb'system(',
            rb'shell_exec(',
            rb'passthru(',
            rb'`.*`',  # 反引号执行
        ]
        
        # 恶意文件头
        self.malicious_headers = [
            b'MZ',  # Windows可执行文件
            b'\x7fELF',  # Linux可执行文件
            b'\xfe\xed\xfa',  # Mach-O可执行文件
            b'PK\x03\x04',  # ZIP文件（可能包含恶意内容）
        ]
    
    def validate_file_extension(self, filename: str) -> Tuple[bool, str]:
        """验证文件扩展名"""
        if not filename:
            return False, "文件名不能为空"
        
        # 获取文件扩展名
        file_ext = os.path.splitext(filename.lower())[1]
        
        if not file_ext:
            return False, "文件必须包含扩展名"
        
        if file_ext not in self.allowed_extensions:
            return False, f"不支持的文件类型: {file_ext}"
        
        return True, "文件扩展名验证通过"
    
    def validate_file_size(self, file_size: int) -> Tuple[bool, str]:
        """验证文件大小"""
        if file_size <= 0:
            return False, "文件大小不能为0"
        
        if file_size > self.max_file_size:
            return False, f"文件大小超过限制: {file_size} > {self.max_file_size}"
        
        return True, "文件大小验证通过"
    
    def validate_mime_type(self, mime_type: str) -> Tuple[bool, str]:
        """验证MIME类型"""
        if not mime_type:
            return False, "MIME类型不能为空"
        
        if mime_type not in self.allowed_mime_types:
            return False, f"不支持的MIME类型: {mime_type}"
        
        return True, "MIME类型验证通过"
    
    def detect_file_type(self, file_content: bytes) -> Tuple[str, str]:
        """检测文件类型"""
        try:
            # 使用python-magic检测MIME类型
            mime_type = magic.from_buffer(file_content, mime=True)
            
            # 获取文件扩展名
            extension = mimetypes.guess_extension(mime_type)
            if extension:
                extension = extension.lower()
            else:
                extension = ""
            
            return mime_type, extension
            
        except Exception as e:
            logger.error(f"File type detection error: {e}")
            return "application/octet-stream", ""
    
    def scan_for_malicious_content(self, file_content: bytes) -> Tuple[bool, List[str]]:
        """扫描恶意内容"""
        threats = []
        
        try:
            # 检查恶意文件头
            for header in self.malicious_headers:
                if file_content.startswith(header):
                    threats.append(f"检测到恶意文件头: {header}")
            
            # 检查危险模式
            for pattern in self.dangerous_patterns:
                if re.search(pattern, file_content, re.IGNORECASE):
                    threats.append(f"检测到危险模式: {pattern}")
            
            # 检查文件内容长度异常
            if len(file_content) < 10:  # 文件过小
                threats.append("文件内容过小，可能不是有效文档")
            
            # 检查是否包含可执行代码特征
            executable_indicators = [
                b'PE\x00\x00',  # Windows PE文件
                b'\x7fELF',     # Linux ELF文件
                b'#!/',         # Shell脚本
            ]
            
            for indicator in executable_indicators:
                if indicator in file_content:
                    threats.append("检测到可执行文件特征")
                    break
            
            return len(threats) == 0, threats
            
        except Exception as e:
            logger.error(f"Malicious content scan error: {e}")
            threats.append(f"扫描过程出错: {str(e)}")
            return False, threats
    
    def calculate_file_hash(self, file_content: bytes) -> str:
        """计算文件哈希值"""
        return hashlib.sha256(file_content).hexdigest()
    
    def validate_file(self, file: UploadFile) -> Tuple[bool, Dict[str, any]]:
        """综合文件验证"""
        validation_result = {
            "valid": False,
            "errors": [],
            "warnings": [],
            "file_info": {}
        }
        
        try:
            # 读取文件内容
            file_content = file.file.read()
            file.file.seek(0)  # 重置文件指针
            
            # 验证文件扩展名
            ext_valid, ext_message = self.validate_file_extension(file.filename)
            if not ext_valid:
                validation_result["errors"].append(ext_message)
            
            # 验证文件大小
            size_valid, size_message = self.validate_file_size(len(file_content))
            if not size_valid:
                validation_result["errors"].append(size_message)
            
            # 验证MIME类型
            mime_valid, mime_message = self.validate_mime_type(file.content_type)
            if not mime_valid:
                validation_result["errors"].append(mime_message)
            
            # 检测实际文件类型
            detected_mime, detected_ext = self.detect_file_type(file_content)
            
            # 检查MIME类型是否匹配
            if file.content_type != detected_mime:
                validation_result["warnings"].append(
                    f"MIME类型不匹配: 声明={file.content_type}, 检测={detected_mime}"
                )
            
            # 扫描恶意内容
            content_safe, threats = self.scan_for_malicious_content(file_content)
            if not content_safe:
                validation_result["errors"].extend(threats)
            
            # 计算文件哈希
            file_hash = self.calculate_file_hash(file_content)
            
            # 收集文件信息
            validation_result["file_info"] = {
                "filename": file.filename,
                "size": len(file_content),
                "content_type": file.content_type,
                "detected_mime": detected_mime,
                "detected_extension": detected_ext,
                "hash": file_hash
            }
            
            # 判断验证结果
            validation_result["valid"] = len(validation_result["errors"]) == 0
            
            return validation_result["valid"], validation_result
            
        except Exception as e:
            logger.error(f"File validation error: {e}")
            validation_result["errors"].append(f"文件验证过程出错: {str(e)}")
            return False, validation_result
    
    def sanitize_filename(self, filename: str) -> str:
        """清理文件名"""
        # 移除危险字符
        dangerous_chars = ['<', '>', ':', '"', '|', '?', '*', '\\', '/']
        for char in dangerous_chars:
            filename = filename.replace(char, '_')
        
        # 限制文件名长度
        if len(filename) > 255:
            name, ext = os.path.splitext(filename)
            filename = name[:255-len(ext)] + ext
        
        return filename

# 全局文件安全检查服务实例
file_security_service = FileSecurityService()
