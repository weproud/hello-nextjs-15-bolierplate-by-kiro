# 컴포넌트 문서화

이 문서는 Next.js 15 애플리케이션의 모든 컴포넌트에 대한 사용법과 예제를 제공합니다.

## 컴포넌트 구조

```
src/components/
├── ui/           # 재사용 가능한 기본 UI 컴포넌트 (shadcn/ui 기반)
├── forms/        # 폼 관련 컴포넌트
├── auth/         # 인증 관련 컴포넌트
├── layout/       # 레이아웃 컴포넌트
├── error/        # 에러 처리 컴포넌트
├── editor/       # 텍스트 에디터 컴포넌트
├── posts/        # 포스트 관련 컴포넌트
├── projects/     # 프로젝트 관련 컴포넌트
├── dashboard/    # 대시보드 컴포넌트
├── providers/    # React 컨텍스트 프로바이더
├── lazy/         # 지연 로딩 컴포넌트
├── loading/      # 로딩 상태 컴포넌트
├── patterns/     # 디자인 패턴 예제
└── performance/  # 성능 최적화 컴포넌트
```

## 컴포넌트 사용 가이드라인

### 1. Server Components vs Client Components

- **기본적으로 모든 컴포넌트는 Server Component로 작성**
- 상호작용이 필요한 경우에만 `"use client"` 지시어 사용
- 클라이언트 컴포넌트는 최소한의 범위로 제한

```typescript
// ✅ Server Component (기본)
export function ServerComponent({ data }: Props) {
  return <div>{data.title}</div>
}

// ✅ Client Component (상호작용 필요시)
"use client"
export function ClientComponent({ onClick }: Props) {
  return <button onClick={onClick}>Click me</button>
}
```

### 2. 타입 안전성

- 모든 컴포넌트는 TypeScript 인터페이스로 props 정의
- Zod 스키마를 사용한 런타임 검증 적용
- 제네릭 타입을 활용한 재사용성 향상

```typescript
interface ComponentProps {
  title: string
  description?: string
  onAction?: (id: string) => void
}

export function Component({ title, description, onAction }: ComponentProps) {
  // 컴포넌트 구현
}
```

### 3. 스타일링 규칙

- TailwindCSS utility-first 접근법 사용
- shadcn/ui 컴포넌트 시스템 활용
- CSS Variables를 통한 테마 지원

```typescript
import { cn } from '@/lib/utils'

export function StyledComponent({ className, ...props }: Props) {
  return (
    <div
      className={cn(
        "base-styles",
        "responsive-styles",
        className
      )}
      {...props}
    />
  )
}
```

## 카테고리별 컴포넌트 가이드

### [UI 컴포넌트](./ui/README.md)

기본 UI 요소들 (Button, Input, Card 등)

### [폼 컴포넌트](./forms/README.md)

React Hook Form + Zod 기반 폼 처리

### [인증 컴포넌트](./auth/README.md)

NextAuth.js 기반 인증 시스템

### [레이아웃 컴포넌트](./layout/README.md)

페이지 레이아웃 및 구조 컴포넌트

### [에러 처리 컴포넌트](./error/README.md)

에러 바운더리 및 에러 처리 시스템

### [에디터 컴포넌트](./editor/README.md)

TipTap 기반 리치 텍스트 에디터

### [포스트 컴포넌트](./posts/README.md)

블로그 포스트 관련 컴포넌트

### [프로젝트 컴포넌트](./projects/README.md)

프로젝트 관리 관련 컴포넌트

### [대시보드 컴포넌트](./dashboard/README.md)

대시보드 UI 컴포넌트

## 성능 최적화 가이드

### 1. 코드 분할

```typescript
import dynamic from 'next/dynamic'

const LazyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <div>Loading...</div>,
  ssr: false
})
```

### 2. 메모이제이션

```typescript
import { memo } from 'react'

export const OptimizedComponent = memo(function Component(props: Props) {
  // 컴포넌트 구현
})
```

### 3. 이미지 최적화

```typescript
import { OptimizedImage } from '@/components/ui/optimized-image'

<OptimizedImage
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false}
/>
```

## 접근성 가이드라인

### 1. ARIA 속성

```typescript
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  aria-controls="dialog-content"
>
  Close
</button>
```

### 2. 키보드 네비게이션

```typescript
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'

export function NavigableComponent() {
  const { handleKeyDown } = useKeyboardNavigation({
    onEnter: handleSelect,
    onEscape: handleClose
  })

  return <div onKeyDown={handleKeyDown}>...</div>
}
```

### 3. 포커스 관리

```typescript
import { useRef, useEffect } from 'react'

export function FocusableComponent({ autoFocus }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus()
    }
  }, [autoFocus])

  return <input ref={ref} />
}
```

## 테스트 가이드라인

### 1. 컴포넌트 테스트

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Component } from './component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const handleClick = vi.fn()
    render(<Component onClick={handleClick} />)

    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### 2. 접근성 테스트

```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should not have accessibility violations', async () => {
  const { container } = render(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## 개발 도구

### 1. Storybook 설정 (선택사항)

컴포넌트 개발 및 문서화를 위한 Storybook 설정 가이드

### 2. 컴포넌트 생성 템플릿

새로운 컴포넌트 생성을 위한 표준 템플릿

### 3. 린팅 규칙

컴포넌트 개발 시 준수해야 할 ESLint 규칙들

---

각 카테고리별 상세 문서는 해당 디렉토리의 README.md 파일을 참조하세요.
