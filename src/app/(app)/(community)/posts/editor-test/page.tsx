import { EditorTest } from '@/components/editor/editor-test'
import { PostCardTest } from '@/components/posts/post-card-test'
import { InfinitePostsDemo } from '@/components/posts/infinite-posts-demo'

export default function EditorTestPage() {
  return (
    <div className='container mx-auto py-8 space-y-12'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>에디터 테스트</h1>
        <p className='text-muted-foreground mt-2'>
          Tiptap 에디터와 포스트 컴포넌트들의 개발 테스트 페이지입니다.
        </p>
      </div>

      <EditorTest />

      <div className='border-t pt-12'>
        <h2 className='text-2xl font-semibold mb-6'>포스트 카드 테스트</h2>
        <PostCardTest />
      </div>

      <div className='border-t pt-12'>
        <h2 className='text-2xl font-semibold mb-6'>무한 스크롤 데모</h2>
        <InfinitePostsDemo />
      </div>
    </div>
  )
}
