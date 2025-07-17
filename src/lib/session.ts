import { getServerSession } from 'next-auth'
import { authOptions } from '../auth'
import type { Session } from 'next-auth'
import { createAppError, ERROR_CODES } from './error-handling'

// Server-side session utilities
export async function getCurrentSession(): Promise<Session | null> {
  try {
    return await getServerSession(authOptions)
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
}

export async function requireAuth(): Promise<Session> {
  const session = await getCurrentSession()

  if (!session?.user) {
    throw createAppError(ERROR_CODES.UNAUTHORIZED, 'Authentication required')
  }

  return session
}

export async function getCurrentUser() {
  const session = await getCurrentSession()
  return session?.user || null
}

export async function requireUser() {
  const session = await requireAuth()
  return session.user
}

// Session validation utilities
export function isValidSession(session: Session | null): session is Session {
  return !!(session?.user?.id && session.user.email)
}

export function hasRole(session: Session | null, role: string): boolean {
  // For now, we don't have roles in our schema
  // This is a placeholder for future role-based access control
  return isValidSession(session)
}

// Session helpers for client components
export function getSessionUser(session: Session | null) {
  return session?.user || null
}

export function isAuthenticated(session: Session | null): boolean {
  return isValidSession(session)
}
