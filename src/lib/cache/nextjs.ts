/**
 * Next.js caching utilities and configurations
 */

import { unstable_cache } from 'next/cache'
import { revalidateTag, revalidatePath } from 'next/cache'

// Cache tags for organized invalidation
export const CACHE_TAGS = {
  USER: 'user',
  PROJECT: 'project',
  PHASE: 'phase',
  MISSION: 'mission',
  STATIC: 'static',
  CONFIG: 'config',
} as const

// Cache durations in seconds
export const CACHE_DURATION = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  STATIC: 86400, // 24 hours
} as const

/**
 * Create a cached function with Next.js unstable_cache
 */
export function createCachedFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyParts: string[],
  options: {
    tags?: string[]
    revalidate?: number
  } = {}
) {
  return unstable_cache(fn, keyParts, {
    tags: options.tags || [],
    revalidate: options.revalidate || CACHE_DURATION.MEDIUM,
  })
}

/**
 * Cache invalidation utilities
 */
export const cacheInvalidation = {
  // Invalidate by tag
  byTag: (tag: string) => {
    revalidateTag(tag)
  },

  // Invalidate by path
  byPath: (path: string) => {
    revalidatePath(path)
  },

  // Invalidate user-related data
  user: (userId: string) => {
    revalidateTag(`${CACHE_TAGS.USER}:${userId}`)
    revalidateTag(CACHE_TAGS.USER)
  },

  // Invalidate project-related data
  project: (projectId: string) => {
    revalidateTag(`${CACHE_TAGS.PROJECT}:${projectId}`)
    revalidateTag(CACHE_TAGS.PROJECT)
  },

  // Invalidate all user projects
  userProjects: (userId: string) => {
    revalidateTag(`${CACHE_TAGS.USER}:${userId}:projects`)
    revalidateTag(CACHE_TAGS.PROJECT)
  },

  // Invalidate static data
  static: () => {
    revalidateTag(CACHE_TAGS.STATIC)
  },

  // Invalidate configuration
  config: () => {
    revalidateTag(CACHE_TAGS.CONFIG)
  },
}

/**
 * Route segment config helpers
 */
export const routeConfig = {
  // Static generation with revalidation
  staticWithRevalidation: (revalidate: number) => ({
    revalidate,
  }),

  // Dynamic with caching
  dynamicWithCache: (revalidate: number) => ({
    dynamic: 'force-dynamic' as const,
    revalidate,
  }),

  // Force static
  forceStatic: {
    dynamic: 'force-static' as const,
  },

  // No cache
  noCache: {
    dynamic: 'force-dynamic' as const,
    revalidate: 0,
  },
}

/**
 * Page-level caching configurations
 */
export const pageCache = {
  // Home page - static with daily revalidation
  home: {
    revalidate: CACHE_DURATION.STATIC,
  },

  // Dashboard - dynamic with short cache
  dashboard: {
    revalidate: CACHE_DURATION.SHORT,
  },

  // Workspace - dynamic with short cache
  workspace: {
    revalidate: CACHE_DURATION.SHORT,
  },

  // Project pages - medium cache
  project: {
    revalidate: CACHE_DURATION.MEDIUM,
  },

  // Static pages - long cache
  static: {
    revalidate: CACHE_DURATION.STATIC,
  },
}

/**
 * API route caching headers
 */
export const apiCache = {
  // Short cache for dynamic data
  short: {
    'Cache-Control': `s-maxage=${CACHE_DURATION.SHORT}, stale-while-revalidate`,
  },

  // Medium cache for semi-static data
  medium: {
    'Cache-Control': `s-maxage=${CACHE_DURATION.MEDIUM}, stale-while-revalidate`,
  },

  // Long cache for static data
  long: {
    'Cache-Control': `s-maxage=${CACHE_DURATION.LONG}, stale-while-revalidate`,
  },

  // No cache for sensitive data
  noCache: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  },
}
