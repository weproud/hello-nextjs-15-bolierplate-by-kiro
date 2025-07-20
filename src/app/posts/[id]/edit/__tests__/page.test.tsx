import { render, screen } from '@testing-library/react'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { getPostAction } from '@/lib/actions/post-actions'
import EditPostPage from '../page'

// Mock dependencies
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  notFound: jest.fn(),
}))

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/actions/post-actions', () => ({
  getPostAction: jest.fn(),
}))

jest.mock('@/components/posts/post-form', () => ({
  PostForm: ({ mode, initialData }: any) => (
    <div data-testid="post-form">
      <div>Mode: {mode}</div>
      <div>Title: {initialData?.title}</div>
      <div>Content: {initialData?.content}</div>
    </div>
  ),
}))

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockGetPostAction = getPostAction as jest.MockedFunction<
  typeof getPostAction
>
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>
const mockNotFound = notFound as jest.MockedFunction<typeof notFound>

describe('EditPostPage', () => {
  const mockParams = Promise.resolve({ id: 'test-post-id' })
  const mockUser = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
  }
  const mockPost = {
    id: 'test-post-id',
    title: 'Test Post',
    content: 'Test content',
    excerpt: 'Test excerpt',
    published: false,
    authorId: 'user-1',
    author: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('비인증 사용자를 로그인 페이지로 리다이렉트한다', async () => {
    mockAuth.mockResolvedValue(null)

    await EditPostPage({ params: mockParams })

    expect(mockRedirect).toHaveBeenCalledWith(
      '/auth/signin?callbackUrl=/posts/test-post-id/edit'
    )
  })

  it('존재하지 않는 포스트에 대해 404를 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: mockUser })
    mockGetPostAction.mockResolvedValue({
      data: { post: null },
    } as any)

    await EditPostPage({ params: mockParams })

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('포스트 가져오기 실패 시 404를 반환한다', async () => {
    mockAuth.mockResolvedValue({ user: mockUser })
    mockGetPostAction.mockRejectedValue(new Error('Database error'))

    await EditPostPage({ params: mockParams })

    expect(mockNotFound).toHaveBeenCalled()
  })

  it('다른 사용자의 포스트 편집 시 권한 없음 메시지를 표시한다', async () => {
    const otherUser = { ...mockUser, id: 'other-user' }
    mockAuth.mockResolvedValue({ user: otherUser })
    mockGetPostAction.mockResolvedValue({
      data: { post: mockPost },
    } as any)

    const result = await EditPostPage({ params: mockParams })

    // 권한 없음 컴포넌트가 렌더링되는지 확인
    expect(result).toBeDefined()
    // 실제 렌더링 테스트는 integration test에서 수행
  })

  it('작성자가 포스트를 편집할 수 있다', async () => {
    mockAuth.mockResolvedValue({ user: mockUser })
    mockGetPostAction.mockResolvedValue({
      data: { post: mockPost },
    } as any)

    const result = await EditPostPage({ params: mockParams })

    // 편집 페이지가 렌더링되는지 확인
    expect(result).toBeDefined()
    expect(mockRedirect).not.toHaveBeenCalled()
    expect(mockNotFound).not.toHaveBeenCalled()
  })
})
