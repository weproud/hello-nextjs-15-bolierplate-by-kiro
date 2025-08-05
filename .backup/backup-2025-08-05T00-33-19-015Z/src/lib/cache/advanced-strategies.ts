/**
 * Advanced caching strategies and utilities
 */

import { globalCache, userCache, projectCache } from './memory'
import { cacheInvalidation, CACHE_TAGS } from './nextjs'
import { prismaMemoryCache } from './prisma'

/**
 * Cache preloading strategies for better performance
 */
export const cachePreloading = {
  /**
   * Preload user dashboard data
   */
  userDashboard: async (userId: string) => {
    try {
      const { PrismaCacheWrapper } = await import('./prisma')
      const { prisma } = await import('../prisma')

      const cachedPrisma = new PrismaCacheWrapper(prisma)

      // Preload all dashboard-related data in parallel
      const [user, projects, projectCount] = await Promise.all([
        cachedPrisma.user.findUnique(userId),
        cachedPrisma.project.findMany(userId),
        cachedPrisma.project.count(userId),
      ])

      // Cache additional computed data
      if (projects) {
        // Note: status field doesn't exist in current schema, using placeholder logic
        const activeProjects = projects.slice(0, Math.ceil(projects.length / 2))
        const completedProjects = projects.slice(Math.ceil(projects.length / 2))

        userCache.set(`user:${userId}:active-projects`, activeProjects, 300000)
        userCache.set(
          `user:${userId}:completed-projects`,
          completedProjects,
          300000
        )
        userCache.set(
          `user:${userId}:project-stats`,
          {
            total: projectCount,
            active: activeProjects.length,
            completed: completedProjects.length,
          },
          300000
        )
      }

      console.log(`[Cache] User dashboard preloaded for: ${userId}`)
      return { user, projects, projectCount }
    } catch (error) {
      console.error('[Cache] Failed to preload user dashboard:', error)
      return null
    }
  },

  projectDetails: async (projectId: string) => {
    try {
      const { PrismaCacheWrapper } = await import('./prisma')
      const { prisma } = await import('../prisma')

      const cachedPrisma = new PrismaCacheWrapper(prisma)

      const [project] = await Promise.all([
        cachedPrisma.project.findUnique(projectId),
      ])

      console.log(`[Cache] Project details preloaded for: ${projectId}`)
      return { project }
    } catch (error) {
      console.error('[Cache] Failed to preload project details:', error)
      return null
    }
  },

  /**
   * Preload route-specific data
   */
  route: async (route: string, userId?: string) => {
    const routeStrategies: Record<string, () => Promise<any>> = {
      '/dashboard': () =>
        userId ? cachePreloading.userDashboard(userId) : Promise.resolve(null),
      '/projects': () =>
        userId ? cachePreloading.userDashboard(userId) : Promise.resolve(null),
    }

    const strategy = routeStrategies[route]
    if (strategy) {
      const data = await strategy()
      if (data) {
        globalCache.set(`route:${route}:${userId || 'anonymous'}`, data, 300000)
      }
      return data
    }

    return null
  },
}

/**
 * Smart cache invalidation with dependency tracking
 */
export const smartInvalidation = {
  /**
   * Invalidate with dependency cascade
   */
  cascadeInvalidation: (
    entityType: string,
    entityId: string,
    userId?: string
  ) => {
    const dependencies: Record<string, string[]> = {
      user: ['user:profile', 'user:projects', 'user:stats'],
      project: ['project:details', 'project:progress', 'user:projects'],
    }

    const entityDeps = dependencies[entityType] || []

    entityDeps.forEach(dep => {
      const cacheKey = dep.includes(':')
        ? `${dep}:${entityId}`
        : `${entityType}:${entityId}:${dep.split(':')[1]}`

      globalCache.delete(cacheKey)
      userCache.delete(cacheKey)
      projectCache.delete(cacheKey)
    })

    // Invalidate Next.js cache tags
    cacheInvalidation.byTag(`${entityType}:${entityId}`)
    if (userId) {
      cacheInvalidation.byTag(`user:${userId}`)
    }

    console.log(
      `[Cache] Cascade invalidation completed for ${entityType}:${entityId}`
    )
  },

  /**
   * Batch invalidation for multiple entities
   */
  batchInvalidation: (
    entities: Array<{ type: string; id: string; userId?: string }>
  ) => {
    const uniqueTags = new Set<string>()

    entities.forEach(({ type, id, userId }) => {
      uniqueTags.add(`${type}:${id}`)
      if (userId) {
        uniqueTags.add(`user:${userId}`)
      }

      // Clear memory caches
      smartInvalidation.cascadeInvalidation(type, id, userId)
    })

    // Batch invalidate Next.js cache tags
    uniqueTags.forEach(tag => cacheInvalidation.byTag(tag))

    console.log(
      `[Cache] Batch invalidation completed for ${entities.length} entities`
    )
  },
}

