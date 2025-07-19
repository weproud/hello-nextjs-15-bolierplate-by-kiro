# UI/UX 및 개발 워크플로우 가이드

## 7. UI/UX 패턴

### 7.1 shadcn/ui 컴포넌트 사용 패턴

#### 버튼 컴포넌트

```typescript
// src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive: 'bg-destructive text-white shadow-xs hover:bg-destructive/90',
        outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3',
        lg: 'h-10 rounded-md px-6',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// 사용 예시
<Button variant="outline" size="sm">
  취소
</Button>
<Button variant="default" size="lg">
  저장
</Button>
```

#### 카드 컴포넌트

```typescript
// 카드 사용 패턴
<Card>
  <CardHeader>
    <CardTitle>프로젝트 제목</CardTitle>
    <CardDescription>프로젝트 설명</CardDescription>
    <CardAction>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <p>카드 내용</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline">편집</Button>
    <Button>저장</Button>
  </CardFooter>
</Card>
```

### 7.2 테마 시스템

#### CSS 변수 기반 테마

```css
/* src/app/globals.css */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
  /* ... 기타 색상 변수 */
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.92 0.004 286.32);
  --primary-foreground: oklch(0.21 0.006 285.885);
  /* ... 다크 모드 색상 */
}
```

#### 테마 토글 컴포넌트

```typescript
// src/components/theme-toggle.tsx
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}
```

### 7.3 반응형 그리드 레이아웃

```typescript
// 반응형 그리드 패턴
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {projects.map((project) => (
    <ProjectCard key={project.id} project={project} />
  ))}
</div>

// 컨테이너 쿼리 활용
<div className="@container">
  <div className="@sm:grid-cols-2 @lg:grid-cols-3 grid gap-4">
    {/* 내용 */}
  </div>
</div>
```

### 7.4 카드 스타일 유틸리티

```typescript
// 카드 스타일 클래스
const cardStyles = {
  base: "bg-card text-card-foreground rounded-xl border shadow-sm",
  interactive: "hover:shadow-md transition-shadow cursor-pointer",
  elevated: "shadow-lg border-0",
  outlined: "border-2 shadow-none",
}

// 사용 예시
<div className={cn(cardStyles.base, cardStyles.interactive, className)}>
  {children}
</div>
```

---

## 8. 특수 규칙 및 제약사항

### 8.1 인증 시스템 (NextAuth.js)

#### 설정

```typescript
// src/auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})
```

#### 미들웨어 보호

```typescript
// src/middleware.ts
export default auth(req => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const protectedRoutes = ['/dashboard', '/projects']
  const isProtectedRoute = protectedRoutes.some(route =>
    nextUrl.pathname.startsWith(route)
  )

  if (!isLoggedIn && isProtectedRoute) {
    const signInUrl = new URL('/auth/signin', nextUrl)
    signInUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})
```

### 8.2 에러 처리 패턴

#### 글로벌 에러 바운더리

```typescript
// src/components/global-error-boundary.tsx
export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Global error:', error, errorInfo)
        // 에러 로깅 서비스로 전송
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>오류가 발생했습니다</CardTitle>
          <CardDescription>
            {error.message || '알 수 없는 오류가 발생했습니다.'}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={resetErrorBoundary}>다시 시도</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
```

#### Server Action 에러 처리

```typescript
// src/lib/error-handling.ts
export class ActionError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'ActionError'
  }
}

export const handleActionError = (error: unknown): string => {
  if (error instanceof ActionError) {
    return error.message
  }

  if (error instanceof Error) {
    return process.env.NODE_ENV === 'production'
      ? '서버에서 오류가 발생했습니다.'
      : error.message
  }

  return '알 수 없는 오류가 발생했습니다.'
}
```

### 8.3 성능 최적화 규칙

#### 컴포넌트 최적화

```typescript
// React.memo 사용
export const ProjectCard = memo(function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card>
      {/* 컴포넌트 내용 */}
    </Card>
  )
})

// useCallback 사용
const handleSubmit = useCallback(async (data: FormData) => {
  await submitAction(data)
}, [])

// useMemo 사용
const filteredProjects = useMemo(() => {
  return projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  )
}, [projects, searchTerm])
```

#### 동적 임포트

```typescript
// 컴포넌트 지연 로딩
const ProjectModal = dynamic(() => import('./project-modal'), {
  loading: () => <Skeleton className="h-96 w-full" />,
})

// 라이브러리 지연 로딩
const loadChartLibrary = () => import('recharts')
```
