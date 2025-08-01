'use client'

import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { signIn, signOut, useSession } from 'next-auth/react'

export function AppSidebarUser() {
  const { isMobile } = useSidebar()
  const { data: session } = useSession()

  // Show login button if no session, otherwise show user info
  if (!session?.user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size='lg'
            onClick={() => signIn('google')}
            className='hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          >
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>로그인</span>
              <span className='truncate text-xs'>Google로 시작하기</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const displayUser = session.user

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage
                  src={displayUser.image}
                  alt={displayUser.name || '사용자'}
                />
                <AvatarFallback className='rounded-lg'>
                  {displayUser.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {displayUser.name || '사용자'}
                </span>
                <span className='truncate text-xs'>
                  {displayUser.email || '이메일 없음'}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage
                    src={displayUser.image || displayUser.image}
                    alt={displayUser.name || '사용자'}
                  />
                  <AvatarFallback className='rounded-lg'>
                    {displayUser.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>
                    {displayUser.name || '사용자'}
                  </span>
                  <span className='truncate text-xs'>
                    {displayUser.email || '이메일 없음'}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                계정
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                알림
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
