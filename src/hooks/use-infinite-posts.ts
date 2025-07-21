'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getPostsAction } from '@/lib/actions/post-actions'
import type { Post } from '@/types/post'

interface UseInfinitePostsOptions {
  initialPosts?: Post[]
  initialHasMore?: boolean
  limit?: number
  published?: boolean
  authorId?: string
}

interface UseInfinitePostsReturn {
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

/**
 * 무한 스크롤 포스트 목록을 위한 커스텀 훅
 * Intersection Observer API를 사용하여 자동 로딩 구현
 */
export function useInfinitePosts({
  initialPosts = [],
  initialHasMore = true,
  limit = 6,
  published = true,
  authorId,
}: UseInfinitePostsOptions = {}): UseInfinitePostsReturn {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [cursor, setCursor] = useState<string | null>(
    initialPosts.length > 0
      ? initialPosts[initialPosts.length - 1]?.id || null
      : null
  )

  // Intersection Observer 참조
  const observer = useRef<IntersectionObserver | null>(null)
  const loadMoreTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * 포스트 로드 함수
   */
  const loadPosts = useCallback(
    async (isRefresh = false) => {
      if (isLoading) return
      if (!isRefresh && !hasMore) return

      setIsLoading(true)
      setIsError(false)
      setError(null)

      try {
        const result = await getPostsAction({
          cursor: isRefresh ? null : cursor,
          limit,
          published,
          authorId,
        })

        console.log('getPostsAction result:', result)

        if (result?.data?.success && Array.isArray(result.data.posts)) {
          const newPosts = result.data.posts
          const pagination = result.data.pagination

          if (isRefresh) {
            setPosts(newPosts)
            setCursor(
              newPosts.length > 0
                ? newPosts[newPosts.length - 1]?.id || null
                : null
            )
          } else {
            setPosts(prevPosts => {
              // 중복 제거를 위해 기존 포스트 ID 세트 생성
              const existingIds = new Set(prevPosts.map(post => post.id))
              const uniqueNewPosts = newPosts.filter(
                post => !existingIds.has(post.id)
              )
              return [...prevPosts, ...uniqueNewPosts]
            })
            setCursor(pagination?.nextCursor || null)
          }

          setHasMore(pagination?.hasMore || false)
        } else {
          console.error('getPostsAction failed:', result)
          throw new Error(
            result?.data?.error?.message ||
              result?.data?.error ||
              result?.error?.message ||
              result?.error ||
              '포스트를 불러오는데 실패했습니다.'
          )
        }
      } catch (err) {
        console.error('Failed to load posts:', err)
        setIsError(true)
        setError(
          err instanceof Error
            ? err.message
            : '포스트를 불러오는데 실패했습니다.'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [cursor, hasMore, isLoading, limit, published, authorId]
  )

  /**
   * 더 많은 포스트 로드 (디바운싱 적용)
   */
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      // 기존 타이머 취소
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current)
      }

      // 짧은 지연 후 로드 (중복 요청 방지)
      loadMoreTimeoutRef.current = setTimeout(() => {
        loadPosts(false)
      }, 100)
    }
  }, [loadPosts, isLoading, hasMore])

  /**
   * 포스트 목록 새로고침
   */
  const refresh = useCallback(() => {
    setHasMore(true)
    setIsError(false)
    setError(null)
    setCursor(null)
    loadPosts(true)
  }, [loadPosts])

  /**
   * 에러 상태 초기화 및 재시도
   */
  const retry = useCallback(() => {
    if (isError) {
      setIsError(false)
      setError(null)
      loadPosts(false)
    }
  }, [isError, loadPosts])

  /**
   * Intersection Observer 콜백 참조
   */
  const observerRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver(
        entries => {
          if (entries[0]?.isIntersecting && hasMore && !isLoading) {
            loadMore()
          }
        },
        {
          threshold: 0.1,
          rootMargin: '200px', // 200px 전에 미리 로드하여 더 부드러운 경험 제공
        }
      )

      if (node) observer.current.observe(node)
    },
    [loadMore, hasMore, isLoading]
  )

  // 컴포넌트 언마운트 시 observer 및 타이머 정리
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current)
      }
    }
  }, [])

  // 초기 데이터가 없을 때 첫 로드
  useEffect(() => {
    if (posts.length === 0 && !isLoading && hasMore) {
      loadPosts(true)
    }
  }, []) // 의존성 배열을 비워서 마운트 시에만 실행

  // 디버그 로깅 (개발 환경에서만)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('useInfinitePosts state:', {
        postsCount: posts.length,
        isLoading,
        isError,
        hasMore,
        cursor,
      })
    }
  }, [posts.length, isLoading, isError, hasMore, cursor])

  return {
    posts,
    isLoading,
    isError,
    error,
    hasMore,
    loadMore,
    refresh,
    retry,
    observerRef,
  }
}

/**
 * 특정 사용자의 포스트를 위한 무한 스크롤 훅
 */
export function useInfiniteUserPosts(
  userId: string,
  options: Omit<UseInfinitePostsOptions, 'authorId'> = {}
) {
  return useInfinitePosts({
    ...options,
    authorId: userId,
  })
}

/**
 * 공개된 포스트만을 위한 무한 스크롤 훅
 */
export function useInfinitePublishedPosts(
  options: Omit<UseInfinitePostsOptions, 'published'> = {}
) {
  return useInfinitePosts({
    ...options,
    published: true,
  })
}

/**
 * 모든 포스트(공개/비공개)를 위한 무한 스크롤 훅
 */
export function useInfiniteAllPosts(
  options: Omit<UseInfinitePostsOptions, 'published'> = {}
) {
  return useInfinitePosts({
    ...options,
    published: undefined,
  })
}
