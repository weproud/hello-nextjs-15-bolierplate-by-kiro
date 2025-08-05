'use client'

import { InfinitePostList } from './infinite-post-list'
import type { Post } from '@/types'

// 데모용 포스트 데이터
const mockPosts: Post[] = [
  {
    id: '1',
    title: '첫 번째 포스트',
    content:
      '<p>첫 번째 포스트의 내용입니다. 이것은 <strong>Tiptap 에디터</strong>로 작성된 리치 텍스트 콘텐츠입니다.</p>',
    excerpt: '첫 번째 포스트의 요약입니다.',
    published: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    authorId: 'user1',
    author: {
      id: 'user1',
      name: '김개발',
      email: 'dev@example.com',
      image: 'https://github.com/shadcn.png',
    },
  },
  {
    id: '2',
    title: '두 번째 포스트 - 무한 스크롤 테스트',
    content:
      '<p>두 번째 포스트의 내용입니다.</p><ul><li>무한 스크롤 기능</li><li>스켈레톤 로더</li><li>에러 처리</li></ul>',
    excerpt: '무한 스크롤과 관련된 기능들을 테스트하는 포스트입니다.',
    published: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    authorId: 'user2',
    author: {
      id: 'user2',
      name: '이디자인',
      email: 'design@example.com',
    },
  },
  {
    id: '3',
    title: '세 번째 포스트 - 초안',
    content: '<p>아직 완성되지 않은 포스트입니다.</p>',
    published: false,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    authorId: 'user1',
    author: {
      id: 'user1',
      name: '김개발',
      email: 'dev@example.com',
      image: 'https://github.com/shadcn.png',
    },
  },
]

export function InfinitePostListDemo() {
  const handleEdit = (postId: string) => {
    console.log('편집:', postId)
  }

  const handleDelete = (postId: string) => {
    console.log('삭제:', postId)
  }

  return (
    <div className='container mx-auto py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-4'>
          무한 스크롤 포스트 목록 데모
        </h1>
        <p className='text-muted-foreground'>
          InfinitePostList 컴포넌트의 다양한 상태를 확인할 수 있습니다.
        </p>
      </div>

      <div className='space-y-12'>
        {/* 기본 포스트 목록 */}
        <section>
          <h2 className='text-2xl font-semibold mb-4'>기본 포스트 목록</h2>
          <InfinitePostList initialPosts={mockPosts} initialHasMore={false} />
        </section>

        {/* 액션 버튼이 있는 포스트 목록 */}
        <section>
          <h2 className='text-2xl font-semibold mb-4'>
            액션 버튼이 있는 포스트 목록
          </h2>
          <InfinitePostList
            initialPosts={mockPosts}
            initialHasMore={false}
            showActions={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </section>

        {/* 빈 상태 */}
        <section>
          <h2 className='text-2xl font-semibold mb-4'>빈 상태</h2>
          <InfinitePostList initialPosts={[]} initialHasMore={false} />
        </section>

        {/* 공개된 포스트만 */}
        <section>
          <h2 className='text-2xl font-semibold mb-4'>공개된 포스트만</h2>
          <InfinitePostList
            initialPosts={mockPosts.filter(post => post.published)}
            initialHasMore={false}
            published={true}
          />
        </section>
      </div>
    </div>
  )
}
