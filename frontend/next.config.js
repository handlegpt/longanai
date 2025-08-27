/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // 使用API路由进行代理，移除rewrites配置
  experimental: {
    logging: {
      level: 'verbose'
    }
  }
}

module.exports = nextConfig 