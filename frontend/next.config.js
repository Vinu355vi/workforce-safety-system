// next.config.js
import('next').NextConfig
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig