/**
 * Authentication Service
 *
 * Utilities and helpers for authentication operations
 * beyond what NextAuth provides out of the box.
 */

import { auth, signIn, signOut } from '@/auth'
import { createLogger } from '@/lib/logger'
import type { UserRole } from '@/types/next-auth'
import { redirect } from 'next/navigation'
import type { AuthUser, IAuthService } from './interfaces'

const logger = createLogger('auth-service')

export interface Permission {
  resource: string
  action: string
}

export interface Session {
  user: AuthUser
  expires: string
}

export interface AuthResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface SignInResult extends AuthResult {
  redirectUrl?: string
}

export interface PermissionCheckResult extends AuthResult<boolean> {
  permissions?: string[]
}

// 역할별 권한 정의 (문자열 기반)
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

// 역할별 구조화된 권한 정의
const ROLE_STRUCTURED_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: true,
    canManageUsers: true,
    canAccessAdmin: true,
  },
  user: {
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: true,
    canManageUsers: false,
    canAccessAdmin: false,
  },
  guest: {
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canManageUsers: false,
    canAccessAdmin: false,
  },
}

// 기본 권한 (모든 인증된 사용자)
const DEFAULT_PERMISSIONS = ROLE_PERMISSIONS.user
const DEFAULT_STRUCTURED_PERMISSIONS = ROLE_STRUCTURED_PERMISSIONS.user

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
): Promise<SignInResult> {
  try {
    await signIn(provider, {
      redirectTo: redirectTo || '/dashboard',
    })

    return {
      success: true,
      redirectUrl: redirectTo || '/dashboard',
    }
  } catch (error) {
    logger.error('Sign in failed', error as Error, { provider, redirectTo })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    }
  }
}

/**
 * Sign out user
 */
export async function signOutUser(redirectTo?: string): Promise<AuthResult> {
  try {
    await signOut({
      redirectTo: redirectTo || '/',
    })

    return {
      success: true,
    }
  } catch (error) {
    logger.error('Sign out failed', error as Error, { redirectTo })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign out failed',
    }
  }
}

/**
 * Get user role from database or session
 */
function getUserRole(user: AuthUser): UserRole {
  // 세션에서 역할 정보가 있으면 사용
  if ('role' in user && user.role) {
    return user.role as UserRole
  }

  // TODO: 실제 구현에서는 데이터베이스에서 사용자 역할을 조회
  // 현재는 이메일 기반으로 간단한 역할 할당
  if (user.email?.includes('admin')) {
    return 'admin'
  }

  // 기본적으로 모든 인증된 사용자는 'user' 역할
  return 'user'
}

/**
 * Get user structured permissions
 */
export async function getUserStructuredPermissions(
  user?: AuthUser
): Promise<UserPermissions> {
  const currentUser = user || (await getCurrentUser())

  if (!currentUser) {
    return ROLE_STRUCTURED_PERMISSIONS.guest
  }

  try {
    // 세션에서 권한 정보가 있으면 사용
    if ('permissions' in currentUser && currentUser.permissions) {
      return currentUser.permissions as UserPermissions
    }

    const userRole = getUserRole(currentUser)
    return (
      ROLE_STRUCTURED_PERMISSIONS[userRole] || DEFAULT_STRUCTURED_PERMISSIONS
    )
  } catch (error) {
    logger.error('Failed to get user structured permissions', error as Error, {
      userId: currentUser.id,
    })

    // 에러 발생 시 기본 권한으로 폴백
    return DEFAULT_STRUCTURED_PERMISSIONS
  }
}

/**
 * Check specific permission by key
 */
