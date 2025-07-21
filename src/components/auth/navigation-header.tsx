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
  title = 'NEXTJS 15',
  showAuthButton = true,
}: NavigationHeaderProps) {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors">
      <div className="flex h-14 items-center justify-between px-4 w-full max-w-none">
        <div className="flex">
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <span className="font-bold text-xl text-foreground">{title}</span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          {isAuthenticated && (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                대시보드
              </Button>
            </Link>
          )}

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
    </header>
  )
}
