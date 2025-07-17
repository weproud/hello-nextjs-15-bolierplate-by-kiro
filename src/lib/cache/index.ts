/**
 * Cache utilities and strategies index
 */

// Memory cache
export * from './memory'

// Next.js caching
export * from './nextjs'

// Prisma query caching
export * from './prisma'

// Static data caching
export * from './static'

// Cache strategies and management
export * from './strategies'

// Advanced cache strategies
export * from './advanced-strategies'

// Cache initialization
export * from './init'

// Cache examples and patterns
export * from './examples'

// Cache validation and testing
export * from './validate'

// Re-export commonly used utilities
export {
  MemoryCache,
  globalCache,
  userCache,
  projectCache,
  cacheUtils,
} from './memory'

export {
  CACHE_TAGS,
  CACHE_DURATION,
  createCachedFunction,
  cacheInvalidation,
  routeConfig,
  pageCache,
  apiCache,
} from './nextjs'

export {
  PrismaCacheWrapper,
  prismaMemoryCache,
  withPrismaCache,
} from './prisma'

export {
  configCache,
  constantsCache,
  featureFlagsCache,
  staticCacheUtils,
} from './static'

export {
  cacheConfig,
  setupCache,
  routeCacheConfig,
  cacheKeys,
  invalidationPatterns,
} from './config'

export { cacheStrategies, cacheWarming, cacheHealth } from './strategies'

export {
  cachePreloading,
  smartInvalidation,
  cacheCompression,
  cacheAnalytics,
  distributedCachePrep,
  cacheWarmingScheduler,
} from './advanced-strategies'

export {
  initializeCache,
  withCache,
  cached,
  cacheUtils as initCacheUtils,
} from './init'

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
export function createCachedFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    tags?: string[]
    revalidate?: number
    keyParts?: (...args: T) => string[]
  } = {}
) {
  const {
    tags = [],
    revalidate = CACHE_CONFIG.DEFAULT_DURATION,
    keyParts,
  } = options

  return unstable_cache(fn, keyParts ? undefined : [fn.name], {
    tags,
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
  invalidateTags(tags: string | string[]) {
    const tagArray = Array.isArray(tags) ? tags : [tags]
    tagArray.forEach(tag => revalidateTag(tag))
  },

  /**
   * Invalidate cache by paths
   */
  invalidatePaths(paths: string | string[]) {
    const pathArray = Array.isArray(paths) ? paths : [paths]
    pathArray.forEach(path => revalidatePath(path))
  },

  /**
   * Invalidate user-related cache
   */
  invalidateUser(userId?: string) {
    const tags = [CACHE_CONFIG.TAGS.USER]
    if (userId) {
      tags.push(`${CACHE_CONFIG.TAGS.USER}-${userId}`)
    }
    this.invalidateTags(tags)
  },

  /**
   * Invalidate project-related cache
   */
  invalidateProjects(projectId?: string) {
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
  invalidateStats() {
    this.invalidateTags(CACHE_CONFIG.TAGS.STATS)
    this.invalidatePaths('/dashboard')
  },

  /**
   * Generate cache key from parameters
   */
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
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
        totalPhases: 0,
        averagePhasesPerProject: 0,
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

/**
 * Memory cache for client-side caching
 */
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>()

  set(
    key: string,
    data: any,
    ttl: number = CACHE_CONFIG.DEFAULT_DURATION * 1000
  ) {
    const expires = Date.now() + ttl
    this.cache.set(key, { data, expires })
  }

  get<T = any>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

// Export memory cache instance
export const memoryCache = new MemoryCache()

/**
 * Local storage cache utilities
 */
export const localStorageCache = {
  set(key: string, data: any, ttl?: number) {
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
