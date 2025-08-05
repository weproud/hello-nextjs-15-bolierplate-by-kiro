import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { env } from './lib/env'
import { prisma } from './lib/prisma'
import type { UserPermissions, UserRole } from './types/next-auth'

// 역할별 권한 매핑
const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
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

// 사용자 역할 결정 로직
function getUserRole(email: string): UserRole {
  // 관리자 이메일 패턴 확인
  if (email.includes('admin') || email.endsWith('@admin.com')) {
    return 'admin'
  }

  // 기본적으로 모든 인증된 사용자는 'user' 역할
  return 'user'
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          lastLoginAt: new Date(),
        }
      },
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id

        // 세션 갱신 시 마지막 로그인 시간 업데이트
        if (user.id) {
          await prisma.user
            .update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            })
            .catch(error => {
              console.error('Failed to update lastLoginAt:', error)
            })
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }

      // 계정 연결 시 추가 정보 저장
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
      }

      return token
    },
    async signIn({ user, account, profile }) {
      // 추가 검증 로직
      if (account?.provider === 'google') {
        // Google 계정 검증
        if (!profile?.email_verified) {
          console.warn('Email not verified for user:', profile?.email)
          return false
        }
      }

      return true
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        isNewUser,
      })

      // 새 사용자인 경우 환영 이메일 발송 등의 로직 추가 가능
      if (isNewUser) {
        // TODO: 환영 이메일 발송
        console.log('New user registered:', user.email)
      }
    },
    async signOut({ session, token }) {
      console.log('User signed out:', {
        userId: session?.user?.id || token?.id,
        email: session?.user?.email || token?.email,
      })
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: env.AUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
})
