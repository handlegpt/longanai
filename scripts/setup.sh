#!/bin/bash

echo "🚀 设置 Longan AI 项目..."

# 创建必要的目录
mkdir -p uploads
mkdir -p static
mkdir -p logs

# 设置前端
echo "📦 安装前端依赖..."
cd frontend
npm install
cd ..

# 设置后端
echo "🐍 安装后端依赖..."
cd backend
pip install -r requirements.txt

# 初始化数据库
echo "🗄️ 初始化数据库..."
python -c "
from app.core.database import engine
from app.models.user import Base
Base.metadata.create_all(bind=engine)
print('Database initialized successfully')
"

cd ..

# 创建环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cat > .env << EOF
# Database
DATABASE_URL=sqlite:///./longanai.db

# Redis
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Email Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_TLS=true
SMTP_SSL=false
FROM_EMAIL=noreply@longan.ai
FROM_NAME=龍眼AI

# API Settings
API_V1_STR=/api
PROJECT_NAME=Longan AI

# Development
DEBUG=true
EOF
fi

echo "✅ 项目设置完成！"
echo ""
echo "📧 邮件配置说明："
echo "  1. 使用Gmail邮箱作为SMTP服务器"
echo "  2. 需要在Gmail中开启两步验证"
echo "  3. 生成应用专用密码"
echo "  4. 更新.env文件中的SMTP_USERNAME和SMTP_PASSWORD"
echo ""
echo "启动开发服务器："
echo "  前端: cd frontend && npm run dev"
echo "  后端: cd backend && uvicorn app.main:app --reload"
echo ""
echo "或者使用 Docker:"
echo "  docker-compose up -d" 