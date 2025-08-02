# Design Document

## Overview

이 설계는 현재 Next.js 15 애플리케이션을 최신 best practice에 맞춰 리팩토링하는 포괄적인 계획을
제시합니다. 프로젝트는 이미 Next.js 15, React 19, TypeScript 5.8+, TailwindCSS 4.0, shadcn/ui를
사용하고 있으며, 코드 구조와 패턴을 현대적인 표준에 맞춰 개선하는 것이 목표입니다.

### 현재 상태 분석

**강점:**

- Next.js 15 App Router 사용
- TypeScript strict 모드 활성화
- TailwindCSS 4.0 with CSS variables
- shadcn/ui 컴포넌트 시스템
- Prisma ORM with PostgreSQL
- NextAuth.js 5.0 인증 시스템
- next-safe-action을 통한 타입 안전한 서버 액션
- Zustand 상태 관리
- 성능 최적화 설정 (번들 분석, 캐싱 전략)

**개선 필요 영역:**

- 컴포넌트 구조 및 네이밍 일관성
- 타입 정의 중앙화
- 에러 처리 시스템 통합
- 성능 최적화 패턴 적용
- 테스트 구조 개선
- 코드 분할 및 lazy loading 최적화

## Architecture

### 1. 프로젝트 구조 최적화

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (app)/             # 인증된 사용자 라우트 그룹
│   │   ├── (dashboard)/   # 대시보드 관련 라우트
│   │   └── (community)/   # 커뮤니티 관련 라우트
│   ├── @modal/            # 병렬 라우트 (모달)
│   ├── api/               # API 라우트
│   └── auth/              # 인증 관련 라우트
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # shadcn/ui 기본 컴포넌트
│   ├── forms/            # 폼 관련 컴포넌트
│   ├── auth/             # 인증 관련 컴포넌트
│   ├── dashboard/        # 대시보드 컴포넌트
│   ├── posts/            # 포스트 관련 컴포넌트
│   ├── projects/         # 프로젝트 관련 컴포넌트
│   ├── editor/           # 에디터 컴포넌트
│   ├── error/            # 에러 처리 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── lib/                  # 유틸리티 및 설정
│   ├── actions/          # 서버 액션
│   ├── validations/      # Zod 스키마
│   ├── cache/            # 캐싱 전략
│   └── prisma/           # 데이터베이스 유틸리티
├── hooks/                # 커스텀 React 훅
├── stores/               # Zustand 스토어
├── types/                # TypeScript 타입 정의
├── providers/            # React 컨텍스트 프로바이더
└── services/             # 외부 서비스 통합
```

### 2. 컴포넌트 아키텍처

#### Server Components First 접근법

- 기본적으로 모든 컴포넌트는 Server Component
- 클라이언트 상호작용이 필요한 경우에만 'use client' 사용
- 적절한 경계에서 클라이언트/서버 컴포넌트 분리

#### 컴포넌트 계층 구조

```
Page Component (Server)
├── Layout Component (Server)
├── Data Fetching (Server)
├── Static Content (Server)
└── Interactive Components (Client)
    ├── Form Components (Client)
    ├── Modal Components (Client)
    └── State Management (Client)
```

### 3. 타입 시스템 설계

#### 중앙화된 타입 정의

```typescript
// types/index.ts - 중앙 타입 내보내기
export * from './api'
export * from './database'
export * from './common'
export * from './editor'
export * from './post'

// types/common.ts - 공통 타입
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

#### 런타임 검증과 타입 안전성

```typescript
// lib/validations/schemas.ts
import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
})

export type User = z.infer<typeof UserSchema>
```

## Components and Interfaces

### 1. UI 컴포넌트 시스템

#### shadcn/ui 기반 디자인 시스템

```typescript
// components/ui/button.tsx
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
```

#### 컴포넌트 합성 패턴

```typescript
// components/forms/form-field.tsx
interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
        {label}
      </Label>
      {children}
      {error && <FormError message={error} />}
    </div>
  )
}
```

### 2. 폼 처리 시스템

#### React Hook Form + Zod 통합

```typescript
// hooks/use-form-with-action.ts
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'

export function useFormWithAction<TSchema extends z.ZodSchema, TInput, TOutput>(
  schema: TSchema,
  action: SafeAction<TInput, TOutput>
) {
  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
  })

  const { execute, result, isExecuting } = useAction(action)

  const onSubmit = form.handleSubmit(async data => {
    await execute(data)
  })

  return {
    form,
    onSubmit,
    result,
    isExecuting,
  }
}
```

### 3. 상태 관리 아키텍처

#### Zustand 스토어 구조

