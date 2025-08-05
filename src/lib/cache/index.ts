/**
 * Cache utilities and strategies index
 */

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'

// Memory cache
export * from '@/lib/cache/memory'

// Next.js caching
export * from '@/lib/cache/nextjs'

// Prisma query caching
export * from '@/lib/cache/prisma'

// Static data caching
export * from '@/lib/cache/static'

// Cache strategies and management
export * from '@/lib/cache/strategies'

// Advanced cache strategies
export * from '@/lib/cache/advanced-strategies'

// Cache initialization
export * from '@/lib/cache/init'

// Cache examples and patterns
export * from '@/lib/cache/examples'

// Cache validation and testing
export * from '@/lib/cache/validate'

// Re-export commonly used utilities
export {
  globalCache,
  MemoryCache,
  projectCache,
  userCache,
} from '@/lib/cache/memory'

export {
  apiCache,
  CACHE_DURATION,
  CACHE_TAGS,
  cacheInvalidation,
  pageCache,
  routeConfig,
} from '@/lib/cache/nextjs'

export {
  PrismaCacheWrapper,
  prismaMemoryCache,
  withPrismaCache,
} from '@/lib/cache/prisma'

export {
  configCache,
  constantsCache,
  featureFlagsCache,
  staticCacheUtils,
} from '@/lib/cache/static'

export {
  cacheConfig,
  cacheKeys,
  invalidationPatterns,
  routeCacheConfig,
  setupCache,
} from '@/lib/cache/config'

export {
  cacheHealth,
  cacheStrategies,
  cacheWarming,
} from '@/lib/cache/strategies'

export {
  cacheAnalytics,
  cacheCompression,
  cachePreloading,
  cacheWarmingScheduler,
  distributedCachePrep,
  smartInvalidation,
} from '@/lib/cache/advanced-strategies'

export {
  cached,
  cacheUtils as initCacheUtils,
  initializeCache,
  withCache,
} from '@/lib/cache/init'

// Cache configuration
export const CACHE_CONFIG = {
  // Default cache duration (in seconds)
  DEFAULT_DURATION: 60 * 5, // 5 minutes

  // Cache durations for different data types
  DURATIONS: {
    STATIC: 60 * 60 * 24, // 24 hours
    USER_DATA: 60 * 15, // 15 minutes
    PROJECT_DATA: 60 * 10, // 10 minutes
    STATS: 60 * 5, // 5 minutes
    SEARCH: 60 * 2, // 2 minutes
  },

  // Cache tags for organized invalidation
  TAGS: {
    USER: 'user',
    PROJECTS: 'projects',
    PROJECT: (id: string) => `project-${id}`,
    STATS: 'stats',
    SEARCH: 'search',
  },
} as const

/**
 * Create a cached function with automatic tag management
 */
export function createCachedFunction<T extends readonly unknown[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    tags?: readonly string[]
    revalidate?: number
    keyParts?: (...args: T) => readonly string[]
  } = {}
): (...args: T) => Promise<R> {
  const {
    tags = [],
    revalidate = CACHE_CONFIG.DEFAULT_DURATION,
    keyParts,
  } = options

  return unstable_cache(fn, keyParts ? undefined : [fn.name], {
    tags: [...tags],
    revalidate,
  })
}

/**
 * Cache utilities for common operations
 */
export const cacheUtils = {
  /**
   * Invalidate cache by tags
   */
  invalidateTags(tags: string | readonly string[]): void {
    const tagArray = Array.isArray(tags) ? tags : [tags]
    tagArray.forEach(tag => revalidateTag(tag))
  },

  /**
   * Invalidate cache by paths
   */
  invalidatePaths(paths: string | readonly string[]): void {
    const pathArray = Array.isArray(paths) ? paths : [paths]
    pathArray.forEach(path => revalidatePath(path))
  },

  /**
   * Invalidate user-related cache
   */
  invalidateUser(userId?: string): void {
    const tags = [CACHE_CONFIG.TAGS.USER]
    if (userId) {
      tags.push(`${CACHE_CONFIG.TAGS.USER}-${userId}`)
    }
    this.invalidateTags(tags)
  },

  /**
   * Invalidate project-related cache
   */
  invalidateProjects(projectId?: string): void {
    const tags = [CACHE_CONFIG.TAGS.PROJECTS]
    if (projectId) {
      tags.push(CACHE_CONFIG.TAGS.PROJECT(projectId))
    }
    this.invalidateTags(tags)
    this.invalidatePaths(['/projects', '/dashboard'])
  },

  /**
   * Invalidate statistics cache
   */
  invalidateStats(): void {
    this.invalidateTags(CACHE_CONFIG.TAGS.STATS)
    this.invalidatePaths('/dashboard')
  },

  /**
   * Generate cache key from parameters
   */
  generateKey(prefix: string, params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${String(params[key])}`)
      .join('|')
    return `${prefix}:${sortedParams}`
  },
}

/**
 * Cached data fetchers
 */
export const cachedFetchers = {
  /**
   * Cached user profile fetch
   */
  getUserProfile: createCachedFunction(
    async (userId: string) => {
      // This would typically fetch from database
      // For now, return a placeholder
      return {
        id: userId,
        name: 'Cached User',
        email: 'user@example.com',
      }
    },
    {
      tags: [CACHE_CONFIG.TAGS.USER],
      revalidate: CACHE_CONFIG.DURATIONS.USER_DATA,
    }
  ),

  /**
   * Cached project list fetch
   */
  getProjects: createCachedFunction(
    async (userId: string, options: { page?: number; limit?: number } = {}) => {
      // This would typically fetch from database
      // For now, return a placeholder
      return {
        projects: [],
        pagination: {
          page: options.page || 1,
          limit: options.limit || 10,
          totalCount: 0,
          totalPages: 0,
        },
      }
    },
    {
      tags: [CACHE_CONFIG.TAGS.PROJECTS],
      revalidate: CACHE_CONFIG.DURATIONS.PROJECT_DATA,
    }
  ),

  /**
   * Cached project stats fetch
   */
  getProjectStats: createCachedFunction(
    async (userId: string) => {
      // This would typically fetch from database
      // For now, return a placeholder
      return {
        totalProjects: 0,
        projectsThisMonth: 0,
        monthlyGrowth: 0,
      }
    },
    {
      tags: [CACHE_CONFIG.TAGS.STATS],
      revalidate: CACHE_CONFIG.DURATIONS.STATS,
    }
  ),
}

// Export memory cache instance from memory module
export { memoryCache } from '@/lib/cache/memory'

/**
 * Local storage cache utilities
 */
export const localStorageCache = {
  set(key: string, data: unknown, ttl?: number) {
    if (typeof window === 'undefined') return

    const item = {
      data,
      expires: ttl ? Date.now() + ttl : null,
    }

    try {
      localStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to set localStorage cache:', error)
    }
  },

  get<T = any>(key: string): T | null {
    if (typeof window === 'undefined') return null

    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      const parsed = JSON.parse(item)

      if (parsed.expires && Date.now() > parsed.expires) {
        localStorage.removeItem(key)
        return null
      }

      return parsed.data
    } catch (error) {
      console.warn('Failed to get localStorage cache:', error)
      return null
    }
  },

  delete(key: string) {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  },

  clear() {
    if (typeof window === 'undefined') return
    localStorage.clear()
  },

  has(key: string): boolean {
    return this.get(key) !== null
  },
}
