#!/usr/bin/env python3
"""
设置管理员用户脚本
使用方法: python scripts/setup_admin.py <email>
"""

import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from datetime import datetime

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User

def setup_admin(email: str):
    """设置指定邮箱为管理员"""
    # 创建数据库连接
    engine = create_engine(settings.DATABASE_URL)
    
    with Session(engine) as db:
        # 查找用户
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"❌ 用户 {email} 不存在")
            print("请先注册该邮箱，然后再运行此脚本")
            return False
        
        # 设置为管理员
        user.is_admin = True
        user.is_verified = True  # 确保已验证
        db.commit()
        
        print(f"✅ 成功设置 {email} 为管理员")
        print(f"📧 邮箱: {user.email}")
        print(f"👑 管理员权限: {user.is_admin}")
        print(f"✅ 验证状态: {user.is_verified}")
        print(f"📅 创建时间: {user.created_at}")
        print("\n🔑 管理员登录信息:")
        print(f"   邮箱: {email}")
        print(f"   密码: admin123")
        print(f"   登录地址: http://localhost:3000/admin/login")
        
        return True

def main():
    if len(sys.argv) != 2:
        print("使用方法: python scripts/setup_admin.py <email>")
        print("示例: python scripts/setup_admin.py admin@example.com")
        sys.exit(1)
    
    email = sys.argv[1]
    
    if '@' not in email:
        print("❌ 请输入有效的邮箱地址")
        sys.exit(1)
    
    print(f"🔧 正在设置管理员: {email}")
    print("=" * 50)
    
    success = setup_admin(email)
    
    if success:
        print("\n" + "=" * 50)
        print("🎉 管理员设置完成！")
        print("现在可以使用管理员账号登录后台管理系统")
    else:
        print("\n❌ 管理员设置失败")
        sys.exit(1)

if __name__ == "__main__":
    main() 