'use client'

import Link from 'next/link'
import { useAuth } from './auth-provider'
import { UserProfile } from './user-profile'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { LogIn } from 'lucide-react'

interface NavigationHeaderProps {
  title?: string
  showAuthButton?: boolean
}

export function NavigationHeader({
  title = 'LagomPath',
  showAuthButton = true,
}: NavigationHeaderProps) {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">{title}</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            {isAuthenticated && (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    대시보드
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button variant="ghost" size="sm">
                    프로젝트
                  </Button>
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-2">
            <ThemeToggle />

            {showAuthButton && (
              <>
                {isLoading ? (
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                ) : isAuthenticated ? (
                  <UserProfile />
                ) : (
                  <Link href="/auth/signin">
                    <Button size="sm">
                      <LogIn className="mr-2 h-4 w-4" />
                      로그인
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
