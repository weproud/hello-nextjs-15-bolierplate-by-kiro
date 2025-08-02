import type { Project, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  AbstractRepository,
  BaseRepository,
  NotFoundError,
  type PaginatedResult,
  type PaginationOptions,
  type SortOptions,
} from './base-repository'
import { dbErrors } from '@/lib/prisma'

/**
 * Project 모델에 대한 Repository 클래스
 * 프로젝트 관련 데이터베이스 작업을 담당합니다.
 */
export class ProjectRepository
  extends AbstractRepository
  implements
    BaseRepository<
      Project,
      Prisma.ProjectCreateInput,
      Prisma.ProjectUpdateInput,
      Prisma.ProjectWhereInput,
      Prisma.ProjectOrderByWithRelationInput
    >
{
  /**
   * 모든 프로젝트 조회 (페이지네이션 및 필터링 지원)
   */
  async findMany(options?: {
    where?: Prisma.ProjectWhereInput
    orderBy?: Prisma.ProjectOrderByWithRelationInput
    take?: number
    skip?: number
    include?: Prisma.ProjectInclude
  }): Promise<Project[]> {
    try {
      return await prisma.project.findMany({
        where: options?.where,
        orderBy: options?.orderBy ?? { createdAt: 'desc' },
        take: options?.take,
        skip: options?.skip,
        include: options?.include,
      })
    } catch (error) {
      throw new Error(`Failed to fetch projects: ${error}`)
    }
  }

  /**
   * 페이지네이션된 프로젝트 목록 조회
   */
  async findManyPaginated(
    options?: {
      where?: Prisma.ProjectWhereInput
      include?: Prisma.ProjectInclude
    } & PaginationOptions &
      SortOptions<Project>
  ): Promise<PaginatedResult<Project>> {
    try {
      const { skip, take, page, limit } = this.buildPagination(options)
      const orderBy = this.buildSort(options)

      const [data, total] = await Promise.all([
        prisma.project.findMany({
          where: options?.where,
          orderBy,
          skip,
          take,
          include: options?.include,
        }),
        prisma.project.count({ where: options?.where }),
      ])

      return this.createPaginatedResult(data, total, page, limit)
    } catch (error) {
      throw new Error(`Failed to fetch paginated projects: ${error}`)
    }
  }

  /**
   * ID로 프로젝트 조회
   */
  async findById(
    id: string,
    include?: Prisma.ProjectInclude
  ): Promise<Project | null> {
    try {
      return await prisma.project.findUnique({
        where: { id },
        include,
      })
    } catch (error) {
      throw new Error(`Failed to fetch project by id ${id}: ${error}`)
    }
  }

  /**
   * 조건에 맞는 첫 번째 프로젝트 조회
   */
  async findFirst(options: {
    where: Prisma.ProjectWhereInput
    include?: Prisma.ProjectInclude
  }): Promise<Project | null> {
    try {
      return await prisma.project.findFirst({
        where: options.where,
        include: options.include,
      })
    } catch (error) {
      throw new Error(`Failed to fetch first project: ${error}`)
    }
  }

  /**
   * 프로젝트 수 조회
   */
  async count(where?: Prisma.ProjectWhereInput): Promise<number> {
    try {
      return await prisma.project.count({ where })
    } catch (error) {
      throw new Error(`Failed to count projects: ${error}`)
    }
  }

  /**
   * 새 프로젝트 생성
   */
  async create(
    data: Prisma.ProjectCreateInput,
    include?: Prisma.ProjectInclude
  ): Promise<Project> {
    try {
      return await prisma.project.create({
        data,
        include,
      })
    } catch (error) {
      throw new Error(`Failed to create project: ${error}`)
    }
  }

  /**
   * 여러 프로젝트 생성
   */
  async createMany(
    data: Prisma.ProjectCreateInput[]
  ): Promise<{ count: number }> {
    try {
      return await prisma.project.createMany({
        data,
        skipDuplicates: true,
      })
    } catch (error) {
      throw new Error(`Failed to create multiple projects: ${error}`)
    }
  }

  /**
   * 프로젝트 업데이트
   */
  async update(
    id: string,
    data: Prisma.ProjectUpdateInput,
    include?: Prisma.ProjectInclude
  ): Promise<Project> {
    try {
      return await prisma.project.update({
        where: { id },
        data,
        include,
      })
    } catch (error) {
      if (dbErrors.isRecordNotFoundError(error)) {
        throw new NotFoundError('Project', id)
      }
      throw new Error(`Failed to update project ${id}: ${error}`)
    }
  }

  /**
   * 여러 프로젝트 업데이트
   */
  async updateMany(
    where: Prisma.ProjectWhereInput,
    data: Prisma.ProjectUpdateInput
  ): Promise<{ count: number }> {
    try {
      return await prisma.project.updateMany({
        where,
        data,
      })
    } catch (error) {
      throw new Error(`Failed to update multiple projects: ${error}`)
    }
  }

  /**
   * 프로젝트 삭제
   */
  async delete(id: string): Promise<Project> {
    try {
      return await prisma.project.delete({
        where: { id },
      })
    } catch (error) {
      if (dbErrors.isRecordNotFoundError(error)) {
        throw new NotFoundError('Project', id)
      }
      throw new Error(`Failed to delete project ${id}: ${error}`)
    }
  }

  /**
   * 여러 프로젝트 삭제
   */
  async deleteMany(
    where: Prisma.ProjectWhereInput
  ): Promise<{ count: number }> {
    try {
      return await prisma.project.deleteMany({ where })
    } catch (error) {
      throw new Error(`Failed to delete multiple projects: ${error}`)
    }
  }

  /**
   * 프로젝트 존재 여부 확인
   */
  async exists(where: Prisma.ProjectWhereInput): Promise<boolean> {
    try {
      const project = await prisma.project.findFirst({ where })
      return project !== null
    } catch (error) {
      throw new Error(`Failed to check project existence: ${error}`)
    }
  }

  /**
   * 특정 사용자의 프로젝트 조회
   */
  async findByUser(
    userId: string,
    options?: PaginationOptions & { include?: Prisma.ProjectInclude }
  ): Promise<PaginatedResult<Project>> {
    return this.findManyPaginated({
      where: { userId },
      include: options?.include,
      page: options?.page,
      limit: options?.limit,
    })
  }

  /**
   * 프로젝트 검색 (제목 또는 설명으로)
   */
  async search(
    query: string,
    options?: PaginationOptions & {
      userId?: string
      include?: Prisma.ProjectInclude
    }
  ): Promise<PaginatedResult<Project>> {
    const where: Prisma.ProjectWhereInput = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    }

    if (options?.userId) {
      where.userId = options.userId
    }

    return this.findManyPaginated({
      where,
      include: options?.include,
      page: options?.page,
      limit: options?.limit,
    })
  }

  /**
   * 최근 프로젝트 조회
   */
  async findRecent(
    limit = 5,
    options?: { userId?: string; include?: Prisma.ProjectInclude }
  ): Promise<Project[]> {
    const where: Prisma.ProjectWhereInput = {}
    if (options?.userId) {
      where.userId = options.userId
    }

    return this.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: options?.include,
    })
  }

  /**
   * 프로젝트 통계 조회
   */
  async getStats(userId?: string) {
    try {
      const where: Prisma.ProjectWhereInput = userId ? { userId } : {}

      const [totalProjects, recentProjects] = await Promise.all([
        this.count(where),
        this.count({
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30일 전
          },
        }),
      ])

      return {
        total: totalProjects,
        recent: recentProjects,
      }
    } catch (error) {
      throw new Error(`Failed to get project stats: ${error}`)
    }
  }

  /**
   * 사용자별 프로젝트 수 조회
   */
  async getProjectCountByUser(): Promise<
    Array<{ userId: string; count: number }>
  > {
    try {
      const result = await prisma.project.groupBy({
        by: ['userId'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      })

      return result.map(item => ({
        userId: item.userId,
        count: item._count.id,
      }))
    } catch (error) {
      throw new Error(`Failed to get project count by user: ${error}`)
    }
  }

  /**
   * 프로젝트와 소유자 정보 함께 조회
   */
  async findWithUser(id: string) {
    try {
      return await prisma.project.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              displayName: true,
            },
          },
        },
      })
    } catch (error) {
      throw new Error(`Failed to fetch project with user ${id}: ${error}`)
    }
  }

  /**
   * 특정 기간 내 생성된 프로젝트 조회
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    options?: PaginationOptions & {
      userId?: string
      include?: Prisma.ProjectInclude
    }
  ): Promise<PaginatedResult<Project>> {
    const where: Prisma.ProjectWhereInput = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    }

    if (options?.userId) {
      where.userId = options.userId
    }

    return this.findManyPaginated({
      where,
      include: options?.include,
      page: options?.page,
      limit: options?.limit,
    })
  }

  /**
   * 프로젝트 제목 중복 확인
   */
  async existsByTitle(title: string, userId?: string): Promise<boolean> {
    const where: Prisma.ProjectWhereInput = { title }
    if (userId) {
      where.userId = userId
    }
    return this.exists(where)
  }

  /**
   * 사용자의 프로젝트 중 제목으로 검색
   */
  async findByUserAndTitle(
    userId: string,
    title: string,
    include?: Prisma.ProjectInclude
  ): Promise<Project | null> {
    return this.findFirst({
      where: {
        userId,
        title: { contains: title, mode: 'insensitive' },
      },
      include,
    })
  }
}

// 싱글톤 인스턴스 생성
export const projectRepository = new ProjectRepository()
