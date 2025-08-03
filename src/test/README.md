# Testing Framework

이 프로젝트는 Vitest와 React Testing Library를 사용하여 타입 안전한 테스트 환경을 제공합니다.

## 테스트 실행

```bash
pnpm test              # 테스트 실행
pnpm test:watch        # 감시 모드로 테스트 실행
pnpm test:ui           # UI 모드로 테스트 실행
pnpm test:coverage     # 커버리지와 함께 테스트 실행
```

## 테스트 구조

```
src/test/
├── setup.ts          # 전역 테스트 설정
├── utils.ts          # 테스트 유틸리티 함수
├── types.ts          # 테스트 타입 정의
├── fixtures.ts       # 테스트 데이터 픽스처
└── mocks.ts          # 모킹 유틸리티
```

## 테스트 작성 가이드

### 기본 컴포넌트 테스트

```typescript
import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/utils'
import { createTestSession } from '@/test/fixtures'
import { Button } from './button'

describe('Button', () => {
  it('renders correctly', () => {
    const { getByRole } = renderWithProviders(
      <Button>Click me</Button>
    )

    expect(getByRole('button')).toBeInTheDocument()
    expect(getByRole('button')).toHaveTextContent('Click me')
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const { getByRole } = renderWithProviders(
      <Button onClick={handleClick}>Click me</Button>
    )

    await userEvent.click(getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

### 인증이 필요한 컴포넌트 테스트

```typescript
import { renderWithProviders } from '@/test/utils'
import { createTestSession } from '@/test/fixtures'

describe('ProtectedComponent', () => {
  it('renders for authenticated user', () => {
    const session = createTestSession()
    const { getByText } = renderWithProviders(
      <ProtectedComponent />,
      { session }
    )

    expect(getByText('Welcome back!')).toBeInTheDocument()
  })
})
```

### 서버 액션 테스트

```typescript
import { describe, it, expect, vi } from 'vitest'
import { createMockServerAction } from '@/test/mocks'
import { createTestUser } from '@/test/fixtures'

describe('createUser action', () => {
  it('creates user successfully', async () => {
    const mockAction = createMockServerAction(async data => {
      return { data: createTestUser(data) }
    })

    const result = await mockAction({
      name: 'Test User',
      email: 'test@example.com',
    })

    expect(result.data).toMatchObject({
      name: 'Test User',
      email: 'test@example.com',
    })
  })
})
```

### 폼 테스트

```typescript
import { renderWithProviders } from '@/test/utils'
import { createTestFormData } from '@/test/fixtures'
import userEvent from '@testing-library/user-event'

describe('ContactForm', () => {
  it('submits form with valid data', async () => {
    const onSubmit = vi.fn()
    const { getByLabelText, getByRole } = renderWithProviders(
      <ContactForm onSubmit={onSubmit} />
    )

    await userEvent.type(getByLabelText('Name'), 'John Doe')
    await userEvent.type(getByLabelText('Email'), 'john@example.com')
    await userEvent.click(getByRole('button', { name: 'Submit' }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com'
    })
  })
})
```

## 모킹 가이드

### Prisma 클라이언트 모킹

```typescript
import { mockPrisma, setupUserMocks } from '@/test/mocks'

describe('UserService', () => {
  beforeEach(() => {
    setupUserMocks()
  })

  it('finds user by id', async () => {
    const user = await userService.findById('test-id')
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'test-id' },
    })
  })
})
```

### Next.js 라우터 모킹

```typescript
import { mockNextRouter } from '@/test/mocks'

describe('Navigation', () => {
  it('navigates to correct page', async () => {
    const { getByRole } = renderWithProviders(<Navigation />)

    await userEvent.click(getByRole('link', { name: 'Home' }))
    expect(mockNextRouter.push).toHaveBeenCalledWith('/')
  })
})
```

## 타입 안전성

모든 테스트 유틸리티와 픽스처는 완전한 타입 안전성을 제공합니다:

- `TestUser`, `TestPost`, `TestProject` 타입으로 데이터 일관성 보장
- `MockFunction<T>` 타입으로 모킹 함수 타입 안전성 확보
- `TestActionResult<T>` 타입으로 서버 액션 결과 타입 검증

## 커버리지 설정

테스트 커버리지는 다음 파일들을 제외합니다:

- 설정 파일들 (`*.config.*`)
- 타입 정의 파일들 (`*.d.ts`)
- 테스트 파일들 자체
- `node_modules` 및 빌드 결과물

## 성능 테스트

성능 관련 테스트는 별도로 실행할 수 있습니다:

```bash
pnpm perf:analyze     # 번들 크기 분석
pnpm perf:lighthouse  # Lighthouse 성능 측정
```
