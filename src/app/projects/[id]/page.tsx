import { ProtectedRoute } from '@/components/auth/protected-route'
import { NavigationHeader } from '@/components/auth/navigation-header'
import { getCurrentUser } from '@/services/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProjectDetailClient } from './project-detail-client'

async function getProject(id: string, userId: string) {
  const project = await prisma.project.findFirst({
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
      phases: {
        orderBy: {
          order: 'asc',
        },
      },
      _count: {
        select: {
          phases: true,
        },
      },
    },
  })

  return project
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

  const project = await getProject(params.id, user.id)

  if (!project) {
    notFound()
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <ProjectDetailClient project={project} user={validatedUser} />
      </div>
    </ProtectedRoute>
  )
}
