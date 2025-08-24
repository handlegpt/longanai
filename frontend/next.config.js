/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/api/:path*',
      },
      {
        source: '/static/:path*',
        destination: 'http://backend:8000/static/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://backend:8000/uploads/:path*',
      },
    ];
  },
}

module.exports = nextConfig 