import { ReactNode } from 'react'
import { SidebarLayoutClient } from './sidebar-layout-client'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * Server Component - Sidebar layout with server-side data
 * 서버 사이드 데이터를 포함한 사이드바 레이아웃 서버 컴포넌트
 */
export async function SidebarLayoutServer({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()

  // Fetch user's projects for navigation
  const projects = session?.user?.id
    ? await prisma.project.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          title: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 5, // Show only recent 5 projects in sidebar
      })
    : []

  // Static navigation data
  const navigationData = {
    user: session?.user
      ? {
          name: session.user.name || '사용자',
          email: session.user.email || '',
          avatar: session.user.image || '',
        }
      : null,
    teams: [
      {
        name: '개인 작업공간',
        logo: 'User' as const,
        plan: '무료',
      },
    ],
    navMain: [
      {
        title: '대시보드',
        url: '/dashboard',
        icon: 'LayoutDashboard' as const,
      },
      {
        title: '프로젝트',
        url: '/projects',
        icon: 'FolderOpen' as const,
        items: projects.map(project => ({
          title: project.title,
          url: `/projects/${project.id}`,
        })),
      },
      {
        title: '게시글',
        url: '/posts',
        icon: 'FileText' as const,
        items: [
          {
            title: '모든 게시글',
            url: '/posts',
          },
          {
            title: '새 게시글',
            url: '/posts/new',
          },
        ],
      },
    ],
    projects: projects.map(project => ({
      name: project.title,
      url: `/projects/${project.id}`,
      icon: 'Folder' as const,
    })),
  }

  return (
    <div className="flex min-h-screen">
      {/* Static sidebar structure with dynamic client interactions */}
      <SidebarLayoutClient navigationData={navigationData}>
        {children}
      </SidebarLayoutClient>
    </div>
  )
}

/**
 * Server Component - Simple layout without sidebar data fetching
 * 데이터 페칭 없는 간단한 레이아웃 서버 컴포넌트
 */
export function SimpleSidebarLayoutServer({
  children,
}: {
  children: ReactNode
}) {
  const staticNavigationData = {
    user: null,
    teams: [
      {
        name: '게스트',
        logo: 'User' as const,
        plan: '무료',
      },
    ],
    navMain: [
      {
        title: '홈',
        url: '/',
        icon: 'Home' as const,
      },
      {
        title: '로그인',
        url: '/auth/signin',
        icon: 'LogIn' as const,
      },
    ],
    projects: [],
  }

  return (
    <div className="flex min-h-screen">
      <SidebarLayoutClient navigationData={staticNavigationData}>
        {children}
      </SidebarLayoutClient>
    </div>
  )
}
