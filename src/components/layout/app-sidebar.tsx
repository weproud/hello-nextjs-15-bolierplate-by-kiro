'use client'

import * as React from 'react'
import { AudioWaveform, GalleryVerticalEnd, Home } from 'lucide-react'

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
    avatar: '',
  },
  teams: [
    {
      name: '내 워크스페이스',
      logo: GalleryVerticalEnd,
      plan: 'Free',
    },
    {
      name: 'Team Project',
      logo: AudioWaveform,
      plan: 'Pro',
    },
  ],
  navMain: [
    {
      title: '홈',
      url: '/',
      icon: Home,
      isActive: true,
    },
    // {
    //   title: '내 워크스페이스',
    //   url: '/workspace',
    //   icon: SquareTerminal,
    //   items: [
    //     {
    //       title: '게시글',
    //       url: '/posts',
    //     },
    //   ],
    // },
    // {
    //   title: '프로젝트',
    //   url: '/projects',
    //   icon: FolderKanban,
    //   items: [
    //     {
    //       title: '모든 프로젝트',
    //       url: '/projects',
    //     },
    //     {
    //       title: '새 프로젝트',
    //       url: '/projects/new',
    //     },
    //     {
    //       title: '아카이브',
    //       url: '/projects/archive',
    //     },
    //   ],
    // },
    //   {
    //     title: '문서',
    //     url: '/docs',
    //     icon: BookOpen,
    //     items: [
    //       {
    //         title: '시작하기',
    //         url: '/docs/getting-started',
    //       },
    //       {
    //         title: 'API 참조',
    //         url: '/docs/api',
    //       },
    //       {
    //         title: '가이드',
    //         url: '/docs/guides',
    //       },
    //     ],
    //   },
    //   {
    //     title: '설정',
    //     url: '/settings',
    //     icon: Settings2,
    //     items: [
    //       {
    //         title: '일반',
    //         url: '/settings',
    //       },
    //       {
    //         title: '프로필',
    //         url: '/settings/profile',
    //       },
    //       {
    //         title: '보안',
    //         url: '/settings/security',
    //       },
    //     ],
    //   },
  ],
  // projects: [
  //   {
  //     name: 'Design Engineering',
  //     url: '/projects/design-engineering',
  //     icon: Frame,
  //   },
  //   {
  //     name: 'Sales & Marketing',
  //     url: '/projects/sales-marketing',
  //     icon: PieChart,
  //   },
  //   {
  //     name: 'Travel',
  //     url: '/projects/travel',
  //     icon: Map,
  //   },
  // ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  projects?: Array<{
    id: string
    title: string
    description?: string | null
    _count?: {
      phases: number
    }
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
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