export async function hasStructuredPermission(
  permissionKey: keyof UserPermissions,
  user?: AuthUser
): Promise<boolean> {
  try {
    const permissions = await getUserStructuredPermissions(user)
    return permissions[permissionKey]
  } catch (error) {
    logger.error('Failed to check structured permission', error as Error, {
      permissionKey,
      userId: user?.id,
    })
    return false
  }
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
 * Check if user has specific permissions with detailed result
 */
export async function checkPermission(
  permission: string,
  user?: AuthUser
): Promise<PermissionCheckResult> {
  const currentUser = user || (await getCurrentUser())

  if (!currentUser) {
    return {
      success: false,
      data: false,
      error: 'User not authenticated',
    }
  }

  try {
    const userRole = getUserRole(currentUser)
    const userPermissions = ROLE_PERMISSIONS[userRole] || DEFAULT_PERMISSIONS
    const hasAccess = userPermissions.includes(permission)

    return {
      success: true,
      data: hasAccess,
      permissions: userPermissions,
    }
  } catch (error) {
    logger.error('Failed to check user permission', error as Error, {
      userId: currentUser.id,
      permission,
    })

    // 에러 발생 시 기본 권한으로 폴백
    const hasAccess = DEFAULT_PERMISSIONS.includes(permission)

    return {
      success: false,
      data: hasAccess,
      error: error instanceof Error ? error.message : 'Permission check failed',
      permissions: DEFAULT_PERMISSIONS,
    }
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
 * Get current session with enhanced type safety
 */
export async function getCurrentSession(): Promise<ExtendedSession | null> {
  try {
    const session = await auth()
    return session as ExtendedSession | null
  } catch (error) {
    logger.error('Failed to get session', error as Error)
    return null
  }
}

/**
 * Get current session (legacy compatibility)
 */
export async function getSession(): Promise<Session | null> {
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
export function isValidSession(
  session: ExtendedSession | Session | null
): boolean {
  return !!(session?.user?.id && session.user.email)
}

/**
 * Validate session with detailed result
 */
export async function validateSessionDetailed(): Promise<SessionValidationResult> {
  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        isValid: false,
        error: 'No session found',
      }
    }

    const isValid = isValidSession(session)

    if (!isValid) {
      return {
        isValid: false,
        error: 'Invalid session data',
        session,
      }
    }

    // 세션 만료 확인
    const now = new Date()
    const expiresAt = new Date(session.expires)

    if (now >= expiresAt) {
      return {
        isValid: false,
        error: 'Session expired',
        session,
        needsRefresh: true,
      }
    }

    // 세션 갱신이 필요한지 확인 (만료 1시간 전)
    const oneHourBeforeExpiry = new Date(expiresAt.getTime() - 60 * 60 * 1000)
    const needsRefresh = now >= oneHourBeforeExpiry

    return {
      isValid: true,
      session,
      needsRefresh,
    }
  } catch (error) {
    logger.error('Session validation failed', error as Error)
    return {
      isValid: false,
      error:
        error instanceof Error ? error.message : 'Session validation failed',
    }
  }
}

/**
 * Validate session and refresh if needed (legacy compatibility)
 */
export async function validateSession(): Promise<boolean> {
  const result = await validateSessionDetailed()
  return result.isValid
}

/**
 * Get authentication state for client components
 */
export async function getAuthenticationState(): Promise<AuthenticationState> {
  try {
    const session = await getCurrentSession()

    if (!session) {
      return {
        isAuthenticated: false,
        isLoading: false,
        error: undefined,
      }
    }

    const validationResult = await validateSessionDetailed()

    if (!validationResult.isValid) {
      return {
        isAuthenticated: false,
        isLoading: false,
        error: validationResult.error,
      }
    }

    return {
      isAuthenticated: true,
      isLoading: false,
      user: session.user,
    }
  } catch (error) {
    logger.error('Failed to get authentication state', error as Error)

    return {
      isAuthenticated: false,
      isLoading: false,
      error:
        error instanceof Error
          ? error.message
          : 'Authentication state check failed',
    }
  }
}

/**
 * Refresh user session
 */
export async function refreshUserSession(): Promise<
  AuthResult<ExtendedSession>
> {
  try {
    const validationResult = await validateSessionDetailed()

    if (!validationResult.isValid) {
      return {
        success: false,
        error: validationResult.error || 'Session validation failed',
      }
    }

    if (validationResult.needsRefresh) {
      // TODO: 실제 세션 갱신 로직 구현
      logger.info('Session refresh needed', {
        userId: validationResult.session?.user?.id,
      })
    }

    return {
      success: true,
      data: validationResult.session,
    }
  } catch (error) {
    logger.error('Failed to refresh session', error as Error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Session refresh failed',
    }
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
  ): Promise<SignInResult> {
    return signInWithProvider(provider, redirectTo)
  }

  async signOutUser(redirectTo?: string): Promise<AuthResult> {
    return signOutUser(redirectTo)
  }

  async hasPermission(permission: string, user?: AuthUser): Promise<boolean> {
    return hasPermission(permission, user)
  }

  async checkPermission(
    permission: string,
    user?: AuthUser
  ): Promise<PermissionCheckResult> {
    return checkPermission(permission, user)
  }

  async getUserPermissions(user?: AuthUser): Promise<string[]> {
    return getUserPermissions(user)
  }

  async validateSession(): Promise<boolean> {
    return validateSession()
  }

  async validateSessionDetailed(): Promise<SessionValidationResult> {
    return validateSessionDetailed()
  }

  async getUserStructuredPermissions(
    user?: AuthUser
  ): Promise<UserPermissions> {
    return getUserStructuredPermissions(user)
  }

  async hasStructuredPermission(
    permissionKey: keyof UserPermissions,
    user?: AuthUser
  ): Promise<boolean> {
    return hasStructuredPermission(permissionKey, user)
  }

  async getAuthenticationState(): Promise<AuthenticationState> {
    return getAuthenticationState()
  }

  async refreshUserSession(): Promise<AuthResult<ExtendedSession>> {
    return refreshUserSession()
  }
}

// Default auth service instance
export const authService = new AuthService()
