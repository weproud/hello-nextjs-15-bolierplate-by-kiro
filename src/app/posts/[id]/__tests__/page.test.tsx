import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PostDetailPage from '../page'
import { auth } from '@/auth'
import { getPostAction } from '@/lib/actions/post-actions'

// Mock dependencies
vi.mock('@/auth')
vi.mock('@/lib/actions/post-actions')
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}))

const mockAuth = vi.mocked(auth)
const mockGetPostAction = vi.mocked(getPostAction)

const mockPost = {
  id: 'post-1',
  title: '테스트 포스트',
  content: '<p>테스트 포스트 내용입니다.</p>',
  excerpt: '테스트 포스트 요약',
  published: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  authorId: 'user-1',
  author: {
    id: 'user-1',
    name: '테스트 사용자',
    email: 'test@example.com',
    image: null,
  },
}

const mockSession = {
  user: {
    id: 'user-1',
    name: '테스트 사용자',
    email: 'test@example.com',
  },
}

describe('PostDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('포스트 상세 정보를 올바르게 렌더링한다', async () => {
    mockAuth.mockResolvedValue(mockSession)
    mockGetPostAction.mockResolvedValue({
      data: { post: mockPost },
    } as any)

    const component = await PostDetailPage({
      params: { id: 'post-1' },
    })

    render(component)

    // 포스트 제목 확인
    expect(screen.getByText('테스트 포스트')).toBeInTheDocument()

    // 작성자 정보 확인
    expect(screen.getByText('테스트 사용자')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()

    // 게시 상태 확인
    expect(screen.getByText('게시됨')).toBeInTheDocument()

    // 뒤로 가기 링크 확인
    expect(screen.getByText('포스트 목록으로 돌아가기')).toBeInTheDocument()
  })

  it('작성자에게만 편집/삭제 버튼을 표시한다', async () => {
    mockAuth.mockResolvedValue(mockSession)
    mockGetPostAction.mockResolvedValue({
      data: { post: mockPost },
    } as any)

    const component = await PostDetailPage({
      params: { id: 'post-1' },
    })

    render(component)

    // 편집 버튼 확인
    expect(screen.getAllByText('편집')[0]).toBeInTheDocument()

    // 삭제 버튼 확인
    expect(screen.getByText('삭제')).toBeInTheDocument()
  })

  it('다른 사용자에게는 편집/삭제 버튼을 표시하지 않는다', async () => {
    const otherUserSession = {
      user: {
        id: 'user-2',
        name: '다른 사용자',
        email: 'other@example.com',
      },
    }

    mockAuth.mockResolvedValue(otherUserSession)
    mockGetPostAction.mockResolvedValue({
      data: { post: mockPost },
    } as any)

    const component = await PostDetailPage({
      params: { id: 'post-1' },
    })

    render(component)

    // 편집/삭제 버튼이 없어야 함
    expect(screen.queryByText('편집')).not.toBeInTheDocument()
    expect(screen.queryByText('삭제')).not.toBeInTheDocument()
  })

  it('비인증 사용자에게는 편집/삭제 버튼을 표시하지 않는다', async () => {
    mockAuth.mockResolvedValue(null)
    mockGetPostAction.mockResolvedValue({
      data: { post: mockPost },
    } as any)

    const component = await PostDetailPage({
      params: { id: 'post-1' },
    })

    render(component)

    // 편집/삭제 버튼이 없어야 함
    expect(screen.queryByText('편집')).not.toBeInTheDocument()
    expect(screen.queryByText('삭제')).not.toBeInTheDocument()
  })

  it('초안 포스트에 대해 올바른 배지를 표시한다', async () => {
    const draftPost = { ...mockPost, published: false }

    mockAuth.mockResolvedValue(mockSession)
    mockGetPostAction.mockResolvedValue({
      data: { post: draftPost },
    } as any)

    const component = await PostDetailPage({
      params: { id: 'post-1' },
    })

    render(component)

    // 초안 배지 확인
    expect(screen.getByText('초안')).toBeInTheDocument()
    expect(screen.queryByText('게시됨')).not.toBeInTheDocument()
  })

  it('수정된 포스트에 대해 수정일을 표시한다', async () => {
    const updatedPost = {
      ...mockPost,
      updatedAt: new Date('2024-01-02'),
    }

    mockAuth.mockResolvedValue(mockSession)
    mockGetPostAction.mockResolvedValue({
      data: { post: updatedPost },
    } as any)

    const component = await PostDetailPage({
      params: { id: 'post-1' },
    })

    render(component)

    // 수정일 표시 확인
    expect(screen.getByText(/수정일:/)).toBeInTheDocument()
  })
})
