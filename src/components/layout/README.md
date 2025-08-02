# 레이아웃 컴포넌트 문서

애플리케이션의 페이지 구조와 레이아웃을 담당하는 컴포넌트들입니다. 반응형 디자인과 일관된 사용자
경험을 제공합니다.

## 주요 컴포넌트

### PageLayout

기본 페이지 레이아웃을 제공하는 컴포넌트입니다.

```typescript
import { PageLayout } from '@/components/layout/page-layout'

// 기본 사용법
<PageLayout>
  <div>페이지 콘텐츠</div>
</PageLayout>

// 제목과 설명 포함
<PageLayout
  title="페이지 제목"
  description="페이지 설명"
>
  <div>페이지 콘텐츠</div>
</PageLayout>

// 브레드크럼 포함
<PageLayout
  title="프로젝트 상세"
  breadcrumbs={[
    { label: '홈', href: '/' },
    { label: '프로젝트', href: '/projects' },
    { label: '상세', href: '/projects/1' }
  ]}
>
  <div>프로젝트 상세 내용</div>
</PageLayout>

// 액션 버튼 포함
<PageLayout
  title="프로젝트 목록"
  actions={
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      새 프로젝트
    </Button>
  }
>
  <div>프로젝트 목록</div>
</PageLayout>
```

**Props:**

- `title?: string` - 페이지 제목
- `description?: string` - 페이지 설명
- `breadcrumbs?: BreadcrumbItem[]` - 브레드크럼 항목들
- `actions?: ReactNode` - 페이지 액션 버튼들
- `children: ReactNode` - 페이지 콘텐츠
- `className?: string` - 추가 CSS 클래스
- `maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'` - 최대 너비 설정

### SidebarLayout

사이드바가 포함된 레이아웃 컴포넌트입니다.

```typescript
import { SidebarLayout } from '@/components/layout/sidebar-layout'

// 기본 사용법
<SidebarLayout>
  <div>메인 콘텐츠</div>
</SidebarLayout>

// 커스텀 사이드바 콘텐츠
<SidebarLayout
  sidebarContent={
    <nav>
      <ul>
        <li><a href="/dashboard">대시보드</a></li>
        <li><a href="/projects">프로젝트</a></li>
        <li><a href="/settings">설정</a></li>
      </ul>
    </nav>
  }
>
  <div>메인 콘텐츠</div>
</SidebarLayout>

// 사이드바 초기 상태 설정
<SidebarLayout
  defaultOpen={false}
  collapsible={true}
>
  <div>메인 콘텐츠</div>
</SidebarLayout>
```

**Props:**

- `sidebarContent?: ReactNode` - 사이드바 콘텐츠
- `defaultOpen?: boolean` - 사이드바 초기 열림 상태
- `collapsible?: boolean` - 사이드바 접기 가능 여부
- `children: ReactNode` - 메인 콘텐츠
- `className?: string` - 추가 CSS 클래스

### ResponsiveLayout

반응형 레이아웃을 제공하는 컴포넌트입니다.

```typescript
import { ResponsiveLayout } from '@/components/layout/responsive-layout'

// 기본 반응형 레이아웃
<ResponsiveLayout>
  <div>반응형 콘텐츠</div>
</ResponsiveLayout>

// 그리드 레이아웃
<ResponsiveLayout
  variant="grid"
  columns={{ sm: 1, md: 2, lg: 3 }}
  gap={4}
>
  <div>아이템 1</div>
  <div>아이템 2</div>
  <div>아이템 3</div>
</ResponsiveLayout>

// 플렉스 레이아웃
<ResponsiveLayout
  variant="flex"
  direction={{ sm: 'column', md: 'row' }}
  align="center"
  justify="between"
>
  <div>왼쪽 콘텐츠</div>
  <div>오른쪽 콘텐츠</div>
</ResponsiveLayout>

// 스택 레이아웃
<ResponsiveLayout
  variant="stack"
  spacing={6}
  align="center"
>
  <div>스택 아이템 1</div>
  <div>스택 아이템 2</div>
  <div>스택 아이템 3</div>
</ResponsiveLayout>
```

**Props:**

- `variant?: 'container' | 'grid' | 'flex' | 'stack'` - 레이아웃 타입
- `columns?: ResponsiveValue<number>` - 그리드 컬럼 수 (그리드 전용)
- `gap?: number` - 간격 크기
- `direction?: ResponsiveValue<'row' | 'column'>` - 플렉스 방향 (플렉스 전용)
- `align?: 'start' | 'center' | 'end' | 'stretch'` - 정렬
- `justify?: 'start' | 'center' | 'end' | 'between' | 'around'` - 정당화
- `spacing?: number` - 스택 간격 (스택 전용)
- `children: ReactNode` - 콘텐츠
- `className?: string` - 추가 CSS 클래스

## 레이아웃 패턴

### 대시보드 레이아웃

```typescript
import { PageLayout, SidebarLayout } from '@/components/layout'

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      sidebarContent={
        <nav className="space-y-2">
          <a href="/dashboard" className="block p-2 rounded hover:bg-accent">
            대시보드
          </a>
          <a href="/projects" className="block p-2 rounded hover:bg-accent">
            프로젝트
          </a>
          <a href="/settings" className="block p-2 rounded hover:bg-accent">
            설정
          </a>
        </nav>
      }
    >
      <PageLayout>
        {children}
      </PageLayout>
    </SidebarLayout>
  )
}
```

### 목록 페이지 레이아웃

```typescript
import { PageLayout, ResponsiveLayout } from '@/components/layout'

export function ListPageLayout({
  title,
  createButton,
  children
}: {
  title: string
  createButton?: ReactNode
  children: ReactNode
}) {
  return (
    <PageLayout
      title={title}
      actions={createButton}
    >
      <ResponsiveLayout variant="container">
        {children}
      </ResponsiveLayout>
    </PageLayout>
  )
}
```

