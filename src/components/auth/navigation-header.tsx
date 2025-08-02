'use client'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
import { aria } from '@/lib/accessibility'
import { LogIn } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from './auth-provider'
import { UserProfile } from './user-profile'

interface NavigationHeaderProps {
  title?: string
  showAuthButton?: boolean
}

export function NavigationHeader({
  title = 'NEXTJS 15',
  showAuthButton = true,
}: NavigationHeaderProps) {
  const { isAuthenticated, isLoading } = useAuth()

  // 키보드 네비게이션 설정
  const { containerRef } = useKeyboardNavigation({
    direction: 'horizontal',
    loop: true,
  })

  return (
    <header
      className='sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors'
      role='banner'
    >
      <nav
        ref={containerRef}
        className='flex h-14 items-center justify-between px-4 w-full max-w-none'
        role='navigation'
        aria-label='주 네비게이션'
      >
        <div className='flex'>
          <Link
            href='/'
            className='flex items-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm'
            aria-label={`${title} 홈페이지로 이동`}
          >
            <span className='font-bold text-xl text-foreground'>{title}</span>
          </Link>
        </div>

        <div
          className='flex items-center space-x-2'
          role='toolbar'
          aria-label='사용자 도구'
        >
          {isAuthenticated && (
            <Link href='/dashboard'>
              <Button variant='ghost' size='sm' aria-label='대시보드로 이동'>
                대시보드
              </Button>
            </Link>
          )}

          <ThemeToggle />

          {showAuthButton && (
            <>
              {isLoading ? (
                <div
                  className='w-8 h-8 rounded-full bg-muted animate-pulse'
                  role='status'
                  aria-label='사용자 정보 로딩 중'
                  {...aria.live('polite')}
                />
              ) : isAuthenticated ? (
                <UserProfile />
              ) : (
                <Link href='/auth/signin'>
                  <Button size='sm' aria-label='로그인 페이지로 이동'>
                    <LogIn className='mr-2 h-4 w-4' aria-hidden='true' />
                    로그인
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
