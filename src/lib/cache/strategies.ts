/**
 * Cache invalidation strategies and management
 */

import { cacheInvalidation, CACHE_TAGS } from './nextjs'
import { prismaMemoryCache } from './prisma'
import { staticCacheUtils } from './static'
import { globalCache, userCache, projectCache } from './memory'

/**
 * Cache invalidation strategies for different data types
 */
export const cacheStrategies = {
  /**
   * User data invalidation
   */
  user: {
    // Invalidate all user-related cache
    invalidateAll: (userId: string) => {
      // Next.js cache
      cacheInvalidation.user(userId)

      // Memory cache
      prismaMemoryCache.invalidateUser(userId)
      userCache.delete(`user:${userId}`)
      userCache.delete(`user:${userId}:projects`)

      // Global cache cleanup
      const userKeys = globalCache.keys().filter(key => key.includes(userId))
      userKeys.forEach(key => globalCache.delete(key))
    },

    // Invalidate user profile only
    invalidateProfile: (userId: string) => {
      cacheInvalidation.byTag(`${CACHE_TAGS.USER}:${userId}`)
      prismaMemoryCache.delete(prismaMemoryCache.keys.user(userId))
      userCache.delete(`user:${userId}`)
    },

    // Invalidate user projects
    invalidateProjects: (userId: string) => {
      cacheInvalidation.userProjects(userId)
      prismaMemoryCache.delete(prismaMemoryCache.keys.userProjects(userId))
      userCache.delete(`user:${userId}:projects`)
    },
  },

  /**
   * Project data invalidation
   */
  project: {
    // Invalidate all project-related cache
    invalidateAll: (projectId: string, userId?: string) => {
      // Next.js cache
      cacheInvalidation.project(projectId)

      // Memory cache
      prismaMemoryCache.invalidateProject(projectId, userId)
      projectCache.delete(`project:${projectId}`)

      if (userId) {
        userCache.delete(`user:${userId}:projects`)
      }
    },

    // Invalidate project details only
    invalidateDetails: (projectId: string) => {
      cacheInvalidation.byTag(`${CACHE_TAGS.PROJECT}:${projectId}`)
      prismaMemoryCache.delete(prismaMemoryCache.keys.project(projectId))
      projectCache.delete(`project:${projectId}`)
    },
  },

  /**
   * Static data invalidation
   */
  static: {
    // Invalidate all static cache
    invalidateAll: () => {
      cacheInvalidation.static()
      staticCacheUtils.clear()
    },

    // Invalidate configuration only
    invalidateConfig: () => {
      cacheInvalidation.config()
      // Clear specific config keys from static cache
      staticCacheUtils.clear()
    },
  },

  /**
   * Global cache cleanup
   */
  global: {
    // Clear all caches
    clearAll: () => {
      globalCache.clear()
      userCache.clear()
      projectCache.clear()
      prismaMemoryCache.clear()
      staticCacheUtils.clear()
    },

    // Clear expired entries only
    clearExpired: () => {
      // Memory caches handle expiration automatically
      // This is mainly for manual cleanup if needed
      console.log('[Cache] Expired entries cleared automatically')
    },
  },
}

/**
 * Cache warming strategies
 */
export const cacheWarming = {
  /**
   * Warm up user-specific cache
   */
  user: async (userId: string) => {
    try {
      // Import Prisma client dynamically to avoid circular dependencies
      const { PrismaCacheWrapper } = await import('./prisma')
      const { prisma } = await import('../prisma')

      const cachedPrisma = new PrismaCacheWrapper(prisma)

      // Pre-load user data
      await Promise.all([
        cachedPrisma.user.findUnique(userId),
        cachedPrisma.project.findMany(userId),
        cachedPrisma.project.count(userId),
      ])

      console.log(`[Cache] User cache warmed up for user: ${userId}`)
    } catch (error) {
      console.error('[Cache] Failed to warm up user cache:', error)
    }
  },

  /**
   * Warm up project-specific cache
   */
  project: async (projectId: string) => {
    try {
      const { PrismaCacheWrapper } = await import('./prisma')
      const { prisma } = await import('../prisma')

      const cachedPrisma = new PrismaCacheWrapper(prisma)

      // Pre-load project data
      await Promise.all([cachedPrisma.project.findUnique(projectId)])

      console.log(`[Cache] Project cache warmed up for project: ${projectId}`)
    } catch (error) {
      console.error('[Cache] Failed to warm up project cache:', error)
    }
  },

  /**
   * Warm up static cache
   */
  static: async () => {
    await staticCacheUtils.warmUp()
  },

  /**
   * Warm up all commonly used cache
   */
  all: async (userId?: string) => {
    try {
      await Promise.all([
        cacheWarming.static(),
        userId ? cacheWarming.user(userId) : Promise.resolve(),
      ])

      console.log('[Cache] All cache warmed up successfully')
    } catch (error) {
      console.error('[Cache] Failed to warm up cache:', error)
    }
  },
}

/**
 * Cache health monitoring
 */
export const cacheHealth = {
  /**
   * Get cache statistics
   */
  getStats: () => {
    const { PerformanceMonitor } = require('../performance')
    const monitor = PerformanceMonitor.getInstance()

    return {
      memory: {
        global: {
          size: globalCache.size(),
          keys: globalCache.keys().length,
        },
        user: {
          size: userCache.size(),
          keys: userCache.keys().length,
        },
        project: {
          size: projectCache.size(),
          keys: projectCache.keys().length,
        },
      },
      static: staticCacheUtils.stats(),
      performance: monitor.getOverallCacheStats(),
      cacheMetrics: monitor.getCacheMetrics(),
    }
  },

  /**
   * Check cache health
   */
  checkHealth: () => {
    const stats = cacheHealth.getStats()
    const { performance } = stats

    const health = {
      status: 'healthy' as 'healthy' | 'warning' | 'critical',
      issues: [] as string[],
      recommendations: [] as string[],
    }

    // Check hit rate
    if (performance.hitRate < 0.5) {
      health.status = 'warning'
      health.issues.push('Low cache hit rate')
      health.recommendations.push(
        'Consider warming up cache or adjusting TTL values'
      )
    }

    // Check cache size
    if (performance.totalSize > 1000) {
      health.status = 'warning'
      health.issues.push('Large cache size')
      health.recommendations.push(
        'Consider implementing cache size limits or cleanup strategies'
      )
    }

    return { ...health, stats }
  },

  /**
   * Log cache health report
   */
  logHealthReport: () => {
    if (process.env.NODE_ENV === 'development') {
      const health = cacheHealth.checkHealth()
      console.group('[Cache Health Report]')
      console.log('Status:', health.status)
      console.log('Stats:', health.stats)
      if (health.issues.length > 0) {
        console.log('Issues:', health.issues)
        console.log('Recommendations:', health.recommendations)
      }
      console.groupEnd()
    }
  },
}
