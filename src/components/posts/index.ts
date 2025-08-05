/**
 * Posts Components
 *
 * 포스트 관련 컴포넌트들을 중앙에서 관리하고 내보냅니다.
 */

// Core post components
export { InfinitePostList } from '@/components/posts/infinite-post-list'
export { PostCard } from '@/components/posts/post-card'
export { PostForm } from '@/components/posts/post-form'

// Demo and test components
export { InfinitePostListDemo } from '@/components/posts/infinite-post-list-demo'
export { InfinitePostsDemo } from '@/components/posts/infinite-posts-demo'
export { PostCardTest } from '@/components/posts/post-card-test'

// Re-export types from the central types system
export type {
  CreatePostResult,
  DeletePostResult,
  GetPostResult,
  GetPostsResult,
  InfinitePostListProps,
  Post,
  PostActionResult,
  PostCardProps,
  PostFormData,
  PostFormProps,
  UpdatePostResult,
  UseInfinitePostsReturn,
} from '@/types'
