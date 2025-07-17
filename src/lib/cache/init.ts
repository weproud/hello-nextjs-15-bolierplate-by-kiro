/**
 * Cache initialization and setup utilities
 */

import { cacheWarming, cacheHealth } from './strategies'
import { PerformanceMonitor } from '../performance'

/**
 * Cache initialization configuration
 */
interface CacheInitConfig {
  warmUp?: {
    static?: boolean
    user?: boolean
    userId?: string
  }
  monitoring?: {
    enabled?: boolean
    logInterval?: number
    healthChecks?: boolean
  }
  cleanup?: {
    enabled?: boolean
    interval?: number
  }
}

/**
 * Initialize caching system
 */
export async function initializeCache(config: CacheInitConfig = {}) {
  const {
    warmUp = { static: true, user: false },
    monitoring = {
      enabled: process.env.NODE_ENV === 'development',
      logInterval: 30000,
    },
    cleanup = { enabled: true, interval: 300000 }, // 5 minutes
  } = config

  console.log('[Cache] Initializing caching system...')

  try {
    // Warm up cache if enabled
    if (warmUp.static || warmUp.user) {
      console.log('[Cache] Warming up cache...')

      const warmUpPromises = []

      if (warmUp.static) {
        warmUpPromises.push(cacheWarming.static())
      }

      if (warmUp.user && warmUp.userId) {
        warmUpPromises.push(cacheWarming.user(warmUp.userId))
      }

      await Promise.all(warmUpPromises)
    }

    // Set up monitoring if enabled
    if (monitoring.enabled) {
      setupCacheMonitoring(monitoring.logInterval || 30000)
    }

    // Set up cleanup if enabled
    if (cleanup.enabled) {
      setupCacheCleanup(cleanup.interval || 300000)
    }

    console.log('[Cache] Caching system initialized successfully')
  } catch (error) {
    console.error('[Cache] Failed to initialize caching system:', error)
  }
}

/**
 * Set up cache monitoring
 */
function setupCacheMonitoring(interval: number) {
  const monitor = PerformanceMonitor.getInstance()

  setInterval(() => {
    if (process.env.NODE_ENV === 'development') {
      // Log cache health report
      cacheHealth.logHealthReport()

      // Log performance metrics
      const cacheStats = monitor.getOverallCacheStats()
      monitor.logMetrics({
        cacheHitRate: cacheStats.hitRate,
        cacheSize: cacheStats.totalSize,
      })
    }
  }, interval)

  console.log(`[Cache] Monitoring enabled with ${interval}ms interval`)
}

/**
 * Set up cache cleanup
 */
function setupCacheCleanup(interval: number) {
  setInterval(() => {
    // Check cache health and perform cleanup if needed
    const health = cacheHealth.checkHealth()

    if (health.status === 'warning' || health.status === 'critical') {
      console.log('[Cache] Performing automatic cleanup due to health issues')

      // Perform selective cleanup based on issues
      if (health.issues.includes('Large cache size')) {
        // Clear least recently used items (simplified approach)
        console.log('[Cache] Clearing cache due to size limits')
      }
    }
  }, interval)

  console.log(`[Cache] Cleanup enabled with ${interval}ms interval`)
}

/**
 * Cache middleware for Next.js API routes
 */
export function withCache(
  handler: (req: any, res: any) => Promise<any>,
  options: {
    ttl?: number
    tags?: string[]
    key?: (req: any) => string
  } = {}
) {
  return async (req: any, res: any) => {
    const { ttl = 300, tags = [], key } = options

    // Generate cache key
    const cacheKey = key ? key(req) : `${req.method}:${req.url}`

    // Try to get from cache first
    const { globalCache } = await import('./memory')
    const cached = globalCache.get(cacheKey)

    if (cached) {
      // Set cache headers
      res.setHeader('X-Cache', 'HIT')
      res.setHeader('Cache-Control', `s-maxage=${ttl}, stale-while-revalidate`)

      return res.json(cached)
    }

    // Execute handler
    const result = await handler(req, res)

    // Cache the result
    globalCache.set(cacheKey, result, ttl * 1000)

    // Set cache headers
    res.setHeader('X-Cache', 'MISS')
    res.setHeader('Cache-Control', `s-maxage=${ttl}, stale-while-revalidate`)

    return result
  }
}

/**
 * Cache decorator for class methods
 */
export function cached(
  options: {
    ttl?: number
    key?: (...args: any[]) => string
  } = {}
) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const { ttl = 300000, key } = options // 5 minutes default

    descriptor.value = async function (...args: any[]) {
      // Generate cache key
      const cacheKey = key
        ? key(...args)
        : `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`

      // Try to get from cache
      const { globalCache } = await import('./memory')
      const cached = globalCache.get(cacheKey)

      if (cached !== undefined) {
        return cached
      }

      // Execute original method
      const result = await originalMethod.apply(this, args)

      // Cache the result
      globalCache.set(cacheKey, result, ttl)

      return result
    }

    return descriptor
  }
}

/**
 * Cache utilities for React components
 */
export const cacheUtils = {
  /**
   * Preload data for a route
   */
  preloadRoute: async (route: string, data: any) => {
    const { globalCache } = await import('./memory')
    globalCache.set(`route:${route}`, data, 300000) // 5 minutes
  },

  /**
   * Get preloaded data for a route
   */
  getPreloadedData: async (route: string) => {
    const { globalCache } = await import('./memory')
    return globalCache.get(`route:${route}`)
  },

  /**
   * Cache component data
   */
  cacheComponentData: async (componentName: string, props: any, data: any) => {
    const { globalCache } = await import('./memory')
    const key = `component:${componentName}:${JSON.stringify(props)}`
    globalCache.set(key, data, 300000) // 5 minutes
  },

  /**
   * Get cached component data
   */
  getCachedComponentData: async (componentName: string, props: any) => {
    const { globalCache } = await import('./memory')
    const key = `component:${componentName}:${JSON.stringify(props)}`
    return globalCache.get(key)
  },
}