### 상세 페이지 레이아웃

```typescript
import { PageLayout } from '@/components/layout'

export function DetailPageLayout({
  title,
  breadcrumbs,
  actions,
  children
}: {
  title: string
  breadcrumbs: BreadcrumbItem[]
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <PageLayout
      title={title}
      breadcrumbs={breadcrumbs}
      actions={actions}
      maxWidth="2xl"
    >
      {children}
    </PageLayout>
  )
}
```

## 반응형 유틸리티

### ResponsiveValue 타입

```typescript
type ResponsiveValue<T> =
  | T
  | {
      sm?: T
      md?: T
      lg?: T
      xl?: T
      '2xl'?: T
    }

// 사용 예제
const columns: ResponsiveValue<number> = {
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
}
```

### 브레이크포인트 훅

```typescript
import { useBreakpoint } from '@/hooks/use-breakpoint'

function ResponsiveComponent() {
  const { isMobile, isTablet, isDesktop } = useBreakpoint()

  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  )
}
```

## 접근성 기능

### 키보드 네비게이션

```typescript
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'

export function AccessibleLayout({ children }: { children: ReactNode }) {
  const { handleKeyDown } = useKeyboardNavigation({
    onEscape: () => {
      // 사이드바 닫기 또는 모달 닫기
    }
  })

  return (
    <div onKeyDown={handleKeyDown}>
      <a href="#main-content" className="sr-only focus:not-sr-only">
        메인 콘텐츠로 건너뛰기
      </a>
      <header role="banner">
        {/* 헤더 콘텐츠 */}
      </header>
      <main id="main-content" role="main">
        {children}
      </main>
      <footer role="contentinfo">
        {/* 푸터 콘텐츠 */}
      </footer>
    </div>
  )
}
```

### ARIA 랜드마크

```typescript
export function SemanticLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header role="banner" aria-label="사이트 헤더">
        <nav role="navigation" aria-label="메인 네비게이션">
          {/* 네비게이션 */}
        </nav>
      </header>

      <aside role="complementary" aria-label="사이드바">
        {/* 사이드바 콘텐츠 */}
      </aside>

      <main role="main" aria-label="메인 콘텐츠">
        {children}
      </main>

      <footer role="contentinfo" aria-label="사이트 푸터">
        {/* 푸터 콘텐츠 */}
      </footer>
    </div>
  )
}
```

## 성능 최적화

### 레이아웃 시프트 방지

```typescript
export function StableLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 flex-shrink-0">
        {/* 고정 높이 헤더 */}
      </header>

      <main className="flex-1 overflow-auto">
        {children}
      </main>

      <footer className="h-12 flex-shrink-0">
        {/* 고정 높이 푸터 */}
      </footer>
    </div>
  )
}
```

### 가상화된 목록

```typescript
import { FixedSizeList as List } from 'react-window'

export function VirtualizedListLayout({
  items,
  itemHeight = 50
}: {
  items: any[]
  itemHeight?: number
}) {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      {/* 아이템 렌더링 */}
      {items[index]}
    </div>
  )

  return (
    <PageLayout title="대용량 목록">
      <List
        height={600}
        itemCount={items.length}
        itemSize={itemHeight}
        width="100%"
      >
        {Row}
      </List>
    </PageLayout>
  )
}
```

## 테마 지원

### 다크/라이트 모드

```typescript
import { useTheme } from 'next-themes'

export function ThemedLayout({ children }: { children: ReactNode }) {
  const { theme } = useTheme()

  return (
    <div className={`min-h-screen transition-colors ${
      theme === 'dark' ? 'dark' : ''
    }`}>
      <div className="bg-background text-foreground">
        {children}
      </div>
    </div>
  )
}
```

### 커스텀 테마

```typescript
export function CustomThemedLayout({
  theme = 'default',
  children
}: {
  theme?: 'default' | 'blue' | 'green' | 'purple'
  children: ReactNode
}) {
  const themeClasses = {
    default: 'theme-default',
    blue: 'theme-blue',
    green: 'theme-green',
    purple: 'theme-purple'
  }

  return (
    <div className={themeClasses[theme]}>
      {children}
    </div>
  )
}
```

## 테스트 예제

### 레이아웃 컴포넌트 테스트

```typescript
import { render, screen } from '@testing-library/react'
import { PageLayout } from '../page-layout'

describe('PageLayout', () => {
  it('제목을 올바르게 렌더링한다', () => {
    render(
      <PageLayout title="테스트 페이지">
        <div>콘텐츠</div>
      </PageLayout>
    )

    expect(screen.getByText('테스트 페이지')).toBeInTheDocument()
  })

  it('브레드크럼을 올바르게 렌더링한다', () => {
    const breadcrumbs = [
      { label: '홈', href: '/' },
      { label: '페이지', href: '/page' }
    ]

    render(
      <PageLayout title="테스트" breadcrumbs={breadcrumbs}>
        <div>콘텐츠</div>
      </PageLayout>
    )

    expect(screen.getByText('홈')).toBeInTheDocument()
    expect(screen.getByText('페이지')).toBeInTheDocument()
  })
})
```

## 모범 사례

1. **일관성**: 모든 페이지에서 동일한 레이아웃 패턴 사용
2. **반응형**: 모바일 우선 접근법으로 반응형 디자인 구현
3. **접근성**: ARIA 랜드마크와 키보드 네비게이션 지원
4. **성능**: 레이아웃 시프트 방지와 효율적인 렌더링
5. **재사용성**: 공통 레이아웃 패턴을 컴포넌트로 추상화
