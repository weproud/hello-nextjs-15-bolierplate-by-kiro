/**
 * Test file for project server actions
 * This demonstrates how to test next-safe-action server actions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  duplicateProject,
  getProjectStats,
} from '../project-actions'

// Mock Prisma
const mockPrisma = {
  project: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  phase: {
    count: vi.fn(),
    createMany: vi.fn(),
  },
  $transaction: vi.fn(),
}

// Mock auth
const mockAuth = vi.fn()

// Mock revalidation functions
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

vi.mock('@/auth', () => ({
  auth: mockAuth,
}))

describe('Project Actions', () => {
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
  }

  const mockProject = {
    id: 'project-123',
    title: 'Test Project',
    description: 'Test Description',
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
    _count: { phases: 2 },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: mockUser })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      mockPrisma.project.create.mockResolvedValue(mockProject)

      const result = await createProject({
        title: 'Test Project',
        description: 'Test Description',
      })

      expect(mockPrisma.project.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Project',
          description: 'Test Description',
          userId: 'user-123',
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

      expect(result.data).toEqual({
        project: mockProject,
        message: '프로젝트가 성공적으로 생성되었습니다.',
      })
    })

    it('should handle validation errors', async () => {
      const result = await createProject({
        title: '', // Invalid: empty title
        description: 'Test Description',
      })

      expect(result.validationErrors).toBeDefined()
      expect(result.validationErrors?.title).toContain(
        '프로젝트 제목을 입력해주세요.'
      )
    })

    it('should handle database errors', async () => {
      mockPrisma.project.create.mockRejectedValue(new Error('Database error'))

      const result = await createProject({
        title: 'Test Project',
        description: 'Test Description',
      })

      expect(result.serverError).toContain(
        '프로젝트 생성 중 오류가 발생했습니다'
      )
    })
  })

  describe('getProjects', () => {
    it('should fetch projects with pagination', async () => {
      const mockProjects = [mockProject]
      mockPrisma.project.findMany.mockResolvedValue(mockProjects)
      mockPrisma.project.count.mockResolvedValue(1)

      const result = await getProjects({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      expect(result.data).toEqual({
        projects: mockProjects,
        pagination: {
          page: 1,
          limit: 10,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        filters: {
          search: undefined,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
      })
    })

    it('should handle search queries', async () => {
      const mockProjects = [mockProject]
      mockPrisma.project.findMany.mockResolvedValue(mockProjects)
      mockPrisma.project.count.mockResolvedValue(1)

      await getProjects({
        page: 1,
        limit: 10,
        search: 'test',
        sortBy: 'title',
        sortOrder: 'asc',
      })

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          OR: [
            {
              title: {
                contains: 'test',
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: 'test',
                mode: 'insensitive',
              },
            },
          ],
        },
        include: expect.any(Object),
        orderBy: { title: 'asc' },
        skip: 0,
        take: 10,
      })
    })
  })

  describe('updateProject', () => {
    it('should update a project successfully', async () => {
      mockPrisma.project.findFirst.mockResolvedValue(mockProject)
      mockPrisma.project.update.mockResolvedValue({
        ...mockProject,
        title: 'Updated Project',
      })

      const result = await updateProject({
        id: 'project-123',
        title: 'Updated Project',
        description: 'Updated Description',
      })

      expect(mockPrisma.project.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'project-123',
          userId: 'user-123',
        },
      })

      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: 'project-123' },
        data: {
          title: 'Updated Project',
          description: 'Updated Description',
          updatedAt: expect.any(Date),
        },
        include: expect.any(Object),
      })

      expect(result.data?.message).toBe('프로젝트가 성공적으로 수정되었습니다.')
    })

    it('should handle non-existent project', async () => {
      mockPrisma.project.findFirst.mockResolvedValue(null)

      const result = await updateProject({
        id: 'non-existent',
        title: 'Updated Project',
        description: 'Updated Description',
      })

      expect(result.serverError).toContain(
        '프로젝트를 찾을 수 없거나 수정 권한이 없습니다'
      )
    })
  })

  describe('deleteProject', () => {
    it('should delete a project successfully', async () => {
      mockPrisma.project.findFirst.mockResolvedValue(mockProject)
      mockPrisma.project.delete.mockResolvedValue(mockProject)

      const result = await deleteProject({
        id: 'project-123',
      })

      expect(mockPrisma.project.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'project-123',
          userId: 'user-123',
        },
        include: {
          _count: {
            select: {
              phases: true,
            },
          },
        },
      })

      expect(mockPrisma.project.delete).toHaveBeenCalledWith({
        where: { id: 'project-123' },
      })

      expect(result.data?.message).toContain(
        '프로젝트 "Test Project"가 성공적으로 삭제되었습니다'
      )
    })

    it('should handle unauthorized deletion', async () => {
      mockPrisma.project.findFirst.mockResolvedValue(null)

      const result = await deleteProject({
        id: 'project-123',
      })

      expect(result.serverError).toContain(
        '프로젝트를 찾을 수 없거나 삭제 권한이 없습니다'
      )
    })
  })

  describe('duplicateProject', () => {
    it('should duplicate a project with phases', async () => {
      const mockProjectWithPhases = {
        ...mockProject,
        phases: [
          {
            id: 'phase-1',
            title: 'Phase 1',
            description: 'Phase 1 Description',
            order: 1,
            projectId: 'project-123',
          },
          {
            id: 'phase-2',
            title: 'Phase 2',
            description: 'Phase 2 Description',
            order: 2,
            projectId: 'project-123',
          },
        ],
      }

      const duplicatedProject = {
        ...mockProject,
        id: 'project-456',
        title: 'Test Project (복사본)',
      }

      mockPrisma.project.findFirst.mockResolvedValue(mockProjectWithPhases)
      mockPrisma.$transaction.mockImplementation(async callback => {
        return await callback({
          project: {
            create: vi.fn().mockResolvedValue(duplicatedProject),
            findUnique: vi.fn().mockResolvedValue({
              ...duplicatedProject,
              phases: mockProjectWithPhases.phases,
            }),
          },
          phase: {
            createMany: vi.fn(),
          },
        })
      })

      const result = await duplicateProject({
        id: 'project-123',
      })

      expect(result.data?.message).toContain(
        '프로젝트 "Test Project"가 성공적으로 복사되었습니다'
      )
    })
  })

  describe('getProjectStats', () => {
    it('should return project statistics', async () => {
      mockPrisma.project.count
        .mockResolvedValueOnce(5) // totalProjects
        .mockResolvedValueOnce(2) // projectsThisMonth
        .mockResolvedValueOnce(1) // projectsLastMonth

      mockPrisma.phase.count.mockResolvedValue(10) // totalPhases

      mockPrisma.project.findMany.mockResolvedValue([
        mockProject,
        { ...mockProject, id: 'project-456' },
      ])

      const result = await getProjectStats()

      expect(result.data).toEqual({
        totalProjects: 5,
        totalPhases: 10,
        averagePhasesPerProject: 2.0,
        projectsThisMonth: 2,
        projectsLastMonth: 1,
        monthlyGrowth: 100.0,
        recentProjects: expect.any(Array),
      })
    })
  })
})

// Integration test example
describe('Project Actions Integration', () => {
  it('should perform complete CRUD workflow', async () => {
    // This would be an integration test that tests the complete workflow
    // In a real scenario, you'd use a test database

    // 1. Create project
    // 2. Read project
    // 3. Update project
    // 4. Duplicate project
    // 5. Delete project

    // For now, this is a placeholder to show the structure
    expect(true).toBe(true)
  })
})
