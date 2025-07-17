'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createAuthAction, createPublicAction } from '@/lib/safe-action'
import { z } from 'zod'
import {
  ActionLogger,
  NotFoundError,
  AuthorizationError,
  ValidationError,
  DatabaseError,
  safeExecute,
  checkRateLimit,
  sanitizeObject,
} from '@/lib/error-handling'

/**
 * Sample server actions demonstrating comprehensive error scenarios
 * and various patterns for testing purposes
 */

// Validation schemas for sample actions
const bulkDeleteProjectsSchema = z.object({
  projectIds: z
    .array(z.string().uuid('Invalid project ID'))
    .min(1, 'At least one project ID is required')
    .max(10, 'Cannot delete more than 10 projects at once'),
})

const duplicateProjectSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  newTitle: z
    .string()
    .min(1, 'New title is required')
    .max(255, 'Title must be less than 255 characters'),
})

const getProjectStatsSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
})

const rateLimitedActionSchema = z.object({
  message: z.string().min(1).max(100),
})

const complexValidationSchema = z.object({
  email: z.string().email('Invalid email format'),
  age: z.number().int().min(18, 'Must be at least 18').max(120, 'Invalid age'),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    notifications: z.boolean(),
    language: z.string().length(2, 'Language must be 2 characters'),
  }),
  tags: z.array(z.string().min(1).max(20)).max(5, 'Maximum 5 tags allowed'),
})

/**
 * Bulk delete projects with comprehensive error handling
 */
export const bulkDeleteProjectsAction = createAuthAction('bulkDeleteProjects')
  .inputSchema(bulkDeleteProjectsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { projectIds } = parsedInput

    return safeExecute(
      async () => {
        ActionLogger.info('bulkDeleteProjects', 'Starting bulk delete', {
          userId: user.id,
          projectCount: projectIds.length,
        })

        // Verify all projects exist and belong to user
        const existingProjects = await prisma.project.findMany({
          where: {
            id: { in: projectIds },
            userId: user.id,
          },
          select: { id: true, title: true },
        })

        if (existingProjects.length !== projectIds.length) {
          const foundIds = existingProjects.map(p => p.id)
          const missingIds = projectIds.filter(id => !foundIds.includes(id))

          throw new ValidationError(
            `Some projects not found or access denied: ${missingIds.join(', ')}`
          )
        }

        // Delete projects in a transaction
        const result = await prisma.$transaction(async tx => {
          // First delete all phases
          await tx.phase.deleteMany({
            where: {
              projectId: { in: projectIds },
            },
          })

          // Then delete projects
          const deleteResult = await tx.project.deleteMany({
            where: {
              id: { in: projectIds },
              userId: user.id,
            },
          })

          return deleteResult
        })

        // Revalidate pages
        revalidatePath('/projects')
        revalidatePath('/dashboard')

        ActionLogger.info('bulkDeleteProjects', 'Bulk delete completed', {
          userId: user.id,
          deletedCount: result.count,
        })

        return {
          success: true,
          deletedCount: result.count,
          message: `Successfully deleted ${result.count} projects`,
        }
      },
      'bulkDeleteProjects',
      'Failed to bulk delete projects'
    )
  })

/**
 * Duplicate a project with all its phases
 */
export const duplicateProjectAction = createAuthAction('duplicateProject')
  .inputSchema(duplicateProjectSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { projectId, newTitle } = parsedInput

    return safeExecute(
      async () => {
        ActionLogger.info('duplicateProject', 'Duplicating project', {
          userId: user.id,
          sourceProjectId: projectId,
          newTitle,
        })

        // Get original project with phases
        const originalProject = await prisma.project.findFirst({
          where: {
            id: projectId,
            userId: user.id,
          },
          include: {
            phases: {
              orderBy: { order: 'asc' },
            },
          },
        })

        if (!originalProject) {
          throw new NotFoundError('Project not found or access denied')
        }

        // Create duplicate in a transaction
        const duplicatedProject = await prisma.$transaction(async tx => {
          // Create new project
          const newProject = await tx.project.create({
            data: {
              title: newTitle,
              description: originalProject.description,
              userId: user.id,
            },
          })

          // Create duplicate phases
          if (originalProject.phases.length > 0) {
            await tx.phase.createMany({
              data: originalProject.phases.map(phase => ({
                title: phase.title,
                description: phase.description,
                order: phase.order,
                projectId: newProject.id,
              })),
            })
          }

          // Return project with phases
          return tx.project.findUnique({
            where: { id: newProject.id },
            include: {
              phases: {
                orderBy: { order: 'asc' },
              },
              _count: {
                select: { phases: true },
              },
            },
          })
        })

        // Revalidate pages
        revalidatePath('/projects')
        revalidatePath('/dashboard')

        ActionLogger.info(
          'duplicateProject',
          'Project duplicated successfully',
          {
            userId: user.id,
            originalProjectId: projectId,
            newProjectId: duplicatedProject?.id,
          }
        )

        return {
          success: true,
          project: duplicatedProject,
          message: 'Project duplicated successfully',
        }
      },
      'duplicateProject',
      'Failed to duplicate project'
    )
  })

/**
 * Get comprehensive project statistics
 */
