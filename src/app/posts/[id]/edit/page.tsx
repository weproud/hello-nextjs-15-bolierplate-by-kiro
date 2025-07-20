import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { PostForm } from '@/components/posts/post-form'
import { getPostAction } from '@/lib/actions/post-actions'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit3, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface EditPostPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: EditPostPageProps) {
  const { id } = await params

  try {
    const result = await getPostAction({ id })
    const post = result?.data?.post

    if (!post) {
      return {
        title: '포스트를 찾을 수 없음 | Blog',
        description: '요청하신 포스트를 찾을 수 없습니다.',
      }
    }

    return {
      title: `"${post.title}" 편집 | Blog`,
      description: `"${post.title}" 포스트를 편집합니다.`,
    }
  } catch {
    return {
      title: '포스트 편집 | Blog',
      description: '포스트를 편집합니다.',
    }
  }
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params

  // 인증 확인 - 비인증 사용자는 로그인 페이지로 리다이렉트
  const session = await auth()

  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/posts/${id}/edit`)
  }

  // 포스트 데이터 가져오기
  let post
  try {
    const result = await getPostAction({ id })
    post = result?.data?.post

    if (!post) {
      notFound()
    }
  } catch (error) {
    console.error('Failed to fetch post:', error)
    notFound()
  }

  // 작성자 권한 검증 - 다른 사용자의 포스트 편집 방지
  if (post.authorId !== session.user.id) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* 헤더 섹션 */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link href="/posts" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                포스트 목록으로
              </Link>
            </Button>

            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  접근 권한 없음
                </h1>
                <p className="text-muted-foreground">
                  이 포스트를 편집할 권한이 없습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 권한 없음 알림 */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              다른 사용자의 포스트는 편집할 수 없습니다. 본인이 작성한 포스트만
              편집할 수 있습니다.
            </AlertDescription>
          </Alert>

          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link href="/posts">포스트 목록</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 헤더 섹션 */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/posts" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              포스트 목록으로
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Edit3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">포스트 편집</h1>
            <p className="text-muted-foreground">
              "{post.title}" 포스트를 편집합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 포스트 편집 폼 */}
      <PostForm
        mode="edit"
        initialData={{
          id: post.id,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          published: post.published,
        }}
        onSuccess={() => {
          // 성공 시 처리는 PostForm 컴포넌트 내부에서 처리됨
        }}
        onCancel={() => {
          // 취소 시 포스트 목록 페이지로 이동
          window.location.href = '/posts'
        }}
      />

      {/* 편집 도움말 카드 */}
      <Card className="mt-8 border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">편집 도움말</CardTitle>
          <CardDescription>
            포스트 편집 시 유용한 기능들을 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">자동 저장</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 편집 중 3초마다 자동으로 저장됩니다</li>
                <li>• 마지막 저장 시간이 표시됩니다</li>
                <li>• 네트워크 오류 시 자동 재시도됩니다</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">발행 상태</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 초안: 본인만 볼 수 있습니다</li>
                <li>• 발행: 모든 사용자가 볼 수 있습니다</li>
                <li>• 언제든지 상태를 변경할 수 있습니다</li>
              </ul>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              💡 <strong>팁:</strong> 큰 변경사항을 만들기 전에 초안으로
              저장하여 안전하게 편집하세요.
              <br />
              💡 <strong>단축키:</strong> Ctrl+S (또는 Cmd+S)로 수동 저장할 수
              있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
