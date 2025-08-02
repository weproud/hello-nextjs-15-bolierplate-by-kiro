'use client'

import { useAuth } from './auth-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SignOutDialog } from './signout-dialog'
import { User, LogOut, Settings } from 'lucide-react'

export function UserProfile() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className='w-8 h-8 rounded-full bg-muted animate-pulse' />
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const userInitials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : user.email?.[0]?.toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={user.image || ''} alt={user.name || ''} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>
              {user.name || '이름 없음'}
            </p>
            <p className='text-xs leading-none text-muted-foreground'>
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className='mr-2 h-4 w-4' />
          <span>프로필</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className='mr-2 h-4 w-4' />
          <span>설정</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SignOutDialog>
          <DropdownMenuItem onSelect={e => e.preventDefault()}>
            <LogOut className='mr-2 h-4 w-4' />
            <span>로그아웃</span>
          </DropdownMenuItem>
        </SignOutDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
