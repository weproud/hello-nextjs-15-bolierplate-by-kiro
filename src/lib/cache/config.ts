/**
 * Cache configuration and setup
 */

import { initializeCache } from './init'
import { cacheWarmingScheduler } from './advanced-strategies'

/**
 * Default cache configuration for different environments
 */
export const cacheConfig = {
  development: {
    warmUp: {
      static: true,
      user: false,
    },
    monitoring: {
      enabled: true,
      logInterval: 30000, // 30 seconds
      healthChecks: true,
    },
    cleanup: {
      enabled: true,
      interval: 300000, // 5 minutes
    },
    memory: {
      maxSize: 500,
      compressionThreshold: 5000,
    },
  },
  production: {
    warmUp: {
      static: true,
      user: true,
    },
    monitoring: {
      enabled: false,
      logInterval: 300000, // 5 minutes
      healthChecks: true,
    },
    cleanup: {
      enabled: true,
      interval: 600000, // 10 minutes
    },
    memory: {
      maxSize: 2000,
      compressionThreshold: 10000,
    },
  },
  test: {
    warmUp: {
      static: false,
      user: false,
    },
    monitoring: {
      enabled: false,
      logInterval: 0,
      healthChecks: false,
    },
    cleanup: {
      enabled: false,
      interval: 0,
    },
    memory: {
      maxSize: 100,
      compressionThreshold: 1000,
    },
  },
}

/**
 * Initialize cache system with environment-specific configuration
 */
export async function setupCache(userId?: string) {
  const env = process.env.NODE_ENV || 'development'
  const config = cacheConfig[env] || cacheConfig.development

  // Add userId to warmUp config if provided
  if (userId && config.warmUp.user) {
    ;(config.warmUp as any).userId = userId
  }

  await initializeCache(config)

  // Set up scheduled cache warming in production
  if (env === 'production' && userId) {
    cacheWarmingScheduler.scheduleUserWarming([userId])
    cacheWarmingScheduler.scheduleCleanup()
  }

  return config
}

/**
 * Cache middleware configuration for different route types
 */
export const routeCacheConfig = {
  // Static pages - long cache
  static: {
    ttl: 86400, // 24 hours
    tags: ['static'],
    revalidate: 86400,
  },

  // User dashboard - short cache with user-specific invalidation
  dashboard: {
    ttl: 300, // 5 minutes
    tags: ['user', 'project'],
    revalidate: 300,
  },

  // Project pages - medium cache
  project: {
    ttl: 1800, // 30 minutes
    tags: ['project'],
    revalidate: 1800,
  },

  // API routes - very short cache
  api: {
    ttl: 60, // 1 minute
    tags: ['api'],
    revalidate: 60,
  },

  // Authentication pages - no cache
  auth: {
    ttl: 0,
    tags: [],
    revalidate: 0,
  },
}

/**
 * Cache key generators for consistent naming
 */
export const cacheKeys = {
  user: {
    profile: (userId: string) => `user:${userId}:profile`,
    projects: (userId: string) => `user:${userId}:projects`,
    stats: (userId: string) => `user:${userId}:stats`,
    dashboard: (userId: string) => `user:${userId}:dashboard`,
  },

  project: {
    details: (projectId: string) => `project:${projectId}:details`,
    progress: (projectId: string) => `project:${projectId}:progress`,
  },

  route: {
    data: (route: string, userId?: string) =>
      `route:${route}${userId ? `:${userId}` : ''}`,
  },

  component: {
    data: (componentName: string, props: Record<string, unknown>) =>
      `component:${componentName}:${JSON.stringify(props)}`,
  },
}

/**
 * Cache invalidation patterns for different operations
 */
export const invalidationPatterns = {
  userUpdate: (userId: string) => [
    cacheKeys.user.profile(userId),
    cacheKeys.user.stats(userId),
    cacheKeys.user.dashboard(userId),
  ],

  projectCreate: (userId: string, projectId: string) => [
    cacheKeys.user.projects(userId),
    cacheKeys.user.stats(userId),
    cacheKeys.user.dashboard(userId),
    cacheKeys.project.details(projectId),
  ],

  projectUpdate: (userId: string, projectId: string) => [
    cacheKeys.user.projects(userId),
    cacheKeys.user.dashboard(userId),
    cacheKeys.project.details(projectId),
    cacheKeys.project.progress(projectId),
  ],

  projectDelete: (userId: string, projectId: string) => [
    cacheKeys.user.projects(userId),
    cacheKeys.user.stats(userId),
    cacheKeys.user.dashboard(userId),
    cacheKeys.project.details(projectId),
    cacheKeys.project.progress(projectId),
  ],
}
