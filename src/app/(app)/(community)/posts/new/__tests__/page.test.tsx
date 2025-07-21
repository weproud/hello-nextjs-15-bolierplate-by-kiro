import { render, screen } from '@testing-library/react'
import { auth } from '@/auth'
import NewPostPage from '../page'

// Mock auth
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}))

// Mock redirect
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

// Mock PostForm component
jest.mock('@/components/posts/post-form', () => ({
  PostForm: ({ mode }: { mode: string }) => (
    <div data-testid="post-form">PostForm - Mode: {mode}</div>
  ),
}))

const mockAuth = auth as jest.MockedFunction<typeof auth>

describe('NewPostPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('인증된 사용자에게 포스트 작성 페이지를 렌더링한다', async () => {
    // Mock authenticated user
    mockAuth.mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
      },
      expires: '2024-12-31',
    })

    render(await NewPostPage())

    // Check if page elements are rendered
    expect(screen.getByText('새 포스트 작성')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Tiptap 에디터를 사용하여 리치 텍스트 블로그 포스트를 작성하세요.'
      )
    ).toBeInTheDocument()
    expect(screen.getByTestId('post-form')).toBeInTheDocument()
    expect(screen.getByText('PostForm - Mode: create')).toBeInTheDocument()

    // Check help section
    expect(screen.getByText('에디터 사용 팁')).toBeInTheDocument()
    expect(screen.getByText('헤딩 사용법')).toBeInTheDocument()
    expect(screen.getByText('텍스트 서식')).toBeInTheDocument()
  })

  it('비인증 사용자를 로그인 페이지로 리다이렉트한다', async () => {
    const { redirect } = require('next/navigation')

    // Mock unauthenticated user
    mockAuth.mockResolvedValue(null)

    await NewPostPage()

    expect(redirect).toHaveBeenCalledWith('/auth/signin?callbackUrl=/posts/new')
  })
})
