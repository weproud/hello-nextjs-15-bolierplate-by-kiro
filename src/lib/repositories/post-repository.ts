import { dbErrors, prisma } from '@/lib/prisma'
import {
  AbstractRepository,
  BaseRepository,
  DuplicateError,
  NotFoundError,
  type PaginatedResult,
  type PaginationOptions,
  type SortOptions,
} from '@/lib/repositories/base-repository'
import type { Post, Prisma } from '@prisma/client'

/**
 * Post 모델에 대한 Repository 클래스
 * 포스트 관련 데이터베이스 작업을 담당합니다.
 */
export class PostRepository
  extends AbstractRepository
  implements
    BaseRepository<
      Post,
      Prisma.PostCreateInput,
      Prisma.PostUpdateInput,
      Prisma.PostWhereInput,
      Prisma.PostOrderByWithRelationInput
    >
{
  /**
   * 모든 포스트 조회 (페이지네이션 및 필터링 지원)
   */
  async findMany(options?: {
    where?: Prisma.PostWhereInput
    orderBy?: Prisma.PostOrderByWithRelationInput
    take?: number
    skip?: number
    include?: Prisma.PostInclude
  }): Promise<Post[]> {
    try {
      return await prisma.post.findMany({
        where: options?.where,
        orderBy: options?.orderBy ?? { createdAt: 'desc' },
        take: options?.take,
        skip: options?.skip,
        include: options?.include,
      })
    } catch (error) {
      throw new Error(`Failed to fetch posts: ${error}`)
    }
  }

  /**
   * 페이지네이션된 포스트 목록 조회
   */
  async findManyPaginated(
    options?: {
      where?: Prisma.PostWhereInput
      include?: Prisma.PostInclude
    } & PaginationOptions &
      SortOptions<Post>
  ): Promise<PaginatedResult<Post>> {
    try {
      const { skip, take, page, limit } = this.buildPagination(options)
      const orderBy = this.buildSort(options)

      const [data, total] = await Promise.all([
        prisma.post.findMany({
          where: options?.where,
          orderBy,
          skip,
          take,
          include: options?.include,
        }),
        prisma.post.count({ where: options?.where }),
      ])

      return this.createPaginatedResult(data, total, page, limit)
    } catch (error) {
      throw new Error(`Failed to fetch paginated posts: ${error}`)
    }
  }

  /**
   * ID로 포스트 조회
   */
  async findById(
    id: string,
    include?: Prisma.PostInclude
  ): Promise<Post | null> {
    try {
      return await prisma.post.findUnique({
        where: { id },
        include,
      })
    } catch (error) {
      throw new Error(`Failed to fetch post by id ${id}: ${error}`)
    }
  }

  /**
   * 슬러그로 포스트 조회
   */
  async findBySlug(
    slug: string,
    include?: Prisma.PostInclude
  ): Promise<Post | null> {
    try {
      return await prisma.post.findUnique({
        where: { slug },
        include,
      })
    } catch (error) {
      throw new Error(`Failed to fetch post by slug ${slug}: ${error}`)
    }
  }

  /**
   * 조건에 맞는 첫 번째 포스트 조회
   */
  async findFirst(options: {
    where: Prisma.PostWhereInput
    include?: Prisma.PostInclude
  }): Promise<Post | null> {
    try {
      return await prisma.post.findFirst({
        where: options.where,
        include: options.include,
      })
    } catch (error) {
      throw new Error(`Failed to fetch first post: ${error}`)
    }
  }

  /**
   * 포스트 수 조회
   */
  async count(where?: Prisma.PostWhereInput): Promise<number> {
    try {
      return await prisma.post.count({ where })
    } catch (error) {
      throw new Error(`Failed to count posts: ${error}`)
    }
  }

  /**
   * 새 포스트 생성
   */
  async create(
    data: Prisma.PostCreateInput,
    include?: Prisma.PostInclude
  ): Promise<Post> {
    try {
      return await prisma.post.create({
        data,
        include,
      })
    } catch (error) {
      if (dbErrors.isUniqueConstraintError(error)) {
        throw new DuplicateError('Post', 'slug')
      }
      throw new Error(`Failed to create post: ${error}`)
    }
  }

  /**
   * 여러 포스트 생성
   */
  async createMany(data: Prisma.PostCreateInput[]): Promise<{ count: number }> {
    try {
      return await prisma.post.createMany({
        data,
        skipDuplicates: true,
      })
    } catch (error) {
      throw new Error(`Failed to create multiple posts: ${error}`)
    }
  }

  /**
   * 포스트 업데이트
   */
  async update(
    id: string,
    data: Prisma.PostUpdateInput,
    include?: Prisma.PostInclude
  ): Promise<Post> {
    try {
      return await prisma.post.update({
        where: { id },
        data,
        include,
      })
    } catch (error) {
      if (dbErrors.isRecordNotFoundError(error)) {
        throw new NotFoundError('Post', id)
      }
      if (dbErrors.isUniqueConstraintError(error)) {
        throw new DuplicateError('Post', 'slug')
      }
      throw new Error(`Failed to update post ${id}: ${error}`)
    }
  }

  /**
   * 여러 포스트 업데이트
   */
  async updateMany(
    where: Prisma.PostWhereInput,
    data: Prisma.PostUpdateInput
  ): Promise<{ count: number }> {
    try {
      return await prisma.post.updateMany({
        where,
        data,
      })
    } catch (error) {
      throw new Error(`Failed to update multiple posts: ${error}`)
    }
  }

  /**
   * 포스트 삭제
   */
  async delete(id: string): Promise<Post> {
    try {
      return await prisma.post.delete({
        where: { id },
      })
    } catch (error) {
      if (dbErrors.isRecordNotFoundError(error)) {
        throw new NotFoundError('Post', id)
      }
      throw new Error(`Failed to delete post ${id}: ${error}`)
    }
  }

  /**
   * 여러 포스트 삭제
   */
  async deleteMany(where: Prisma.PostWhereInput): Promise<{ count: number }> {
    try {
      return await prisma.post.deleteMany({ where })
    } catch (error) {
      throw new Error(`Failed to delete multiple posts: ${error}`)
    }
  }

  /**
   * 포스트 존재 여부 확인
   */
  async exists(where: Prisma.PostWhereInput): Promise<boolean> {
    try {
      const post = await prisma.post.findFirst({ where })
      return post !== null
    } catch (error) {
      throw new Error(`Failed to check post existence: ${error}`)
    }
  }

  /**
   * 슬러그 존재 여부 확인
   */
  async existsBySlug(slug: string): Promise<boolean> {
    return this.exists({ slug })
  }

  /**
   * 발행된 포스트 조회
   */
  async findPublished(
    options?: PaginationOptions & { include?: Prisma.PostInclude }
  ): Promise<PaginatedResult<Post>> {
    return this.findManyPaginated({
      where: { published: true },
      include: options?.include,
      page: options?.page,
      limit: options?.limit,
    })
  }

  /**
   * 초안 포스트 조회
   */
  async findDrafts(
    authorId?: string,
    options?: PaginationOptions & { include?: Prisma.PostInclude }
  ): Promise<PaginatedResult<Post>> {
    const where: Prisma.PostWhereInput = { published: false }
    if (authorId) {
      where.authorId = authorId
    }

    return this.findManyPaginated({
      where,
      include: options?.include,
      page: options?.page,
      limit: options?.limit,
    })
  }

  /**
   * 특정 작성자의 포스트 조회
   */
  async findByAuthor(
    authorId: string,
    options?: PaginationOptions & {
      published?: boolean
      include?: Prisma.PostInclude
    }
  ): Promise<PaginatedResult<Post>> {
    const where: Prisma.PostWhereInput = { authorId }
    if (options?.published !== undefined) {
      where.published = options.published
    }

    return this.findManyPaginated({
      where,
      include: options?.include,
      page: options?.page,
      limit: options?.limit,
    })
  }

  /**
   * 포스트 검색 (제목, 내용, 요약으로)
   */
  async search(
    query: string,
    options?: PaginationOptions & {
      published?: boolean
      include?: Prisma.PostInclude
    }
  ): Promise<PaginatedResult<Post>> {
    const where: Prisma.PostWhereInput = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
      ],
    }

    if (options?.published !== undefined) {
      where.published = options.published
    }

    return this.findManyPaginated({
      where,
      include: options?.include,
      page: options?.page,
      limit: options?.limit,
    })
  }

  /**
   * 최근 포스트 조회
   */
  async findRecent(
    limit = 5,
    options?: { published?: boolean; include?: Prisma.PostInclude }
  ): Promise<Post[]> {
    const where: Prisma.PostWhereInput = {}
    if (options?.published !== undefined) {
      where.published = options.published
    }

    return this.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: options?.include,
    })
  }

  /**
   * 인기 포스트 조회 (최근 30일 기준)
   */
  async findPopular(
    limit = 10,
    options?: { include?: Prisma.PostInclude }
  ): Promise<Post[]> {
    // 실제로는 조회수나 좋아요 수 등을 기준으로 해야 하지만,
    // 현재 스키마에는 해당 필드가 없으므로 최근 발행된 포스트로 대체
    return this.findMany({
      where: {
        published: true,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30일 전
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: options?.include,
    })
  }

  /**
   * 포스트 통계 조회
   */
  async getStats(authorId?: string) {
    try {
      const where: Prisma.PostWhereInput = authorId ? { authorId } : {}

      const [totalPosts, publishedPosts, draftPosts, recentPosts] =
        await Promise.all([
          this.count(where),
          this.count({ ...where, published: true }),
          this.count({ ...where, published: false }),
          this.count({
            ...where,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
            },
          }),
        ])

      return {
        total: totalPosts,
        published: publishedPosts,
        drafts: draftPosts,
        recent: recentPosts,
      }
    } catch (error) {
      throw new Error(`Failed to get post stats: ${error}`)
    }
  }

  /**
   * 포스트 발행
   */
  async publish(id: string): Promise<Post> {
    return this.update(id, { published: true })
  }

  /**
   * 포스트 발행 취소
   */
  async unpublish(id: string): Promise<Post> {
    return this.update(id, { published: false })
  }

  /**
   * 슬러그 생성 (제목 기반)
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  /**
   * 고유한 슬러그 생성
   */
  async generateUniqueSlug(title: string): Promise<string> {
    let baseSlug = this.generateSlug(title)
    let slug = baseSlug
    let counter = 1

    while (await this.existsBySlug(slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  /**
   * 포스트와 작성자 정보 함께 조회
   */
  async findWithAuthor(id: string) {
    try {
      return await prisma.post.findUnique({
        where: { id },
        include: {
          author: {
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
      throw new Error(`Failed to fetch post with author ${id}: ${error}`)
    }
  }
}

// 싱글톤 인스턴스 생성
export const postRepository = new PostRepository()
