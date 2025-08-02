import { PostForm } from '@/components/posts/post-form'

export default function TestPostFormPage() {
  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-2xl font-bold mb-8'>PostForm 테스트</h1>
      <PostForm mode='create' />
    </div>
  )
}
