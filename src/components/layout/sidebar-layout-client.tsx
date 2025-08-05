'use client'

import { AppSidebar } from '@/components/layout/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import React, { useMemo, type ReactNode } from 'react'

interface NavigationData {
  user: {
    name: string
    email: string
    avatar: string
  } | null
  teams: Array<{
    name: string
    logo: string
    plan: string
  }>
  navMain: Array<{
    title: string
    url: string
    icon: string
    items?: Array<{
      title: string
      url: string
    }>
  }>
  projects: Array<{
    name: string
    url: string
    icon: string
  }>
  projectsForSwitcher?: Array<{
    id: string
    title: string
    description?: string | null
  }>
}

/**
 * Client Component - Interactive sidebar layout
 * 상호작용이 가능한 사이드바 레이아웃 클라이언트 컴포넌트
 */
export function SidebarLayoutClient({
  children,
  navigationData,
}: {
  children: ReactNode
  navigationData: NavigationData
}) {
  const pathname = usePathname()

  // Generate breadcrumbs based on current path
  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbItems = []

    // Home
    breadcrumbItems.push({
      title: '홈',
      href: '/',
      isCurrentPage: pathname === '/',
    })

    // Generate breadcrumbs for each segment
    let currentPath = ''
    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`
      const isLast = i === segments.length - 1

      let title = segments[i]

      // Customize titles for known routes
      switch (segments[i]) {
        case 'workspace':
          title = '워크스페이스'
          break
        case 'projects':
          title = '프로젝트'
          break
        case 'posts':
          title = '게시글'
          break
        case 'auth':
          title = '인증'
          break
        case 'signin':
          title = '로그인'
          break
        case 'new':
          title = '새로 만들기'
          break
        case 'edit':
          title = '편집'
          break
        default:
          // For dynamic routes like [id], try to find the actual title
          if (segments[i - 1] === 'projects' && navigationData.projects) {
            const project = navigationData.projects.find(
              p => p.url === currentPath
            )
            if (project) {
              title = project.name
            }
          }
      }

      breadcrumbItems.push({
        title,
        href: currentPath,
        isCurrentPage: isLast,
      })
    }

    return breadcrumbItems
  }, [pathname, navigationData.projects])

  return (
    <SidebarProvider>
      <AppSidebar
        navigationData={navigationData}
        projects={navigationData.projectsForSwitcher || []}
      />
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
          <div className='flex items-center gap-2 px-4'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 h-4' />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={item.href}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {item.isCurrentPage ? (
                        <BreadcrumbPage>{item.title}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.href}>
                          {item.title}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
