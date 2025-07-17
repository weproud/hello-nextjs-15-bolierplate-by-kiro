// Re-export the enhanced prisma client
export { prisma, extendedPrisma } from './prisma/client'
export { DatabaseConnection } from './prisma/connection'
export {
  userQueries,
  projectQueries,
  phaseQueries,
  genericQueries,
} from './prisma/queries'
export type { ExtendedPrismaClient } from './prisma/extensions'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Enhanced Prisma client configuration
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

// Database connection utilities
export const db = {
  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error('Database connection failed:', error)
      return false
    }
  },

  /**
   * Get database health status
   */
  async getHealthStatus() {
    try {
      const start = Date.now()
      await prisma.$queryRaw`SELECT 1`
      const responseTime = Date.now() - start

      return {
        status: 'healthy',
        responseTime,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      }
    }
  },

  /**
   * Execute raw SQL query safely
   */
  async executeRaw<T = any>(query: string, params: any[] = []): Promise<T> {
    try {
      return await prisma.$queryRawUnsafe(query, ...params)
    } catch (error) {
      console.error('Raw query execution failed:', error)
      throw error
    }
  },

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      const [userCount, projectCount, phaseCount] = await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
        prisma.phase.count(),
      ])

      return {
        users: userCount,
        projects: projectCount,
        phases: phaseCount,
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('Failed to get database stats:', error)
      throw error
    }
  },

  /**
   * Cleanup expired sessions and tokens
   */
  async cleanup() {
    try {
      const now = new Date()

      // Clean up expired sessions
      const expiredSessions = await prisma.session.deleteMany({
        where: {
          expires: {
            lt: now,
          },
        },
      })

      // Clean up expired verification tokens
      const expiredTokens = await prisma.verificationToken.deleteMany({
        where: {
          expires: {
            lt: now,
          },
        },
      })

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

  /**
   * Backup database (for development)
   */
  async backup() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Backup not available in production')
    }

    try {
      // This would typically use pg_dump or similar
      // For now, just return a placeholder
      return {
        message: 'Backup functionality not implemented',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('Database backup failed:', error)
      throw error
    }
  },
}

// Transaction utilities
export const transaction = {
  /**
   * Execute multiple operations in a transaction
   */
  async execute<T>(
    operations: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    try {
      return await prisma.$transaction(operations)
    } catch (error) {
      console.error('Transaction failed:', error)
      throw error
    }
  },

  /**
   * Execute operations with retry logic
   */
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

        if (attempt === maxRetries) {
          break
        }

        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))

        console.warn(`Transaction attempt ${attempt} failed, retrying...`)
      }
    }

    throw lastError!
  },
}

// Query optimization utilities
export const queryUtils = {
  /**
   * Build dynamic where clause
   */
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

  /**
   * Build pagination options
   */
  buildPagination(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit
    return {
      skip,
      take: limit,
    }
  },

  /**
   * Build sort options
   */
  buildSort(sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc') {
    return {
      [sortBy]: sortOrder,
    }
  },

  /**
   * Calculate pagination metadata
   */
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
  /**
   * Check if error is a unique constraint violation
   */
  isUniqueConstraintError(error: any): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    )
  },

  /**
   * Check if error is a foreign key constraint violation
   */
  isForeignKeyConstraintError(error: any): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    )
  },

  /**
   * Check if error is a record not found error
   */
  isRecordNotFoundError(error: any): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    )
  },

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: any): string {
    if (this.isUniqueConstraintError(error)) {
      return '이미 존재하는 데이터입니다.'
    }

    if (this.isForeignKeyConstraintError(error)) {
      return '관련된 데이터가 존재하지 않습니다.'
    }

    if (this.isRecordNotFoundError(error)) {
      return '요청한 데이터를 찾을 수 없습니다.'
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return `데이터베이스 오류가 발생했습니다. (${error.code})`
    }

    return '알 수 없는 데이터베이스 오류가 발생했습니다.'
  },
}

// Middleware for logging and monitoring
prisma.$use(async (params, next) => {
  const before = Date.now()

  try {
    const result = await next(params)
    const after = Date.now()

    // Log slow queries in development
    if (process.env.NODE_ENV === 'development' && after - before > 1000) {
      console.warn(
        `Slow query detected: ${params.model}.${params.action} took ${after - before}ms`
      )
    }

    return result
  } catch (error) {
    console.error(`Database error in ${params.model}.${params.action}:`, error)
    throw error
  }
})

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma
