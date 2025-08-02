# 인증 컴포넌트 문서

NextAuth.js 5.0 기반의 인증 시스템 컴포넌트들입니다. Google OAuth를 통한 소셜 로그인과 세션 관리를
제공합니다.

## 주요 컴포넌트

### SigninForm

사용자 로그인을 위한 폼 컴포넌트입니다.

```typescript
import { SigninForm } from '@/components/auth/signin-form'

// 기본 사용법
<SigninForm />

// 리다이렉트 URL 지정
<SigninForm callbackUrl="/dashboard" />

// 커스텀 스타일링
<SigninForm className="max-w-md mx-auto" />
```

**Props:**

- `callbackUrl?: string` - 로그인 성공 후 리다이렉트할 URL
- `className?: string` - 추가 CSS 클래스
- `showTitle?: boolean` - 제목 표시 여부 (기본값: true)

**특징:**

- Google OAuth 로그인 지원
- 에러 상태 처리
- 로딩 상태 표시
- 접근성 최적화

### SigninModal

모달 형태의 로그인 컴포넌트입니다.

```typescript
import { SigninModal } from '@/components/auth/signin-modal'

// 기본 사용법
<SigninModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
/>

// 트리거 버튼과 함께 사용
<SigninModal>
  <Button>로그인</Button>
</SigninModal>
```

**Props:**

- `isOpen?: boolean` - 모달 열림 상태
- `onClose?: () => void` - 모달 닫기 콜백
- `children?: ReactNode` - 트리거 요소
- `callbackUrl?: string` - 로그인 성공 후 리다이렉트 URL

### UserProfile

로그인한 사용자의 프로필 정보를 표시하는 컴포넌트입니다.

```typescript
import { UserProfile } from '@/components/auth/user-profile'

// 기본 사용법
<UserProfile />

// 드롭다운 메뉴 형태
<UserProfile showDropdown={true} />

// 커스텀 메뉴 아이템
<UserProfile
  showDropdown={true}
  menuItems={[
    { label: '프로필', href: '/profile' },
    { label: '설정', href: '/settings' },
    { label: '로그아웃', action: 'signout' }
  ]}
/>
```

**Props:**

- `showDropdown?: boolean` - 드롭다운 메뉴 표시 여부
- `menuItems?: MenuItem[]` - 커스텀 메뉴 아이템
- `className?: string` - 추가 CSS 클래스

### ProtectedRoute

인증이 필요한 페이지를 보호하는 컴포넌트입니다.

```typescript
import { ProtectedRoute } from '@/components/auth/protected-route'

// 서버 컴포넌트에서 사용
export default async function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>보호된 콘텐츠</div>
    </ProtectedRoute>
  )
}

// 클라이언트 컴포넌트에서 사용
"use client"
import { ClientProtectedRoute } from '@/components/auth/client-protected-route'

export function ClientDashboard() {
  return (
    <ClientProtectedRoute>
      <div>보호된 클라이언트 콘텐츠</div>
    </ClientProtectedRoute>
  )
}
```

**Props:**

- `children: ReactNode` - 보호할 콘텐츠
- `fallback?: ReactNode` - 로딩 중 표시할 컴포넌트
- `redirectTo?: string` - 미인증 시 리다이렉트할 경로

### AuthProvider

인증 상태를 관리하는 컨텍스트 프로바이더입니다.

```typescript
import { AuthProvider } from '@/components/auth/auth-provider'

// 앱 루트에서 사용
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### SignoutDialog

로그아웃 확인 다이얼로그 컴포넌트입니다.

```typescript
import { SignoutDialog } from '@/components/auth/signout-dialog'

<SignoutDialog
  isOpen={isDialogOpen}
  onClose={() => setIsDialogOpen(false)}
  onConfirm={handleSignout}
/>
```

**Props:**

- `isOpen: boolean` - 다이얼로그 열림 상태
- `onClose: () => void` - 다이얼로그 닫기 콜백
- `onConfirm?: () => void` - 로그아웃 확인 콜백

## 훅 (Hooks)

### useAuth

인증 상태와 관련 함수들을 제공하는 훅입니다.

```typescript
import { useAuth } from '@/hooks/use-auth'

function MyComponent() {
  const {
    user,           // 현재 사용자 정보
    isLoading,      // 로딩 상태
    isAuthenticated, // 인증 상태
    signIn,         // 로그인 함수
    signOut         // 로그아웃 함수
  } = useAuth()

  if (isLoading) return <div>로딩 중...</div>

  if (!isAuthenticated) {
    return <button onClick={() => signIn('google')}>로그인</button>
  }

  return (
    <div>
      <p>안녕하세요, {user?.name}님!</p>
      <button onClick={() => signOut()}>로그아웃</button>
    </div>
  )
}
```

## 에러 처리

### AuthError

인증 관련 에러를 처리하는 컴포넌트입니다.

```typescript
import { AuthError } from '@/components/auth/auth-error'

