import io
import os
from typing import Optional
from fastapi import HTTPException

def extract_text_from_file(content: bytes, filename: str) -> Optional[str]:
    """从文件中提取文本内容"""
    try:
        file_ext = os.path.splitext(filename.lower())[1]
        
        if file_ext == '.txt':
            # 纯文本文件
            return content.decode('utf-8', errors='ignore')
        
        elif file_ext == '.md':
            # Markdown文件
            return content.decode('utf-8', errors='ignore')
        
        elif file_ext == '.pdf':
            # PDF文件 - 需要安装 PyPDF2
            try:
                import PyPDF2
                pdf_file = io.BytesIO(content)
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text.strip()
            except ImportError:
                raise HTTPException(status_code=500, detail="PDF处理功能未安装，请联系管理员")
            except Exception as e:
                print(f"PDF文本提取失败: {e}")
                return None
        
        elif file_ext in ['.doc', '.docx']:
            # Word文档 - 需要安装 python-docx
            try:
                if file_ext == '.docx':
                    from docx import Document
                    doc_file = io.BytesIO(content)
                    doc = Document(doc_file)
                    text = ""
                    for paragraph in doc.paragraphs:
                        text += paragraph.text + "\n"
                    return text.strip()
                else:
                    # .doc 文件需要额外的库支持
                    raise HTTPException(status_code=400, detail="暂不支持 .doc 格式，请转换为 .docx 格式")
            except ImportError:
                raise HTTPException(status_code=500, detail="Word文档处理功能未安装，请联系管理员")
            except Exception as e:
                print(f"Word文档文本提取失败: {e}")
                return None
        
        else:
            return None
            
    except Exception as e:
        print(f"文件内容提取失败: {e}")
        return None

def validate_extracted_text(text: str) -> bool:
    """验证提取的文本内容是否有效"""
    if not text or not text.strip():
        return False
    
    # 检查文本长度
    if len(text.strip()) < 10:
        return False
    
    # 检查是否包含可读字符
    import re
    readable_chars = re.findall(r'[\u4e00-\u9fa5a-zA-Z0-9]', text)
    if len(readable_chars) < 5:
        return False
    
    return True

def clean_extracted_text(text: str) -> str:
    """清理提取的文本内容"""
    import re
    
    # 移除多余的空白字符
    text = re.sub(r'\s+', ' ', text)
    
    # 移除特殊字符（保留中文、英文、数字、标点）
    text = re.sub(r'[^\u4e00-\u9fa5a-zA-Z0-9\s.,!?;:()（）]', '', text)
    
    # 移除行首行尾空白
    text = text.strip()
    
    return text 