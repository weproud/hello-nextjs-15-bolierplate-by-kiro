'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  memo,
  type ReactNode,
} from 'react'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'

interface AuthContextType {
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  user: Session['user'] | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = memo(function AuthProvider({
  children,
}: AuthProviderProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(status === 'loading')
  }, [status])

  const value: AuthContextType = useMemo(
    () => ({
      session,
      isLoading,
      isAuthenticated: !!session?.user,
      user: session?.user || null,
    }),
    [session, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
})

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

// Hook for requiring authentication
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // In a real app, you might redirect to login page
      console.warn('Authentication required')
    }
  }, [isAuthenticated, isLoading])

  return { isAuthenticated, isLoading, user }
}
