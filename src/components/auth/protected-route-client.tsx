'use client'

import { type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { LoginRequired } from '@/components/auth/login-required'

interface ProtectedRouteClientProps {
  children: ReactNode
  title?: string
  description?: string
}

/**
 * 클라이언트 컴포넌트용 보호된 라우트 래퍼
 * 인증되지 않은 사용자에게 로그인 안내를 보여줍니다.
 */
export function ProtectedRouteClient({
  children,
  title,
  description,
}: ProtectedRouteClientProps) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    )
  }

  if (!session?.user) {
    return <LoginRequired title={title} description={description} />
  }

  return <>{children}</>
}
