'use client'

import { useAuth } from './auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogIn, Shield } from 'lucide-react'

interface ClientProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

/**
 * 클라이언트 컴포넌트용 보호된 라우트 래퍼
 * 인증되지 않은 사용자에게 로그인 UI를 표시하거나 리다이렉트합니다.
 */
export function ClientProtectedRoute({
  children,
  fallback,
  redirectTo = '/auth/signin',
  requireAuth = true,
}: ClientProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      // 자동 리다이렉트를 원하는 경우
      if (redirectTo && !fallback) {
        const currentPath = window.location.pathname
        const callbackUrl = encodeURIComponent(currentPath)
        router.push(`${redirectTo}?callbackUrl=${callbackUrl}`)
      }
    }
  }, [isLoading, isAuthenticated, requireAuth, redirectTo, fallback, router])

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 인증이 필요하지만 인증되지 않은 경우
  if (requireAuth && !isAuthenticated) {
    // 커스텀 fallback이 있는 경우
    if (fallback) {
      return <>{fallback}</>
    }

    // 기본 로그인 UI 표시
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">인증 필요</CardTitle>
            <CardDescription>
              이 페이지에 접근하려면 로그인이 필요합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => router.push(redirectTo)}
              className="w-full"
              size="lg"
            >
              <LogIn className="mr-2 h-4 w-4" />
              로그인하기
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 인증된 사용자 또는 인증이 필요하지 않은 경우
  return <>{children}</>
}

/**
 * 인증된 사용자만 접근 가능한 컴포넌트 래퍼
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  return (
    <ClientProtectedRoute requireAuth={true}>{children}</ClientProtectedRoute>
  )
}

/**
 * 인증 상태에 따라 다른 컴포넌트를 렌더링
 */
export function AuthConditional({
  authenticated,
  unauthenticated,
}: {
  authenticated: ReactNode
  unauthenticated: ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{isAuthenticated ? authenticated : unauthenticated}</>
}
