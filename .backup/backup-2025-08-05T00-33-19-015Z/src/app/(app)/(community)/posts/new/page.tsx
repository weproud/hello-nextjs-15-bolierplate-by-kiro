import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { PostForm } from '@/components/posts/post-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, PenTool } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: '새 포스트 작성 | Blog',
  description: 'Tiptap 에디터를 사용하여 새로운 블로그 포스트를 작성하세요.',
}

export default async function NewPostPage() {
  // 인증 확인 - 비인증 사용자는 로그인 페이지로 리다이렉트
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/posts/new')
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      {/* 헤더 섹션 */}
      <div className='mb-8'>
        <div className='flex items-center gap-4 mb-4'>
          <Button variant='ghost' size='sm' asChild>
            <Link href='/posts' className='flex items-center gap-2'>
              <ArrowLeft className='h-4 w-4' />
              포스트 목록으로
            </Link>
          </Button>
        </div>

        <div className='flex items-center gap-3 mb-2'>
          <div className='p-2 rounded-lg bg-primary/10'>
            <PenTool className='h-6 w-6 text-primary' />
          </div>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              새 포스트 작성
            </h1>
            <p className='text-muted-foreground'>
              Tiptap 에디터를 사용하여 리치 텍스트 블로그 포스트를 작성하세요.
            </p>
          </div>
        </div>
      </div>

      {/* 포스트 작성 폼 */}
      <PostForm mode='create' />

      {/* 도움말 카드 */}
      <Card className='mt-8 border-dashed'>
        <CardHeader>
          <CardTitle className='text-lg'>에디터 사용 팁</CardTitle>
          <CardDescription>
            Tiptap 에디터의 다양한 기능을 활용해보세요.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div className='space-y-2'>
              <h4 className='font-medium'>헤딩 사용법</h4>
              <ul className='space-y-1 text-muted-foreground'>
                <li>
                  • <code className='bg-muted px-1 rounded'># 텍스트</code> - H1
                  헤딩
                </li>
                <li>
                  • <code className='bg-muted px-1 rounded'>## 텍스트</code> -
                  H2 헤딩
                </li>
                <li>
                  • <code className='bg-muted px-1 rounded'>### 텍스트</code> -
                  H3 헤딩
                </li>
              </ul>
            </div>
            <div className='space-y-2'>
              <h4 className='font-medium'>텍스트 서식</h4>
              <ul className='space-y-1 text-muted-foreground'>
                <li>
                  • 텍스트 선택 후 <strong>B</strong> 버튼으로 굵게
                </li>
                <li>
                  • 텍스트 선택 후 <em>I</em> 버튼으로 기울임
                </li>
                <li>• 리스트 버튼으로 목록 생성</li>
              </ul>
            </div>
          </div>
          <div className='pt-2 border-t'>
            <p className='text-sm text-muted-foreground'>
              💡 <strong>자동 저장:</strong> 편집 모드에서는 3초마다 자동으로
              저장됩니다.
              <br />
              💡 <strong>요약 생성:</strong> 내용을 입력하면 자동으로 요약이
              생성됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
