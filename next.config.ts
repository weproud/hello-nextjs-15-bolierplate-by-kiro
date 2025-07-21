import type { NextConfig } from 'next'

// Bundle analyzer for performance optimization
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env['ANALYZE'] === 'true',
})

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
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-heading',
      '@tiptap/extension-placeholder',
      'framer-motion',
      'sonner',
      '@hookform/resolvers',
      'react-intersection-observer',
      'use-debounce',
    ],

    // Enable optimized CSS loading
    optimizeCss: true,

    // Enable Turbo for faster builds
    // turbo: {
    //   rules: {
    //     // Optimize SVG imports
    //     '*.svg': {
    //       loaders: ['@svgr/webpack'],
    //       as: '*.js',
    //     },
    //     // Optimize image imports
    //     '*.{png,jpg,jpeg,gif,webp,avif}': {
    //       loaders: ['next-optimized-images-loader'],
    //       as: '*.js',
    //     },
    //   },
    // },
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
    // Enable React compiler optimizations
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    // Enable SWC minification
    styledComponents: true,
  },

  // Webpack optimizations
  webpack: (config, { dev }) => {
    // Production optimizations
    if (!dev) {
      // Enable advanced tree shaking
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        // Custom chunk splitting strategy
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunk for stable dependencies
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // UI components chunk
            ui: {
              test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
              name: 'ui-components',
              chunks: 'all',
              priority: 20,
            },
            // Form components chunk
            forms: {
              test: /[\\/]src[\\/]components[\\/]forms[\\/]/,
              name: 'form-components',
              chunks: 'all',
              priority: 15,
            },
            // Auth components chunk
            auth: {
              test: /[\\/]src[\\/]components[\\/]auth[\\/]/,
              name: 'auth-components',
              chunks: 'all',
              priority: 15,
            },
            // TipTap editor chunk
            editor: {
              test: /[\\/](@tiptap|prosemirror)[\\/]/,
              name: 'editor',
              chunks: 'all',
              priority: 25,
            },
          },
        },
      }

      // Bundle size optimizations
      config.resolve.alias = {
        ...config.resolve.alias,
        // Use lighter alternatives for production
        'react-dom$': 'react-dom/profiling',
        'scheduler/tracing': 'scheduler/tracing-profiling',
      }
    }

    // SVG optimization
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable image optimization for better performance
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
        // Cache form component chunks
        source: '/_next/static/chunks/form-components-:hash*.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache editor component chunks
        source: '/_next/static/chunks/editor-:hash*.js',
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
      {
        // Security headers
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Performance budgets and monitoring
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
}

export default withBundleAnalyzer(nextConfig)