<AuthError
  error={authError}
  onRetry={handleRetry}
  showRetryButton={true}
/>
```

**에러 타입:**

- `OAuthAccountNotLinked` - OAuth 계정 연결 실패
- `OAuthCallback` - OAuth 콜백 에러
- `OAuthSignin` - OAuth 로그인 에러
- `SessionRequired` - 세션 필요
- `AccessDenied` - 접근 거부

### 에러 처리 예제

```typescript
"use client"
import { useSearchParams } from 'next/navigation'
import { AuthError } from '@/components/auth/auth-error'

export function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="container mx-auto py-8">
      <AuthError
        error={error}
        onRetry={() => window.location.href = '/auth/signin'}
      />
    </div>
  )
}
```

## 미들웨어 통합

### 라우트 보호

```typescript
// middleware.ts
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth(req => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // 보호된 라우트 목록
  const protectedRoutes = ['/dashboard', '/profile', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route))

  // 미인증 사용자가 보호된 라우트에 접근하는 경우
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', nextUrl))
  }

  // 인증된 사용자가 로그인 페이지에 접근하는 경우
  if (nextUrl.pathname.startsWith('/auth/signin') && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

## 서버 액션 통합

### 인증이 필요한 서버 액션

```typescript
import { auth } from '@/auth'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export const updateProfile = createSafeAction(updateProfileSchema, async data => {
  const session = await auth()

  if (!session?.user) {
    throw new Error('인증이 필요합니다')
  }

  // 프로필 업데이트 로직
  return { success: true }
})
```

## 접근성 가이드라인

### 키보드 네비게이션

```typescript
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'

export function AccessibleAuthForm() {
  const { handleKeyDown } = useKeyboardNavigation({
    onEnter: handleSubmit,
    onEscape: handleCancel
  })

  return (
    <form onKeyDown={handleKeyDown}>
      <input
        type="email"
        aria-label="이메일 주소"
        aria-required="true"
        aria-describedby="email-error"
      />
      <div id="email-error" role="alert">
        {emailError}
      </div>
    </form>
  )
}
```

### 스크린 리더 지원

```typescript
export function AccessibleUserProfile() {
  return (
    <div role="banner" aria-label="사용자 프로필">
      <img
        src={user.image}
        alt={`${user.name}의 프로필 사진`}
        role="img"
      />
      <div aria-live="polite">
        {isOnline ? '온라인' : '오프라인'}
      </div>
    </div>
  )
}
```

## 테스트 예제

### 컴포넌트 테스트

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { SigninForm } from '../signin-form'
import { SessionProvider } from 'next-auth/react'

describe('SigninForm', () => {
  it('Google 로그인 버튼을 렌더링한다', () => {
    render(
      <SessionProvider session={null}>
        <SigninForm />
      </SessionProvider>
    )

    expect(screen.getByText('Google로 로그인')).toBeInTheDocument()
  })

  it('로그인 버튼 클릭 시 signIn 함수를 호출한다', async () => {
    const mockSignIn = vi.fn()
    vi.mock('next-auth/react', () => ({
      signIn: mockSignIn
    }))

    render(
      <SessionProvider session={null}>
        <SigninForm />
      </SessionProvider>
    )

    fireEvent.click(screen.getByText('Google로 로그인'))
    expect(mockSignIn).toHaveBeenCalledWith('google')
  })
})
```

## 보안 고려사항

1. **CSRF 보호**: NextAuth.js가 자동으로 CSRF 토큰을 관리
2. **세션 보안**: 안전한 쿠키 설정 및 세션 만료 관리
3. **OAuth 보안**: state 매개변수를 통한 CSRF 공격 방지
4. **XSS 방지**: 사용자 입력 데이터 적절한 이스케이프 처리

## 환경 설정

```env
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 문제 해결

### 일반적인 문제들

1. **세션이 null인 경우**: SessionProvider가 올바르게 설정되었는지 확인
2. **리다이렉트 루프**: 미들웨어 설정과 보호된 라우트 설정 확인
3. **OAuth 에러**: 클라이언트 ID와 시크릿이 올바른지 확인
4. **CSRF 에러**: NEXTAUTH_URL이 올바르게 설정되었는지 확인
