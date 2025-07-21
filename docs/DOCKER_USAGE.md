# Docker 使用说明

## 基本操作

### 启动服务
```bash
# 构建并启动所有服务
docker-compose up -d

# 只启动特定服务
docker-compose up -d frontend backend
```

### 查看服务状态
```bash
# 查看所有容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看特定服务的日志
docker-compose logs -f frontend
```

### 停止服务
```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷（谨慎使用）
docker-compose down -v
```

### 重新构建
```bash
# 重新构建所有服务
docker-compose build

# 重新构建特定服务
docker-compose build frontend

# 强制重新构建（不使用缓存）
docker-compose build --no-cache
```

## 镜像管理

### 查看镜像
```bash
# 查看所有镜像
docker images

# 查看Longan AI相关镜像
docker images | grep longanai
```

### 手动清理（可选）
```bash
# 删除未使用的镜像
docker image prune

# 删除所有未使用的资源（谨慎使用）
docker system prune
```

## 端口映射

- **前端**: http://localhost:3008
- **后端API**: http://localhost:8005
- **数据库**: localhost:5432
- **Redis**: localhost:6380
- **Nginx**: http://localhost:80

## 注意事项

1. **数据持久化**: 数据库数据存储在 `postgres_data` 卷中
2. **环境变量**: 可以通过 `.env` 文件或环境变量配置
3. **网络**: 所有服务都在 `longanai-network` 网络中
4. **容器名称**: 每个服务都有固定的容器名称，便于管理

## 故障排除

### 端口冲突
如果端口被占用，可以修改 `docker-compose.yml` 中的端口映射。

### 构建失败
```bash
# 清理构建缓存
docker builder prune

# 重新构建
docker-compose build --no-cache
```

### 磁盘空间不足
```bash
# 查看Docker使用情况
docker system df

# 清理未使用的资源
docker system prune
``` 