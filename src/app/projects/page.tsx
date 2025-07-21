import { ProtectedRoute } from '@/components/auth/protected-route'
import { SidebarLayout } from '@/components/layout/sidebar-layout'
import { getCurrentUser } from '@/services/auth'
import { prisma } from '@/lib/prisma'
import { ProjectListServer } from '@/components/projects/project-list-server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

/**
 * Server Component - Enhanced project data fetching with statistics
 * 통계와 함께 프로젝트 데이터를 가져오는 서버 컴포넌트
 */
async function getProjectsWithStats(userId: string) {
  const [projects, totalCount] = await Promise.all([
    // 프로젝트 목록
    prisma.project.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            phases: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    }),

    // 총 프로젝트 수
    prisma.project.count({
      where: { userId },
    }),
  ])

  // 통계 계산
  const stats = {
    total: totalCount,
    active: projects.length, // 모든 프로젝트를 활성으로 간주
    completed: 0, // 완료 상태 필드가 없으므로 0
    totalPhases: projects.reduce(
      (acc, project) => acc + project._count.phases,
      0
    ),
  }

  return { projects, stats }
}

interface ProjectsPageProps {
  searchParams: Promise<{ search?: string; status?: string }>
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const user = await getCurrentUser()
  const resolvedSearchParams = await searchParams

  if (!user?.id) {
    return null // This should be handled by ProtectedRoute
  }

  // Server-side data fetching with enhanced statistics
  const { projects, stats } = await getProjectsWithStats(user.id)

  const breadcrumbs = [{ label: '홈', href: '/' }, { label: '프로젝트' }]

  return (
    <ProtectedRoute>
      <SidebarLayout breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          {/* Static header section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">프로젝트</h1>
              <p className="text-muted-foreground">
                {user?.name || user?.email}님의 프로젝트를 관리하고 추적하세요.
              </p>
            </div>
            <Link href="/projects/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />새 프로젝트
              </Button>
            </Link>
          </div>

          {/* Static statistics section */}
          {stats.total > 0 && (
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">총 프로젝트</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold">{stats.active}</div>
                <p className="text-xs text-muted-foreground">활성 프로젝트</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">완료된 프로젝트</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold">{stats.totalPhases}</div>
                <p className="text-xs text-muted-foreground">총 단계</p>
              </div>
            </div>
          )}

          {/* Server component with client interactions */}
          <ProjectListServer
            projects={projects}
            searchParams={resolvedSearchParams}
          />
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  )
}