/**
 * Cache compression utilities for large objects
 */
export const cacheCompression = {
  /**
   * Compress data before caching (simple JSON stringification for now)
   */
  compress: (data: unknown): string => {
    try {
      return JSON.stringify(data)
    } catch (error) {
      console.error('[Cache] Compression failed:', error)
      return JSON.stringify({ error: 'Compression failed' })
    }
  },

  /**
   * Decompress cached data
   */
  decompress: <T>(compressedData: string): T | null => {
    try {
      return JSON.parse(compressedData) as T
    } catch (error) {
      console.error('[Cache] Decompression failed:', error)
      return null
    }
  },

  /**
   * Check if data should be compressed based on size
   */
  shouldCompress: (data: unknown, threshold = 10000): boolean => {
    try {
      const size = JSON.stringify(data).length
      return size > threshold
    } catch {
      return false
    }
  },
}

/**
 * Cache analytics and monitoring
 */
export const cacheAnalytics = {
  /**
   * Track cache performance metrics
   */
  trackMetrics: () => {
    const metrics = {
      global: globalCache.getStats(),
      user: userCache.getStats(),
      project: projectCache.getStats(),
      timestamp: Date.now(),
    }

    // Store metrics for analysis
    globalCache.set('cache:metrics:latest', metrics, 3600000) // 1 hour

    return metrics
  },

  /**
   * Get cache hit rate analysis
   */
  getHitRateAnalysis: () => {
    try {
      const { PerformanceMonitor } = require('../performance')
      const monitor = PerformanceMonitor.getInstance()

      return {
        overall: monitor.getOverallCacheStats(),
        byCache: monitor.getCacheMetrics(),
        recommendations: cacheAnalytics.generateRecommendations(
          monitor.getOverallCacheStats()
        ),
      }
    } catch (error) {
      console.error('[Cache] Failed to get hit rate analysis:', error)
      return null
    }
  },

  /**
   * Generate cache optimization recommendations
   */
  generateRecommendations: (stats: {
    hitRate: number
    totalSize: number
    missCount: number
    hitCount: number
  }) => {
    const recommendations: string[] = []

    if (stats.hitRate < 0.6) {
      recommendations.push('Consider increasing cache TTL values')
      recommendations.push(
        'Implement cache warming for frequently accessed data'
      )
    }

    if (stats.totalSize > 1000) {
      recommendations.push('Consider implementing cache size limits')
      recommendations.push('Enable automatic cleanup of expired entries')
    }

    if (stats.missCount > stats.hitCount) {
      recommendations.push('Review caching strategy for better coverage')
      recommendations.push('Consider preloading critical data')
    }

    return recommendations
  },
}

/**
 * Distributed cache preparation utilities
 */
export const distributedCachePrep = {
  /**
   * Serialize cache data for external storage
   */
  serialize: (data: unknown) => {
    return {
      data: cacheCompression.compress(data),
      timestamp: Date.now(),
      version: '1.0',
    }
  },

  /**
   * Deserialize cache data from external storage
   */
  deserialize: <T>(
    serializedData: {
      data?: string
      timestamp?: number
      version?: string
    } | null
  ): T | null => {
    try {
      if (!serializedData || !serializedData.data) {
        return null
      }

      return cacheCompression.decompress<T>(serializedData.data)
    } catch (error) {
      console.error('[Cache] Deserialization failed:', error)
      return null
    }
  },

  /**
   * Generate cache keys for distributed storage
   */
  generateDistributedKey: (namespace: string, key: string) => {
    return `cache:${namespace}:${key}`
  },
}

/**
 * Cache warming scheduler
 */
export const cacheWarmingScheduler = {
  /**
   * Schedule cache warming for active users
   */
  scheduleUserWarming: (userIds: string[], intervalMs = 1800000) => {
    // 30 minutes
    const warmingInterval = setInterval(async () => {
      console.log('[Cache] Starting scheduled user cache warming...')

      for (const userId of userIds) {
        try {
          await cachePreloading.userDashboard(userId)
          // Small delay between users to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          console.error(
            `[Cache] Failed to warm cache for user ${userId}:`,
            error
          )
        }
      }

      console.log('[Cache] Scheduled user cache warming completed')
    }, intervalMs)

    return warmingInterval
  },

  /**
   * Schedule cache cleanup
   */
  scheduleCleanup: (intervalMs = 600000) => {
    // 10 minutes
    const cleanupInterval = setInterval(() => {
      console.log('[Cache] Starting scheduled cache cleanup...')

      const globalCleaned = globalCache.cleanup()
      const userCleaned = userCache.cleanup()
      const projectCleaned = projectCache.cleanup()

      console.log(
        `[Cache] Cleanup completed: ${globalCleaned + userCleaned + projectCleaned} entries removed`
      )
    }, intervalMs)

    return cleanupInterval
  },
}
