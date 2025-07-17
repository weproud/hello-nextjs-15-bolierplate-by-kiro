import { ProtectedRoute } from '@/components/auth/protected-route'
import { NavigationHeader } from '@/components/auth/navigation-header'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { ProjectsPageClient } from './projects-client'

async function getProjects(userId: string) {
  return await prisma.project.findMany({
    where: {
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
      _count: {
        select: {
          phases: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
}

export default async function ProjectsPage() {
  const user = await getCurrentUser()

  if (!user?.id) {
    return null // This should be handled by ProtectedRoute
  }

  const projects = await getProjects(user.id)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <ProjectsPageClient initialProjects={projects} user={user} />
      </div>
    </ProtectedRoute>
  )
}
