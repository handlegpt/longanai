/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    console.log('🔧 Next.js rewrites configuration loaded');
    console.log('🔧 Backend URL:', process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000');
    
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000'}/api/:path*`,
      },
      {
        source: '/static/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000'}/static/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000'}/uploads/:path*`,
      },
    ];
  },
  // 添加调试信息
  experimental: {
    logging: {
      level: 'verbose'
    }
  }
}

module.exports = nextConfig 