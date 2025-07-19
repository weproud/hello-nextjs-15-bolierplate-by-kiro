'use client'

import * as React from 'react'
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Home,
  FolderKanban,
  User,
  LogOut,
} from 'lucide-react'

import { NavProjects } from '@/components/layout/nav-projects'
import { NavUser } from '@/components/layout/nav-user'
import { TeamSwitcher } from '@/components/layout/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavMain } from '@/components/layout/nav-main'

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
    {
      title: '대시보드',
      url: '/dashboard',
      icon: SquareTerminal,
      items: [
        {
          title: '개요',
          url: '/dashboard',
        },
        {
          title: '게시글',
          url: '/posts',
        },
      ],
    },
    {
      title: '프로젝트',
      url: '/projects',
      icon: FolderKanban,
      items: [
        {
          title: '모든 프로젝트',
          url: '/projects',
        },
        {
          title: '새 프로젝트',
          url: '/projects/new',
        },
        {
          title: '아카이브',
          url: '/projects/archive',
        },
      ],
    },
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
  projects: [
    {
      name: 'Design Engineering',
      url: '/projects/design-engineering',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '/projects/sales-marketing',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '/projects/travel',
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} variant="inset">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
