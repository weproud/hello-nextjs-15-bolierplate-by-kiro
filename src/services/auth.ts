/**
 * Authentication Service
 *
 * Utilities and helpers for authentication operations
 * beyond what NextAuth provides out of the box.
 */

import { auth, signIn, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import { createLogger } from '@/lib/logger'
import type { IAuthService, AuthUser } from './interfaces'

const logger = createLogger('auth-service')

export type UserRole = 'admin' | 'user' | 'guest'

export interface Permission {
  resource: string
  action: string
}

export interface Session {
  user: AuthUser
  expires: string
}

// 역할별 권한 정의
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'read:profile',
    'update:profile',
    'delete:profile',
    'create:project',
    'read:project',
    'update:project',
    'delete:project',
    'manage:users',
    'manage:system',
  ],
  user: [
    'read:profile',
    'update:profile',
    'create:project',
    'read:project',
    'update:project',
    'delete:project',
  ],
  guest: ['read:profile', 'read:project'],
}

// 기본 권한 (모든 인증된 사용자)
const DEFAULT_PERMISSIONS = ROLE_PERMISSIONS.user

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await auth()
    return session?.user || null
  } catch (error) {
    logger.error('Failed to get current user', error as Error)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Require authentication - redirect to sign in if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin')
  }

  return user
}

/**
 * Sign in with provider
 */
export async function signInWithProvider(
  provider: string,
  redirectTo?: string
) {
  try {
    await signIn(provider, {
      redirectTo: redirectTo || '/dashboard',
    })
  } catch (error) {
    logger.error('Sign in failed', error as Error, { provider, redirectTo })
    throw new Error('Authentication failed')
  }
}

/**
 * Sign out user
 */
export async function signOutUser(redirectTo?: string) {
  try {
    await signOut({
      redirectTo: redirectTo || '/',
    })
  } catch (error) {
    logger.error('Sign out failed', error as Error, { redirectTo })
    throw new Error('Sign out failed')
  }
}

/**
 * Get user role from database or session
 */
function getUserRole(user: AuthUser): UserRole {
  // TODO: 실제 구현에서는 데이터베이스에서 사용자 역할을 조회
  // 현재는 이메일 기반으로 간단한 역할 할당
  if (user.email?.includes('admin')) {
    return 'admin'
  }

  // 기본적으로 모든 인증된 사용자는 'user' 역할
  return 'user'
}

/**
 * Check if user has specific permissions
 */
export async function hasPermission(
  permission: string,
  user?: AuthUser
): Promise<boolean> {
  const currentUser = user || (await getCurrentUser())

  if (!currentUser) {
    return false
  }

  try {
    const userRole = getUserRole(currentUser)
    const userPermissions = ROLE_PERMISSIONS[userRole] || DEFAULT_PERMISSIONS

    return userPermissions.includes(permission)
  } catch (error) {
    logger.error('Failed to check user permission', error as Error, {
      userId: currentUser.id,
      permission,
    })

    // 에러 발생 시 기본 권한으로 폴백
    return DEFAULT_PERMISSIONS.includes(permission)
  }
}

/**
 * Get user permissions
 */
export async function getUserPermissions(user?: AuthUser): Promise<string[]> {
  const currentUser = user || (await getCurrentUser())

  if (!currentUser) {
    return []
  }

  try {
    const userRole = getUserRole(currentUser)
    return ROLE_PERMISSIONS[userRole] || DEFAULT_PERMISSIONS
  } catch (error) {
    logger.error('Failed to get user permissions', error as Error, {
      userId: currentUser.id,
    })

    // 에러 발생 시 기본 권한으로 폴백
    return DEFAULT_PERMISSIONS
  }
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const session = await auth()
    return session as Session | null
  } catch (error) {
    logger.error('Failed to get session', error as Error)
    return null
  }
}

/**
 * Check if session is valid
 */
export function isValidSession(session: Session | null): boolean {
  return !!(session?.user?.id && session.user.email)
}

/**
 * Validate session and refresh if needed
 */
export async function validateSession(): Promise<boolean> {
  try {
    const session = await getCurrentSession()
    return isValidSession(session)
  } catch (error) {
    logger.error('Session validation failed', error as Error)
    return false
  }
}

/**
 * Authentication Service Implementation
 */
export class AuthService implements IAuthService {
  async getCurrentUser(): Promise<AuthUser | null> {
    return getCurrentUser()
  }

  async isAuthenticated(): Promise<boolean> {
    return isAuthenticated()
  }

  async requireAuth(): Promise<AuthUser> {
    return requireAuth()
  }

  async signInWithProvider(
    provider: string,
    redirectTo?: string
  ): Promise<void> {
    return signInWithProvider(provider, redirectTo)
  }

  async signOutUser(redirectTo?: string): Promise<void> {
    return signOutUser(redirectTo)
  }

  async hasPermission(permission: string, user?: AuthUser): Promise<boolean> {
    return hasPermission(permission, user)
  }

  async getUserPermissions(user?: AuthUser): Promise<string[]> {
    return getUserPermissions(user)
  }

  async validateSession(): Promise<boolean> {
    return validateSession()
  }
}

// Default auth service instance
export const authService = new AuthService()
