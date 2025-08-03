import { type DefaultSession, type DefaultUser } from 'next-auth'
import { type DefaultJWT } from 'next-auth/jwt'

export type UserRole = 'admin' | 'user' | 'guest'

export interface UserPermissions {
  canCreateProject: boolean
  canEditProject: boolean
  canDeleteProject: boolean
  canManageUsers: boolean
  canAccessAdmin: boolean
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      image: string
      role?: UserRole
      permissions?: UserPermissions
      lastLoginAt?: Date
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    role?: UserRole
    permissions?: UserPermissions
    lastLoginAt?: Date
    createdAt?: Date
    updatedAt?: Date
  }

  interface Profile {
    sub: string
    name: string
    email: string
    picture: string
    email_verified?: boolean
    locale?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role?: UserRole
    permissions?: UserPermissions
    lastLoginAt?: Date
  }
}

// Additional types for enhanced session management
export interface ExtendedSession extends DefaultSession {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: UserRole
    permissions?: UserPermissions
    lastLoginAt?: Date
  }
  expires: string
  sessionToken?: string
}

export interface SessionValidationResult {
  isValid: boolean
  session?: ExtendedSession
  error?: string
  needsRefresh?: boolean
}

export interface AuthenticationState {
  isAuthenticated: boolean
  isLoading: boolean
  user?: ExtendedSession['user']
  error?: string
}
