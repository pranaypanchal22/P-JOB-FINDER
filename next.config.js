/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src/'),
      '@/components': path.resolve(__dirname, 'src/components/'),
      '@/lib': path.resolve(__dirname, 'src/lib/'),
      '@/server': path.resolve(__dirname, 'src/server/'),
      '@/types': path.resolve(__dirname, 'src/types/'),
    }
    return config
  },
}

module.exports = nextConfig
