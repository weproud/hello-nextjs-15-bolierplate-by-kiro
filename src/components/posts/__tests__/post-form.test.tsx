import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PostForm } from '../post-form'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('@/lib/actions/post-actions', () => ({
  createPostAction: jest.fn(),
  updatePostAction: jest.fn(),
}))

jest.mock('@/components/editor/tiptap-editor', () => ({
  TiptapEditor: ({ onChange, content }: any) => (
    <textarea
      data-testid="tiptap-editor"
      value={content}
      onChange={e => onChange(e.target.value)}
      placeholder="포스트 내용을 입력하세요..."
    />
  ),
}))

describe('PostForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('새 포스트 작성 모드로 렌더링된다', () => {
    render(<PostForm mode="create" />)

    expect(screen.getByText('새 포스트 작성')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('포스트 제목을 입력하세요...')
    ).toBeInTheDocument()
    expect(screen.getByTestId('tiptap-editor')).toBeInTheDocument()
    expect(screen.getByText('초안 저장')).toBeInTheDocument()
  })

  it('편집 모드로 렌더링된다', () => {
    const initialData = {
      id: '1',
      title: '테스트 포스트',
      content: '<p>테스트 내용</p>',
      published: false,
    }

    render(<PostForm mode="edit" initialData={initialData} />)

    expect(screen.getByText('포스트 편집')).toBeInTheDocument()
    expect(screen.getByDisplayValue('테스트 포스트')).toBeInTheDocument()
  })

  it('제목 입력이 올바르게 작동한다', async () => {
    render(<PostForm mode="create" />)

    const titleInput =
      screen.getByPlaceholderText('포스트 제목을 입력하세요...')
    fireEvent.change(titleInput, { target: { value: '새로운 포스트 제목' } })

    expect(titleInput).toHaveValue('새로운 포스트 제목')
  })

  it('발행 상태 토글이 올바르게 작동한다', async () => {
    render(<PostForm mode="create" />)

    const publishSwitch = screen.getByRole('switch')
    expect(screen.getByText('초안')).toBeInTheDocument()

    fireEvent.click(publishSwitch)

    await waitFor(() => {
      expect(screen.getByText('발행됨')).toBeInTheDocument()
      expect(screen.getByText('포스트 발행')).toBeInTheDocument()
    })
  })

  it('필수 필드 검증이 작동한다', async () => {
    render(<PostForm mode="create" />)

    const submitButton = screen.getByText('초안 저장')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('제목을 입력해주세요.')).toBeInTheDocument()
      expect(screen.getByText('내용을 입력해주세요.')).toBeInTheDocument()
    })
  })

  it('취소 버튼이 올바르게 작동한다', () => {
    const onCancel = jest.fn()
    render(<PostForm mode="create" onCancel={onCancel} />)

    const cancelButton = screen.getByText('취소')
    fireEvent.click(cancelButton)

    expect(onCancel).toHaveBeenCalled()
  })
})
