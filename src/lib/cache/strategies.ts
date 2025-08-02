import { unstable_cache } from 'next/cache'
import { cache } from 'react'

/**
 * Caching Strategies
 *
 * Next.js 15의 캐싱 기능을 활용한 다양한 캐싱 전략 구현
 */

// Cache tags for invalidation
export const CACHE_TAGS = {
  USERS: 'users',
  POSTS: 'posts',
  PROJECTS: 'projects',
  SESSIONS: 'sessions',
  ANALYTICS: 'analytics',
} as const

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const

// Generic cache wrapper with type safety
export function createCachedFunction<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  keyPrefix: string,
  options: {
    revalidate?: number
    tags?: string[]
  } = {}
) {
  return unstable_cache(fn, [keyPrefix], {
    revalidate: options.revalidate || CACHE_DURATIONS.MEDIUM,
    tags: options.tags || [],
  })
}

// Request-level caching (React cache)
export function createRequestCache<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>
) {
  return cache(fn)
}

// User-related caching
export const userCache = {
  // Get user by ID with caching
  getById: createCachedFunction(
    async (id: string) => {
      const { userRepository } = await import('@/lib/repositories')
      return userRepository.findById(id, {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    },
    'user-by-id',
    {
      revalidate: CACHE_DURATIONS.LONG,
      tags: [CACHE_TAGS.USERS],
    }
  ),

  // Get user with projects
  getWithProjects: createCachedFunction(
    async (id: string) => {
      const { userRepository } = await import('@/lib/repositories')
      return userRepository.findById(id, {
        projects: {
          orderBy: { updatedAt: 'desc' },
          take: 10,
        },
      })
    },
    'user-with-projects',
    {
      revalidate: CACHE_DURATIONS.MEDIUM,
      tags: [CACHE_TAGS.USERS, CACHE_TAGS.PROJECTS],
    }
  ),

  // Get user stats
  getStats: createCachedFunction(
    async (id: string) => {
      const { projectRepository, postRepository, userRepository } =
        await import('@/lib/repositories')
      const [projectCount, postCount, user] = await Promise.all([
        projectRepository.count({ userId: id }),
        postRepository.count({ authorId: id }),
        userRepository.findById(id, {
          select: { createdAt: true },
        }),
      ])

      return {
        projectCount,
        postCount,
        joinedAt: user?.createdAt,
      }
    },
    'user-stats',
    {
      revalidate: CACHE_DURATIONS.LONG,
      tags: [CACHE_TAGS.USERS, CACHE_TAGS.PROJECTS],
    }
  ),
}

// Project-related caching
export const projectCache = {
  // Get projects with pagination
  getMany: createCachedFunction(
    async (
      options: {
        page?: number
        limit?: number
        userId?: string
        search?: string
      } = {}
    ) => {
      const { projectRepository } = await import('@/lib/repositories')
      const { page = 1, limit = 10, userId, search } = options

      const where: any = {}
      if (userId) where.userId = userId
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      const result = await projectRepository.findManyPaginated({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        page,
        limit,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      })

      return {
        projects: result.data,
        pagination: {
          page: result.pagination.page,
          limit: result.pagination.limit,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        },
      }
    },
    'projects-list',
    {
      revalidate: CACHE_DURATIONS.SHORT,
      tags: [CACHE_TAGS.PROJECTS],
    }
  ),

  // Get project by ID
  getById: createCachedFunction(
    async (id: string) => {
      const { projectRepository } = await import('@/lib/repositories')
      return projectRepository.findById(id, {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      })
    },
    'project-by-id',
    {
      revalidate: CACHE_DURATIONS.MEDIUM,
      tags: [CACHE_TAGS.PROJECTS],
    }
  ),

  // Get recent projects
  getRecent: createCachedFunction(
    async (limit = 5) => {
      const { projectRepository } = await import('@/lib/repositories')
      return projectRepository.findRecent(limit, {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })
    },
    'recent-projects',
    {
      revalidate: CACHE_DURATIONS.MEDIUM,
      tags: [CACHE_TAGS.PROJECTS],
    }
  ),
}

// Analytics caching (longer duration for expensive queries)
export const analyticsCache = {
  // Get dashboard stats
  getDashboardStats: createCachedFunction(
    async () => {
      const { prisma } = await import('@/lib/prisma')

      const { userRepository, projectRepository } = await import(
        '@/lib/repositories'
      )
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      const [totalUsers, totalProjects, recentUsers, recentProjects] =
        await Promise.all([
          userRepository.count(),
          projectRepository.count(),
          userRepository.count({
            createdAt: {
              gte: thirtyDaysAgo,
            },
          }),
          projectRepository.count({
            createdAt: {
              gte: thirtyDaysAgo,
            },
          }),
        ])

      return {
        totalUsers,
        totalProjects,
        recentUsers,
        recentProjects,
        growth: {
          users: recentUsers,
          projects: recentProjects,
        },
      }
    },
    'dashboard-stats',
    {
      revalidate: CACHE_DURATIONS.LONG,
      tags: [CACHE_TAGS.ANALYTICS, CACHE_TAGS.USERS, CACHE_TAGS.PROJECTS],
    }
  ),

  // Get activity data for charts
  getActivityData: createCachedFunction(
    async (days = 30) => {
      const { prisma } = await import('@/lib/prisma')
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      const projects = await prisma.project.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
        },
      })

      // Group by day
      const activityMap = new Map<string, number>()
      projects.forEach(project => {
        const day = project.createdAt.toISOString().split('T')[0]
        activityMap.set(day, (activityMap.get(day) || 0) + 1)
      })

      return Array.from(activityMap.entries()).map(([day, count]) => ({
        day,
        projects: count,
      }))
    },
    'activity-data',
    {
      revalidate: CACHE_DURATIONS.VERY_LONG,
      tags: [CACHE_TAGS.ANALYTICS, CACHE_TAGS.PROJECTS],
    }
  ),
}

