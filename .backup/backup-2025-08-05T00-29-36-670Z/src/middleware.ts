import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 보호된 경로들
  const protectedRoutes = ['/dashboard', '/workspace', '/profile', '/projects']
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  // 인증 관련 경로들
  const authRoutes = ['/auth/signin', '/auth/error']
  const isAuthRoute = authRoutes.includes(pathname)

  // 임시로 인증 체크를 비활성화하고 모든 요청을 통과시킵니다
  // TODO: NextAuth.js 설정이 완료되면 인증 로직을 다시 활성화해야 합니다

  return NextResponse.next()
}

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
