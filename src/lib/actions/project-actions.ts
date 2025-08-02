'use server'

import { ActionLogger } from '@/lib/error-handling'
import { projectRepository } from '@/lib/repositories/project-repository'
import { authActionClient } from '@/lib/safe-action'
import {
  createProjectSchema,
  deleteProjectSchema,
  getProjectSchema,
  getUserProjectsSchema,
  updateProjectSchema,
} from '@/lib/validations/project'
import { revalidatePath } from 'next/cache'

/**
 * Create a new project
 */
export const createProjectAction = authActionClient
  .inputSchema(createProjectSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { title, description } = parsedInput

    ActionLogger.info('createProject', 'Creating new project', {
      userId: user.id,
      title,
    })

    try {
      const project = await projectRepository.create(
        {
          title,
          description: description ?? null,
          user: {
            connect: { id: user.id },
          },
        },
        {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        }
      )

      // Revalidate projects page and sidebar data
      revalidatePath('/projects')
      revalidatePath('/dashboard')
      revalidatePath('/', 'layout') // Revalidate layout to update sidebar

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
export const updateProjectAction = authActionClient
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
      const existingProject = await projectRepository.findFirst({
        where: {
          id,
          userId: user.id,
        },
      })

      if (!existingProject) {
        throw new Error('Project not found or access denied')
      }

      const project = await projectRepository.update(
        id,
        {
          ...(title && { title }),
          ...(description !== undefined && { description }),
        },
        {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        }
      )

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
export const deleteProjectAction = authActionClient
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
      const existingProject = await projectRepository.findFirst({
        where: {
          id,
          userId: user.id,
        },
      })

      if (!existingProject) {
        throw new Error('Project not found or access denied')
      }

      await projectRepository.delete(id)

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
export const getProjectAction = authActionClient
  .inputSchema(getProjectSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { id } = parsedInput

    try {
      const project = await projectRepository.findFirst({
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
export const getUserProjectsAction = authActionClient
  .inputSchema(getUserProjectsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx
    const { limit, offset } = parsedInput

    try {
      const result = await projectRepository.findByUser(user.id, {
        page: Math.floor(offset / limit) + 1,
        limit,
      })

      const projects = result.data
      const totalCount = result.pagination.total

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
