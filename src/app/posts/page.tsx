import { EditorTest } from '@/components/editor/editor-test'
import { PostCardTest } from '@/components/posts/post-card-test'
import { InfinitePostsDemo } from '@/components/posts/infinite-posts-demo'

export default function EditorTestPage() {
  return (
    <div className="container mx-auto py-8 space-y-12">
      <EditorTest />
      <div className="border-t pt-12">
        <PostCardTest />
      </div>
      <div className="border-t pt-12">
        <InfinitePostsDemo />
      </div>
    </div>
  )
}
