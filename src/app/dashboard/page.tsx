import { ProtectedRoute } from '@/components/auth/protected-route'
import { SidebarLayout } from '@/components/layout/sidebar-layout'
import { getCurrentUser } from '@/services/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { User, Mail, Calendar, Activity } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

/**
 * Server Component - Dashboard data fetching
 * 대시보드 데이터를 서버에서 가져오는 함수
 */
async function getDashboardData(userId: string) {
  const [projects, posts] = await Promise.all([
    // 프로젝트 통계
    prisma.project.findMany({
      where: { userId },
      include: {
        _count: {
          select: { phases: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5, // 최근 5개만
    }),

    // 포스트 통계 (작성자인 경우)
    prisma.post.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        title: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 5, // 최근 5개만
    }),
  ])

  // 통계 계산
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.length, // 모든 프로젝트를 활성으로 간주
    completedProjects: 0, // 완료 상태 필드가 없으므로 0
    totalPosts: posts.length,
    publishedPosts: posts.filter(post => post.published).length,
    draftPosts: posts.filter(post => !post.published).length,
    totalPhases: projects.reduce(
      (acc, project) => acc + project._count.phases,
      0
    ),
  }

  const completionRate =
    stats.totalProjects > 0
      ? Math.round((stats.completedProjects / stats.totalProjects) * 100)
      : 0

  return {
    projects,
    posts,
    stats: {
      ...stats,
      completionRate,
    },
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user?.id) {
    return null
  }

  // Server-side data fetching
  const dashboardData = await getDashboardData(user.id)

  const breadcrumbs = [{ label: '홈', href: '/' }, { label: '대시보드' }]

  return (
    <ProtectedRoute>
      <SidebarLayout breadcrumbs={breadcrumbs}>
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              안녕하세요, {user?.name || '사용자'}님! 👋
            </h1>
            <p className="text-muted-foreground">
              오늘도 목표를 향해 한 걸음 더 나아가세요.
            </p>
          </div>

          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                프로필 정보
              </CardTitle>
              <CardDescription>현재 로그인된 계정 정보입니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">이름</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.name || '이름 없음'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">이메일</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email || '이메일 없음'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  프로젝트 관리
                </CardTitle>
                <CardDescription>
                  새로운 프로젝트를 시작하거나 기존 프로젝트를 관리하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/projects">
                  <Button className="w-full">프로젝트 보기</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  일정 관리
                </CardTitle>
                <CardDescription>
                  오늘의 할 일과 예정된 미션을 확인하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  일정 보기
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-500" />
                  프로필 설정
                </CardTitle>
                <CardDescription>
                  계정 설정과 개인 정보를 관리하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  설정하기
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats Overview - Real data from server */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {dashboardData.stats.totalProjects}
                </div>
                <p className="text-xs text-muted-foreground">총 프로젝트</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {dashboardData.stats.activeProjects}
                </div>
                <p className="text-xs text-muted-foreground">진행 중</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {dashboardData.stats.completedProjects}
                </div>
                <p className="text-xs text-muted-foreground">완료됨</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {dashboardData.stats.completionRate}%
                </div>
                <p className="text-xs text-muted-foreground">완료율</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats - Posts and Phases */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {dashboardData.stats.totalPosts}
                </div>
                <p className="text-xs text-muted-foreground">총 게시글</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {dashboardData.stats.publishedPosts}
                </div>
                <p className="text-xs text-muted-foreground">게시된 글</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">
                  {dashboardData.stats.totalPhases}
                </div>
                <p className="text-xs text-muted-foreground">총 단계</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          {(dashboardData.projects.length > 0 ||
            dashboardData.posts.length > 0) && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Projects */}
              {dashboardData.projects.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>최근 프로젝트</CardTitle>
                    <CardDescription>
                      최근 업데이트된 프로젝트들입니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData.projects.map(project => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/projects/${project.id}`}
                              className="text-sm font-medium hover:underline truncate block"
                            >
                              {project.title}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {project._count.phases}개 단계
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(project.updatedAt).toLocaleDateString(
                              'ko-KR'
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Link href="/projects">
                        <Button variant="outline" size="sm" className="w-full">
                          모든 프로젝트 보기
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Posts */}
              {dashboardData.posts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>최근 게시글</CardTitle>
                    <CardDescription>
                      최근 작성한 게시글들입니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData.posts.map(post => (
                        <div
                          key={post.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/posts/${post.id}`}
                              className="text-sm font-medium hover:underline truncate block"
                            >
                              {post.title}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {post.published ? '게시됨' : '초안'}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.updatedAt).toLocaleDateString(
                              'ko-KR'
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Link href="/posts">
                        <Button variant="outline" size="sm" className="w-full">
                          모든 게시글 보기
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  )
}
