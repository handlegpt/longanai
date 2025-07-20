# 龙眼AI - 智能粤语播客生成平台

## 🎯 项目概述

龙眼AI是一个基于AI技术的粤语播客生成平台，支持用户通过邮箱验证登录，使用Microsoft Edge TTS技术生成地道的粤语播客内容。

## 🏗️ 技术架构

### 后端 (Backend)
- **框架**: FastAPI + Python 3.9+
- **数据库**: SQLAlchemy ORM + SQLite (开发) / PostgreSQL (生产)
- **认证**: JWT Token + 邮箱验证
- **邮件服务**: SMTP (Gmail/Outlook/Yahoo)
- **TTS引擎**: Microsoft Edge TTS
- **文件处理**: Python-multipart + aiofiles

### 前端 (Frontend)
- **框架**: Next.js 14 + React 18
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **图标**: Lucide React
- **通知**: React Hot Toast

### 部署 (Deployment)
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **缓存**: Redis
- **数据库**: PostgreSQL (生产)

## ✨ 核心功能

### 🔐 用户认证系统
- **邮箱验证登录**: 无需密码，只需邮箱验证
- **Gmail风格登录**: 输入邮箱即可登录
- **自动用户创建**: 首次登录自动创建账户
- **JWT Token认证**: 安全的会话管理
- **邮箱验证流程**: 完整的验证邮件发送和验证

### 🎤 播客生成功能
- **文本输入生成**: 直接输入文本生成播客
- **文件上传生成**: 支持TXT、PDF、DOC、DOCX文件
- **三种声音角色**: 靓女、靓仔、阿嫲
- **情感调节**: 正常、开心、悲伤、兴奋、平静
- **速度控制**: 0.5x - 2.0x播放速度
- **实时预览**: 生成前预览音频
- **一键下载**: 生成的播客文件下载

### 📁 文件管理
- **拖拽上传**: 支持文件拖拽上传
- **多格式支持**: TXT、PDF、DOC、DOCX
- **文件预览**: 上传前预览文件内容
- **进度显示**: 上传进度实时显示

### 📚 历史记录
- **播客历史**: 查看所有生成的播客
- **搜索过滤**: 按时间、声音角色过滤
- **重新生成**: 基于历史记录重新生成
- **批量管理**: 批量删除、下载

### 🎨 用户界面
- **响应式设计**: 支持桌面和移动设备
- **粤语界面**: 使用地道粤语表达
- **现代化UI**: 简洁美观的界面设计
- **流畅动画**: 使用Framer Motion实现流畅动画

## 📁 项目结构

```
longanai/
├── backend/                 # 后端代码
│   ├── app/
│   │   ├── core/           # 核心配置
│   │   ├── models/         # 数据模型
│   │   ├── routers/        # API路由
│   │   └── services/       # 业务服务
│   ├── requirements.txt    # Python依赖
│   └── Dockerfile         # 后端容器配置
├── frontend/               # 前端代码
│   ├── app/               # Next.js页面
│   ├── components/        # React组件
│   ├── package.json       # Node.js依赖
│   └── Dockerfile        # 前端容器配置
├── docs/                  # 文档
├── scripts/               # 部署脚本
├── docker-compose.yml     # Docker编排
└── README.md             # 项目说明
```

## 🚀 快速开始

### 1. 环境准备
```bash
# 克隆项目
git clone https://github.com/your-username/longanai.git
cd longanai

# 运行设置脚本
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. 配置邮件服务
1. 按照 `docs/EMAIL_SETUP.md` 配置Gmail SMTP
2. 更新 `.env` 文件中的邮件设置

### 3. 启动开发服务器
```bash
# 启动后端
cd backend
uvicorn app.main:app --reload

# 启动前端 (新终端)
cd frontend
npm run dev
```

### 4. 使用Docker部署
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps
```

## 🔧 配置说明

### 环境变量 (.env)
```env
# 数据库配置
DATABASE_URL=sqlite:///./longanai.db

# 安全配置
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# 文件上传
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

## 🧪 测试

### 后端测试
```bash
cd backend
pytest tests/
```

### 前端测试
```bash
cd frontend
npm test
```

## 📊 API文档

启动后端服务后，访问以下地址查看API文档：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔒 安全特性

- **邮箱验证**: 确保用户邮箱真实性
- **JWT Token**: 安全的身份验证
- **CORS配置**: 跨域请求安全控制
- **文件类型验证**: 防止恶意文件上传
- **输入验证**: 严格的输入数据验证

## 🌟 特色功能

### 粤语本地化
- **地道表达**: 使用真实粤语表达
- **文化适配**: 符合粤语用户习惯
- **声音角色**: 三种不同性格的声音

### 智能生成
- **AI驱动**: 基于Microsoft Edge TTS
- **情感控制**: 支持多种情感表达
- **速度调节**: 灵活的播放速度控制

### 用户体验
- **一键生成**: 简化的操作流程
- **实时预览**: 即时音频预览
- **历史管理**: 完整的记录管理

## 🚧 开发路线图

### 已完成 ✅
- [x] 基础项目架构
- [x] 邮箱验证登录系统
- [x] 播客生成核心功能
- [x] 文件上传功能
- [x] 历史记录管理
- [x] 响应式UI设计
- [x] Docker部署配置

### 进行中 🔄
- [ ] 多语言支持 (广东话/香港话/英文)
- [ ] 高级音频处理
- [ ] 用户设置面板

### 计划中 📋
- [ ] 播客模板系统
- [ ] 社交分享功能
- [ ] 移动端APP
- [ ] 高级订阅功能
- [ ] 播客社区功能

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

- 项目主页: https://longan.ai
- 问题反馈: https://github.com/your-username/longanai/issues
- 邮箱: support@longan.ai

---

**让AI讲好你嘅粤语故事** 🎤✨ 