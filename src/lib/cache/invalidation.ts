import { CACHE_TAGS } from '@/lib/cache/strategies'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Cache Invalidation Utilities
 *
 * 서버 액션과 함께 사용할 수 있는 캐시 무효화 유틸리티들
 */

// Cache invalidation patterns
export const invalidationPatterns = {
  // User operations
  user: {
    created: (userId: string) => [
      CACHE_TAGS.USERS,
      CACHE_TAGS.ANALYTICS,
      `user-${userId}`,
    ],
    updated: (userId: string) => [
      CACHE_TAGS.USERS,
      `user-${userId}`,
      `user-with-projects-${userId}`,
    ],
    deleted: (userId: string) => [
      CACHE_TAGS.USERS,
      CACHE_TAGS.PROJECTS,
      CACHE_TAGS.ANALYTICS,
      `user-${userId}`,
    ],
  },

  // Project operations
  project: {
    created: (userId: string, projectId: string) => [
      CACHE_TAGS.PROJECTS,
      CACHE_TAGS.ANALYTICS,
      `user-with-projects-${userId}`,
      `user-stats-${userId}`,
      'recent-projects',
      'projects-list',
    ],
    updated: (userId: string, projectId: string) => [
      CACHE_TAGS.PROJECTS,
      `project-${projectId}`,
      `user-with-projects-${userId}`,
      'projects-list',
    ],
    deleted: (userId: string, projectId: string) => [
      CACHE_TAGS.PROJECTS,
      CACHE_TAGS.ANALYTICS,
      `project-${projectId}`,
      `user-with-projects-${userId}`,
      `user-stats-${userId}`,
      'recent-projects',
      'projects-list',
    ],
  },

  // Post operations (if applicable)
  post: {
    created: (authorId: string, postId: string) => [
      CACHE_TAGS.POSTS,
      CACHE_TAGS.ANALYTICS,
      `user-stats-${authorId}`,
    ],
    updated: (authorId: string, postId: string) => [
      CACHE_TAGS.POSTS,
      `post-${postId}`,
    ],
    deleted: (authorId: string, postId: string) => [
      CACHE_TAGS.POSTS,
      CACHE_TAGS.ANALYTICS,
      `post-${postId}`,
      `user-stats-${authorId}`,
    ],
  },

  // Analytics operations
  analytics: {
    refresh: () => [CACHE_TAGS.ANALYTICS],
  },
}

// Generic cache invalidation function
export async function invalidateCache(tags: string[], paths?: string[]) {
  try {
    // Invalidate cache tags
    for (const tag of tags) {
      revalidateTag(tag)
    }

    // Invalidate paths if provided
    if (paths) {
      for (const path of paths) {
        revalidatePath(path)
      }
    }

    console.log(
      `✅ Cache invalidated: tags=[${tags.join(', ')}]${paths ? `, paths=[${paths.join(', ')}]` : ''}`
    )
  } catch (error) {
    console.error('❌ Cache invalidation failed:', error)
    throw error
  }
}

