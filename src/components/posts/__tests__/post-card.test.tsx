import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PostCard } from '../post-card'
import type { Post } from '@/types'

// 테스트용 더미 데이터
const mockPost: Post = {
  id: 'test-post-1',
  title: '테스트 포스트 제목',
  content: '<p>이것은 <strong>테스트</strong> 포스트 내용입니다.</p>',
  excerpt: '이것은 테스트 포스트 내용입니다.',
  slug: 'test-post',
  published: true,
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-16T10:00:00Z'),
  authorId: 'user-1',
  author: {
    id: 'user-1',
    name: '김개발',
    email: 'developer@example.com',
    image: undefined,
  },
}

const mockDraftPost: Post = {
  ...mockPost,
  id: 'test-post-2',
  title: '초안 포스트',
  published: false,
  excerpt: undefined,
  author: {
    id: 'user-2',
    name: '',
    email: 'user@example.com',
    image: 'https://example.com/avatar.jpg',
  },
}

describe('PostCard', () => {
  it('포스트 제목과 내용을 올바르게 렌더링한다', () => {
    render(<PostCard post={mockPost} />)

    expect(screen.getByText('테스트 포스트 제목')).toBeInTheDocument()
    expect(
      screen.getByText('이것은 테스트 포스트 내용입니다.')
    ).toBeInTheDocument()
  })

  it('작성자 정보를 올바르게 표시한다', () => {
    render(<PostCard post={mockPost} />)

    expect(screen.getByText('김개발')).toBeInTheDocument()
  })

  it('작성자 이름이 없을 때 이메일을 표시한다', () => {
    render(<PostCard post={mockDraftPost} />)

    expect(screen.getByText('user@example.com')).toBeInTheDocument()
  })

  it('작성일을 올바른 형식으로 표시한다', () => {
    render(<PostCard post={mockPost} />)

    expect(screen.getByText('2024년 1월 15일')).toBeInTheDocument()
  })

  it('게시된 포스트에 "게시됨" 배지를 표시한다', () => {
    render(<PostCard post={mockPost} />)

    expect(screen.getByText('게시됨')).toBeInTheDocument()
  })

  it('초안 포스트에 "초안" 배지를 표시한다', () => {
    render(<PostCard post={mockDraftPost} />)

    expect(screen.getByText('초안')).toBeInTheDocument()
  })

  it('excerpt가 없을 때 content에서 자동으로 요약을 생성한다', () => {
    render(<PostCard post={mockDraftPost} />)

    // HTML 태그가 제거된 텍스트가 표시되어야 함
    expect(
      screen.getByText(/이것은 테스트 포스트 내용입니다/)
    ).toBeInTheDocument()
  })

  it('포스트 상세 페이지로의 링크가 올바르게 설정된다', () => {
    render(<PostCard post={mockPost} />)

    const titleLink = screen.getByRole('link', { name: /테스트 포스트 제목/ })
    const detailLink = screen.getByRole('link', { name: /자세히 보기/ })

    expect(titleLink).toHaveAttribute('href', '/posts/test-post-1')
    expect(detailLink).toHaveAttribute('href', '/posts/test-post-1')
  })

  it('showActions가 true일 때 액션 버튼을 표시한다', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <PostCard
        post={mockPost}
        showActions={true}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    // 드롭다운 메뉴 버튼이 있어야 함
    const menuButton = screen.getByRole('button')
    expect(menuButton).toBeInTheDocument()
  })

  it('편집 버튼 클릭 시 onEdit 콜백이 호출된다', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <PostCard
        post={mockPost}
        showActions={true}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    // 드롭다운 메뉴 열기
    const menuButton = screen.getByRole('button')
    fireEvent.click(menuButton)

    // 편집 버튼 클릭
    const editButton = screen.getByText('편집')
    fireEvent.click(editButton)

    expect(onEdit).toHaveBeenCalledWith('test-post-1')
  })

  it('삭제 버튼 클릭 시 onDelete 콜백이 호출된다', async () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(
      <PostCard
        post={mockPost}
        showActions={true}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )

    // 드롭다운 메뉴 열기
    const menuButton = screen.getByRole('button')
    fireEvent.click(menuButton)

    // 삭제 버튼 클릭
    const deleteButton = screen.getByText('삭제')
    fireEvent.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith('test-post-1')
  })

  it('커스텀 className이 적용된다', () => {
    const { container } = render(
      <PostCard post={mockPost} className="custom-class" />
    )

    const card = container.querySelector('.custom-class')
    expect(card).toBeInTheDocument()
  })

  it('작성자 아바타가 올바르게 렌더링된다', () => {
    render(<PostCard post={mockPost} />)

    const avatar = screen.getByRole('img', { name: '김개발' })
    expect(avatar).toBeInTheDocument()
  })

  it('작성자 이미지가 있을 때 아바타에 이미지를 표시한다', () => {
    render(<PostCard post={mockDraftPost} />)

    const avatar = screen.getByRole('img', { name: 'user@example.com' })
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })
})
