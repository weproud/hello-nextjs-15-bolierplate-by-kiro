'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createAuthAction } from '@/lib/safe-action'
import {
  createPhaseSchema,
  updatePhaseSchema,
  deletePhaseSchema,
  getPhaseSchema,
  getProjectPhasesSchema,
  reorderPhasesSchema,
} from '@/lib/validations/phase'
import {
  ActionLogger,
  NotFoundError,
  AuthorizationError,
  ValidationError,
  safeExecute,
} from '@/lib/error-handling'

/**
 * Create a new phase
 */
export const createPhaseAction = createAuthAction('createPhase')
  .inputSchema(createPhaseSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { title, description, order, projectId } = parsedInput

    return safeExecute(async () => {
      ActionLogger.info('createPhase', 'Creating new phase', {
        userId: user.id,
        projectId,
        title,
      })

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

      // Get the next order if not specified
      let finalOrder = order
      if (finalOrder === 0) {
        const lastPhase = await prisma.phase.findFirst({
          where: { projectId },
          orderBy: { order: 'desc' },
        })
        finalOrder = (lastPhase?.order ?? -1) + 1
      }

      const phase = await prisma.phase.create({
        data: {
          title,
          description: description ?? null,
          order: finalOrder,
          projectId,
        },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              userId: true,
            },
          },
        },
      })

      // Revalidate relevant pages
      revalidatePath('/projects')
      revalidatePath(`/projects/${projectId}`)
      revalidatePath('/dashboard')

      ActionLogger.info('createPhase', 'Phase created successfully', {
        phaseId: phase.id,
        projectId,
        userId: user.id,
      })

      return {
        success: true,
        phase,
        message: 'Phase created successfully',
      }
    }, 'Failed to create phase')
  })

/**
 * Update an existing phase
 */
export const updatePhaseAction = createAuthAction('updatePhase')
  .inputSchema(updatePhaseSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { id, title, description, order } = parsedInput

    return safeExecute(async () => {
      ActionLogger.info('updatePhase', 'Updating phase', {
        phaseId: id,
        userId: user.id,
      })

      // Check if phase exists and user has access
      const existingPhase = await prisma.phase.findFirst({
        where: {
          id,
          project: {
            userId: user.id,
          },
        },
        include: {
          project: true,
        },
      })

      if (!existingPhase) {
        throw new NotFoundError('Phase not found or access denied')
      }

      const phase = await prisma.phase.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(order !== undefined && { order }),
        },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              userId: true,
            },
          },
        },
      })

      // Revalidate relevant pages
      revalidatePath('/projects')
      revalidatePath(`/projects/${existingPhase.projectId}`)
      revalidatePath('/dashboard')

      ActionLogger.info('updatePhase', 'Phase updated successfully', {
        phaseId: id,
        userId: user.id,
      })

      return {
        success: true,
        phase,
        message: 'Phase updated successfully',
      }
    }, 'Failed to update phase')
  })

/**
 * Delete a phase
 */
export const deletePhaseAction = createAuthAction('deletePhase')
  .inputSchema(deletePhaseSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { id } = parsedInput

    return safeExecute(async () => {
      ActionLogger.info('deletePhase', 'Deleting phase', {
        phaseId: id,
        userId: user.id,
      })

      // Check if phase exists and user has access
      const existingPhase = await prisma.phase.findFirst({
        where: {
          id,
          project: {
            userId: user.id,
          },
        },
        include: {
          project: true,
        },
      })

      if (!existingPhase) {
        throw new NotFoundError('Phase not found or access denied')
      }

      await prisma.phase.delete({
        where: { id },
      })

      // Revalidate relevant pages
      revalidatePath('/projects')
      revalidatePath(`/projects/${existingPhase.projectId}`)
      revalidatePath('/dashboard')

      ActionLogger.info('deletePhase', 'Phase deleted successfully', {
        phaseId: id,
        projectId: existingPhase.projectId,
        userId: user.id,
      })

      return {
        success: true,
        message: 'Phase deleted successfully',
      }
    }, 'Failed to delete phase')
  })

/**
 * Get a single phase by ID
 */
export const getPhaseAction = createAuthAction('getPhase')
  .inputSchema(getPhaseSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { id } = parsedInput

    return safeExecute(async () => {
      const phase = await prisma.phase.findFirst({
        where: {
          id,
          project: {
            userId: user.id,
          },
        },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              userId: true,
            },
          },
        },
      })

      if (!phase) {
        throw new NotFoundError('Phase not found or access denied')
      }

      return {
        success: true,
        phase,
      }
    }, 'Failed to get phase')
  })

/**
 * Get phases for a project with pagination
 */
export const getProjectPhasesAction = createAuthAction('getProjectPhases')
  .inputSchema(getProjectPhasesSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { projectId, limit, offset } = parsedInput

    return safeExecute(async () => {
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

      const [phases, totalCount] = await Promise.all([
        prisma.phase.findMany({
          where: {
            projectId,
          },
          orderBy: {
            order: 'asc',
          },
          take: limit,
          skip: offset,
        }),
        prisma.phase.count({
          where: {
            projectId,
          },
        }),
      ])

      return {
        success: true,
        phases,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      }
    }, 'Failed to get project phases')
  })

/**
 * Reorder phases within a project
 */
export const reorderPhasesAction = createAuthAction('reorderPhases')
  .inputSchema(reorderPhasesSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { projectId, phaseOrders } = parsedInput

    return safeExecute(async () => {
      ActionLogger.info('reorderPhases', 'Reordering phases', {
        projectId,
        userId: user.id,
        phaseCount: phaseOrders.length,
      })

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

      // Verify all phases belong to the project
      const existingPhases = await prisma.phase.findMany({
        where: {
          id: {
            in: phaseOrders.map(p => p.id),
          },
          projectId,
        },
      })

      if (existingPhases.length !== phaseOrders.length) {
        throw new ValidationError([
          {
            field: 'phaseOrders',
            message: 'Some phases do not belong to this project',
            code: 'INVALID_PHASE_PROJECT',
          },
        ])
      }

      // Update phases in a transaction
      await prisma.$transaction(
        phaseOrders.map(phaseOrder =>
          prisma.phase.update({
            where: { id: phaseOrder.id },
            data: { order: phaseOrder.order },
          })
        )
      )

      // Get updated phases
      const updatedPhases = await prisma.phase.findMany({
        where: { projectId },
        orderBy: { order: 'asc' },
      })

      // Revalidate relevant pages
      revalidatePath('/projects')
      revalidatePath(`/projects/${projectId}`)
      revalidatePath('/dashboard')

      ActionLogger.info('reorderPhases', 'Phases reordered successfully', {
        projectId,
        userId: user.id,
        phaseCount: phaseOrders.length,
      })

      return {
        success: true,
        phases: updatedPhases,
        message: 'Phases reordered successfully',
      }
    }, 'Failed to reorder phases')
  })
