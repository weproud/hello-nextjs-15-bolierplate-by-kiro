import { renderHook, act, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useInfinitePosts } from '../use-infinite-posts'
import type { Post } from '@/types/post'

// Mock the post actions
vi.mock('@/lib/actions/post-actions', () => ({
  getPostsAction: vi.fn(),
}))

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Test Post 1',
    content: 'Content 1',
    excerpt: 'Excerpt 1',
    slug: 'test-post-1',
    published: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    authorId: 'user1',
    author: {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.jpg',
    },
  },
  {
    id: '2',
    title: 'Test Post 2',
    content: 'Content 2',
    excerpt: 'Excerpt 2',
    slug: 'test-post-2',
    published: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    authorId: 'user1',
    author: {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.jpg',
    },
  },
]

describe('useInfinitePosts', () => {
  const { getPostsAction } = await import('@/lib/actions/post-actions')
  const mockGetPostsAction = vi.mocked(getPostsAction)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('초기 포스트와 함께 올바르게 초기화된다', () => {
    const { result } = renderHook(() =>
      useInfinitePosts({
        initialPosts: mockPosts,
        initialHasMore: true,
      })
    )

    expect(result.current.posts).toEqual(mockPosts)
    expect(result.current.hasMore).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('초기 데이터가 없을 때 자동으로 로드한다', async () => {
    mockGetPostsAction.mockResolvedValueOnce({
      success: true,
      posts: mockPosts,
      pagination: {
        hasMore: true,
        nextCursor: '2',
        limit: 10,
      },
    })

    const { result } = renderHook(() => useInfinitePosts())

    await waitFor(() => {
      expect(result.current.posts).toEqual(mockPosts)
    })

    expect(result.current.hasMore).toBe(true)
    expect(mockGetPostsAction).toHaveBeenCalledWith({
      cursor: null,
      limit: 10,
      published: true,
      authorId: undefined,
    })
  })

  it('loadMore 함수가 올바르게 작동한다', async () => {
    const additionalPosts: Post[] = [
      {
        id: '3',
        title: 'Test Post 3',
        content: 'Content 3',
        excerpt: 'Excerpt 3',
        slug: 'test-post-3',
        published: true,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        authorId: 'user1',
        author: {
          id: 'user1',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    ]

    mockGetPostsAction.mockResolvedValueOnce({
      success: true,
      posts: additionalPosts,
      pagination: {
        hasMore: false,
        nextCursor: null,
        limit: 10,
      },
    })

    const { result } = renderHook(() =>
      useInfinitePosts({
        initialPosts: mockPosts,
        initialHasMore: true,
      })
    )

    await act(async () => {
      result.current.loadMore()
    })

    await waitFor(() => {
      expect(result.current.posts).toHaveLength(3)
    })

    expect(result.current.posts).toEqual([...mockPosts, ...additionalPosts])
    expect(result.current.hasMore).toBe(false)
  })

  it('에러 상태를 올바르게 처리한다', async () => {
    const errorMessage = '포스트를 불러오는데 실패했습니다.'
    mockGetPostsAction.mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useInfinitePosts())

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBe(errorMessage)
    expect(result.current.posts).toEqual([])
  })

  it('refresh 함수가 올바르게 작동한다', async () => {
    const refreshedPosts: Post[] = [
      {
        id: '4',
        title: 'New Post',
        content: 'New Content',
        published: true,
        createdAt: new Date('2024-01-04'),
        updatedAt: new Date('2024-01-04'),
        authorId: 'user1',
        author: {
          id: 'user1',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    ]

    mockGetPostsAction.mockResolvedValueOnce({
      success: true,
      posts: refreshedPosts,
      pagination: {
        hasMore: true,
        nextCursor: '4',
        limit: 10,
      },
    })

    const { result } = renderHook(() =>
      useInfinitePosts({
        initialPosts: mockPosts,
        initialHasMore: false,
      })
    )

    await act(async () => {
      result.current.refresh()
    })

    await waitFor(() => {
      expect(result.current.posts).toEqual(refreshedPosts)
    })

    expect(result.current.hasMore).toBe(true)
    expect(mockGetPostsAction).toHaveBeenCalledWith({
      cursor: null,
      limit: 10,
      published: true,
      authorId: undefined,
    })
  })

  it('중복 포스트를 제거한다', async () => {
    const duplicatePosts: Post[] = [
      mockPosts[1], // 중복된 포스트
      {
        id: '3',
        title: 'Test Post 3',
        content: 'Content 3',
        published: true,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
        authorId: 'user1',
        author: {
          id: 'user1',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    ]

    mockGetPostsAction.mockResolvedValueOnce({
      success: true,
      posts: duplicatePosts,
      pagination: {
        hasMore: false,
        nextCursor: null,
        limit: 10,
      },
    })

    const { result } = renderHook(() =>
      useInfinitePosts({
        initialPosts: mockPosts,
        initialHasMore: true,
      })
    )

    await act(async () => {
      result.current.loadMore()
    })

    await waitFor(() => {
      expect(result.current.posts).toHaveLength(3)
    })

    // 중복된 포스트는 추가되지 않아야 함
    const postIds = result.current.posts.map(post => post.id)
    expect(postIds).toEqual(['1', '2', '3'])
  })

  it('로딩 중일 때 추가 요청을 방지한다', async () => {
    mockGetPostsAction.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                success: true,
                posts: mockPosts,
                pagination: {
                  hasMore: true,
                  nextCursor: '2',
                  limit: 10,
                },
              }),
            100
          )
        )
    )

    const { result } = renderHook(() => useInfinitePosts())

    // 첫 번째 loadMore 호출
    act(() => {
      result.current.loadMore()
    })

    expect(result.current.isLoading).toBe(true)

    // 로딩 중에 두 번째 loadMore 호출
    act(() => {
      result.current.loadMore()
    })

    // API는 한 번만 호출되어야 함
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockGetPostsAction).toHaveBeenCalledTimes(1)
  })

  it('hasMore가 false일 때 추가 요청을 방지한다', () => {
    const { result } = renderHook(() =>
      useInfinitePosts({
        initialPosts: mockPosts,
        initialHasMore: false,
      })
    )

    act(() => {
      result.current.loadMore()
    })

    expect(mockGetPostsAction).not.toHaveBeenCalled()
  })
})
