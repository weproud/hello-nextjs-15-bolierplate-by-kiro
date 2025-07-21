'use client'

import { memo } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

import { PostCard } from './post-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { useInfinitePosts } from '@/hooks/use-infinite-posts'
import type { Post } from '@/types/post'
import { cn } from '@/lib/utils'

interface InfinitePostListProps {
  initialPosts?: Post[]
  initialHasMore?: boolean
  className?: string
  showActions?: boolean
  onEdit?: (postId: string) => void
  onDelete?: (postId: string) => void
  limit?: number
  published?: boolean
  authorId?: string
}

// 포스트 카드 스켈레톤 컴포넌트
const PostCardSkeleton = memo(function PostCardSkeleton() {
  return (
    <div
      className="border border-border/50 rounded-lg p-6 bg-card/50 backdrop-blur-sm"
      data-testid="skeleton"
    >
      {/* 헤더 */}
      <div className="space-y-3 mb-4">
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>

      {/* 메타 정보 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <Skeleton className="h-5 w-12" />
      </div>

      {/* 하단 링크 */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
})

// 로딩 스켈레톤 그리드
const LoadingSkeleton = memo(function LoadingSkeleton({
  count = 3,
}: {
  count?: number
}) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <PostCardSkeleton key={`skeleton-${index}`} />
      ))}
    </>
  )
})

// 에러 상태 컴포넌트
const ErrorState = memo(function ErrorState({
  error,
  onRetry,
}: {
  error: string
  onRetry: () => void
}) {
  return (
    <div className="col-span-full">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
})

// 빈 상태 컴포넌트
const EmptyState = memo(function EmptyState() {
  return (
    <div className="col-span-full text-center py-12">
      <div className="text-muted-foreground">
        <div className="text-lg font-medium mb-2">포스트가 없습니다</div>
        <p className="text-sm">첫 번째 포스트를 작성해보세요!</p>
      </div>
    </div>
  )
})

// 더 이상 포스트가 없음을 알리는 컴포넌트
const NoMorePosts = memo(function NoMorePosts() {
  return (
    <div className="col-span-full text-center py-8">
      <div className="text-muted-foreground">
        <div className="text-sm">더 이상 포스트가 없습니다</div>
      </div>
    </div>
  )
})

// 로딩 더보기 인디케이터
const LoadMoreIndicator = memo(function LoadMoreIndicator() {
  return (
    <>
      {/* 추가 로딩 스켈레톤 */}
      <LoadingSkeleton count={3} />
      <div className="col-span-full text-center py-4">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">더 많은 포스트를 불러오는 중...</span>
        </div>
      </div>
    </>
  )
})

export const InfinitePostList = memo(function InfinitePostList({
  initialPosts = [],
  initialHasMore = true,
  className,
  showActions = false,
  onEdit,
  onDelete,
  limit = 6,
  published = true,
  authorId,
}: InfinitePostListProps) {
  const { posts, isLoading, isError, error, hasMore, retry, observerRef } =
    useInfinitePosts({
      initialPosts,
      initialHasMore,
      limit,
      published,
      authorId,
    })

  // 초기 로딩 상태 (포스트가 없고 로딩 중)
  const isInitialLoading = posts.length === 0 && isLoading

  // 더 많은 포스트 로딩 상태 (포스트가 있고 로딩 중)
  const isLoadingMore = posts.length > 0 && isLoading

  return (
    <div className={cn('w-full', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 에러 상태 */}
        {isError && error && <ErrorState error={error} onRetry={retry} />}

        {/* 초기 로딩 상태 */}
        {isInitialLoading && <LoadingSkeleton count={limit} />}

        {/* 포스트 목록 */}
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            showActions={showActions}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {/* 빈 상태 (에러가 없고 포스트가 없을 때) */}
        {!isError && !isInitialLoading && posts.length === 0 && <EmptyState />}

        {/* 더 많은 포스트 로딩 인디케이터 */}
        {isLoadingMore && <LoadMoreIndicator />}

        {/* 더 이상 포스트가 없음 */}
        {!isLoading && !hasMore && posts.length > 0 && <NoMorePosts />}
      </div>

      {/* Intersection Observer 타겟 */}
      {hasMore && !isLoading && !isError && (
        <div
          ref={observerRef}
          className="h-20 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="text-muted-foreground text-sm">
            스크롤하여 더 많은 포스트 보기
          </div>
        </div>
      )}
    </div>
  )
})

InfinitePostList.displayName = 'InfinitePostList'
