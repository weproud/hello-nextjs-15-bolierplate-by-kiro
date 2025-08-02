# Next.js 15 Best Practice 개발 가이드

> Next.js 15 App Router, React 19, TypeScript 5.8+ 기반 현대적 풀스택 웹 애플리케이션 개발을 위한
> 완전한 가이드

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [프로젝트 구조 및 아키텍처](#2-프로젝트-구조-및-아키텍처)
3. [기술 스택 및 의존성](#3-기술-스택-및-의존성)
4. [코딩 컨벤션 및 스타일](#4-코딩-컨벤션-및-스타일)
5. [핵심 시스템 분석](#5-핵심-시스템-분석)
6. [새로운 패턴 및 규칙](#6-새로운-패턴-및-규칙)
7. [성능 최적화 가이드](#7-성능-최적화-가이드)
8. [테스트 전략](#8-테스트-전략)
9. [배포 및 운영](#9-배포-및-운영)

---

## 1. 프로젝트 개요

Next.js 15와 최신 React 19를 기반으로 한 현대적인 풀스택 웹 애플리케이션 보일러플레이트입니다.
프로젝트 관리, 사용자 인증, 그리고 확장 가능한 아키텍처를 제공합니다.

### 핵심 특징

- **타입 안전성**: TypeScript 5.8+ 엄격 모드
- **현대적 UI**: shadcn/ui + Tailwind CSS 4.0
- **인증 시스템**: NextAuth.js v5 (Google OAuth)
- **데이터베이스**: Prisma ORM + PostgreSQL
- **성능 최적화**: Turbopack, Bundle Analyzer
- **개발자 경험**: ESLint, Prettier, Vitest

---

## 2. 프로젝트 구조 및 아키텍처

### 2.1 루트 디렉토리 구조

```
├── .kiro/                  # Kiro AI 설정
├── docs/                   # 프로젝트 문서
├── prisma/                 # 데이터베이스 스키마
├── public/                 # 정적 자산
├── src/                    # 메인 소스 코드
└── [config files]          # 설정 파일들
```

### 2.2 소스 코드 구조 (`src/`)

```
src/
├── app/                    # Next.js 15 App Router
│   ├── @modal/            # 병렬 라우트 (모달)
│   ├── api/               # API 라우트
│   ├── auth/              # 인증 페이지
│   ├── dashboard/         # 대시보드
│   ├── projects/          # 프로젝트 관리
│   └── forms/             # 폼 예제
├── components/            # React 컴포넌트
│   ├── auth/             # 인증 관련
│   ├── forms/            # 폼 컴포넌트
│   ├── projects/         # 프로젝트 관련
│   └── ui/               # shadcn/ui 기본 컴포넌트
├── lib/                  # 라이브러리 코드
│   ├── actions/          # Server Actions
│   ├── cache/            # 캐싱 전략
│   ├── prisma/           # 데이터베이스 유틸리티
│   └── validations/      # Zod 스키마
├── hooks/                # 커스텀 React 훅
├── stores/               # Zustand 상태 관리
├── types/                # TypeScript 타입 정의
├── providers/            # React Context 프로바이더
├── services/             # 외부 서비스 통합
└── styles/               # 스타일 관련
```

### 2.3 라우팅 패턴

#### App Router 구조

```typescript
// 기본 페이지 구조
app/
├── page.tsx              # 홈페이지
├── layout.tsx            # 루트 레이아웃
├── loading.tsx           # 로딩 UI
├── error.tsx             # 에러 UI
└── not-found.tsx         # 404 페이지
```

#### 병렬 라우트 (Parallel Routes)

```typescript
// 모달을 위한 병렬 라우트
app/
├── @modal/
│   ├── default.tsx       # 기본 슬롯
│   └── (.)auth/
│       └── signin/
│           └── page.tsx  # 인터셉트된 로그인 모달
```

#### 인터셉터 라우트 (Intercepting Routes)

```typescript
// (.) 현재 레벨 인터셉트
// (..) 상위 레벨 인터셉트
// (...) 루트 레벨 인터셉트

// 예시: 로그인 모달 인터셉트
@modal/(.)auth/signin/page.tsx
```

---

## 3. 기술 스택 및 의존성

### 3.1 핵심 프레임워크

```json
{
  "next": "15.4.1", // Next.js 15 with App Router
  "react": "19.1.0", // React 19 최신 기능
  "typescript": "^5.8.3" // TypeScript 엄격 모드
}
```

### 3.2 UI 및 스타일링

```json
{
  "tailwindcss": "^4.1.11", // Tailwind CSS 4.0
  "@radix-ui/react-*": "^1.x.x", // Radix UI 프리미티브
  "class-variance-authority": "^0.7.1", // CVA 스타일 변형
  "tailwind-merge": "^3.3.1", // 클래스 병합
  "next-themes": "^0.4.6", // 테마 시스템
  "lucide-react": "^0.525.0" // 아이콘 라이브러리
}
```

### 3.3 데이터베이스 및 백엔드

```json
{
  "@prisma/client": "^6.12.0", // Prisma ORM
  "prisma": "^6.12.0", // Prisma CLI
  "next-auth": "^5.0.0-beta.29", // NextAuth.js v5
  "@auth/prisma-adapter": "^2.10.0", // Prisma 어댑터
  "next-safe-action": "^8.0.8" // 타입 안전 Server Actions
}
```

### 3.4 폼 및 검증

```json
{
  "react-hook-form": "^7.60.0", // 폼 관리
  "@hookform/resolvers": "^5.1.1", // 폼 리졸버
  "zod": "^4.0.5" // 스키마 검증
}
```

### 3.5 상태 관리 및 유틸리티

```json
{
  "zustand": "^5.0.6", // 상태 관리
  "immer": "^10.1.1", // 불변성 관리
  "date-fns": "^4.1.0", // 날짜 유틸리티
  "sonner": "^2.0.6" // 토스트 알림
}
```

### 3.6 개발 도구

```json
{
  "@typescript-eslint/eslint-plugin": "^8.37.0",
  "@typescript-eslint/parser": "^8.37.0",
  "eslint-config-prettier": "^10.1.5",
  "prettier": "^3.6.2",
  "vitest": "^1.3.1",
  "@testing-library/react": "^14.2.1"
}
```

### 3.7 패키지 매니저

**pnpm 사용 권장**

```bash
# 설치
pnpm install

# 의존성 추가
pnpm add package-name

# shadcn/ui 컴포넌트 추가
pnpm dlx shadcn@latest add button
```

---

## 4. 코딩 컨벤션 및 스타일

### 4.1 파일 네이밍 컨벤션

```
# 페이지 파일
page.tsx, layout.tsx, loading.tsx, error.tsx

# 컴포넌트 파일 (kebab-case)
signin-form.tsx
user-profile.tsx
project-list.tsx

# 유틸리티 파일 (kebab-case)
auth-error-utils.ts
form-error-handler.ts

# 타입 정의 파일 (kebab-case)
next-auth.d.ts
common.ts

# 훅 파일 (use- 접두사)
use-form.ts
use-mobile.ts
```

### 4.2 TypeScript 타입 정의 패턴

```typescript
// 인터페이스 우선 사용
interface User {
  id: string
  name: string
  email: string
}

// 타입 별칭은 유니온, 유틸리티 타입에 사용
type Theme = 'light' | 'dark' | 'system'
type UserWithProjects = User & { projects: Project[] }

// 제네릭 타입 정의
interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

// 유틸리티 타입 활용
type CreateUserInput = Omit<User, 'id'>
type UpdateUserInput = Partial<CreateUserInput>
```

### 4.3 컴포넌트 구조 규칙

```typescript
// 1. 임포트 순서
import * as React from 'react'           // React 관련
import { NextPage } from 'next'          // Next.js 관련
import { Button } from '@/components/ui' // 내부 컴포넌트
import { cn } from '@/lib/utils'         // 유틸리티
import type { User } from '@/types'      // 타입 (type-only import)

// 2. 컴포넌트 정의
interface UserProfileProps {
  user: User
  onUpdate?: (user: User) => void
  className?: string
}

export function UserProfile({
  user,
  onUpdate,
  className
}: UserProfileProps) {
  // 3. 훅 사용
  const [isEditing, setIsEditing] = React.useState(false)

  // 4. 이벤트 핸들러
  const handleEdit = React.useCallback(() => {
    setIsEditing(true)
  }, [])

  // 5. 렌더링
  return (
    <div className={cn('user-profile', className)}>
      {/* 컴포넌트 내용 */}
    </div>
  )
}
```

### 4.4 ESLint/Prettier 설정

#### Prettier 설정 (`.prettierrc`)

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 80,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

#### ESLint 주요 규칙

````javascript
// eslint.config.mjs
export default [
  {
    rules: {
      // TypeScript 규칙
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',

      // 코드 품질
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
    }
  }
]
```--
-

## 5. 핵심 시스템 분석

### 5.1 hooks/ - 커스텀 훅 패턴

#### 폼 관리 훅
```typescript
// src/hooks/use-form.ts
export function useFormWithValidation<TSchema extends z.ZodType>(
  schema: TSchema,
  options?: UseFormProps
) {
  return useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    ...options,
  })
}

// 사용 예시
const form = useFormWithValidation(loginSchema, {
  defaultValues: { email: '', password: '' }
})
````

#### 에러 처리 훅

```typescript
// src/hooks/use-error-boundary.ts
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  return { error, resetError, captureError }
}
```

### 5.2 lib/ - 라이브러리 코드

#### 유틸리티 함수 (`lib/utils.ts`)

```typescript
// 클래스 병합 유틸리티
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 문자열 유틸리티
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// 날짜 유틸리티
export function formatRelativeTime(date: Date | string, locale = 'ko-KR'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  // 구현 로직...
}
```

#### Server Actions (`lib/actions/`)

```typescript
// src/lib/actions/project-actions.ts
import { authActionClient } from '@/lib/safe-action'
import { projectSchema } from '@/lib/validations/project'

export const createProjectAction = authActionClient
  .schema(projectSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { userId } = ctx

    const project = await prisma.project.create({
      data: {
        ...parsedInput,
        userId,
      },
    })

    return { project }
  })
```

#### 검증 스키마 (`lib/validations/`)

```typescript
// src/lib/validations/common.ts
export const emailSchema = z.email('올바른 이메일을 입력해주세요')
export const nameSchema = z.string().min(1, '이름을 입력해주세요').max(100, '이름이 너무 깁니다')

// src/lib/validations/project.ts
export const projectSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목이 너무 깁니다'),
  description: z.string().max(500, '설명이 너무 깁니다').optional(),
})

export type ProjectInput = z.infer<typeof projectSchema>
```

#### 캐싱 시스템 (`lib/cache/`)

```typescript
// src/lib/cache/strategies.ts
import { unstable_cache } from 'next/cache'

export const getCachedProjects = unstable_cache(
  async (userId: string) => {
    return await prisma.project.findMany({
      where: { userId },
    })
  },
  ['projects'],
  {
    tags: ['projects'],
    revalidate: 3600, // 1시간
  }
)
```

### 5.3 providers/ - Context 및 Provider 패턴

```typescript
// src/components/providers.tsx
export const Providers = memo(function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <AppStoreProvider>
            <ErrorHandlerProvider />
            {children}
            <Toaster position="top-right" />
          </AppStoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  )
})
```

### 5.4 types/ - TypeScript 타입 정의

```typescript
// src/types/index.ts
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface User extends BaseEntity {
  name?: string | null
  email: string
  emailVerified?: Date | null
  image?: string | null
}

export interface Project extends BaseEntity {
  title: string
  description?: string | null
  userId: string
  user?: User
}

// 유틸리티 타입
export type Prettify<T> = { [K in keyof T]: T[K] } & {}
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
```

---

## 6. 새로운 패턴 및 규칙

### 6.1 Server Components First 접근법

#### 기본 원칙

- 모든 컴포넌트는 기본적으로 Server Component로 작성
- 클라이언트 상호작용이 필요한 경우에만 `"use client"` 지시어 사용
- 적절한 경계에서 클라이언트/서버 컴포넌트 분리

```typescript
// ✅ Server Component (기본)
export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id)

  return (
    <div>
      <ProjectHeader project={project} />
      <ProjectContent project={project} />
      <ProjectActions projectId={project.id} /> {/* Client Component */}
    </div>
  )
}

// ✅ Client Component (상호작용 필요)
"use client"
export function ProjectActions({ projectId }: { projectId: string }) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div>
      <Button onClick={() => setIsEditing(true)}>편집</Button>
      {isEditing && <EditProjectModal projectId={projectId} />}
    </div>
  )
}
```

#### 컴포넌트 분리 전략

```typescript
// 패턴 1: 컨테이너/프레젠테이션 분리
// Server Component (컨테이너)
export default async function PostsPage() {
  const posts = await getPosts()
  return <PostsList posts={posts} />
}

// Client Component (프레젠테이션)
"use client"
export function PostsList({ posts }: { posts: Post[] }) {
  const [filter, setFilter] = useState('')
  // 클라이언트 로직...
}

// 패턴 2: 하이브리드 컴포넌트
export function PostCard({ post }: { post: Post }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle> {/* Server */}
      </CardHeader>
      <CardContent>
        <PostActions postId={post.id} /> {/* Client */}
      </CardContent>
    </Card>
  )
}
```

### 6.2 타입 시스템 중앙화

#### 중앙화된 타입 내보내기

```typescript
// src/types/index.ts
export * from './api'
export * from './database'
export * from './common'
export * from './editor'
export * from './post'

// 공통 타입 정의
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
```

#### 런타임 검증과 타입 안전성

```typescript
// src/lib/validations/schemas.ts
import { z } from 'zod'

// 기본 스키마
export const baseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// 사용자 스키마
export const userSchema = baseEntitySchema.extend({
  name: z.string().min(1, '이름을 입력해주세요').max(100),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  image: z.string().url().optional(),
})

// 타입 추론
export type User = z.infer<typeof userSchema>

// 폼 데이터 스키마 (생성용)
export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateUserInput = z.infer<typeof createUserSchema>
```

### 6.3 통합 폼 처리 시스템

#### useFormWithAction 훅

```typescript
// src/hooks/use-form-with-action.ts
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

export function useFormWithAction<TSchema extends z.ZodSchema, TInput, TOutput>(
  schema: TSchema,
  action: SafeAction<TInput, TOutput>,
  options?: {
    successMessage?: string
    onSuccess?: (data: TOutput) => void
    onError?: (error: string) => void
  }
) {
  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const { execute, result, isExecuting } = useAction(action, {
    onSuccess: data => {
      if (options?.successMessage) {
        toast.success(options.successMessage)
      }
      options?.onSuccess?.(data)
      form.reset()
    },
    onError: error => {
      toast.error(error.serverError || '오류가 발생했습니다')
      options?.onError?.(error.serverError || '오류가 발생했습니다')
    },
  })

  const handleSubmit = form.handleSubmit(async data => {
    await execute(data)
  })

  return {
    form,
    handleSubmit,
    isLoading: isExecuting,
    result,
    errors: result?.validationErrors,
  }
}
```

#### 사용 예제

```typescript
// 컴포넌트에서 사용
function CreateProjectForm() {
  const router = useRouter()

  const { form, handleSubmit, isLoading } = useFormWithAction(
    createProjectSchema,
    createProjectAction,
    {
      successMessage: '프로젝트가 생성되었습니다',
      onSuccess: (data) => router.push(`/projects/${data.id}`)
    }
  )

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>프로젝트 이름</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '생성 중...' : '프로젝트 생성'}
      </Button>
    </form>
  )
}
```

### 6.4 통합 에러 처리 시스템

#### 계층적 에러 바운더리

```typescript
// src/components/error/unified-error-boundary.tsx
interface UnifiedErrorBoundaryProps {
  level: 'global' | 'route' | 'component'
  name: string
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export function UnifiedErrorBoundary({
  level,
  name,
  children,
  fallback,
  onError
}: UnifiedErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          level={level}
          componentName={name}
        />
      )}
      onError={(error, errorInfo) => {
        console.error(`[${level.toUpperCase()}] Error in ${name}:`, error)
        onError?.(error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// 사용 예제
export function MyComponent() {
  return (
    <UnifiedErrorBoundary level="component" name="MyComponent">
      <SomeComponentThatMightFail />
    </UnifiedErrorBoundary>
  )
}
```

#### 서버 액션 에러 처리

```typescript
// src/lib/actions/safe-action-wrapper.ts
import { createSafeActionClient } from 'next-safe-action'
import { auth } from '@/auth'

export const actionClient = createSafeActionClient({
  handleReturnedServerError(e) {
    if (e instanceof Error) {
      return {
        serverError: e.message,
      }
    }
    return {
      serverError: '예상치 못한 오류가 발생했습니다',
    }
  },
})

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth()

  if (!session?.user) {
    throw new Error('로그인이 필요합니다')
  }

  return next({ ctx: { user: session.user } })
})
```

### 6.5 Repository 패턴

#### 기본 Repository 클래스

```typescript
// src/lib/repositories/base-repository.ts
export abstract class BaseRepository<T> {
  protected abstract model: any

  async findById(id: string): Promise<T | null> {
    return await this.model.findUnique({
      where: { id },
    })
  }

  async findMany(options?: {
    where?: any
    orderBy?: any
    take?: number
    skip?: number
  }): Promise<T[]> {
    return await this.model.findMany(options)
  }

  async create(data: any): Promise<T> {
    return await this.model.create({
      data,
    })
  }

  async update(id: string, data: any): Promise<T> {
    return await this.model.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<T> {
    return await this.model.delete({
      where: { id },
    })
  }
}
```

#### 구체적인 Repository 구현

```typescript
// src/lib/repositories/post-repository.ts
export class PostRepository extends BaseRepository<Post> {
  protected model = prisma.post

  async findPublished(options?: {
    take?: number
    skip?: number
    orderBy?: Prisma.PostOrderByWithRelationInput
  }) {
    return await this.model.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      ...options,
    })
  }

  async findBySlug(slug: string) {
    return await this.model.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })
  }
}

export const postRepository = new PostRepository()
```

### 6.6 성능 최적화 패턴

#### 캐싱 전략

```typescript
// src/lib/cache/strategies.ts
import { unstable_cache } from 'next/cache'
import { cache } from 'react'

// Next.js 캐싱
export const getCachedPosts = unstable_cache(
  async (page: number = 1, limit: number = 10) => {
    return postRepository.findPublished({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
    })
  },
  ['posts'],
  {
    revalidate: 60, // 1분 캐시
    tags: ['posts'],
  }
)

// React 캐싱 (요청 단위)
export const getUser = cache(async (id: string) => {
  return await userRepository.findById(id)
})
```

#### 코드 분할 및 지연 로딩

```typescript
// src/components/lazy/lazy-components.tsx
import dynamic from 'next/dynamic'

// 에디터 지연 로딩
export const LazyEditor = dynamic(
  () => import('@/components/editor/tiptap-editor'),
  {
    loading: () => <EditorSkeleton />,
    ssr: false,
  }
)

// 모달 지연 로딩
export const LazyModal = dynamic(
  () => import('@/components/ui/dialog').then(mod => ({ default: mod.Dialog })),
  {
    loading: () => <div>Loading...</div>,
  }
)

// 차트 지연 로딩
export const LazyChart = dynamic(
  () => import('recharts').then(mod => ({ default: mod.LineChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
)
```

---

## 7. 성능 최적화 가이드

### 7.1 번들 최적화

#### 번들 분석

```bash
# 번들 크기 분석
npm run build:analyze

# 성능 측정
npm run lighthouse
```

#### Tree Shaking 최적화

```typescript
// ❌ 전체 라이브러리 임포트
import * as _ from 'lodash'

// ✅ 필요한 함수만 임포트
import { debounce } from 'lodash-es'

// ✅ 개별 패키지 사용
import debounce from 'lodash.debounce'
```

### 7.2 이미지 최적화

#### OptimizedImage 컴포넌트

```typescript
// src/components/ui/optimized-image.tsx
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
}

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  className,
  priority = false,
  quality = 85,
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      quality={quality}
      className={cn('rounded-lg object-cover', className)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  )
}
```

### 7.3 데이터베이스 최적화

#### Prisma 쿼리 최적화

```typescript
// ❌ N+1 쿼리 문제
const posts = await prisma.post.findMany()
for (const post of posts) {
  const author = await prisma.user.findUnique({
    where: { id: post.authorId },
  })
}

// ✅ include를 사용한 조인
const posts = await prisma.post.findMany({
  include: {
    author: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
})

// ✅ 필요한 필드만 선택
const posts = await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    excerpt: true,
    author: {
      select: {
        name: true,
      },
    },
  },
})
```

---

## 8. 테스트 전략

### 8.1 테스트 구조

```
src/
├── components/
│   └── __tests__/
│       ├── button.test.tsx
│       └── form.test.tsx
├── lib/
│   └── __tests__/
│       ├── utils.test.ts
│       └── validations.test.ts
└── app/
    └── __tests__/
        └── page.test.tsx
```

### 8.2 컴포넌트 테스트

```typescript
// src/components/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../ui/button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles correctly', () => {
    render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
  })
})
```

### 8.3 서버 액션 테스트

```typescript
// src/lib/actions/__tests__/post-actions.test.ts
import { createPost } from '../post-actions'
import { prismaMock } from '@/test/prisma-mock'

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

describe('createPost', () => {
  it('creates a post successfully', async () => {
    const mockPost = {
      id: '1',
      title: 'Test Post',
      content: 'Test content',
      authorId: 'user-1',
    }

    prismaMock.post.create.mockResolvedValue(mockPost)

    const result = await createPost({
      title: 'Test Post',
      content: 'Test content',
    })

    expect(result.data).toEqual(mockPost)
    expect(prismaMock.post.create).toHaveBeenCalledWith({
      data: {
        title: 'Test Post',
        content: 'Test content',
        authorId: expect.any(String),
      },
    })
  })
})
```

### 8.4 E2E 테스트 (Playwright)

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/auth/signin')

    await page.click('text=Google로 로그인')

    // OAuth 플로우 시뮬레이션
    await page.waitForURL('/dashboard')

    await expect(page.locator('text=대시보드')).toBeVisible()
  })
})
```

---

## 9. 배포 및 운영

### 9.1 환경 설정

#### 환경 변수 관리

```bash
# .env.local (개발)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# .env.production (프로덕션)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=production-secret-key
DATABASE_URL=postgresql://production-db-url
```

### 9.2 빌드 최적화

#### next.config.ts 설정

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 실험적 기능
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 번들 분석
  webpack: (config, { isServer }) => {
    if (!isServer && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-report.html',
        })
      )
    }
    return config
  },
}

export default nextConfig
```

### 9.3 모니터링 및 로깅

#### 에러 추적

```typescript
// src/lib/monitoring.ts
export function captureException(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    // Sentry, LogRocket 등 에러 추적 서비스
    console.error('Error captured:', error, context)
  } else {
    console.error('Development error:', error, context)
  }
}

// 사용 예제
try {
  await riskyOperation()
} catch (error) {
  captureException(error, { userId, operation: 'riskyOperation' })
  throw error
}
```

### 9.4 성능 모니터링

#### Web Vitals 추적

```typescript
// src/app/layout.tsx
import { Analytics } from '@/components/analytics'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

// src/components/analytics.tsx
'use client'
import { useReportWebVitals } from 'next/web-vitals'

export function Analytics() {
  useReportWebVitals((metric) => {
    // Google Analytics, Vercel Analytics 등으로 전송
    console.log(metric)
  })

  return null
}
```

---

## 마무리

이 가이드는 Next.js 15 기반 현대적 웹 애플리케이션 개발을 위한 포괄적인 지침을 제공합니다.
지속적으로 업데이트되는 기술 스택에 맞춰 가이드도 함께 발전시켜 나가겠습니다.

### 추가 리소스

- [Next.js 15 공식 문서](https://nextjs.org/docs)
- [React 19 문서](https://react.dev)
- [TypeScript 5.8+ 문서](https://www.typescriptlang.org/docs)
- [Tailwind CSS 4.0 문서](https://tailwindcss.com/docs)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com)

### 기여하기

이 가이드의 개선사항이나 추가할 내용이 있다면 언제든 제안해 주세요.
