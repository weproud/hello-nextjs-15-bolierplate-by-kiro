# LagomPath 프로젝트 종합 개발 가이드

> Next.js 15 기반 현대적 풀스택 웹 애플리케이션 개발을 위한 완전한 가이드

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [프로젝트 구조 및 아키텍처](#2-프로젝트-구조-및-아키텍처)
3. [기술 스택 및 의존성](#3-기술-스택-및-의존성)
4. [코딩 컨벤션 및 스타일](#4-코딩-컨벤션-및-스타일)
5. [핵심 시스템 분석](#5-핵심-시스템-분석)

---

## 1. 프로젝트 개요

LagomPath는 Next.js 15와 최신 React 19를 기반으로 한 현대적인 풀스택 웹 애플리케이션 보일러플레이트입니다. 프로젝트 관리, 사용자 인증, 그리고 확장 가능한 아키텍처를 제공합니다.

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
export function formatRelativeTime(
  date: Date | string,
  locale = 'ko-KR'
): string {
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
export const nameSchema = z
  .string()
  .min(1, '이름을 입력해주세요')
  .max(100, '이름이 너무 깁니다')

// src/lib/validations/project.ts
export const projectSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(100, '제목이 너무 깁니다'),
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
      include: { phases: true },
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
  phases?: Phase[]
}

// 유틸리티 타입
export type Prettify<T> = { [K in keyof T]: T[K] } & {}
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
```
