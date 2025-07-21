#!/usr/bin/env python3
"""
Generate a secure SECRET_KEY for Longan AI
"""

import secrets
import string

def generate_secret_key(length=32):
    """Generate a secure random secret key"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_urlsafe_key(length=32):
    """Generate a URL-safe secret key"""
    return secrets.token_urlsafe(length)

if __name__ == "__main__":
    print("=== Longan AI Secret Key Generator ===")
    print()
    
    # Generate different types of keys
    print("1. Standard Secret Key (32 chars):")
    print(f"SECRET_KEY={generate_secret_key(32)}")
    print()
    
    print("2. URL-Safe Secret Key (32 chars):")
    print(f"SECRET_KEY={generate_urlsafe_key(32)}")
    print()
    
    print("3. Long Secret Key (64 chars):")
    print(f"SECRET_KEY={generate_secret_key(64)}")
    print()
    
    print("=== 使用说明 ===")
    print("1. 选择上面任意一个SECRET_KEY")
    print("2. 复制到你的.env文件中")
    print("3. 确保在生产环境中使用不同的密钥")
    print()
    print("=== 环境变量设置 ===")
    print("在backend/.env文件中添加以下配置：")
    print()
    print("# Security Configuration")
    print("SECRET_KEY=你选择的密钥")
    print("ALGORITHM=HS256")
    print("ACCESS_TOKEN_EXPIRE_MINUTES=30")
    print()
    print("# OpenAI Configuration (for GPT translation)")
    print("OPENAI_API_KEY=你的OpenAI API密钥")
    print()
    print("注意：请将'你的OpenAI API密钥'替换为实际的OpenAI API密钥") 