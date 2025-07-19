// 포스트 관련 타입 정의
export interface Post {
  id: string
  title: string
  content: string
  excerpt?: string
  slug?: string
  published: boolean
  createdAt: Date
  updatedAt: Date
  authorId: string
  author: {
    id: string
    name: string
    email: string
    image?: string
  }
}

// 포스트 생성/수정을 위한 폼 데이터 타입
export interface PostFormData {
  title: string
  content: string
  published?: boolean
}

// 포스트 카드 컴포넌트 props 타입
export interface PostCardProps {
  post: Post
  className?: string
}

// 포스트 폼 컴포넌트 props 타입
export interface PostFormProps {
  initialData?: Partial<PostFormData>
  onSubmit: (data: PostFormData) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

// 무한 스크롤 포스트 목록 타입
export interface InfinitePostListProps {
  initialPosts: Post[]
  hasMore: boolean
  className?: string
}

// 무한 스크롤 훅 반환 타입
export interface UseInfinitePostsReturn {
  posts: Post[]
  isLoading: boolean
  isError: boolean
  hasMore: boolean
  loadMore: () => void
}

// 포스트 에러 타입
export interface PostError {
  type: 'VALIDATION' | 'NETWORK' | 'PERMISSION' | 'NOT_FOUND'
  message: string
  field?: string
}

// Server Action 결과 타입
export interface PostActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: {
    message: string
    code: string
    field?: string
  }
}
