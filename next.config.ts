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
      'next-auth',
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
    // Enable optimized CSS loading
    optimizeCss: true,
    // Enable server components external packages optimization
    serverComponentsExternalPackages: ['next-auth'],
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
    // Enable React compiler optimizations
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers for caching optimization
  async headers() {
    return [
      {
        // Cache static assets for modal components
        source: '/_next/static/chunks/pages/@modal/(.)auth/signin-:hash*.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache auth component chunks
        source: '/_next/static/chunks/components/auth/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Preload hints for modal components
        source: '/@modal/(.)auth/signin',
        headers: [
          {
            key: 'Link',
            value: '</components/auth/signin-modal>; rel=modulepreload',
          },
        ],
      },
    ]
  },

  // Webpack optimizations for bundle splitting
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize modal component chunks
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          // Separate chunk for auth modal components
          authModal: {
            test: /[\\/]components[\\/]auth[\\/](signin-modal|signin-form|modal-error-boundary)\.tsx?$/,
            name: 'auth-modal',
            chunks: 'all',
            priority: 30,
            reuseExistingChunk: true,
          },
          // Separate chunk for UI components used in modals
          modalUI: {
            test: /[\\/]components[\\/]ui[\\/](card|button|dialog)\.tsx?$/,
            name: 'modal-ui',
            chunks: 'all',
            priority: 25,
            reuseExistingChunk: true,
          },
        },
      }
    }
    return config
  },
}

export default nextConfig
