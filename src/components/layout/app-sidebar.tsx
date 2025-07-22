'use client'

import * as React from 'react'
import {
  FolderKanban,
  Home,
  LayoutDashboard,
  MessageSquare,
  Rocket,
  Scan,
} from 'lucide-react'

import { AppSidebarUser } from '@/components/layout/app-sidebar-user'
import { ProjectSwitcher } from '@/components/layout/project-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  AppSidebarMenu,
  SidebarMenu,
} from '@/components/layout/app-sidebar-menu'
import { Logo } from '@/components/ui/logo'

// Default data - will be replaced with real data
const data = {
  user: {
    name: '사용자',
    email: 'user@example.com',
    image: '',
  },
  navMain: [
    {
      title: '홈',
      url: '/',
      icon: Home,
      isActive: true,
    },
    {
      title: '대시보드',
      url: '/dashboard',
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: '커뮤니티',
      url: '/community',
      icon: MessageSquare,
      // items: [
      //   {
      //     title: '피드',
      //     url: '/community/feed',
      //   },
      // ],
      isActive: false,
    },
  ],
  navWorkspace: [
    {
      title: '프로젝트',
      url: '/projects',
      icon: Rocket,
      isActive: true,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navigationData?: any
  projects?: Array<{
    id: string
    title: string
    description?: string | null
  }>
}

export function AppSidebar({
  projects = [],
  navigationData,
  ...props
}: AppSidebarProps) {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <Sidebar collapsible="icon" {...props} variant="inset">
      <SidebarHeader>
        <Logo showText={!isCollapsed} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <AppSidebarMenu items={data.navMain} />
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>내 워크스페이스</SidebarGroupLabel>
          <AppSidebarMenu items={data.navWorkspace} />
          <div className="mt-3" />
          <ProjectSwitcher projects={projects} />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
