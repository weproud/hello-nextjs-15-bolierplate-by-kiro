---
inclusion: always
---

# Product Overview

Next.js 15 보일러플레이트 애플리케이션으로, 확장 가능하고 타입 안전한 풀스택 웹 애플리케이션 구축을 위한 모범 사례를 구현합니다.

## Core Architecture Patterns

### Server-First Approach

- Server Components를 기본으로 사용하고, 필요한 경우에만 Client Components 사용
- `"use client"` 지시어는 상호작용이 필요한 컴포넌트에만 추가
- 데이터 페칭은 서버에서 수행하고 props로 전달

### Type Safety Standards

- 모든 API 응답과 데이터베이스 스키마에 대해 Zod 스키마 정의
- `next-safe-action`을 사용한 타입 안전한 서버 액션
- Prisma 스키마와 TypeScript 타입 간 일관성 유지

### Component Organization

```
src/components/
├── ui/           # 재사용 가능한 기본 컴포넌트 (shadcn/ui)
├── forms/        # 폼 관련 컴포넌트
├── auth/         # 인증 관련 컴포넌트
├── error/        # 에러 처리 컴포넌트
└── [feature]/    # 기능별 컴포넌트 그룹
```

## Code Style Conventions

### File Naming

- 컴포넌트 파일: `kebab-case.tsx` (예: `user-profile.tsx`)
- 페이지 파일: Next.js App Router 규칙 따름 (`page.tsx`, `layout.tsx`)
- 유틸리티 함수: `kebab-case.ts`

### Component Structure

```typescript
// 1. 타입 정의
interface ComponentProps {
  // props 정의
}

// 2. 컴포넌트 함수
export function ComponentName({ prop }: ComponentProps) {
  // 3. 훅과 상태
  // 4. 이벤트 핸들러
  // 5. JSX 반환
}
```

### Import Organization

```typescript
// 1. React 및 Next.js imports
import { useState } from 'react'
import { redirect } from 'next/navigation'

// 2. 외부 라이브러리
import { z } from 'zod'

// 3. 내부 모듈 (절대 경로 사용)
import { Button } from '@/components/ui/button'
import { validateUser } from '@/lib/auth'
```

## Error Handling Strategy

### Error Boundaries

- 페이지 레벨: `error.tsx` 파일 사용
- 컴포넌트 레벨: `ErrorBoundary` 컴포넌트 래핑
- 전역 에러: `global-error.tsx`로 처리

### Server Action Error Handling

```typescript
// safe-action을 사용한 에러 처리
const action = createSafeAction(schema, async data => {
  try {
    // 비즈니스 로직
  } catch (error) {
    return { error: '에러 메시지' }
  }
})
```

## Form Handling Patterns

### React Hook Form + Zod

- 모든 폼에서 `react-hook-form`과 `zod` 조합 사용
- 서버 액션과 연동을 위해 `useFormWithAction` 훅 활용
- 폼 검증은 클라이언트와 서버 양쪽에서 수행

### Form Component Structure

```typescript
const formSchema = z.object({
  // 스키마 정의
})

export function FormComponent() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  // 서버 액션 연동
  const { execute, isExecuting } = useAction(serverAction)
}
```

## Authentication Flow

### NextAuth.js v5 Integration

- Google OAuth 제공자 사용
- 세션 기반 인증
- 미들웨어를 통한 라우트 보호

### Protected Routes

- 서버 컴포넌트에서 `auth()` 함수로 세션 확인
- 클라이언트에서는 `useSession` 훅 사용
- 인증이 필요한 페이지는 `ProtectedRoute` 컴포넌트로 래핑

## Performance Guidelines

### Bundle Optimization

- 동적 import를 사용한 코드 분할
- `next/dynamic`으로 컴포넌트 지연 로딩
- 이미지는 `next/image` 컴포넌트 사용

### Caching Strategy

- 정적 데이터는 `cache()` 함수 사용
- 동적 데이터는 적절한 `revalidate` 설정
- Prisma 쿼리 최적화 및 인덱스 활용

## Development Workflow

### Quality Assurance

- 코드 작성 전 타입 정의부터 시작
- 컴포넌트 작성 시 접근성 고려 (ARIA 속성, 키보드 네비게이션)
- 에러 처리와 로딩 상태 구현 필수

### Testing Approach

- 단위 테스트: Vitest + React Testing Library
- 통합 테스트: 주요 사용자 플로우 중심
- E2E 테스트: 인증 및 핵심 기능
