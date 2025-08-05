/**
 * Post Type Definitions
 *
 * 포스트 관련 타입들을 정의합니다.
 */

import type { BaseEntity } from '@/types/common'

// Post Entity Types - 포스트 엔티티 타입들
export interface Post extends BaseEntity {
  title: string
  content: string
  excerpt?: string | null
  slug?: string | null
  published: boolean
  authorId: string
  author: {
    id: string
    name: string | null
    email: string
    image?: string | null
  }
}

// Post Form Types - 포스트 폼 관련 타입들
export interface PostFormData {
  title: string
  content: string
  excerpt?: string
  published?: boolean
}

export interface PostDraftData {
  title?: string
  content?: string
}

// Post Component Props - 포스트 컴포넌트 props 타입들
export interface PostCardProps {
  post: Post
  className?: string
  showActions?: boolean
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
}

export interface PostFormProps {
  initialData?: Partial<PostFormData>
  onSubmit: (data: PostFormData) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export interface InfinitePostListProps {
  initialPosts: Post[]
  hasMore: boolean
  className?: string
}

// Post Hook Types - 포스트 훅 관련 타입들
export interface UseInfinitePostsReturn {
  posts: Post[]
  isLoading: boolean
  isError: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
  retry: () => void
  observerRef: (node: HTMLElement | null) => void
}

export interface UseInfinitePostsOptions {
  initialPosts?: Post[]
  limit?: number
  published?: boolean
  authorId?: string
}

// Post Error Types - 포스트 에러 타입들
export interface PostError {
  type: 'VALIDATION' | 'NETWORK' | 'PERMISSION' | 'NOT_FOUND'
  message: string
  field?: string
}

// Post Action Result Types - 서버 액션 결과 타입들
export interface PostActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
    field?: string
  }
}

export interface CreatePostResult extends PostActionResult<Post> {
  post?: Post
  message?: string
}

export interface UpdatePostResult extends PostActionResult<Post> {
  post?: Post
  message?: string
}

export interface DeletePostResult extends PostActionResult {
  message?: string
}

export interface GetPostResult extends PostActionResult<Post> {
  post?: Post
}

export interface GetPostsResult extends PostActionResult<Post[]> {
  posts?: Post[]
  pagination?: {
    hasMore: boolean
    nextCursor: string | null
    limit: number
  }
}

// Post Statistics Types - 포스트 통계 타입들
export interface PostStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  postsThisMonth: number
  postsLastMonth: number
  monthlyGrowth: number
}

export interface PostAnalytics {
  postId: string
  views: number
  likes: number
  comments: number
  shares: number
  readTime: number
  bounceRate: number
}

// Post Search Types - 포스트 검색 타입들
export interface PostSearchOptions {
  query: string
  published?: boolean
  authorId?: string
  tags?: string[]
  dateRange?: {
    from?: Date
    to?: Date
  }
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'views'
  sortOrder?: 'asc' | 'desc'
}

export interface PostSearchResult {
  posts: Post[]
  totalCount: number
  searchTime: number
  suggestions?: string[]
}

// Post Metadata Types - 포스트 메타데이터 타입들
export interface PostMetadata {
  wordCount: number
  readingTime: number
  tags: string[]
  category?: string
  featuredImage?: string
  seoTitle?: string
  seoDescription?: string
}

// Post Version Types - 포스트 버전 관리 타입들
export interface PostVersion {
  id: string
  postId: string
  version: number
  title: string
  content: string
  createdAt: Date
  createdBy: string
}

export interface PostRevision {
  id: string
  postId: string
  changes: {
    field: string
    oldValue: any
    newValue: any
  }[]
  createdAt: Date
  createdBy: string
}

// Post Export/Import Types - 포스트 내보내기/가져오기 타입들
export interface PostExportOptions {
  format: 'json' | 'markdown' | 'html'
  includeMetadata: boolean
  includeImages: boolean
}

export interface PostImportData {
  title: string
  content: string
  excerpt?: string
  published: boolean
  originalId?: string
  importSource?: string
  metadata?: PostMetadata
}

// Post Validation Types - 포스트 유효성 검사 타입들
export interface PostValidationResult {
  isValid: boolean
  errors: {
    field: string
    message: string
  }[]
  warnings: {
    field: string
    message: string
  }[]
}

// Post Filter Types - 포스트 필터 타입들
export interface PostFilters {
  published?: boolean
  authorId?: string
  tags?: string[]
  category?: string
  dateRange?: {
    from?: Date
    to?: Date
  }
  hasExcerpt?: boolean
  hasSlug?: boolean
}

// Post Sort Types - 포스트 정렬 타입들
export interface PostSortOptions {
  field: 'createdAt' | 'updatedAt' | 'title' | 'published'
  order: 'asc' | 'desc'
}

// Post Pagination Types - 포스트 페이지네이션 타입들
export interface PostPaginationOptions {
  cursor?: string
  limit: number
  offset?: number
}

export interface PostPaginationResult {
  hasMore: boolean
  nextCursor?: string | null
  totalCount?: number
  currentPage?: number
  totalPages?: number
}
