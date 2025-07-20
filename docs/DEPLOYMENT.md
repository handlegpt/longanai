# Longan AI 部署指南

## 本地开发部署

### 环境要求
- Node.js 18+
- Python 3.11+
- Git

### 快速开始

1. **克隆项目**
```bash
git clone https://github.com/your-username/longanai.git
cd longanai
```

2. **运行设置脚本**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

3. **启动开发服务器**
```bash
chmod +x scripts/dev.sh
./scripts/dev.sh
```

或者分别启动：

**后端：**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**前端：**
```bash
cd frontend
npm install
npm run dev
```

## Docker 部署

### 使用 Docker Compose

1. **构建并启动所有服务**
```bash
docker-compose up -d
```

2. **查看服务状态**
```bash
docker-compose ps
```

3. **查看日志**
```bash
docker-compose logs -f
```

4. **停止服务**
```bash
docker-compose down
```

### 单独构建镜像

**前端镜像：**
```bash
cd frontend
docker build -t longanai-frontend .
```

**后端镜像：**
```bash
cd backend
docker build -t longanai-backend .
```

## 生产环境部署

### 环境变量配置

创建 `.env` 文件：
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/longanai

# Redis
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-super-secret-production-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# API Settings
API_V1_STR=/api
PROJECT_NAME=Longan AI

# Production
DEBUG=false
```

### 使用 Nginx 反向代理

1. **安装 Nginx**
```bash
sudo apt update
sudo apt install nginx
```

2. **配置 Nginx**
```bash
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl restart nginx
```

3. **配置 SSL (可选)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 使用 PM2 管理进程

**安装 PM2：**
```bash
npm install -g pm2
```

**启动应用：**
```bash
# 启动后端
cd backend
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name "longanai-backend"

# 启动前端
cd frontend
pm2 start "npm start" --name "longanai-frontend"
```

**查看状态：**
```bash
pm2 status
pm2 logs
```

## 数据库迁移

### 使用 Alembic

1. **初始化 Alembic**
```bash
cd backend
alembic init alembic
```

2. **创建迁移**
```bash
alembic revision --autogenerate -m "Initial migration"
```

3. **应用迁移**
```bash
alembic upgrade head
```

## 监控和日志

### 日志配置

创建 `backend/logging.conf`：
```ini
[loggers]
keys=root,app

[handlers]
keys=consoleHandler,fileHandler

[formatters]
keys=normalFormatter

[logger_root]
level=INFO
handlers=consoleHandler

[logger_app]
level=INFO
handlers=consoleHandler,fileHandler
qualname=app
propagate=0

[handler_consoleHandler]
class=StreamHandler
level=INFO
formatter=normalFormatter
args=(sys.stdout,)

[handler_fileHandler]
class=FileHandler
level=INFO
formatter=normalFormatter
args=('logs/app.log', 'a')

[formatter_normalFormatter]
format=%(asctime)s - %(name)s - %(levelname)s - %(message)s
```

## 故障排除

### 常见问题

1. **端口被占用**
```bash
# 查看端口占用
lsof -i :3008
lsof -i :8000

# 杀死进程
kill -9 <PID>
```

2. **数据库连接问题**
```bash
# 检查数据库状态
sqlite3 longanai.db ".tables"
```

3. **依赖安装问题**
```bash
# 清理缓存
npm cache clean --force
pip cache purge
```

4. **Docker 问题**
```bash
# 清理 Docker 缓存
docker system prune -a
docker volume prune
```

## 性能优化

### 前端优化
- 启用 Gzip 压缩
- 使用 CDN 加速静态资源
- 启用浏览器缓存

### 后端优化
- 使用 Redis 缓存
- 数据库连接池
- 异步处理大文件

### 系统优化
- 调整 Nginx 工作进程数
- 配置系统文件描述符限制
- 启用系统级缓存 