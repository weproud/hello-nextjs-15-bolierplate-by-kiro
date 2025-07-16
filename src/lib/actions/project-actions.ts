'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { action, authAction } from '@/lib/safe-action'
import { prisma } from '@/lib/prisma'

// Validation schemas for project operations
const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, '프로젝트 제목을 입력해주세요.')
    .max(255, '프로젝트 제목은 최대 255자까지 입력 가능합니다.'),
  description: z
    .string()
    .max(1000, '프로젝트 설명은 최대 1000자까지 입력 가능합니다.')
    .optional(),
})

const updateProjectSchema = z.object({
  id: z.string().uuid('올바른 프로젝트 ID가 필요합니다.'),
  title: z
    .string()
    .min(1, '프로젝트 제목을 입력해주세요.')
    .max(255, '프로젝트 제목은 최대 255자까지 입력 가능합니다.'),
  description: z
    .string()
    .max(1000, '프로젝트 설명은 최대 1000자까지 입력 가능합니다.')
    .optional(),
})

const deleteProjectSchema = z.object({
  id: z.string().uuid('올바른 프로젝트 ID가 필요합니다.'),
})

const getProjectSchema = z.object({
  id: z.string().uuid('올바른 프로젝트 ID가 필요합니다.'),
})

const getProjectsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Create a new project
export const createProject = authAction
  .schema(createProjectSchema)
  .metadata({ actionName: 'createProject' })
  .action(async ({ parsedInput, ctx }) => {
    try {
      console.log(`[${ctx.userId}] Creating project:`, {
        title: parsedInput.title,
        hasDescription: !!parsedInput.description,
      })

      const project = await prisma.project.create({
        data: {
          title: parsedInput.title,
          description: parsedInput.description || null,
          userId: ctx.userId,
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

      // Revalidate relevant pages and cache tags
      revalidatePath('/projects')
      revalidatePath('/dashboard')
      revalidateTag('user-projects')

      console.log(`[${ctx.userId}] Project created successfully:`, project.id)
      return {
        project,
        message: '프로젝트가 성공적으로 생성되었습니다.',
      }
    } catch (error) {
      console.error(`[${ctx.userId}] Failed to create project:`, error)

      if (error instanceof Error) {
        throw new Error(
          `프로젝트 생성 중 오류가 발생했습니다: ${error.message}`
        )
      }

      throw new Error('프로젝트 생성 중 알 수 없는 오류가 발생했습니다.')
    }
  })

// Get a single project by ID
export const getProject = authAction
  .schema(getProjectSchema)
  .metadata({ actionName: 'getProject' })
  .action(async ({ parsedInput, ctx }) => {
    try {
      console.log(`[${ctx.userId}] Fetching project:`, parsedInput.id)

      const project = await prisma.project.findFirst({
        where: {
          id: parsedInput.id,
          userId: ctx.userId, // Ensure user can only access their own projects
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
        throw new Error('프로젝트를 찾을 수 없습니다.')
      }

      console.log(`[${ctx.userId}] Project fetched successfully:`, project.id)
      return project
    } catch (error) {
      console.error(`[${ctx.userId}] Failed to fetch project:`, error)

      if (error instanceof Error) {
        throw error
      }

      throw new Error('프로젝트 조회 중 알 수 없는 오류가 발생했습니다.')
    }
  })

// Get projects with pagination and filtering
export const getProjects = authAction
  .schema(getProjectsSchema)
  .metadata({ actionName: 'getProjects' })
  .action(async ({ parsedInput, ctx }) => {
    try {
      console.log(`[${ctx.userId}] Fetching projects:`, {
        page: parsedInput.page,
        limit: parsedInput.limit,
        search: parsedInput.search,
        sortBy: parsedInput.sortBy,
        sortOrder: parsedInput.sortOrder,
      })

      const skip = (parsedInput.page - 1) * parsedInput.limit

      // Build where clause for search
      const whereClause = {
        userId: ctx.userId,
        ...(parsedInput.search && {
          OR: [
            {
              title: {
                contains: parsedInput.search,
                mode: 'insensitive' as const,
              },
            },
            {
              description: {
                contains: parsedInput.search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }),
      }

      // Get projects and total count in parallel
      const [projects, totalCount] = await Promise.all([
        prisma.project.findMany({
          where: whereClause,
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
          orderBy: {
            [parsedInput.sortBy]: parsedInput.sortOrder,
          },
          skip,
          take: parsedInput.limit,
        }),
        prisma.project.count({
          where: whereClause,
        }),
      ])

      const totalPages = Math.ceil(totalCount / parsedInput.limit)

      const result = {
        projects,
        pagination: {
          page: parsedInput.page,
          limit: parsedInput.limit,
          totalCount,
          totalPages,
          hasNextPage: parsedInput.page < totalPages,
          hasPreviousPage: parsedInput.page > 1,
        },
        filters: {
          search: parsedInput.search,
          sortBy: parsedInput.sortBy,
          sortOrder: parsedInput.sortOrder,
        },
      }

      console.log(`[${ctx.userId}] Projects fetched successfully:`, {
        count: projects.length,
        totalCount,
        page: parsedInput.page,
      })

      return result
    } catch (error) {
      console.error(`[${ctx.userId}] Failed to fetch projects:`, error)

      if (error instanceof Error) {
        throw new Error(
          `프로젝트 목록 조회 중 오류가 발생했습니다: ${error.message}`
        )
      }

      throw new Error('프로젝트 목록 조회 중 알 수 없는 오류가 발생했습니다.')
    }
  })

// Update an existing project
export const updateProject = authAction
  .schema(updateProjectSchema)
  .metadata({ actionName: 'updateProject' })
  .action(async ({ parsedInput, ctx }) => {
    try {
      console.log(`[${ctx.userId}] Updating project:`, {
        id: parsedInput.id,
        title: parsedInput.title,
        hasDescription: !!parsedInput.description,
      })

      // First check if the project exists and belongs to the user
      const existingProject = await prisma.project.findFirst({
        where: {
          id: parsedInput.id,
          userId: ctx.userId,
        },
      })

      if (!existingProject) {
        throw new Error('프로젝트를 찾을 수 없거나 수정 권한이 없습니다.')
      }

      const updatedProject = await prisma.project.update({
        where: {
          id: parsedInput.id,
        },
        data: {
          title: parsedInput.title,
          description: parsedInput.description || null,
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
          _count: {
            select: {
              phases: true,
            },
          },
        },
      })

      // Revalidate relevant pages and cache tags
      revalidatePath('/projects')
      revalidatePath(`/projects/${parsedInput.id}`)
      revalidatePath('/dashboard')
      revalidateTag('user-projects')
      revalidateTag(`project-${parsedInput.id}`)

      console.log(
        `[${ctx.userId}] Project updated successfully:`,
        updatedProject.id
      )
      return {
        project: updatedProject,
        message: '프로젝트가 성공적으로 수정되었습니다.',
      }
    } catch (error) {
      console.error(`[${ctx.userId}] Failed to update project:`, error)

      if (error instanceof Error) {
        throw error
      }

      throw new Error('프로젝트 수정 중 알 수 없는 오류가 발생했습니다.')
    }
  })

// Delete a project
export const deleteProject = authAction
  .schema(deleteProjectSchema)
  .metadata({ actionName: 'deleteProject' })
  .action(async ({ parsedInput, ctx }) => {
    try {
      console.log(`[${ctx.userId}] Deleting project:`, parsedInput.id)

      // First check if the project exists and belongs to the user
      const existingProject = await prisma.project.findFirst({
        where: {
          id: parsedInput.id,
          userId: ctx.userId,
        },
        include: {
          _count: {
            select: {
              phases: true,
            },
          },
        },
      })

      if (!existingProject) {
        throw new Error('프로젝트를 찾을 수 없거나 삭제 권한이 없습니다.')
      }

      // Delete the project (phases will be deleted automatically due to cascade)
      await prisma.project.delete({
        where: {
          id: parsedInput.id,
        },
      })

      // Revalidate relevant pages and cache tags
      revalidatePath('/projects')
      revalidatePath('/dashboard')
      revalidateTag('user-projects')
      revalidateTag(`project-${parsedInput.id}`)

      console.log(`[${ctx.userId}] Project deleted successfully:`, {
        id: parsedInput.id,
        title: existingProject.title,
        phasesCount: existingProject._count.phases,
      })

      return {
        message: `프로젝트 "${existingProject.title}"가 성공적으로 삭제되었습니다.`,
        deletedProject: {
          id: existingProject.id,
          title: existingProject.title,
          phasesCount: existingProject._count.phases,
        },
      }
    } catch (error) {
      console.error(`[${ctx.userId}] Failed to delete project:`, error)

      if (error instanceof Error) {
        throw error
      }

      throw new Error('프로젝트 삭제 중 알 수 없는 오류가 발생했습니다.')
    }
  })

// Duplicate a project
export const duplicateProject = authAction
  .schema(getProjectSchema)
  .metadata({ actionName: 'duplicateProject' })
  .action(async ({ parsedInput, ctx }) => {
    try {
      console.log(`[${ctx.userId}] Duplicating project:`, parsedInput.id)

      // Get the original project with its phases
      const originalProject = await prisma.project.findFirst({
        where: {
          id: parsedInput.id,
          userId: ctx.userId,
        },
        include: {
          phases: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      })

      if (!originalProject) {
        throw new Error('복사할 프로젝트를 찾을 수 없습니다.')
      }

      // Create the duplicated project with phases in a transaction
      const duplicatedProject = await prisma.$transaction(async tx => {
        // Create the new project
        const newProject = await tx.project.create({
          data: {
            title: `${originalProject.title} (복사본)`,
            description: originalProject.description,
            userId: ctx.userId,
          },
        })

        // Create the phases if any exist
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

        // Return the complete project with phases
        return await tx.project.findUnique({
          where: { id: newProject.id },
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
      })

      // Revalidate relevant pages and cache tags
      revalidatePath('/projects')
      revalidatePath('/dashboard')
      revalidateTag('user-projects')

      console.log(`[${ctx.userId}] Project duplicated successfully:`, {
        originalId: parsedInput.id,
        newId: duplicatedProject?.id,
        phasesCount: originalProject.phases.length,
      })

      return {
        project: duplicatedProject,
        message: `프로젝트 "${originalProject.title}"가 성공적으로 복사되었습니다.`,
      }
    } catch (error) {
      console.error(`[${ctx.userId}] Failed to duplicate project:`, error)

      if (error instanceof Error) {
        throw error
      }

      throw new Error('프로젝트 복사 중 알 수 없는 오류가 발생했습니다.')
    }
  })

// Get project statistics for dashboard
export const getProjectStats = authAction
  .metadata({ actionName: 'getProjectStats' })
  .action(async ({ ctx }) => {
    try {
      console.log(`[${ctx.userId}] Fetching project statistics`)

      const [
        totalProjects,
        totalPhases,
        recentProjects,
        projectsThisMonth,
        projectsLastMonth,
      ] = await Promise.all([
        // Total projects count
        prisma.project.count({
          where: { userId: ctx.userId },
        }),

        // Total phases count across all projects
        prisma.phase.count({
          where: {
            project: {
              userId: ctx.userId,
            },
          },
        }),

        // Recent projects (last 5)
        prisma.project.findMany({
          where: { userId: ctx.userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            _count: {
              select: {
                phases: true,
              },
            },
          },
        }),

        // Projects created this month
        prisma.project.count({
          where: {
            userId: ctx.userId,
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),

        // Projects created last month
        prisma.project.count({
          where: {
            userId: ctx.userId,
            createdAt: {
              gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth() - 1,
                1
              ),
              lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
      ])

      const monthlyGrowth =
        projectsLastMonth > 0
          ? ((projectsThisMonth - projectsLastMonth) / projectsLastMonth) * 100
          : projectsThisMonth > 0
            ? 100
            : 0

      const stats = {
        totalProjects,
        totalPhases,
        averagePhasesPerProject:
          totalProjects > 0
            ? Math.round((totalPhases / totalProjects) * 10) / 10
            : 0,
        projectsThisMonth,
        projectsLastMonth,
        monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
        recentProjects,
      }

      console.log(`[${ctx.userId}] Project statistics fetched successfully:`, {
        totalProjects: stats.totalProjects,
        totalPhases: stats.totalPhases,
        monthlyGrowth: stats.monthlyGrowth,
      })

      return stats
    } catch (error) {
      console.error(
        `[${ctx.userId}] Failed to fetch project statistics:`,
        error
      )

      if (error instanceof Error) {
        throw new Error(
          `프로젝트 통계 조회 중 오류가 발생했습니다: ${error.message}`
        )
      }

      throw new Error('프로젝트 통계 조회 중 알 수 없는 오류가 발생했습니다.')
    }
  })

// Export type definitions for client-side usage
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type GetProjectsInput = z.infer<typeof getProjectsSchema>