```typescript
// stores/app-store.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface AppState {
  user: User | null
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
}

interface AppActions {
  setUser: (user: User | null) => void
  setTheme: (theme: AppState['theme']) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState & AppActions>()(
  immer(set => ({
    user: null,
    theme: 'system',
    sidebarOpen: false,
    setUser: user =>
      set(state => {
        state.user = user
      }),
    setTheme: theme =>
      set(state => {
        state.theme = theme
      }),
    toggleSidebar: () =>
      set(state => {
        state.sidebarOpen = !state.sidebarOpen
      }),
  }))
)
```

## Data Models

### 1. 데이터베이스 스키마 최적화

#### Prisma 스키마 구조

```prisma
// prisma/schema.prisma
model User {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts Account[]
  sessions Session[]
  posts    Post[]
  projects Project[]

  @@map("users")
}

model Post {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title     String
  content   String
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  authorId String @db.Uuid
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@map("posts")
}
```

### 2. 타입 안전한 데이터 액세스

#### Repository 패턴

```typescript
// lib/repositories/post-repository.ts
import { prisma } from '@/lib/prisma'
import type { Post, Prisma } from '@prisma/client'

export class PostRepository {
  async findMany(options?: {
    where?: Prisma.PostWhereInput
    orderBy?: Prisma.PostOrderByWithRelationInput
    take?: number
    skip?: number
  }) {
    return prisma.post.findMany({
      ...options,
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

  async findById(id: string) {
    return prisma.post.findUnique({
      where: { id },
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

  async create(data: Prisma.PostCreateInput) {
    return prisma.post.create({
      data,
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

## Error Handling

### 1. 통합 에러 처리 시스템

#### 에러 바운더리 계층

```typescript
// components/error/error-boundary.tsx
'use client'

import { Component, type ReactNode } from 'react'
import { ErrorFallback } from './error-fallback'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // 에러 로깅 서비스로 전송
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}
```

#### 서버 액션 에러 처리

```typescript
// lib/actions/safe-action-wrapper.ts
import { createSafeActionClient } from 'next-safe-action'
import { z } from 'zod'

export const actionClient = createSafeActionClient({
  handleReturnedServerError(e) {
    if (e instanceof Error) {
      return {
        serverError: e.message,
      }
    }
    return {
      serverError: 'An unexpected error occurred',
    }
  },
})

export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth()

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  return next({ ctx: { user: session.user } })
})
```

### 2. 클라이언트 에러 처리

#### 에러 상태 관리

```typescript
// hooks/use-error-handler.ts
import { useCallback } from 'react'
import { toast } from 'sonner'

export function useErrorHandler() {
  const handleError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      toast.error(error.message)
    } else {
      toast.error('An unexpected error occurred')
    }

    // 에러 로깅
    console.error('Client error:', error)
  }, [])

  return { handleError }
}
```

## Testing Strategy

### 1. 테스트 구조

#### 컴포넌트 테스트

```typescript
// components/ui/__tests__/button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

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
})
```

#### 서버 액션 테스트

```typescript
// lib/actions/__tests__/post-actions.test.ts
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
  })
})
```

### 2. 성능 테스트

#### 번들 크기 모니터링

```javascript
// scripts/bundle-analysis.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer && process.env.ANALYZE === 'true') {
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
```

## Performance Optimizations

### 1. 코드 분할 및 Lazy Loading

#### 동적 임포트 전략

```typescript
// components/lazy-components.ts
import dynamic from 'next/dynamic'

export const LazyEditor = dynamic(() => import('./editor/tiptap-editor'), {
  loading: () => <div>Loading editor...</div>,
  ssr: false,
})

export const LazyModal = dynamic(() => import('./ui/modal'), {
  loading: () => <div>Loading...</div>,
})
```

### 2. 캐싱 전략

#### Next.js 캐싱 최적화

```typescript
// lib/cache/strategies.ts
import { unstable_cache } from 'next/cache'

export const getCachedPosts = unstable_cache(
  async (page: number = 1, limit: number = 10) => {
    return postRepository.findMany({
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
```

### 3. 이미지 최적화

#### Next.js Image 컴포넌트 활용

```typescript
// components/ui/optimized-image.tsx
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  className,
  priority = false,
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn('rounded-lg object-cover', className)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
```

## Implementation Phases

### Phase 1: 기반 구조 정리

- 타입 시스템 중앙화
- 컴포넌트 구조 표준화
- 에러 처리 시스템 통합

### Phase 2: 성능 최적화

- 코드 분할 적용
- 캐싱 전략 구현
- 이미지 최적화

### Phase 3: 개발자 경험 개선

- 테스트 구조 개선
- 린팅 규칙 강화
- 문서화 개선

### Phase 4: 고급 기능 구현

- 고급 상태 관리 패턴
- 성능 모니터링
- 접근성 개선
