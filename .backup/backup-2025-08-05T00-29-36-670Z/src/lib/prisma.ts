import { Prisma, PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Main Prisma client instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    errorFormat: 'pretty',
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Enhanced Prisma client with extensions
export const extendedPrisma = prisma
  .$extends({
    name: 'audit',
    query: {
      $allModels: {
        async create({ args, query }) {
          if (args.data && typeof args.data === 'object') {
            const now = new Date()
            if ('createdAt' in args.data) args.data.createdAt = now
            if ('updatedAt' in args.data) args.data.updatedAt = now
          }
          return query(args)
        },
        async update({ args, query }) {
          if (args.data && typeof args.data === 'object') {
            if ('updatedAt' in args.data) args.data.updatedAt = new Date()
          }
          return query(args)
        },
      },
    },
  })
  .$extends({
    name: 'logging',
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          const start = Date.now()
          try {
            const result = await query(args)
            const duration = Date.now() - start
            if (process.env.NODE_ENV === 'development' && duration > 1000) {
              console.warn(
                `Slow query: ${model}.${operation} took ${duration}ms`
              )
            }
            return result
          } catch (error) {
            console.error(`Database error in ${model}.${operation}:`, error)
            throw error
          }
        },
      },
    },
  })

export type ExtendedPrismaClient = typeof extendedPrisma

// Database utilities
export const db = {
  async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error('Database connection failed:', error)
      return false
    }
  },

  async cleanup() {
    try {
      const now = new Date()
      const [expiredSessions, expiredTokens] = await Promise.all([
        prisma.session.deleteMany({ where: { expires: { lt: now } } }),
        prisma.verificationToken.deleteMany({
          where: { expires: { lt: now } },
        }),
      ])

      return {
        expiredSessions: expiredSessions.count,
        expiredTokens: expiredTokens.count,
        timestamp: now,
      }
    } catch (error) {
      console.error('Database cleanup failed:', error)
      throw error
    }
  },
}

// Transaction utilities
export const transaction = {
  async execute<T>(
    operations: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return await prisma.$transaction(operations)
  },

  async executeWithRetry<T>(
    operations: (tx: Prisma.TransactionClient) => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.execute(operations)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        if (attempt === maxRetries) break

        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  },
}

// Query utilities (used by repositories)
export const queryUtils = {
  buildWhereClause(filters: Record<string, any>): any {
    const where: any = {}
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && key.includes('search')) {
          where.OR = [
            { title: { contains: value, mode: 'insensitive' } },
            { description: { contains: value, mode: 'insensitive' } },
          ]
        } else {
          where[key] = value
        }
      }
    })
    return where
  },

  buildPagination(page = 1, limit = 10) {
    return { skip: (page - 1) * limit, take: limit }
  },

  buildSort(sortBy = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') {
    return { [sortBy]: sortOrder }
  },

  calculatePagination(totalCount: number, page: number, limit: number) {
    const totalPages = Math.ceil(totalCount / limit)
    return {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    }
  },
}

// Error handling utilities
export const dbErrors = {
  isUniqueConstraintError(
    error: unknown
  ): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    )
  },

  isForeignKeyConstraintError(
    error: unknown
  ): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    )
  },

  isRecordNotFoundError(
    error: unknown
  ): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    )
  },

  getUserFriendlyMessage(error: unknown): string {
    if (this.isUniqueConstraintError(error))
      return '이미 존재하는 데이터입니다.'
    if (this.isForeignKeyConstraintError(error))
      return '관련된 데이터가 존재하지 않습니다.'
    if (this.isRecordNotFoundError(error))
      return '요청한 데이터를 찾을 수 없습니다.'
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return `데이터베이스 오류가 발생했습니다. (${error.code})`
    }
    return '알 수 없는 데이터베이스 오류가 발생했습니다.'
  },
}

// Graceful shutdown
if (typeof process !== 'undefined' && process.on) {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

export default prisma
