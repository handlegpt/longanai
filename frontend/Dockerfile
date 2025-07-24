# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json .
COPY package-lock.json .

# 安全依赖安装，强制锁定
RUN npm ci --production

# 自动修复已知依赖漏洞（可选，生产环境建议人工 review）
RUN npm audit fix --production || true

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3008

# Start the application on port 3008
CMD ["npm", "start", "--", "-p", "3008"] 