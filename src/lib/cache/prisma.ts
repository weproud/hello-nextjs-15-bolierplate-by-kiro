/**
 * Prisma query result caching utilities
 */

import { PrismaClient } from '@prisma/client'
import { MemoryCache } from './memory'
import { CACHE_TAGS, CACHE_DURATION, createCachedFunction } from './nextjs'

// Prisma query cache instance
const prismaCache = new MemoryCache()

/**
 * Cache wrapper for Prisma queries
 */
export class PrismaCacheWrapper {
  constructor(private prisma: PrismaClient) {}

  /**
   * Cached user queries
   */
  user = {
    findUnique: createCachedFunction(
      async (id: string) => {
        return this.prisma.user.findUnique({
          where: { id },
          include: {
            accounts: true,
            sessions: true,
          },
        })
      },
      ['user', 'findUnique'],
      {
        tags: [CACHE_TAGS.USER],
        revalidate: CACHE_DURATION.MEDIUM,
      }
    ),

    findByEmail: createCachedFunction(
      async (email: string) => {
        return this.prisma.user.findUnique({
          where: { email },
        })
      },
      ['user', 'findByEmail'],
      {
        tags: [CACHE_TAGS.USER],
        revalidate: CACHE_DURATION.MEDIUM,
      }
    ),
  }

  /**
   * Cached project queries
   */
  project = {
    findMany: createCachedFunction(
      async (userId: string) => {
        return this.prisma.project.findMany({
          where: { userId },
          include: {
            phases: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      },
      ['project', 'findMany'],
      {
        tags: [CACHE_TAGS.PROJECT],
        revalidate: CACHE_DURATION.SHORT,
      }
    ),

    findUnique: createCachedFunction(
      async (id: string) => {
        return this.prisma.project.findUnique({
          where: { id },
          include: {
            user: true,
            phases: {
              orderBy: { order: 'asc' },
            },
          },
        })
      },
      ['project', 'findUnique'],
      {
        tags: [CACHE_TAGS.PROJECT],
        revalidate: CACHE_DURATION.MEDIUM,
      }
    ),

    count: createCachedFunction(
      async (userId: string) => {
        return this.prisma.project.count({
          where: { userId },
        })
      },
      ['project', 'count'],
      {
        tags: [CACHE_TAGS.PROJECT],
        revalidate: CACHE_DURATION.MEDIUM,
      }
    ),
  }

  /**
   * Cached phase queries
   */
  phase = {
    findMany: createCachedFunction(
      async (projectId: string) => {
        return this.prisma.phase.findMany({
          where: { projectId },
          orderBy: { order: 'asc' },
        })
      },
      ['phase', 'findMany'],
      {
        tags: [CACHE_TAGS.PHASE],
        revalidate: CACHE_DURATION.SHORT,
      }
    ),

    findUnique: createCachedFunction(
      async (id: string) => {
        return this.prisma.phase.findUnique({
          where: { id },
          include: {
            project: true,
          },
        })
      },
      ['phase', 'findUnique'],
      {
        tags: [CACHE_TAGS.PHASE],
        revalidate: CACHE_DURATION.MEDIUM,
      }
    ),
  }

  /**
   * Raw Prisma client for non-cached operations
   */
  get raw() {
    return this.prisma
  }
}

/**
 * Memory cache utilities for Prisma results
 */
export const prismaMemoryCache = {
  // Generate cache keys
  keys: {
    user: (id: string) => `prisma:user:${id}`,
    userByEmail: (email: string) => `prisma:user:email:${email}`,
    userProjects: (userId: string) => `prisma:user:${userId}:projects`,
    project: (id: string) => `prisma:project:${id}`,
    projectPhases: (projectId: string) => `prisma:project:${projectId}:phases`,
    phase: (id: string) => `prisma:phase:${id}`,
  },

  // Cache with TTL
  set: <T>(key: string, value: T, ttlMs: number = 300000) => {
    prismaCache.set(key, value, ttlMs)
  },

  // Get from cache
  get: <T>(key: string): T | undefined => {
    return prismaCache.get(key)
  },

  // Delete from cache
  delete: (key: string) => {
    prismaCache.delete(key)
  },

  // Clear all Prisma cache
  clear: () => {
    prismaCache.clear()
  },

  // Invalidate user-related cache
  invalidateUser: (userId: string) => {
    const userKey = prismaMemoryCache.keys.user(userId)
    const projectsKey = prismaMemoryCache.keys.userProjects(userId)

    prismaCache.delete(userKey)
    prismaCache.delete(projectsKey)
  },

  // Invalidate project-related cache
  invalidateProject: (projectId: string, userId?: string) => {
    const projectKey = prismaMemoryCache.keys.project(projectId)
    const phasesKey = prismaMemoryCache.keys.projectPhases(projectId)

    prismaCache.delete(projectKey)
    prismaCache.delete(phasesKey)

    if (userId) {
      const userProjectsKey = prismaMemoryCache.keys.userProjects(userId)
      prismaCache.delete(userProjectsKey)
    }
  },
}

/**
 * Cached query wrapper function
 */
export function withPrismaCache<T extends any[], R>(
  queryFn: (...args: T) => Promise<R>,
  cacheKey: (...args: T) => string,
  ttlMs: number = 300000
) {
  return async (...args: T): Promise<R> => {
    const key = cacheKey(...args)

    // Try to get from cache first
    const cached = prismaMemoryCache.get<R>(key)
    if (cached !== undefined) {
      return cached
    }

    // Execute query and cache result
    const result = await queryFn(...args)
    prismaMemoryCache.set(key, result, ttlMs)

    return result
  }
}
