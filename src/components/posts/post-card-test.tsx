'use client'

import { PostCard } from './post-card'
import type { Post } from '@/types'

// 테스트용 더미 데이터
const mockPost: Post = {
  id: '1',
  title: '포스트 카드 컴포넌트 테스트',
  content:
    '<p>이것은 <strong>Tiptap 에디터</strong>로 작성된 테스트 포스트입니다. 포스트 카드가 제대로 렌더링되는지 확인하기 위한 샘플 콘텐츠입니다.</p><h2>헤딩 예시</h2><ul><li>첫 번째 항목</li><li>두 번째 항목</li></ul>',
  excerpt:
    '이것은 Tiptap 에디터로 작성된 테스트 포스트입니다. 포스트 카드가 제대로 렌더링되는지 확인하기 위한 샘플 콘텐츠입니다.',
  slug: 'test-post-card',
  published: true,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-16'),
  authorId: 'user1',
  author: {
    id: 'user1',
    name: '김개발',
    email: 'developer@example.com',
    image: undefined,
  },
}

const mockDraftPost: Post = {
  id: '2',
  title: '초안 상태의 포스트 예시',
  content: '<p>이것은 아직 게시되지 않은 초안 상태의 포스트입니다.</p>',
  excerpt: undefined, // excerpt가 없는 경우 테스트
  slug: 'draft-post',
  published: false,
  createdAt: new Date('2024-01-20'),
  updatedAt: new Date('2024-01-20'),
  authorId: 'user2',
  author: {
    id: 'user2',
    name: '', // 이름이 없는 경우 테스트
    email: 'user@example.com',
    image: 'https://github.com/shadcn.png',
  },
}

export function PostCardTest() {
  const handleEdit = (postId: string) => {
    console.log('편집 클릭:', postId)
  }

  const handleDelete = (postId: string) => {
    console.log('삭제 클릭:', postId)
  }

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-8'>포스트 카드 컴포넌트 테스트</h1>

      <div className='space-y-8'>
        <section>
          <h2 className='text-xl font-semibold mb-4'>기본 포스트 카드</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <PostCard post={mockPost} />
            <PostCard post={mockDraftPost} />
          </div>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-4'>
            액션 버튼이 있는 포스트 카드
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <PostCard
              post={mockPost}
              showActions={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <PostCard
              post={mockDraftPost}
              showActions={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </section>

        <section>
          <h2 className='text-xl font-semibold mb-4'>
            커스텀 스타일 포스트 카드
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <PostCard
              post={mockPost}
              className='border-primary/20 bg-primary/5'
            />
          </div>
        </section>
      </div>
    </div>
  )
}
