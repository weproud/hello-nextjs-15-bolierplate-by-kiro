'use client'

import { InfinitePostList } from './infinite-post-list'
import { Button } from '@/components/ui/button'

interface InfinitePostsDemoProps {
  className?: string
}

/**
 * 무한 스크롤 포스트 목록 데모 컴포넌트
 * InfinitePostList 컴포넌트의 기능을 테스트하기 위한 컴포넌트
 */
export function InfinitePostsDemo({ className }: InfinitePostsDemoProps) {
  const handleEdit = (postId: string) => {
    console.log('편집:', postId)
    // 실제 구현에서는 편집 페이지로 이동
    // router.push(`/posts/${postId}/edit`)
  }

  const handleDelete = (postId: string) => {
    console.log('삭제:', postId)
    // 실제 구현에서는 삭제 확인 다이얼로그 표시
    // if (confirm('정말 삭제하시겠습니까?')) {
    //   deletePost(postId)
    // }
  }

  return (
    <div className={className}>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>포스트 목록</h2>
          <p className='text-muted-foreground mt-1'>
            무한 스크롤로 포스트를 탐색하세요
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant='outline'>
          새로고침
        </Button>
      </div>

      {/* 무한 스크롤 포스트 목록 */}
      <InfinitePostList
        limit={6} // 테스트를 위해 작은 수로 설정
        showActions={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
