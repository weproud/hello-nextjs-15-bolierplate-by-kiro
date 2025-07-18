import { ProtectedRoute } from '@/components/auth/protected-route'
import { SidebarLayout } from '@/components/layout/sidebar-layout'
import { getCurrentUser } from '@/services/auth'
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

  // The user from getCurrentUser() might have optional fields.
  // The client component expects a specific User shape.
  const validatedUser = {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? '',
  }

  const projects = await getProjects(user.id)

  const breadcrumbs = [{ label: '홈', href: '/' }, { label: '프로젝트' }]

  return (
    <ProtectedRoute>
      <SidebarLayout breadcrumbs={breadcrumbs}>
        <ProjectsPageClient initialProjects={projects} user={validatedUser} />
      </SidebarLayout>
    </ProtectedRoute>
  )
}
