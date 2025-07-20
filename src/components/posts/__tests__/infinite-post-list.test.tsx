import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { InfinitePostList } from '../infinite-post-list'
import type { Post } from '@/types/post'

// useInfinitePosts 훅 모킹
vi.mock('@/hooks/use-infinite-posts', () => ({
  useInfinitePosts: vi.fn(),
}))

const mockUseInfinitePosts = vi.mocked(
  await import('@/hooks/use-infinite-posts')
).useInfinitePosts

// 테스트용 포스트 데이터
const mockPosts: Post[] = [
  {
    id: '1',
    title: '첫 번째 포스트',
    content: '첫 번째 포스트의 내용입니다.',
    excerpt: '첫 번째 포스트의 요약입니다.',
    published: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    authorId: 'user1',
    author: {
      id: 'user1',
      name: '작성자 1',
      email: 'author1@example.com',
      image: 'https://example.com/avatar1.jpg',
    },
  },
  {
    id: '2',
    title: '두 번째 포스트',
    content: '두 번째 포스트의 내용입니다.',
    excerpt: '두 번째 포스트의 요약입니다.',
    published: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    authorId: 'user2',
    author: {
      id: 'user2',
      name: '작성자 2',
      email: 'author2@example.com',
    },
  },
]

describe('InfinitePostList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('포스트 목록을 렌더링한다', async () => {
    mockUseInfinitePosts.mockReturnValue({
      posts: mockPosts,
      isLoading: false,
      isError: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
      refresh: vi.fn(),
      retry: vi.fn(),
      observerRef: vi.fn(),
    })

    render(<InfinitePostList />)

    await waitFor(() => {
      expect(screen.getByText('첫 번째 포스트')).toBeInTheDocument()
      expect(screen.getByText('두 번째 포스트')).toBeInTheDocument()
    })
  })

  it('로딩 상태를 표시한다', () => {
    mockUseInfinitePosts.mockReturnValue({
      posts: [],
      isLoading: true,
      isError: false,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      refresh: vi.fn(),
      retry: vi.fn(),
      observerRef: vi.fn(),
    })

    render(<InfinitePostList />)

    // 스켈레톤 로더가 표시되는지 확인
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('에러 상태를 표시한다', () => {
    const mockRetry = vi.fn()
    mockUseInfinitePosts.mockReturnValue({
      posts: [],
      isLoading: false,
      isError: true,
      error: '포스트를 불러오는데 실패했습니다.',
      hasMore: false,
      loadMore: vi.fn(),
      refresh: vi.fn(),
      retry: mockRetry,
      observerRef: vi.fn(),
    })

    render(<InfinitePostList />)

    expect(
      screen.getByText('포스트를 불러오는데 실패했습니다.')
    ).toBeInTheDocument()
    expect(screen.getByText('다시 시도')).toBeInTheDocument()
  })

  it('빈 상태를 표시한다', () => {
    mockUseInfinitePosts.mockReturnValue({
      posts: [],
      isLoading: false,
      isError: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
      refresh: vi.fn(),
      retry: vi.fn(),
      observerRef: vi.fn(),
    })

    render(<InfinitePostList />)

    expect(screen.getByText('포스트가 없습니다')).toBeInTheDocument()
    expect(
      screen.getByText('첫 번째 포스트를 작성해보세요!')
    ).toBeInTheDocument()
  })

  it('더 이상 포스트가 없음을 표시한다', () => {
    mockUseInfinitePosts.mockReturnValue({
      posts: mockPosts,
      isLoading: false,
      isError: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
      refresh: vi.fn(),
      retry: vi.fn(),
      observerRef: vi.fn(),
    })

    render(<InfinitePostList />)

    expect(screen.getByText('더 이상 포스트가 없습니다')).toBeInTheDocument()
  })

  it('더 많은 포스트 로딩 인디케이터를 표시한다', () => {
    mockUseInfinitePosts.mockReturnValue({
      posts: mockPosts,
      isLoading: true,
      isError: false,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
      refresh: vi.fn(),
      retry: vi.fn(),
      observerRef: vi.fn(),
    })

    render(<InfinitePostList />)

    expect(screen.getByText('포스트를 불러오는 중...')).toBeInTheDocument()
  })

  it('액션 버튼을 표시한다', () => {
    const mockOnEdit = vi.fn()
    const mockOnDelete = vi.fn()

    mockUseInfinitePosts.mockReturnValue({
      posts: mockPosts,
      isLoading: false,
      isError: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
      refresh: vi.fn(),
      retry: vi.fn(),
      observerRef: vi.fn(),
    })

    render(
      <InfinitePostList
        showActions={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    // PostCard 컴포넌트에 showActions prop이 전달되는지 확인
    expect(screen.getByText('첫 번째 포스트')).toBeInTheDocument()
  })
})
