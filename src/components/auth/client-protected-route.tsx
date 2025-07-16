'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'

interface ClientProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * 클라이언트 컴포넌트용 보호된 라우트 래퍼
 * 인증되지 않은 사용자는 로그인 페이지로 리다이렉트됩니다.
 */
export function ClientProtectedRoute({
  children,
  fallback = <div>로딩 중...</div>,
}: ClientProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return <>{fallback}</>
  }

  if (status === 'unauthenticated') {
    return null
  }

  return <>{children}</>
}
