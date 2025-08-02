import type { User, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  AbstractRepository,
  BaseRepository,
  NotFoundError,
  DuplicateError,
  type PaginatedResult,
  type PaginationOptions,
  type SortOptions,
} from './base-repository'
import { dbErrors } from '@/lib/prisma'

/**
 * User 모델에 대한 Repository 클래스
 * 사용자 관련 데이터베이스 작업을 담당합니다.
 */
export class UserRepository
  extends AbstractRepository
  implements
    BaseRepository<
      User,
      Prisma.UserCreateInput,
      Prisma.UserUpdateInput,
      Prisma.UserWhereInput,
      Prisma.UserOrderByWithRelationInput
    >
{
  /**
   * 모든 사용자 조회 (페이지네이션 및 필터링 지원)
   */
  async findMany(options?: {
    where?: Prisma.UserWhereInput
    orderBy?: Prisma.UserOrderByWithRelationInput
    take?: number
    skip?: number
    include?: Prisma.UserInclude
  }): Promise<User[]> {
    try {
      return await prisma.user.findMany({
        where: options?.where,
        orderBy: options?.orderBy ?? { createdAt: 'desc' },
        take: options?.take,
        skip: options?.skip,
        include: options?.include,
      })
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error}`)
    }
  }

  /**
   * 페이지네이션된 사용자 목록 조회
   */
  async findManyPaginated(
    options?: {
      where?: Prisma.UserWhereInput
      include?: Prisma.UserInclude
    } & PaginationOptions &
      SortOptions<User>
  ): Promise<PaginatedResult<User>> {
    try {
      const { skip, take, page, limit } = this.buildPagination(options)
      const orderBy = this.buildSort(options)

      const [data, total] = await Promise.all([
        prisma.user.findMany({
          where: options?.where,
          orderBy,
          skip,
          take,
          include: options?.include,
        }),
        prisma.user.count({ where: options?.where }),
      ])

      return this.createPaginatedResult(data, total, page, limit)
    } catch (error) {
      throw new Error(`Failed to fetch paginated users: ${error}`)
    }
  }

  /**
   * ID로 사용자 조회
   */
  async findById(
    id: string,
    include?: Prisma.UserInclude
  ): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include,
      })
    } catch (error) {
      throw new Error(`Failed to fetch user by id ${id}: ${error}`)
    }
  }

  /**
   * 이메일로 사용자 조회
   */
  async findByEmail(
    email: string,
    include?: Prisma.UserInclude
  ): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email },
        include,
      })
    } catch (error) {
      throw new Error(`Failed to fetch user by email ${email}: ${error}`)
    }
  }

  /**
   * 조건에 맞는 첫 번째 사용자 조회
   */
  async findFirst(options: {
    where: Prisma.UserWhereInput
    include?: Prisma.UserInclude
  }): Promise<User | null> {
    try {
      return await prisma.user.findFirst({
        where: options.where,
        include: options.include,
      })
    } catch (error) {
      throw new Error(`Failed to fetch first user: ${error}`)
    }
  }

  /**
   * 사용자 수 조회
   */
  async count(where?: Prisma.UserWhereInput): Promise<number> {
    try {
      return await prisma.user.count({ where })
    } catch (error) {
      throw new Error(`Failed to count users: ${error}`)
    }
  }

  /**
   * 새 사용자 생성
   */
  async create(
    data: Prisma.UserCreateInput,
    include?: Prisma.UserInclude
  ): Promise<User> {
    try {
      return await prisma.user.create({
        data,
        include,
      })
    } catch (error) {
      if (dbErrors.isUniqueConstraintError(error)) {
        throw new DuplicateError('User', 'email')
      }
      throw new Error(`Failed to create user: ${error}`)
    }
  }

  /**
   * 여러 사용자 생성
   */
  async createMany(data: Prisma.UserCreateInput[]): Promise<{ count: number }> {
    try {
      return await prisma.user.createMany({
        data,
        skipDuplicates: true,
      })
    } catch (error) {
      throw new Error(`Failed to create multiple users: ${error}`)
    }
  }

  /**
   * 사용자 업데이트
   */
  async update(
    id: string,
    data: Prisma.UserUpdateInput,
    include?: Prisma.UserInclude
  ): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data,
        include,
      })
    } catch (error) {
      if (dbErrors.isRecordNotFoundError(error)) {
        throw new NotFoundError('User', id)
      }
      if (dbErrors.isUniqueConstraintError(error)) {
        throw new DuplicateError('User', 'email')
      }
      throw new Error(`Failed to update user ${id}: ${error}`)
    }
  }

  /**
   * 여러 사용자 업데이트
   */
  async updateMany(
    where: Prisma.UserWhereInput,
    data: Prisma.UserUpdateInput
  ): Promise<{ count: number }> {
    try {
      return await prisma.user.updateMany({
        where,
        data,
      })
    } catch (error) {
      throw new Error(`Failed to update multiple users: ${error}`)
    }
  }

  /**
   * 사용자 삭제
   */
  async delete(id: string): Promise<User> {
    try {
      return await prisma.user.delete({
        where: { id },
      })
    } catch (error) {
      if (dbErrors.isRecordNotFoundError(error)) {
        throw new NotFoundError('User', id)
      }
      throw new Error(`Failed to delete user ${id}: ${error}`)
    }
  }

  /**
   * 여러 사용자 삭제
   */
  async deleteMany(where: Prisma.UserWhereInput): Promise<{ count: number }> {
    try {
      return await prisma.user.deleteMany({ where })
    } catch (error) {
      throw new Error(`Failed to delete multiple users: ${error}`)
    }
  }

  /**
   * 사용자 존재 여부 확인
   */
  async exists(where: Prisma.UserWhereInput): Promise<boolean> {
    try {
      const user = await prisma.user.findFirst({ where })
      return user !== null
    } catch (error) {
      throw new Error(`Failed to check user existence: ${error}`)
    }
  }

  /**
   * 이메일 존재 여부 확인
   */
  async existsByEmail(email: string): Promise<boolean> {
    return this.exists({ email })
  }

  /**
   * 관리자 사용자 조회
   */
  async findAdmins(include?: Prisma.UserInclude): Promise<User[]> {
    return this.findMany({
      where: { isAdmin: true },
      include,
    })
  }

  /**
   * 활성 사용자 조회 (이메일 인증된 사용자)
   */
  async findActiveUsers(
    options?: PaginationOptions & { include?: Prisma.UserInclude }
  ): Promise<PaginatedResult<User>> {
    return this.findManyPaginated({
      where: {
        emailVerified: { not: null },
      },
      include: options?.include,
      page: options?.page,
      limit: options?.limit,
    })
  }

  /**
   * 사용자 검색 (이름 또는 이메일로)
   */
  async search(
    query: string,
    options?: PaginationOptions & { include?: Prisma.UserInclude }
  ): Promise<PaginatedResult<User>> {
    return this.findManyPaginated({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: options?.include,
      page: options?.page,
      limit: options?.limit,
    })
  }

  /**
   * 사용자 통계 조회
   */
  async getStats() {
    try {
      const [totalUsers, activeUsers, adminUsers, recentUsers] =
        await Promise.all([
          this.count(),
          this.count({ emailVerified: { not: null } }),
          this.count({ isAdmin: true }),
          this.count({
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30일 전
            },
          }),
        ])

      return {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers,
        recent: recentUsers,
        inactive: totalUsers - activeUsers,
      }
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error}`)
    }
  }

  /**
   * 사용자와 관련된 모든 데이터 조회 (프로필 페이지용)
   */
  async findWithRelations(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          posts: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          projects: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              posts: true,
              projects: true,
            },
          },
        },
      })
    } catch (error) {
      throw new Error(`Failed to fetch user with relations ${id}: ${error}`)
    }
  }
}

// 싱글톤 인스턴스 생성
export const userRepository = new UserRepository()
