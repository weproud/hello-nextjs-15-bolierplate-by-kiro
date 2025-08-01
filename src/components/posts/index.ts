/**
 * Posts Components
 *
 * 포스트 관련 컴포넌트들을 중앙에서 관리하고 내보냅니다.
 */

// Core post components
export { PostForm } from './post-form'
export { PostCard } from './post-card'
export { InfinitePostList } from './infinite-post-list'

// Demo and test components
export { PostCardTest } from './post-card-test'
export { InfinitePostListDemo } from './infinite-post-list-demo'
export { InfinitePostsDemo } from './infinite-posts-demo'

// Re-export types from the central types system
export type {
  Post,
  PostFormData,
  PostCardProps,
  PostFormProps,
  InfinitePostListProps,
  UseInfinitePostsReturn,
  PostActionResult,
  CreatePostResult,
  UpdatePostResult,
  DeletePostResult,
  GetPostResult,
  GetPostsResult,
} from '@/types'