export const getProjectStatsAction = createAuthAction('getProjectStats')
  .inputSchema(getProjectStatsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { projectId } = parsedInput

    return safeExecute(
      async () => {
        // Verify project ownership
        const project = await prisma.project.findFirst({
          where: {
            id: projectId,
            userId: user.id,
          },
        })

        if (!project) {
          throw new NotFoundError('Project not found or access denied')
        }

        // Get comprehensive stats
        const [phaseCount, totalProjects, userStats] = await Promise.all([
          prisma.phase.count({
            where: { projectId },
          }),
          prisma.project.count({
            where: { userId: user.id },
          }),
          prisma.user.findUnique({
            where: { id: user.id },
            select: {
              createdAt: true,
              _count: {
                select: {
                  projects: true,
                },
              },
            },
          }),
        ])

        const stats = {
          project: {
            id: project.id,
            title: project.title,
            createdAt: project.createdAt,
            phaseCount,
          },
          user: {
            totalProjects,
            memberSince: userStats?.createdAt,
            totalProjectsCount: userStats?._count.projects ?? 0,
          },
          computed: {
            projectAge: Math.floor(
              (Date.now() - project.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            ),
            averagePhasesPerProject:
              totalProjects > 0
                ? Math.round(
                    ((userStats?._count.projects ?? 0) / totalProjects) * 100
                  ) / 100
                : 0,
          },
        }

        return {
          success: true,
          stats,
        }
      },
      'getProjectStats',
      'Failed to get project statistics'
    )
  })

/**
 * Rate-limited action demonstrating rate limiting
 */
export const rateLimitedAction = createAuthAction('rateLimitedAction')
  .inputSchema(rateLimitedActionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { message } = parsedInput

    return safeExecute(
      async () => {
        // Check rate limit (5 requests per minute per user)
        const rateLimitKey = `rate_limit_${user.id}`
        const isAllowed = checkRateLimit(rateLimitKey, 5, 60000)

        if (!isAllowed) {
          throw new ValidationError(
            'Rate limit exceeded. Please wait before trying again.'
          )
        }

        ActionLogger.info(
          'rateLimitedAction',
          'Processing rate-limited action',
          {
            userId: user.id,
            message: message.substring(0, 20) + '...',
          }
        )

        // Simulate some processing
        await new Promise(resolve => setTimeout(resolve, 100))

        return {
          success: true,
          message: `Processed: ${message}`,
          timestamp: new Date().toISOString(),
        }
      },
      'rateLimitedAction',
      'Failed to process rate-limited action'
    )
  })

/**
 * Complex validation demonstration
 */
export const complexValidationAction = createPublicAction('complexValidation')
  .inputSchema(complexValidationSchema)
  .action(async ({ parsedInput }) => {
    return safeExecute(
      async () => {
        // Sanitize input
        const sanitizedInput = sanitizeObject(parsedInput)

        ActionLogger.info(
          'complexValidation',
          'Processing complex validation',
          {
            email: sanitizedInput.email,
            theme: sanitizedInput.preferences.theme,
          }
        )

        // Additional business logic validation
        if (sanitizedInput.email.includes('test') && sanitizedInput.age < 25) {
          throw new ValidationError(
            'Test emails are not allowed for users under 25'
          )
        }

        if (
          sanitizedInput.tags.some(tag => tag.toLowerCase().includes('spam'))
        ) {
          throw new ValidationError('Spam-related tags are not allowed')
        }

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 50))

        return {
          success: true,
          processedData: {
            ...sanitizedInput,
            processedAt: new Date().toISOString(),
            validationPassed: true,
          },
          message: 'Complex validation completed successfully',
        }
      },
      'complexValidation',
      'Failed to process complex validation'
    )
  })

/**
 * Error scenario testing action - deliberately throws different types of errors
 */
export const errorTestAction = createAuthAction('errorTest')
  .inputSchema(
    z.object({
      errorType: z.enum([
        'validation',
        'not_found',
        'authorization',
        'database',
        'generic',
        'success',
      ]),
      message: z.string().optional(),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { errorType, message } = parsedInput

    ActionLogger.info('errorTest', `Testing error type: ${errorType}`, {
      userId: user.id,
      errorType,
    })

    switch (errorType) {
      case 'validation':
        throw new ValidationError(
          message || 'This is a test validation error',
          { field1: ['Test error 1'], field2: ['Test error 2'] }
        )

      case 'not_found':
        throw new NotFoundError(message || 'Test resource not found')

      case 'authorization':
        throw new AuthorizationError(message || 'Test authorization denied')

      case 'database':
        throw new DatabaseError(message || 'Test database error')

      case 'generic':
        throw new Error(message || 'Test generic error')

      case 'success':
        return {
          success: true,
          message: message || 'Error test completed successfully',
          errorType,
          timestamp: new Date().toISOString(),
        }

      default:
        throw new ValidationError('Invalid error type specified')
    }
  })

// Type exports for the schemas
export type BulkDeleteProjectsInput = z.infer<typeof bulkDeleteProjectsSchema>
export type DuplicateProjectInput = z.infer<typeof duplicateProjectSchema>
export type GetProjectStatsInput = z.infer<typeof getProjectStatsSchema>
export type RateLimitedActionInput = z.infer<typeof rateLimitedActionSchema>
export type ComplexValidationInput = z.infer<typeof complexValidationSchema>