// Specific invalidation functions
export const cacheInvalidators = {
  // User-related invalidations
  onUserCreated: async (userId: string) => {
    const tags = invalidationPatterns.user.created(userId)
    const paths = ['/dashboard', '/users']
    await invalidateCache(tags, paths)
  },

  onUserUpdated: async (userId: string) => {
    const tags = invalidationPatterns.user.updated(userId)
    const paths = [`/users/${userId}`, '/dashboard']
    await invalidateCache(tags, paths)
  },

  onUserDeleted: async (userId: string) => {
    const tags = invalidationPatterns.user.deleted(userId)
    const paths = ['/dashboard', '/users']
    await invalidateCache(tags, paths)
  },

  // Project-related invalidations
  onProjectCreated: async (userId: string, projectId: string) => {
    const tags = invalidationPatterns.project.created(userId, projectId)
    const paths = ['/dashboard', '/projects', `/users/${userId}`]
    await invalidateCache(tags, paths)
  },

  onProjectUpdated: async (userId: string, projectId: string) => {
    const tags = invalidationPatterns.project.updated(userId, projectId)
    const paths = [`/projects/${projectId}`, '/projects', '/dashboard']
    await invalidateCache(tags, paths)
  },

  onProjectDeleted: async (userId: string, projectId: string) => {
    const tags = invalidationPatterns.project.deleted(userId, projectId)
    const paths = ['/projects', '/dashboard', `/users/${userId}`]
    await invalidateCache(tags, paths)
  },

  // Post-related invalidations
  onPostCreated: async (authorId: string, postId: string) => {
    const tags = invalidationPatterns.post.created(authorId, postId)
    const paths = ['/posts', '/dashboard', `/users/${authorId}`]
    await invalidateCache(tags, paths)
  },

  onPostUpdated: async (authorId: string, postId: string) => {
    const tags = invalidationPatterns.post.updated(authorId, postId)
    const paths = [`/posts/${postId}`, '/posts']
    await invalidateCache(tags, paths)
  },

  onPostDeleted: async (authorId: string, postId: string) => {
    const tags = invalidationPatterns.post.deleted(authorId, postId)
    const paths = ['/posts', '/dashboard', `/users/${authorId}`]
    await invalidateCache(tags, paths)
  },

  // Analytics invalidations
  onAnalyticsRefresh: async () => {
    const tags = invalidationPatterns.analytics.refresh()
    const paths = ['/dashboard', '/analytics']
    await invalidateCache(tags, paths)
  },

  // Bulk invalidations
  onBulkOperation: async (operation: 'users' | 'projects' | 'posts') => {
    const tags = [
      CACHE_TAGS[operation.toUpperCase() as keyof typeof CACHE_TAGS],
      CACHE_TAGS.ANALYTICS,
    ]
    const paths = ['/dashboard', `/${operation}`]
    await invalidateCache(tags, paths)
  },
}

// Cache warming utilities
export const cacheWarming = {
  // Warm up dashboard data
  warmDashboard: async () => {
    try {
      const { analyticsCache, projectCache } = await import('./strategies')

      // Pre-load dashboard stats
      await analyticsCache.getDashboardStats()

      // Pre-load recent projects
      await projectCache.getRecent(10)

      console.log('✅ Dashboard cache warmed')
    } catch (error) {
      console.error('❌ Dashboard cache warming failed:', error)
    }
  },

  // Warm up user data
  warmUserData: async (userId: string) => {
    try {
      const { userCache, projectCache } = await import('./strategies')

      // Pre-load user data
      await Promise.all([
        userCache.getById(userId),
        userCache.getWithProjects(userId),
        userCache.getStats(userId),
        projectCache.getMany({ userId, limit: 20 }),
      ])

      console.log(`✅ User cache warmed for ${userId}`)
    } catch (error) {
      console.error(`❌ User cache warming failed for ${userId}:`, error)
    }
  },

  // Warm up popular content
  warmPopularContent: async () => {
    try {
      const { projectCache } = await import('./strategies')

      // Pre-load recent and popular projects
      await Promise.all([
        projectCache.getRecent(20),
        projectCache.getMany({ limit: 50 }),
      ])

      console.log('✅ Popular content cache warmed')
    } catch (error) {
      console.error('❌ Popular content cache warming failed:', error)
    }
  },
}

// Cache monitoring utilities
export const cacheMonitoring = {
  // Get cache hit/miss statistics
  getStats: () => {
    // This would integrate with your monitoring system
    return {
      hitRate: 0.85, // Example: 85% hit rate
      missRate: 0.15,
      totalRequests: 1000,
      cacheSize: '50MB',
    }
  },

  // Log cache performance
  logPerformance: (operation: string, startTime: number, hit: boolean) => {
    const duration = Date.now() - startTime
    const status = hit ? 'HIT' : 'MISS'

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Cache ${status}: ${operation} (${duration}ms)`)
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // analytics.track('cache_performance', {
      //   operation,
      //   duration,
      //   hit,
      // })
    }
  },
}

// Cache debugging utilities
export const cacheDebugging = {
  // List all active cache tags
  listActiveTags: () => {
    return Object.values(CACHE_TAGS)
  },

  // Clear all caches (development only)
  clearAll: async () => {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Cache clearing is only allowed in development')
    }

    const tags = Object.values(CACHE_TAGS)
    await invalidateCache(tags)

    console.log('🧹 All caches cleared')
  },

  // Test cache invalidation
  testInvalidation: async (tag: string) => {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Cache testing is only allowed in development')
    }

    console.log(`🧪 Testing cache invalidation for tag: ${tag}`)
    await invalidateCache([tag])
    console.log(`✅ Cache invalidation test completed for: ${tag}`)
  },
}