// Cache invalidation utilities
export const cacheInvalidation = {
  // Invalidate by tag
  invalidateTag: async (tag: string) => {
    const { revalidateTag } = await import('next/cache')
    revalidateTag(tag)
  },

  // Invalidate multiple tags
  invalidateTags: async (tags: string[]) => {
    const { revalidateTag } = await import('next/cache')
    tags.forEach(tag => revalidateTag(tag))
  },

  // Invalidate user-related caches
  invalidateUser: async (userId?: string) => {
    await cacheInvalidation.invalidateTag(CACHE_TAGS.USERS)
    if (userId) {
      await cacheInvalidation.invalidateTag(`user-${userId}`)
    }
  },

  // Invalidate project-related caches
  invalidateProjects: async (userId?: string) => {
    await cacheInvalidation.invalidateTags([
      CACHE_TAGS.PROJECTS,
      CACHE_TAGS.ANALYTICS,
    ])
    if (userId) {
      await cacheInvalidation.invalidateTag(`user-projects-${userId}`)
    }
  },

  // Invalidate all analytics
  invalidateAnalytics: async () => {
    await cacheInvalidation.invalidateTag(CACHE_TAGS.ANALYTICS)
  },
}

// Request-level caching for expensive operations
export const requestCache = {
  // Cache user session for the request duration
  getCurrentUser: createRequestCache(async () => {
    const { auth } = await import('@/lib/auth')
    const session = await auth()
    return session?.user || null
  }),

  // Cache user permissions for the request duration
  getUserPermissions: createRequestCache(async (userId: string) => {
    // This would be replaced with actual permission logic
    return {
      canCreateProject: true,
      canEditProject: true,
      canDeleteProject: true,
      isAdmin: false,
    }
  }),
}

// Memory cache for frequently accessed data
class MemoryCache<T> {
  private cache = new Map<string, { data: T; expires: number }>()
  private defaultTTL: number

  constructor(defaultTTL = 5 * 60 * 1000) {
    // 5 minutes default
    this.defaultTTL = defaultTTL
  }

  set(key: string, data: T, ttl = this.defaultTTL): void {
    const expires = Date.now() + ttl
    this.cache.set(key, { data, expires })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key)
      }
    }
  }
}

// Global memory cache instances
export const memoryCache = {
  users: new MemoryCache<any>(10 * 60 * 1000), // 10 minutes
  projects: new MemoryCache<any>(5 * 60 * 1000), // 5 minutes
  sessions: new MemoryCache<any>(15 * 60 * 1000), // 15 minutes
}

// Cleanup memory caches periodically
if (typeof window === 'undefined') {
  setInterval(
    () => {
      Object.values(memoryCache).forEach(cache => cache.cleanup())
    },
    5 * 60 * 1000
  ) // Cleanup every 5 minutes
}
