import { auth } from '@/auth'
import { redirect } from 'next/navigation'

/**
 * 서버 컴포넌트에서 현재 세션을 가져옵니다.
 * 인증되지 않은 경우 null을 반환합니다.
 */
export async function getCurrentSession() {
  return await auth()
}

/**
 * 서버 컴포넌트에서 현재 사용자를 가져옵니다.
 * 인증되지 않은 경우 null을 반환합니다.
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user || null
}

/**
 * 서버 컴포넌트에서 인증이 필요한 페이지를 보호합니다.
 * 인증되지 않은 경우 로그인 페이지로 리다이렉트합니다.
 */
export async function requireAuth() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return session
}

/**
 * 서버 컴포넌트에서 사용자 정보가 필요한 페이지를 보호합니다.
 * 인증되지 않은 경우 로그인 페이지로 리다이렉트합니다.
 */
export async function requireUser() {
  const session = await requireAuth()

  if (!session.user) {
    redirect('/auth/signin')
  }

  return session.user
}

/**
 * 특정 경로로 리다이렉트하면서 현재 URL을 callbackUrl로 설정합니다.
 */
export function redirectToSignIn(callbackUrl?: string) {
  const url = new URL(
    '/auth/signin',
    process.env['NEXTAUTH_URL'] || 'http://localhost:3000'
  )

  if (callbackUrl) {
    url.searchParams.set('callbackUrl', callbackUrl)
  }

  redirect(url.toString())
}
