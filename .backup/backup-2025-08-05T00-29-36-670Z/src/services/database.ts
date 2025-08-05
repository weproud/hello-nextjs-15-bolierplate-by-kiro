/**
 * Database Service
 *
 * High-level database operations and utilities
 * built on top of Prisma for common patterns.
 */

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export interface PaginationOptions {
  page: number
  limit: number
}

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface DatabaseResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  metadata?: Record<string, unknown>
}

export interface BatchOperationResult {
  success: boolean
  successCount: number
  failureCount: number
  errors: Array<{
    index: number
    error: string
  }>
}

export interface SearchOptions {
  query?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Generic pagination helper with improved type safety
 */
export async function paginate<T>(
  model: {
    findMany: (args: {
      where?: Record<string, unknown>
      include?: Record<string, unknown>
      orderBy?: Record<string, unknown>
      skip?: number
      take?: number
    }) => Promise<T[]>
    count: (args: { where?: Record<string, unknown> }) => Promise<number>
  },
  options: PaginationOptions & {
    where?: Record<string, unknown>
    include?: Record<string, unknown>
    orderBy?: Record<string, unknown>
  }
): Promise<DatabaseResult<PaginationResult<T>>> {
  try {
    const { page, limit, where, include, orderBy } = options
    const skip = (page - 1) * limit

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return {
        success: false,
        error:
          'Invalid pagination parameters: page and limit must be positive integers',
      }
    }

    // Filter out undefined values to satisfy exactOptionalPropertyTypes
    const findManyArgs: {
      where?: Record<string, unknown>
      include?: Record<string, unknown>
      orderBy?: Record<string, unknown>
      skip: number
      take: number
    } = {
      skip,
      take: limit,
    }

    if (where !== undefined) findManyArgs.where = where
    if (include !== undefined) findManyArgs.include = include
    if (orderBy !== undefined) findManyArgs.orderBy = orderBy

    const countArgs: { where?: Record<string, unknown> } = {}
    if (where !== undefined) countArgs.where = where

    const [data, totalCount] = await Promise.all([
      model.findMany(findManyArgs),
      model.count(countArgs),
    ])

    const totalPages = Math.ceil(totalCount / limit)

    const result: PaginationResult<T> = {
      data,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    }

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Pagination failed',
      metadata: {
        options,
        timestamp: new Date().toISOString(),
      },
    }
  }
}

/**
 * User database operations
 */
export const userDb = {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    })
  },

  async updateProfile(id: string, data: { name?: string; email?: string }) {
    return prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })
  },

  async getStats(userId: string) {
    const [projectCount] = await Promise.all([
      prisma.project.count({
        where: { userId },
      }),
    ])

    return {
      projectCount,
    }
  },
}

/**
 * Project database operations
 */
export const projectDb = {
  async findByUserId(
    userId: string,
    options: PaginationOptions & SearchOptions = { page: 1, limit: 10 }
  ): Promise<DatabaseResult<PaginationResult<any>>> {
    const {
      page,
      limit,
      query,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options

    const where: Prisma.ProjectWhereInput = {
      userId,
      ...(query && {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      }),
    }

    const result = await paginate(prisma.project, {
      page,
      limit,
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    })

    return result
  },

  async update(
    id: string,
    data: { title?: string; description?: string },
    userId?: string
  ) {
    return prisma.project.update({
      where: {
        id,
        ...(userId && { userId }),
      },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
  },

  async delete(id: string, userId?: string) {
    return prisma.project.delete({
      where: {
        id,
        ...(userId && { userId }),
      },
    })
  },

  async duplicate(id: string, userId: string) {
    return prisma.$transaction(async tx => {
      const original = await tx.project.findFirst({
        where: { id, userId },
      })

      if (!original) {
        throw new Error('Project not found')
      }

      const newProject = await tx.project.create({
        data: {
          title: `${original.title} (복사본)`,
          description: original.description,
          userId,
        },
      })

      return tx.project.findUnique({
        where: { id: newProject.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
    })
  },
}

/**
 * Generic database utilities
 */
export const dbUtils = {
  /**
   * Check if record exists
   */
  async exists<
    T extends {
      count: (args: { where: Record<string, unknown> }) => Promise<number>
    },
  >(model: T, where: Record<string, unknown>): Promise<boolean> {
    const count = await model.count({ where })
    return count > 0
  },

  /**
   * Soft delete (if your models support it)
   */
  async softDelete<
    T extends {
      update: (args: {
        where: { id: string }
        data: Record<string, unknown>
      }) => Promise<unknown>
    },
  >(model: T, id: string) {
    return model.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    })
  },

  /**
   * Batch operations
   */
  async batchCreate<
    T extends {
      createMany: (args: {
        data: Record<string, unknown>[]
        skipDuplicates: boolean
      }) => Promise<{ count: number }>
    },
  >(model: T, data: Record<string, unknown>[]): Promise<BatchOperationResult> {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        return {
          success: false,
          successCount: 0,
          failureCount: 0,
          errors: [{ index: -1, error: 'Invalid or empty data array' }],
        }
      }

      const result = await model.createMany({
        data,
        skipDuplicates: true,
      })

      return {
        success: true,
        successCount: result.count,
        failureCount: data.length - result.count,
        errors: [],
      }
    } catch (error) {
      return {
        success: false,
        successCount: 0,
        failureCount: data.length,
        errors: [
          {
            index: -1,
            error:
              error instanceof Error ? error.message : 'Batch create failed',
          },
        ],
      }
    }
  },

  async batchUpdate<
    T extends {
      updateMany: (args: {
        where: Record<string, unknown>
        data: Record<string, unknown>
      }) => Promise<unknown>
    },
  >(
    model: T,
    updates: Array<{
      where: Record<string, unknown>
      data: Record<string, unknown>
    }>
  ) {
    return prisma.$transaction(async () => {
      const results = []
      for (const update of updates) {
        const result = await model.updateMany({
          where: update.where,
          data: update.data,
        })
        results.push(result)
      }
      return results
    })
  },

  async batchDelete<
    T extends {
      deleteMany: (args: {
        where: { id: { in: string[] } }
      }) => Promise<unknown>
    },
  >(model: T, ids: string[]) {
    return model.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })
  },
}
