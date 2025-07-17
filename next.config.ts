import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    // Enable optimized package imports for better tree shaking
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-slot',
      'react-hook-form',
      'zod',
      'clsx',
      'tailwind-merge',
    ],
    // Enable turbo mode for faster builds
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

export default nextConfig
