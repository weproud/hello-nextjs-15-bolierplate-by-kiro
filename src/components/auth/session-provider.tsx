'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface SessionProviderProps {
  children: ReactNode
}

/**
 * NextAuth 세션 프로바이더 래퍼
 * 클라이언트 컴포넌트에서 useSession 훅을 사용하기 위해 필요합니다.
 */
export function SessionProvider({ children }: SessionProviderProps) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
