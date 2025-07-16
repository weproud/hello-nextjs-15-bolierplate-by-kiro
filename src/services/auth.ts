/**
 * Authentication Service
 *
 * Utilities and helpers for authentication operations
 * beyond what NextAuth provides out of the box.
 */

import { auth, signIn, signOut } from '@/auth'
import { redirect } from 'next/navigation'

export interface AuthUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await auth()
    return session?.user || null
  } catch (error) {
    console.error('Failed to get current user:', error)
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
    console.error('Sign in failed:', error)
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
    console.error('Sign out failed:', error)
    throw new Error('Sign out failed')
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

  // TODO: Implement role-based permissions
  // For now, all authenticated users have basic permissions
  const basicPermissions = [
    'read:profile',
    'update:profile',
    'create:project',
    'read:project',
    'update:project',
    'delete:project',
  ]

  return basicPermissions.includes(permission)
}

/**
 * Get user permissions
 */
export async function getUserPermissions(user?: AuthUser): Promise<string[]> {
  const currentUser = user || (await getCurrentUser())

  if (!currentUser) {
    return []
  }

  // TODO: Implement role-based permissions from database
  // For now, return basic permissions for all users
  return [
    'read:profile',
    'update:profile',
    'create:project',
    'read:project',
    'update:project',
    'delete:project',
  ]
}

/**
 * Validate session and refresh if needed
 */
export async function validateSession(): Promise<boolean> {
  try {
    const session = await auth()
    return !!session?.user
  } catch (error) {
    console.error('Session validation failed:', error)
    return false
  }
}

/**
 * Auth utilities for client-side usage
 */
export const authUtils = {
  isAuthenticated,
  getCurrentUser,
  hasPermission,
  getUserPermissions,
  validateSession,
}
