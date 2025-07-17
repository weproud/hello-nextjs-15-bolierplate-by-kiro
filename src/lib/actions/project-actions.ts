'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createAuthAction } from '@/lib/safe-action'
import {
  createProjectSchema,
  updateProjectSchema,
  deleteProjectSchema,
  getProjectSchema,
  getUserProjectsSchema,
} from '@/lib/validations/project'
import { ActionLogger } from '@/lib/error-handling'

/**
 * Create a new project
 */
export const createProjectAction = createAuthAction('createProject')
  .inputSchema(createProjectSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { title, description } = parsedInput

    ActionLogger.info('createProject', 'Creating new project', {
      userId: user.id,
      title,
    })

    try {
      const project = await prisma.project.create({
        data: {
          title,
          description: description ?? null,
          userId: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              phases: true,
            },
          },
        },
      })

      // Revalidate projects page
      revalidatePath('/projects')
      revalidatePath('/dashboard')

      ActionLogger.info('createProject', 'Project created successfully', {
        projectId: project.id,
        userId: user.id,
      })

      return {
        success: true,
        project,
        message: 'Project created successfully',
      }
    } catch (error) {
      ActionLogger.error('createProject', 'Failed to create project', error, {
        userId: user.id,
        title,
      })
      throw error
    }
  })

/**
 * Update an existing project
 */
export const updateProjectAction = createAuthAction('updateProject')
  .inputSchema(updateProjectSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { id, title, description } = parsedInput

    ActionLogger.info('updateProject', 'Updating project', {
      projectId: id,
      userId: user.id,
    })

    try {
      // Check if project exists and belongs to user
      const existingProject = await prisma.project.findFirst({
        where: {
          id,
          userId: user.id,
        },
      })

      if (!existingProject) {
        throw new Error('Project not found or access denied')
      }

      const project = await prisma.project.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              phases: true,
            },
          },
        },
      })

      // Revalidate projects page
      revalidatePath('/projects')
      revalidatePath('/dashboard')
      revalidatePath(`/projects/${id}`)

      ActionLogger.info('updateProject', 'Project updated successfully', {
        projectId: id,
        userId: user.id,
      })

      return {
        success: true,
        project,
        message: 'Project updated successfully',
      }
    } catch (error) {
      ActionLogger.error('updateProject', 'Failed to update project', error, {
        projectId: id,
        userId: user.id,
      })
      throw error
    }
  })

/**
 * Delete a project
 */
export const deleteProjectAction = createAuthAction('deleteProject')
  .inputSchema(deleteProjectSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { id } = parsedInput

    ActionLogger.info('deleteProject', 'Deleting project', {
      projectId: id,
      userId: user.id,
    })

    try {
      // Check if project exists and belongs to user
      const existingProject = await prisma.project.findFirst({
        where: {
          id,
          userId: user.id,
        },
      })

      if (!existingProject) {
        throw new Error('Project not found or access denied')
      }

      await prisma.project.delete({
        where: { id },
      })

      // Revalidate projects page
      revalidatePath('/projects')
      revalidatePath('/dashboard')

      ActionLogger.info('deleteProject', 'Project deleted successfully', {
        projectId: id,
        userId: user.id,
      })

      return {
        success: true,
        message: 'Project deleted successfully',
      }
    } catch (error) {
      ActionLogger.error('deleteProject', 'Failed to delete project', error, {
        projectId: id,
        userId: user.id,
      })
      throw error
    }
  })

/**
 * Get a single project by ID
 */
export const getProjectAction = createAuthAction('getProject')
  .inputSchema(getProjectSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { id } = parsedInput

    try {
      const project = await prisma.project.findFirst({
        where: {
          id,
          userId: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          phases: {
            orderBy: {
              order: 'asc',
            },
          },
          _count: {
            select: {
              phases: true,
            },
          },
        },
      })

      if (!project) {
        throw new Error('Project not found or access denied')
      }

      return {
        success: true,
        project,
      }
    } catch (error) {
      ActionLogger.error('getProject', 'Failed to get project', error, {
        projectId: id,
        userId: user.id,
      })
      throw error
    }
  })

/**
 * Get user's projects with pagination
 */
export const getUserProjectsAction = createAuthAction('getUserProjects')
  .inputSchema(getUserProjectsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { limit, offset } = parsedInput

    try {
      const [projects, totalCount] = await Promise.all([
        prisma.project.findMany({
          where: {
            userId: user.id,
          },
          include: {
            _count: {
              select: {
                phases: true,
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: limit,
          skip: offset,
        }),
        prisma.project.count({
          where: {
            userId: user.id,
          },
        }),
      ])

      return {
        success: true,
        projects,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
      }
    } catch (error) {
      ActionLogger.error(
        'getUserProjects',
        'Failed to get user projects',
        error,
        {
          userId: user.id,
          limit,
          offset,
        }
      )
      throw error
    }
  })
