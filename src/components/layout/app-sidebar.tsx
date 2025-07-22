'use client'

import * as React from 'react'
import {
  AudioWaveform,
  FolderKanban,
  GalleryVerticalEnd,
  Home,
  SquareTerminal,
} from 'lucide-react'

import { NavUser } from '@/components/layout/nav-user'
import { ProjectSwitcher } from '@/components/layout/project-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavMain } from '@/components/layout/nav-main'
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
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: '커뮤니티',
      url: '/community',
      icon: FolderKanban,
      // items: [
      //   {
      //     title: '피드',
      //     url: '/community/feed',
      //   },
      // ],
      isActive: false,
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

export function AppSidebar({ projects = [], ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props} variant="inset">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <ProjectSwitcher projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
