import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth(req => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // 보호된 경로들
  const protectedRoutes = ['/dashboard', '/profile', '/projects']
  const isProtectedRoute = protectedRoutes.some(route =>
    nextUrl.pathname.startsWith(route)
  )

  // 인증 관련 경로들
  const authRoutes = ['/auth/signin', '/auth/error']
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)

  // 이미 로그인한 사용자가 인증 페이지에 접근하려는 경우 홈으로 리다이렉트
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/', nextUrl))
  }

  // 보호된 경로에 인증되지 않은 사용자가 접근하려는 경우 로그인 페이지로 리다이렉트
  if (!isLoggedIn && isProtectedRoute) {
    const callbackUrl = nextUrl.pathname + nextUrl.search
    const signInUrl = new URL('/auth/signin', nextUrl)
    signInUrl.searchParams.set('callbackUrl', callbackUrl)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    /*
     * 다음 경로들을 제외한 모든 요청에 대해 실행:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public 폴더의 파일들
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
