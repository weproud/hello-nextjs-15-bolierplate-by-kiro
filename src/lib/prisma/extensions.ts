import { Prisma } from '@prisma/client'
import { prisma } from './client'

// Soft delete extension
export const softDeleteExtension = Prisma.defineExtension({
  name: 'softDelete',
  model: {
    $allModels: {
      async softDelete<T>(this: T, where: Prisma.Args<T, 'delete'>['where']) {
        const context = Prisma.getExtensionContext(this)

        // Check if the model has a deletedAt field
        const modelName = context.$name
        if (!modelName) throw new Error('Model name not found')

        // For now, we'll implement actual delete since our schema doesn't have deletedAt
        // In a real implementation, you'd update with deletedAt: new Date()
        return (context as any).delete({ where })
      },

      async findManyNotDeleted<T>(this: T, args?: Prisma.Args<T, 'findMany'>) {
        const context = Prisma.getExtensionContext(this)

        // In a real soft delete implementation, you'd filter out deleted records
        // For now, just return regular findMany
        return (context as any).findMany(args)
      },
    },
  },
})

// Audit trail extension
export const auditExtension = Prisma.defineExtension({
  name: 'audit',
  query: {
    $allModels: {
      async create({ args, query }) {
        // Add audit fields if they exist
        if (args.data && typeof args.data === 'object') {
          const now = new Date()
          if ('createdAt' in args.data) {
            args.data.createdAt = now
          }
          if ('updatedAt' in args.data) {
            args.data.updatedAt = now
          }
        }
        return query(args)
      },

      async update({ args, query }) {
        // Update the updatedAt field if it exists
        if (args.data && typeof args.data === 'object') {
          if ('updatedAt' in args.data) {
            args.data.updatedAt = new Date()
          }
        }
        return query(args)
      },

      async updateMany({ args, query }) {
        // Update the updatedAt field if it exists
        if (args.data && typeof args.data === 'object') {
          if ('updatedAt' in args.data) {
            args.data.updatedAt = new Date()
          }
        }
        return query(args)
      },
    },
  },
})

// Logging extension
export const loggingExtension = Prisma.defineExtension({
  name: 'logging',
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const start = Date.now()

        if (process.env.NODE_ENV === 'development') {
          console.log(`[Prisma] ${model}.${operation} started`)
        }

        try {
          const result = await query(args)
          const duration = Date.now() - start

          if (process.env.NODE_ENV === 'development') {
            console.log(
              `[Prisma] ${model}.${operation} completed in ${duration}ms`
            )
          }

          return result
        } catch (error) {
          const duration = Date.now() - start
          console.error(
            `[Prisma] ${model}.${operation} failed after ${duration}ms:`,
            error
          )
          throw error
        }
      },
    },
  },
})

// Extended Prisma client with all extensions
export const extendedPrisma = prisma
  .$extends(auditExtension)
  .$extends(loggingExtension)
  .$extends(softDeleteExtension)

export type ExtendedPrismaClient = typeof extendedPrisma
