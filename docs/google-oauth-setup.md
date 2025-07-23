# Google OAuth 配置指南

## 1. 创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API

## 2. 创建 OAuth 2.0 凭据

1. 在左侧菜单中，转到 "API 和服务" > "凭据"
2. 点击 "创建凭据" > "OAuth 2.0 客户端 ID"
3. 选择应用类型为 "Web 应用程序"
4. 设置应用名称（如 "龙眼AI"）

## 3. 配置重定向 URI

添加以下授权重定向 URI：
- 开发环境：`http://localhost:8000/api/auth/google/callback`
- 生产环境：`https://yourdomain.com/api/auth/google/callback`

## 4. 获取凭据信息

创建完成后，你会获得：
- **客户端 ID**：`123456789-abcdefghijklmnop.apps.googleusercontent.com`
- **客户端密钥**：`GOCSPX-abcdefghijklmnopqrstuvwxyz`

## 5. 配置环境变量

在 `backend/.env` 文件中添加：

```env
# Google OAuth Settings
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

## 6. 验证配置

1. 重启后端服务
2. 访问登录页面
3. 点击 "使用 Google 登录" 按钮
4. 应该能正常跳转到 Google 授权页面

## 注意事项

- 确保重定向 URI 完全匹配（包括协议、域名、端口）
- 生产环境需要使用 HTTPS
- 客户端密钥要保密，不要提交到代码仓库
- 如果修改了重定向 URI，需要在 Google Cloud Console 中同步更新 