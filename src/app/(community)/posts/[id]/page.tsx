import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, User, Edit, Trash2, ArrowLeft } from 'lucide-react'

import { auth } from '@/auth'
import { getPostAction, deletePostAction } from '@/lib/actions/post-actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { DeletePostButton } from './delete-post-button'

interface PostDetailPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PostDetailPageProps) {
  try {
    const result = await getPostAction({ id: params.id })
    const post = result?.data?.post

    if (!post) {
      return {
        title: '포스트를 찾을 수 없음',
        description: '요청하신 포스트를 찾을 수 없습니다.',
      }
    }

    // HTML 태그 제거하여 설명 생성
    const description =
      post.content
        .replace(/<[^>]*>/g, '')
        .slice(0, 160)
        .trim() + (post.content.length > 160 ? '...' : '')

    return {
      title: post.title,
      description: description,
      openGraph: {
        title: post.title,
        description: description,
        type: 'article',
        publishedTime: post.createdAt.toISOString(),
        modifiedTime: post.updatedAt.toISOString(),
        authors: [post.author.name || post.author.email],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: description,
      },
    }
  } catch {
    return {
      title: '포스트',
      description: '블로그 포스트를 확인하세요.',
    }
  }
}

// 날짜 포맷팅 유틸리티 함수
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// 사용자 이름 또는 이메일에서 이니셜 생성
function getInitials(name: string, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return email[0].toUpperCase()
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const session = await auth()

  // 포스트 데이터 가져오기
  const result = await getPostAction({ id: params.id })

  if (!result?.data?.post) {
    notFound()
  }

  const { post } = result.data
  const authorName = post.author.name || post.author.email
  const authorInitials = getInitials(post.author.name || '', post.author.email)
  const isAuthor = session?.user?.id === post.authorId

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 md:py-8">
      {/* 뒤로 가기 버튼 */}
      <div className="mb-6">
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          포스트 목록으로 돌아가기
        </Link>
      </div>

      <article className="space-y-8" role="main">
        {/* 포스트 헤더 */}
        <header className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4">
                {post.title}
              </h1>

              {/* 게시 상태 배지 */}
              <div className="flex items-center gap-2 mb-4">
                {post.published ? (
                  <Badge variant="default">게시됨</Badge>
                ) : (
                  <Badge variant="secondary">초안</Badge>
                )}
              </div>
            </div>

            {/* 작성자 액션 버튼 */}
            {isAuthor && (
              <div className="flex items-center gap-2 sm:flex-shrink-0">
                <Link href={`/posts/${post.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">편집</span>
                  </Button>
                </Link>
                <DeletePostButton postId={post.id} />
              </div>
            )}
          </div>

          {/* 작성자 정보 및 메타데이터 */}
          <Card className="bg-muted/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* 작성자 프로필 */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.image} alt={authorName} />
                      <AvatarFallback>{authorInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{authorName}</div>
                      <div className="text-sm text-muted-foreground">
                        {post.author.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 날짜 정보 */}
                <div className="text-left sm:text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>작성일</span>
                  </div>
                  <time dateTime={post.createdAt.toISOString()}>
                    {formatDate(post.createdAt)}
                  </time>
                  {post.updatedAt.getTime() !== post.createdAt.getTime() && (
                    <div className="mt-1 text-xs">
                      수정일: {formatDate(post.updatedAt)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </header>

        <Separator />

        {/* 포스트 내용 */}
        <section
          className="prose prose-gray dark:prose-invert max-w-none prose-sm sm:prose-base"
          aria-label="포스트 내용"
        >
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </section>
      </article>

      {/* 하단 네비게이션 */}
      <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            포스트 목록
          </Link>

          {isAuthor && (
            <div className="flex items-center gap-2">
              <Link href={`/posts/${post.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">편집하기</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
