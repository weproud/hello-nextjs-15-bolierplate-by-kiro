# Design Document

## Overview

프로젝트의 완전한 개발 환경 구성을 위한 설계입니다. 현재 기본적인 Next.js 15 + Tailwind CSS 4.0
설정에서 시작하여, 가이드라인에 명시된 모든 기술 스택과 프로젝트 구조를 체계적으로 구성합니다.

### 현재 상태 분석

- ✅ Next.js 15 (App Router)
- ✅ TypeScript 5 (기본 설정)
- ✅ Tailwind CSS 4.0 (기본 설정)
- ✅ ESLint (기본 Next.js 규칙)
- ❌ Strict TypeScript 설정
- ❌ shadcn/ui
- ❌ Prisma + PostgreSQL
- ❌ NextAuth.js
- ❌ 완전한 프로젝트 구조

## Architecture

### 기술 스택 구성도

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js 15 App Router] --> B[React 19]
        A --> C[TypeScript 5.8+]
        C --> D[Strict Mode + 추가 규칙]
    end

    subgraph "Styling Layer"
        E[Tailwind CSS 4.0] --> F[CSS Variables]
        E --> G[shadcn/ui Components]
        G --> H[next-themes]
    end

    subgraph "Data Layer"
        I[Prisma ORM] --> J[PostgreSQL]
        I --> K[Type-safe Queries]
    end

    subgraph "Auth Layer"
        L[NextAuth.js 5.0] --> M[Google OAuth]
        L --> N[JWT Sessions]
    end

    subgraph "State Management"
        O[Zustand] --> P[Type-safe Stores]
        Q[React Hook Form] --> R[Zod Validation]
    end

    subgraph "Development Tools"
        S[ESLint + Prettier] --> T[Code Quality]
        U[next-safe-action] --> V[Type-safe Server Actions]
    end
```

### 프로젝트 구조 설계

```
src/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API 라우트
│   │   ├── auth/
│   │   └── webhooks/
│   ├── auth/              # 인증 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 홈페이지
│   └── globals.css        # 전역 스타일
├── components/            # 재사용 컴포넌트
│   ├── auth/             # 인증 관련 컴포넌트
│   └── ui/               # shadcn/ui 기본 컴포넌트
├── contexts/             # React Context
├── data/                 # 정적 데이터
├── hooks/                # 커스텀 훅
├── i18n/                 # 국제화 설정
├── lib/                  # 유틸리티 및 설정
│   ├── actions/          # Server Actions
│   ├── cache/            # 캐싱 관련
│   ├── prisma/           # Prisma 설정
│   ├── utils/            # 유틸리티 함수
│   └── validations/      # Zod 스키마
├── providers/            # Provider 컴포넌트
├── services/             # 비즈니스 로직
├── stores/               # Zustand 스토어
├── styles/               # 추가 스타일 파일
└── types/                # TypeScript 타입 정의
```

## Components and Interfaces

### 1. TypeScript 설정 강화

**tsconfig.json 업데이트:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  }
}
```

### 2. 코드 품질 도구 설정

**ESLint 규칙 확장:**

- TypeScript 전용 규칙
- 사용하지 않는 변수 감지
- console.log 경고
- 코드 스타일 일관성

**Prettier 설정:**

- 세미콜론 없음
- 단일 따옴표 사용
- 2칸 들여쓰기
- 80자 줄 길이 제한

### 3. 스타일링 시스템

**Tailwind CSS 4.0 설정:**

- CSS 변수 기반 테마 시스템
- 다크모드 지원
- 커스텀 컬러 팔레트

**shadcn/ui 통합:**

- New York 스타일
- zinc 베이스 컬러
- CSS 변수 기반 테마

### 4. 데이터베이스 스키마

**핵심 모델 관계:**

```prisma
model User {
  id        String    @id @default(dbgenerated("gen_random_uuid()"))
  name      String?   @db.VarChar(255)
  email     String    @unique @db.VarChar(255)
  projects  Project[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Project {
  id          String   @id @default(dbgenerated("gen_random_uuid()"))
  title       String   @db.VarChar(255)
  description String?  @db.Text
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 5. 인증 시스템

**NextAuth.js 설정:**

- Google OAuth Provider
- JWT 세션 전략
- Prisma 어댑터
- 타입 안전한 세션 관리

### 6. 상태 관리

**Zustand 스토어:**

- 타입 안전한 전역 상태
- 지속성 미들웨어
- DevTools 통합

**React Hook Form + Zod:**

- 타입 안전한 폼 검증
- 서버 사이드 검증과 일치
- 에러 처리 통합

## Data Models

### 사용자 관련 모델

```typescript
interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: Date
  updatedAt: Date
}

interface Session {
  user: User
  expires: string
}
```

### 프로젝트 관련 모델

```typescript
interface Project {
  id: string
  title: string
  description: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}
```

### 폼 검증 스키마

```typescript
const createProjectSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.'),
  description: z.string().optional(),
})

type CreateProjectInput = z.infer<typeof createProjectSchema>
```

## Error Handling

### 1. Server Actions 에러 처리

```typescript
export const createProject = authAction(createProjectSchema).action(
  async ({ parsedInput, ctx }) => {
    try {
      const project = await prisma.project.create({
        data: {
          ...parsedInput,
          userId: ctx.user.id,
        },
      })

      revalidatePath('/projects')
      return { success: true, data: project }
    } catch (error) {
      console.error('프로젝트 생성 오류:', error)
      throw new Error('프로젝트를 생성하는 중 오류가 발생했습니다.')
    }
  }
)
```

### 2. 클라이언트 에러 처리

```typescript
const { execute, isExecuting, result } = useAction(createProject, {
  onSuccess: ({ data }) => {
    toast.success('프로젝트가 생성되었습니다.')
  },
  onError: ({ error }) => {
    toast.error(error.serverError || '오류가 발생했습니다.')
  },
})
```

### 3. 전역 에러 경계

- React Error Boundary 구현
- 404/500 에러 페이지
- 개발/프로덕션 환경별 에러 표시

## Testing Strategy

### 1. 단위 테스트

- 유틸리티 함수 테스트
- 컴포넌트 단위 테스트
- Zod 스키마 검증 테스트

### 2. 통합 테스트

- Server Actions 테스트
- 데이터베이스 연동 테스트
- 인증 플로우 테스트

### 3. E2E 테스트

- 주요 사용자 플로우
- 인증 및 권한 테스트
- 반응형 디자인 테스트

### 4. 테스트 도구

- Jest + Testing Library
- Playwright (E2E)
- MSW (API 모킹)

## 성능 최적화

### 1. Next.js 최적화

- Server Components 우선 사용
- 동적 임포트 활용
- 이미지 최적화 설정

### 2. 번들 최적화

- Tree shaking 활용
- 코드 분할 전략
- 의존성 최적화

### 3. 캐싱 전략

- Next.js 캐싱 활용
- Prisma 쿼리 캐싱
- 정적 데이터 캐싱

## 보안 고려사항

### 1. 인증 보안

- JWT 토큰 보안
- CSRF 보호
- 세션 관리

### 2. 데이터 보안

- 입력 검증 (Zod)
- SQL 인젝션 방지 (Prisma)
- XSS 방지

### 3. 환경 변수 관리

- 타입 안전한 환경 변수
- 민감 정보 보호
- 개발/프로덕션 분리
