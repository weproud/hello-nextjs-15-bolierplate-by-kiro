import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import Link from 'next/link'

import { InfinitePostList } from '@/components/posts/infinite-post-list'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getPostsAction } from '@/lib/actions/post-actions'
import { auth } from '@/auth'
import { db, prisma } from '@/lib/prisma'

// 로딩 스켈레톤 컴포넌트
function PostListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="border border-border/50 rounded-lg p-6 bg-card/50 backdrop-blur-sm"
        >
          <div className="space-y-3 mb-4">
            <Skeleton className="h-6 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-5 w-12" />
          </div>
          <div className="mt-4 pt-3 border-t border-border/50">
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Server Component - Enhanced post data fetching with statistics
 * 통계와 함께 포스트 데이터를 가져오는 서버 컴포넌트
 */
async function getPostsWithStats() {
  try {
    console.log('포스트 데이터 로딩 시작...')

    // 직접 Prisma로 포스트 가져오기 (getPostsAction 우회)
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    })

    console.log('직접 조회한 포스트 수:', posts.length)

    // 통계 정보
    const [totalCount, publishedCount] = await Promise.all([
      prisma.post.count({ where: { published: true } }),
      prisma.post.count({ where: { published: true } }),
    ])

    console.log(`통계 - 총: ${totalCount}, 게시됨: ${publishedCount}`)

    return {
      posts,
      pagination: {
        hasMore: posts.length === 10,
        nextCursor: posts.length > 0 ? posts[posts.length - 1].id : null,
        limit: 10,
      },
      stats: {
        total: totalCount,
        published: publishedCount,
      },
    }
  } catch (error) {
    console.error('포스트 로딩 실패:', error)
    throw error
  }
}

// 포스트 목록 컴포넌트
async function PostListContent() {
  try {
    const { posts, pagination, stats } = await getPostsWithStats()

    return (
      <div className="space-y-6">
        {/* Statistics section */}
        {stats.total > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">총 포스트</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-2xl font-bold">{stats.published}</div>
              <p className="text-xs text-muted-foreground">게시된 포스트</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-2xl font-bold">
                {stats.total > 0
                  ? Math.round((stats.published / stats.total) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">게시율</p>
            </div>
          </div>
        )}

        {/* Post list */}
        <InfinitePostList
          initialPosts={posts}
          initialHasMore={pagination.hasMore}
          limit={10}
          published={true}
          className="w-full"
        />
      </div>
    )
  } catch (error) {
    console.error('Failed to load posts:', error)
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <div className="text-lg font-medium mb-2">
            포스트를 불러올 수 없습니다
          </div>
          <p className="text-sm">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    )
  }
}

export default async function PostsPage() {
  const session = await auth()

  return (
    <div className="container mx-auto py-8">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">포스트</h1>
          <p className="text-muted-foreground mt-2">
            다양한 주제의 포스트를 탐색해보세요
          </p>
        </div>

        {/* 포스트 작성 버튼 (인증된 사용자만) */}
        {session?.user && (
          <Button asChild>
            <Link href="/posts/new">
              <Plus className="h-4 w-4 mr-2" />새 포스트 작성
            </Link>
          </Button>
        )}
      </div>

      {/* 포스트 목록 */}
      <Suspense fallback={<PostListSkeleton />}>
        <PostListContent />
      </Suspense>
    </div>
  )
}
