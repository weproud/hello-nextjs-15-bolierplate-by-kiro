/**
 * Cache usage examples and patterns
 */

import {
  setupCache,
  cachePreloading,
  smartInvalidation,
  cacheKeys,
  withCache,
  cached,
  PrismaCacheWrapper,
  globalCache,
  userCache,
  projectCache,
} from './index'

/**
 * Example: Setting up cache in Next.js app
 */
export async function initializeAppCache(userId?: string) {
  // Initialize cache system with user-specific warming
  const config = await setupCache(userId)

  console.log('[Cache] Application cache initialized with config:', config)

  // Preload critical data for the user
  if (userId) {
    await cachePreloading.userDashboard(userId)
  }

  return config
}

/**
 * Example: Using cached Prisma queries in a service
 */
export class ProjectService {
  constructor(private cachedPrisma: PrismaCacheWrapper) {}

  @cached({
    ttl: 300000,
    key: (userId: string) => cacheKeys.user.projects(userId),
  })
  async getUserProjects(userId: string) {
    return this.cachedPrisma.project.findMany(userId)
  }

  @cached({
    ttl: 600000,
    key: (projectId: string) => cacheKeys.project.details(projectId),
  })
  async getProjectDetails(projectId: string) {
    return this.cachedPrisma.project.findUnique(projectId)
  }

  async createProject(userId: string, projectData: any) {
    const project = await this.cachedPrisma.raw.project.create({
      data: { ...projectData, userId },
    })

    // Smart invalidation after creation
    smartInvalidation.cascadeInvalidation('project', project.id, userId)

    return project
  }

  async updateProject(projectId: string, userId: string, updateData: any) {
    const project = await this.cachedPrisma.raw.project.update({
      where: { id: projectId },
      data: updateData,
    })

    // Smart invalidation after update
    smartInvalidation.cascadeInvalidation('project', projectId, userId)

    return project
  }
}

/**
 * Example: API route with caching middleware
 */
export const getUserProjectsAPI = withCache(
  async (req: any, res: any) => {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' })
    }

    const { prisma } = await import('../prisma')
    const cachedPrisma = new PrismaCacheWrapper(prisma)

    const projects = await cachedPrisma.project.findMany(userId)

    return res.json({ projects })
  },
  {
    ttl: 300, // 5 minutes
    tags: ['user', 'project'],
    key: (req: any) => cacheKeys.user.projects(req.query.userId),
  }
)

/**
 * Example: Component-level caching
 */
export class DashboardDataLoader {
  /**
   * Load and cache dashboard data
   */
  static async loadDashboardData(userId: string) {
    const cacheKey = cacheKeys.user.dashboard(userId)

    // Try to get from cache first
    let dashboardData = userCache.get(cacheKey)

    if (!dashboardData) {
      // Load from database and cache
      dashboardData = await cachePreloading.userDashboard(userId)

      if (dashboardData) {
        userCache.set(cacheKey, dashboardData, 300000) // 5 minutes
      }
    }

    return dashboardData
  }

  /**
   * Preload data for multiple routes
   */
  static async preloadUserRoutes(userId: string) {
    const routes = ['/dashboard', '/projects']

    await Promise.all(routes.map(route => cachePreloading.route(route, userId)))

    console.log(`[Cache] Preloaded ${routes.length} routes for user: ${userId}`)
  }
}

/**
 * Example: Cache warming on user login
 */
export async function onUserLogin(userId: string) {
  try {
    // Warm up user-specific cache
    await Promise.all([
      cachePreloading.userDashboard(userId),
      DashboardDataLoader.preloadUserRoutes(userId),
    ])

    console.log(`[Cache] User cache warmed up for: ${userId}`)
  } catch (error) {
    console.error('[Cache] Failed to warm up user cache on login:', error)
  }
}

/**
 * Example: Cache invalidation on user actions
 */
export async function onProjectStatusChange(
  projectId: string,
  userId: string,
  newStatus: string
) {
  // Update project status
  const { prisma } = await import('../prisma')
  await prisma.project.update({
    where: { id: projectId },
    data: { title: newStatus },
  })

  // Smart invalidation with cascade
  smartInvalidation.cascadeInvalidation('project', projectId, userId)

  // Preload fresh data
  await cachePreloading.projectDetails(projectId)

  console.log(
    `[Cache] Project status updated and cache refreshed: ${projectId}`
  )
}

/**
 * Example: Batch operations with cache management
 */
export async function batchUpdateProjects(
  updates: Array<{ projectId: string; userId: string; data: any }>
) {
  const { prisma } = await import('../prisma')

  // Perform batch updates
  const updatePromises = updates.map(({ projectId, data }) =>
    prisma.project.update({
      where: { id: projectId },
      data,
    })
  )

  await Promise.all(updatePromises)

  // Batch invalidation
  const entities = updates.map(({ projectId, userId }) => ({
    type: 'project',
    id: projectId,
    userId,
  }))

  smartInvalidation.batchInvalidation(entities)

  console.log(
    `[Cache] Batch updated ${updates.length} projects with cache invalidation`
  )
}

/**
 * Example: Cache health monitoring
 */
export function setupCacheMonitoring() {
  // Monitor cache health every 5 minutes
  setInterval(() => {
    const globalStats = globalCache.getStats()
    const userStats = userCache.getStats()
    const projectStats = projectCache.getStats()

    console.log('[Cache Health]', {
      global: globalStats,
      user: userStats,
      project: projectStats,
      timestamp: new Date().toISOString(),
    })

    // Alert if cache utilization is high
    if (globalStats.utilizationPercent > 80) {
      console.warn(
        '[Cache] High cache utilization detected:',
        globalStats.utilizationPercent + '%'
      )
    }

    // Cleanup expired entries if needed
    if (globalStats.expiredCount > 10) {
      const cleaned = globalCache.cleanup()
      console.log(`[Cache] Cleaned up ${cleaned} expired entries`)
    }
  }, 300000) // 5 minutes
}

/**
 * Example: Route-specific cache configuration
 */
export const routeExamples = {
  // Dashboard page with user-specific caching
  dashboard: {
    generateStaticParams: async () => {
      // Pre-generate for common users if needed
      return []
    },

    revalidate: 300, // 5 minutes

    async getData(userId: string) {
      return DashboardDataLoader.loadDashboardData(userId)
    },
  },

  // Project detail page with project-specific caching
  projectDetail: {
    revalidate: 1800, // 30 minutes

    async getData(projectId: string) {
      const cacheKey = cacheKeys.project.details(projectId)

      let projectData = projectCache.get(cacheKey)

      if (!projectData) {
        projectData = await cachePreloading.projectDetails(projectId)
        if (projectData) {
          projectCache.set(cacheKey, projectData, 1800000) // 30 minutes
        }
      }

      return projectData
    },
  },
}
