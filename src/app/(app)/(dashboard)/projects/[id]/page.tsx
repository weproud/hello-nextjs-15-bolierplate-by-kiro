import { ProtectedRoute } from '@/components/auth/protected-route'
import { getCurrentUser } from '@/services/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProjectDetailClient } from './project-detail-client'

/**
 * Server Component - Enhanced project data fetching with related data
 * 관련 데이터와 함께 프로젝트 데이터를 가져오는 서버 컴포넌트
 */
async function getProjectWithDetails(id: string, userId: string) {
  const [project, relatedProjects] = await Promise.all([
    // 메인 프로젝트 데이터
    prisma.project.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),

    // 관련 프로젝트들 (같은 사용자의 다른 프로젝트)
    prisma.project.findMany({
      where: {
        userId,
        id: {
          not: id,
        },
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 3, // 최근 3개만
    }),
  ])

  return { project, relatedProjects }
}

interface ProjectDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProjectDetailPage({
  params: paramsPromise,
}: ProjectDetailPageProps) {
  const params = await paramsPromise
  const user = await getCurrentUser()

  if (!user?.id) {
    return null
  }

  // The user from getCurrentUser() might have optional fields.
  // The ProjectDetailClient expects a specific User shape.
  // We create a validated user object to pass to the client component.
  const validatedUser = {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? '',
  }

  const { project, relatedProjects } = await getProjectWithDetails(
    params.id,
    user.id
  )

  if (!project) {
    notFound()
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Static related projects section */}
        {relatedProjects.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">관련 프로젝트</h3>
            <div className="flex gap-2 flex-wrap">
              {relatedProjects.map(relatedProject => (
                <a
                  key={relatedProject.id}
                  href={`/projects/${relatedProject.id}`}
                  className="text-sm bg-muted hover:bg-muted/80 px-3 py-1 rounded-full transition-colors"
                >
                  {relatedProject.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic project detail - Client Component */}
        <ProjectDetailClient project={project} user={validatedUser} />
      </div>
    </ProtectedRoute>
  )
}
