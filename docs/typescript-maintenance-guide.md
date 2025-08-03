# TypeScript 유지보수 가이드

## 목차

1. [개요](#개요)
2. [일상적인 개발 워크플로우](#일상적인-개발-워크플로우)
3. [타입 안전성 유지 방법](#타입-안전성-유지-방법)
4. [일반적인 타입 에러 패턴과 해결법](#일반적인-타입-에러-패턴과-해결법)
5. [코드 리뷰 체크리스트](#코드-리뷰-체크리스트)
6. [성능 최적화 가이드](#성능-최적화-가이드)
7. [트러블슈팅](#트러블슈팅)

## 개요

이 가이드는 Next.js 15 보일러플레이트 프로젝트에서 TypeScript 타입 안전성을 유지하고 새로운 타입
에러를 예방하기 위한 실용적인 지침을 제공합니다.

## 일상적인 개발 워크플로우

### 개발 시작 전 체크

```bash
# 1. 의존성 설치 확인
pnpm install

# 2. 타입 체크
pnpm type-check

# 3. 린트 체크
pnpm lint

# 4. 개발 서버 시작
pnpm dev
```

### 새로운 기능 개발 시 단계별 접근

#### 1단계: 타입 정의

```typescript
// ✅ 좋은 예: 명확한 인터페이스 정의
interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  preferences: UserPreferences
}

interface UserPreferences {
  theme: 'light' | 'dark'
  language: 'ko' | 'en'
  notifications: boolean
}

// ❌ 나쁜 예: any 타입 사용
interface UserProfile {
  id: string
  data: any // 피해야 할 패턴
}
```

#### 2단계: 컴포넌트 구현

```typescript
// ✅ 좋은 예: 타입 안전한 컴포넌트
interface UserCardProps {
  user: UserProfile
  onEdit?: (user: UserProfile) => void
  className?: string
}

export function UserCard({ user, onEdit, className }: UserCardProps) {
  // 구현...
}

// ❌ 나쁜 예: 타입이 없는 컴포넌트
export function UserCard(props: any) {
  // 구현...
}
```

#### 3단계: 서버 액션 구현

```typescript
// ✅ 좋은 예: next-safe-action 사용
const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
})

export const updateUser = actionClient
  .inputSchema(updateUserSchema)
  .action(async ({ parsedInput }) => {
    // 타입 안전한 구현
    return await userRepository.update(parsedInput.id, parsedInput)
  })
```

### 커밋 전 체크리스트

```bash
# 1. 타입 체크 통과 확인
pnpm type-check

# 2. 린트 에러 수정
pnpm lint:fix

# 3. 포맷팅 적용
pnpm format

# 4. 빌드 테스트
pnpm build

# 5. 테스트 실행 (있는 경우)
pnpm test --run
```

## 타입 안전성 유지 방법

### 1. 엄격한 TypeScript 설정 유지

현재 프로젝트의 `tsconfig.json` 설정을 유지하세요:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 2. 타입 가드 활용

```typescript
// ✅ 타입 가드 함수
function isValidUser(user: unknown): user is UserProfile {
  return (
    typeof user === 'object' &&
    user !== null &&
    typeof (user as UserProfile).id === 'string' &&
    typeof (user as UserProfile).name === 'string'
  )
}

// 사용 예
function processUser(data: unknown) {
  if (isValidUser(data)) {
    // 이제 data는 UserProfile 타입으로 추론됨
    console.log(data.name)
  }
}
```

### 3. 유틸리티 타입 활용

```typescript
// ✅ 유틸리티 타입으로 타입 재사용
type CreateUserRequest = Omit<UserProfile, 'id'>
type UpdateUserRequest = Partial<Pick<UserProfile, 'name' | 'email'>>

// ✅ 조건부 타입 활용
type ApiResponse<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
    }
```

### 4. 제네릭 타입 제약 조건

```typescript
// ✅ 적절한 제약 조건
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>
  create(data: Omit<T, 'id'>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
}

// ✅ 사용 예
class UserRepository implements Repository<UserProfile> {
  // 구현...
}
```

## 일반적인 타입 에러 패턴과 해결법

### 1. "Property does not exist" 에러

```typescript
// ❌ 문제 상황
interface User {
  name: string
}

const user: User = { name: 'John' }
console.log(user.email) // 에러: Property 'email' does not exist

// ✅ 해결법 1: 인터페이스 확장
interface User {
  name: string
  email?: string // 선택적 속성 추가
}

// ✅ 해결법 2: 타입 단언 (주의해서 사용)
console.log((user as any).email) // 임시 해결책

// ✅ 해결법 3: 타입 가드 사용
if ('email' in user) {
  console.log(user.email)
}
```

### 2. "Argument of type X is not assignable to parameter of type Y"

```typescript
// ❌ 문제 상황
function processId(id: string) {
  // 구현...
}

const userId: string | number = getUserId()
processId(userId) // 에러

// ✅ 해결법 1: 타입 변환
processId(String(userId))

// ✅ 해결법 2: 타입 가드
if (typeof userId === 'string') {
  processId(userId)
}

// ✅ 해결법 3: 함수 오버로드
function processId(id: string): void
function processId(id: number): void
function processId(id: string | number): void {
  const stringId = typeof id === 'string' ? id : String(id)
  // 구현...
}
```

### 3. "Cannot find module" 에러

```typescript
// ❌ 문제 상황
import { someFunction } from './utils' // 에러

// ✅ 해결법 1: 정확한 경로 사용
import { someFunction } from './utils.ts'
import { someFunction } from '@/lib/utils'

// ✅ 해결법 2: 타입 선언 파일 생성 (외부 모듈의 경우)
// types/external-lib.d.ts
declare module 'external-lib' {
  export function someFunction(): void
}
```

### 4. Next.js 15 관련 타입 에러

```typescript
// ❌ 구버전 방식
interface PageProps {
  params: { id: string }
  searchParams: { query: string }
}

// ✅ Next.js 15 방식
interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ query: string }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params
  const { query } = await searchParams
  // 구현...
}
```

## 코드 리뷰 체크리스트

### 타입 정의 검토

- [ ] 모든 인터페이스와 타입이 명확하게 정의되었는가?
- [ ] `any` 타입 사용이 최소화되었는가?
- [ ] 제네릭 타입에 적절한 제약 조건이 있는가?
- [ ] 유틸리티 타입을 효과적으로 활용했는가?

### 컴포넌트 검토

- [ ] Props 인터페이스가 정의되었는가?
- [ ] 이벤트 핸들러 타입이 정확한가?
- [ ] 조건부 렌더링에서 타입 안전성이 보장되는가?
- [ ] ref 사용 시 적절한 타입이 지정되었는가?

### 서버 액션 검토

- [ ] Zod 스키마가 정의되었는가?
- [ ] next-safe-action을 사용했는가?
- [ ] 에러 처리가 타입 안전하게 구현되었는가?
- [ ] 반환 타입이 명시되었는가?

### 일반적인 코드 품질

- [ ] 타입 체크가 통과하는가?
- [ ] ESLint 규칙을 준수하는가?
- [ ] 코드가 일관된 스타일을 따르는가?
- [ ] 복잡한 타입에 주석이 있는가?

## 성능 최적화 가이드

### 1. 타입 복잡도 관리

```typescript
// ❌ 과도하게 복잡한 타입
type ComplexType<T> = T extends infer U
  ? U extends string
    ? U extends `${infer A}_${infer B}`
      ? A extends 'user'
        ? B extends 'profile'
          ? UserProfile
          : never
        : never
      : never
    : never
  : never

// ✅ 단순하고 명확한 타입
type UserProfileKey = 'user_profile'
type GetTypeByKey<K> = K extends 'user_profile' ? UserProfile : never
```

### 2. 타입 임포트 최적화

```typescript
// ✅ 타입만 임포트할 때는 type 키워드 사용
import type { UserProfile } from '@/types/user'
import type { ComponentProps } from 'react'

// ✅ 값과 타입을 함께 임포트할 때
import { createUser, type CreateUserRequest } from '@/lib/user'
```

### 3. 조건부 타입 최적화

```typescript
// ❌ 비효율적인 조건부 타입
type SlowType<T> = T extends string
  ? T extends number
    ? never
    : string
  : T extends number
    ? number
    : never

// ✅ 효율적인 조건부 타입
type FastType<T> = T extends string ? string : T extends number ? number : never
```

## 트러블슈팅

### 자주 발생하는 문제와 해결법

#### 1. 빌드는 성공하지만 타입 체크 실패

```bash
# 문제 진단
pnpm type-check

# 해결 방법
# 1. tsconfig.json 설정 확인
# 2. 타입 정의 파일 확인
# 3. 의존성 타입 패키지 설치 확인
```

#### 2. ESLint와 TypeScript 충돌

```bash
# 문제 진단
pnpm lint

# 해결 방법
# 1. eslint.config.ts에서 규칙 충돌 확인
# 2. @typescript-eslint 규칙과 기본 ESLint 규칙 중복 제거
# 3. prettier와의 충돌 확인
```

#### 3. 개발 서버는 정상이지만 빌드 실패

```bash
# 문제 진단
pnpm build

# 해결 방법
# 1. 동적 임포트 타입 확인
# 2. Next.js 특화 타입 확인
# 3. 환경 변수 타입 정의 확인
```

### 디버깅 도구 활용

#### TypeScript 컴파일러 옵션

```json
{
  "compilerOptions": {
    "noEmit": true,
    "skipLibCheck": false,
    "declaration": true,
    "declarationMap": true
  }
}
```

#### 유용한 명령어

```bash
# 상세한 타입 체크 정보
npx tsc --noEmit --listFiles

# 특정 파일의 타입 정보
npx tsc --noEmit --listFiles | grep "filename"

# 타입 정의 생성
npx tsc --declaration --emitDeclarationOnly
```

## 마무리

이 가이드를 따라 개발하면 타입 안전성을 유지하면서 효율적으로 개발할 수 있습니다. 새로운 팀원이
합류할 때도 이 가이드를 참고하여 일관된 코드 품질을 유지하세요.

### 추가 리소스

- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
- [Next.js TypeScript 가이드](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
- [Zod 문서](https://zod.dev/)
- [next-safe-action 문서](https://next-safe-action.dev/)

### 정기적인 점검 항목

- [ ] 월 1회 의존성 업데이트 및 타입 호환성 확인
- [ ] 분기별 TypeScript 버전 업데이트 검토
- [ ] 반기별 타입 정의 리팩토링 검토
- [ ] 연 1회 전체 타입 아키텍처 검토
