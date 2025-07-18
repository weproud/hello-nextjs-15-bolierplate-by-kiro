import { type ReactNode } from 'react'
import { requireAuth } from '@/services/auth'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * 서버 컴포넌트용 보호된 라우트 래퍼
 * 인증되지 않은 사용자는 자동으로 로그인 페이지로 리다이렉트됩니다.
 */
export async function ProtectedRoute({ children }: ProtectedRouteProps) {
  await requireAuth()

  return <>{children}</>
}
