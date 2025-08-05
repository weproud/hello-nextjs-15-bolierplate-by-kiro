import type { Prisma } from '@prisma/client'

/**
 * 기본 Repository 인터페이스
 * 모든 Repository 클래스가 구현해야 하는 공통 메서드들을 정의합니다.
 */
export interface BaseRepository<
  T,
  CreateInput,
  UpdateInput,
  WhereInput,
  OrderByInput,
> {
  /**
   * 모든 레코드 조회 (페이지네이션 및 필터링 지원)
   */
  findMany(options?: {
    where?: WhereInput
    orderBy?: OrderByInput
    take?: number
    skip?: number
    include?: any
  }): Promise<T[]>

  /**
   * ID로 단일 레코드 조회
   */
  findById(id: string, include?: any): Promise<T | null>

  /**
   * 조건에 맞는 첫 번째 레코드 조회
   */
  findFirst(options: { where: WhereInput; include?: any }): Promise<T | null>

  /**
   * 조건에 맞는 레코드 개수 조회
   */
  count(where?: WhereInput): Promise<number>

  /**
   * 새 레코드 생성
   */
  create(data: CreateInput, include?: any): Promise<T>

  /**
   * 여러 레코드 생성
   */
  createMany(data: CreateInput[]): Promise<{ count: number }>

  /**
   * ID로 레코드 업데이트
   */
  update(id: string, data: UpdateInput, include?: any): Promise<T>

  /**
   * 조건에 맞는 여러 레코드 업데이트
   */
  updateMany(where: WhereInput, data: UpdateInput): Promise<{ count: number }>

  /**
   * ID로 레코드 삭제
   */
  delete(id: string): Promise<T>

  /**
   * 조건에 맞는 여러 레코드 삭제
   */
  deleteMany(where: WhereInput): Promise<{ count: number }>

  /**
   * 레코드 존재 여부 확인
   */
  exists(where: WhereInput): Promise<boolean>
}

/**
 * 페이지네이션 결과 타입
 */
export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

/**
 * 페이지네이션 옵션 타입
 */
export interface PaginationOptions {
  page?: number
  limit?: number
}

/**
 * 정렬 옵션 타입
 */
export interface SortOptions<T> {
  sortBy?: keyof T
  sortOrder?: 'asc' | 'desc'
}

/**
 * 기본 Repository 추상 클래스
 * 공통 유틸리티 메서드들을 제공합니다.
 */
export abstract class AbstractRepository {
  /**
   * 페이지네이션 옵션 빌드
   */
  protected buildPagination(options?: PaginationOptions) {
    const page = options?.page ?? 1
    const limit = options?.limit ?? 10
    const skip = (page - 1) * limit

    return {
      skip,
      take: limit,
      page,
      limit,
    }
  }

  /**
   * 페이지네이션 메타데이터 계산
   */
  protected calculatePaginationMeta(
    total: number,
    page: number,
    limit: number
  ) {
    const totalPages = Math.ceil(total / limit)

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    }
  }

  /**
   * 페이지네이션된 결과 생성
   */
  protected createPaginatedResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): PaginatedResult<T> {
    return {
      data,
      pagination: this.calculatePaginationMeta(total, page, limit),
    }
  }

  /**
   * 동적 where 절 빌드
   */
  protected buildDynamicWhere(filters: Record<string, any>): any {
    const where: any = {}

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && key.includes('search')) {
          // 검색 필드의 경우 OR 조건으로 처리
          where.OR = [
            { title: { contains: value, mode: 'insensitive' } },
            { description: { contains: value, mode: 'insensitive' } },
            { content: { contains: value, mode: 'insensitive' } },
          ]
        } else {
          where[key] = value
        }
      }
    })

    return where
  }

  /**
   * 정렬 옵션 빌드
   */
  protected buildSort<T>(options?: SortOptions<T>) {
    const sortBy = options?.sortBy ?? 'createdAt'
    const sortOrder = options?.sortOrder ?? 'desc'

    return {
      [sortBy as string]: sortOrder,
    }
  }
}

/**
 * Repository 에러 타입들
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public cause?: unknown
  ) {
    super(message)
    this.name = 'RepositoryError'
  }
}

export class NotFoundError extends RepositoryError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`)
    this.name = 'NotFoundError'
  }
}

export class DuplicateError extends RepositoryError {
  constructor(resource: string, field: string) {
    super(`${resource} with ${field} already exists`)
    this.name = 'DuplicateError'
  }
}

export class ValidationError extends RepositoryError {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}
