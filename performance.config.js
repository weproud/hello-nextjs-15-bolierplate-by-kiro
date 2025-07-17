/**
 * Performance configuration for development environment
 */

module.exports = {
  // Bundle size thresholds (in KB)
  bundleSize: {
    warning: 500,
    error: 1000,
  },

  // Performance budgets
  budgets: [
    {
      type: 'initial',
      maximumWarning: '500kb',
      maximumError: '1mb',
    },
    {
      type: 'anyComponentStyle',
      maximumWarning: '2kb',
      maximumError: '4kb',
    },
    {
      type: 'anyScript',
      maximumWarning: '5kb',
      maximumError: '10kb',
    },
  ],

  // Lighthouse configuration
  lighthouse: {
    extends: 'lighthouse:default',
    settings: {
      onlyAudits: [
        'first-contentful-paint',
        'largest-contentful-paint',
        'first-meaningful-paint',
        'speed-index',
        'interactive',
        'cumulative-layout-shift',
      ],
    },
  },

  // Webpack bundle analyzer options
  bundleAnalyzer: {
    analyzerMode: 'server',
    analyzerPort: 8888,
    openAnalyzer: true,
    generateStatsFile: true,
    statsFilename: 'bundle-stats.json',
  },

  // Cache configuration
  cache: {
    // Memory cache settings
    memory: {
      defaultTTL: 300000, // 5 minutes
      maxSize: 1000, // Maximum number of entries
      cleanupInterval: 60000, // 1 minute cleanup interval
    },

    // Next.js cache settings
    nextjs: {
      revalidate: {
        short: 60, // 1 minute
        medium: 300, // 5 minutes
        long: 1800, // 30 minutes
        static: 86400, // 24 hours
      },
    },

    // Prisma cache settings
    prisma: {
      defaultTTL: 300000, // 5 minutes
      userDataTTL: 600000, // 10 minutes
      projectDataTTL: 300000, // 5 minutes
      staticDataTTL: 3600000, // 1 hour
    },
  },

  // Performance monitoring
  monitoring: {
    enabled: process.env.NODE_ENV === 'development',
    logInterval: 30000, // 30 seconds
    metricsRetention: 100, // Keep last 100 metrics

    // Performance thresholds
    thresholds: {
      renderTime: 100, // ms
      loadTime: 2000, // ms
      memoryUsage: 100, // MB
      cacheHitRate: 0.7, // 70%
    },
  },

  // Development optimizations
  development: {
    // Hot reload settings
    hotReload: {
      enabled: true,
      overlay: true,
    },

    // Build optimizations
    build: {
      turbo: true,
      incremental: true,
      parallel: true,
    },

    // Cache warming on startup
    cacheWarming: {
      enabled: true,
      static: true,
      user: false, // Only warm user cache when user logs in
    },
  },
}
