# Component Architecture Decisions

이 문서는 프로젝트의 컴포넌트 아키텍처 결정사항과 그 근거를 설명합니다.

## 1. Server/Client Component 분리 원칙

### 결정사항

Server Component와 Client Component를 명확히 분리하고, 하이브리드 패턴을 통해 최적의 성능과 사용자
경험을 제공합니다.

### 근거

- **성능**: 서버에서 렌더링되는 부분은 JavaScript 번들에 포함되지 않음
- **SEO**: 서버 렌더링으로 검색 엔진 최적화 향상
- **사용자 경험**: 초기 로딩 속도 개선과 상호작용 반응성 확보

### 구현 방식

```
src/components/
├── patterns/
│   ├── server-client-boundary.tsx    # 경계 패턴 유틸리티
│   ├── hybrid-examples.tsx           # Server Component 예제
│   └── hybrid-examples-client.tsx    # Client Component 예제
├── error/
│   ├── error-fallback-optimized.tsx  # Server Component (정적 구조)
│   └── error-fallback-client.tsx     # Client Component (상호작용)
├── forms/
│   ├── form-static-content.tsx       # Server Component (레이블, 설명)
│   └── form-lazy.tsx                 # Client Component (동적 로딩)
└── projects/
    ├── project-list-server.tsx       # Server Component (데이터 페칭)
    └── project-list-client.tsx       # Client Component (상호작용)
```

## 2. 데이터 페칭 전략

### 결정사항

데이터 페칭은 Server Component에서 수행하고, Client Component는 상호작용과 상태 관리에만 집중합니다.

### 근거

- **성능**: 서버에서 데이터베이스에 직접 접근하여 빠른 데이터 로딩
- **보안**: 민감한 데이터베이스 쿼리가 클라이언트에 노출되지 않음
- **캐싱**: Next.js의 서버 사이드 캐싱 활용 가능

### 구현 예시

```tsx
// Server Component - 데이터 페칭
export async function ProjectListServer() {
  const projects = await prisma.project.findMany({
    // 서버에서 직접 데이터베이스 쿼리
  })

  return <ProjectListClient projects={projects} />
}

// Client Component - 상호작용
;('use client')
export function ProjectListClient({ projects }) {
  const [filteredProjects, setFilteredProjects] = useState(projects)
  // 클라이언트 상태 관리 및 상호작용
}
```

## 3. 에러 처리 아키텍처

### 결정사항

에러 표시 구조는 Server Component로, 에러 복구 액션은 Client Component로 분리합니다.

### 근거

- **일관성**: 에러 메시지와 레이아웃의 일관된 서버 렌더링
- **접근성**: 서버에서 렌더링된 에러 메시지는 스크린 리더에 즉시 접근 가능
- **성능**: 에러 상황에서도 최소한의 JavaScript 로드

### 구현 방식

```tsx
// Server Component - 에러 구조
export function ErrorFallbackOptimized({ error, title, message }) {
  return (
    <div className='error-container'>
      <h2>{title}</h2>
      <p>{message}</p>
      <ErrorFallbackClient resetError={resetError} />
    </div>
  )
}

// Client Component - 에러 액션
;('use client')
export function ErrorFallbackClient({ resetError }) {
  const handleRetry = () => {
    // 클라이언트 에러 복구 로직
  }
  return <button onClick={handleRetry}>다시 시도</button>
}
```

## 4. 폼 처리 전략

### 결정사항

폼의 정적 요소(레이블, 설명)는 Server Component로, 동적 요소(검증, 상호작용)는 Client Component로
분리합니다.

### 근거

- **접근성**: 폼 레이블과 설명이 서버에서 렌더링되어 접근성 향상
- **성능**: 정적 폼 구조는 JavaScript 없이도 작동
- **점진적 향상**: 기본 폼 기능은 서버 액션으로, 향상된 기능은 클라이언트로

### 구현 방식

```tsx
// Server Component - 폼 구조
export function FormLayoutStatic({ children }) {
  return (
    <form action={serverAction}>
      <div className='form-fields'>{/* 정적 레이블과 설명 */}</div>
      {children} {/* 동적 클라이언트 컴포넌트 */}
    </form>
  )
}

// Client Component - 폼 상호작용
;('use client')
export function FormEnhancement() {
  // 실시간 검증, 자동완성 등
}
```

## 5. 레이아웃 아키텍처

### 결정사항

레이아웃 구조는 Server Component로, 동적 네비게이션과 상호작용은 Client Component로 분리합니다.

### 근거

- **SEO**: 레이아웃과 네비게이션 구조가 서버에서 렌더링
- **성능**: 정적 레이아웃 요소는 JavaScript 번들에서 제외
- **일관성**: 모든 페이지에서 일관된 레이아웃 구조

### 구현 방식

```tsx
// Server Component - 레이아웃 구조
export async function SidebarLayoutServer({ children }) {
  const navigationData = await fetchNavigationData()

  return (
    <div className='layout-structure'>
      <SidebarLayoutClient navigationData={navigationData}>{children}</SidebarLayoutClient>
    </div>
  )
}

// Client Component - 동적 네비게이션
;('use client')
export function SidebarLayoutClient({ navigationData, children }) {
  // 네비게이션 상태 관리 및 상호작용
}
```

## 6. 성능 최적화 전략

### 결정사항

- 지연 로딩(Lazy Loading)을 적극 활용
- 조건부 Client Component 로딩
- 번들 크기 최적화

### 구현 방식

```tsx
// 지연 로딩
const HeavyComponent = lazy(() => import('./heavy-component'))

// 조건부 로딩
export function ConditionalFeature({ condition }) {
  if (!condition) {
    return <StaticFallback />
  }

  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

## 7. 타입 안전성

### 결정사항

Server Component와 Client Component 간의 인터페이스를 명확히 정의하고 타입 안전성을 보장합니다.

### 구현 방식

```tsx
// 공통 타입 정의
interface Project {
  id: string
  title: string
  description: string | null
  // ...
}

// Server Component
export async function ProjectListServer(): Promise<JSX.Element> {
  const projects: Project[] = await fetchProjects()
  return <ProjectListClient projects={projects} />
}

// Client Component
interface ProjectListClientProps {
  projects: Project[]
}

export function ProjectListClient({ projects }: ProjectListClientProps) {
  // 타입 안전한 클라이언트 로직
}
```

## 8. 마이그레이션 전략

### 단계별 접근

1. **분석**: 기존 컴포넌트의 정적/동적 부분 식별
2. **분리**: 정적 부분을 Server Component로 추출
3. **인터페이스**: Server/Client 간 props 인터페이스 정의
4. **테스트**: 기능 동작 및 성능 검증
5. **최적화**: 번들 크기 및 렌더링 성능 개선

### 우선순위

1. 데이터 페칭이 많은 페이지 (대시보드, 목록 페이지)
2. 폼이 많은 페이지 (생성, 편집 페이지)
3. 에러 처리 컴포넌트
4. 레이아웃 컴포넌트

## 9. 모니터링 및 측정

### 성능 지표

- 번들 크기 감소율
- 초기 로딩 시간 개선
- Core Web Vitals 점수
- 서버 렌더링 비율

### 도구

- Next.js Bundle Analyzer
- Lighthouse
- Web Vitals 측정
- 사용자 피드백

## 10. 향후 계획

### 단기 목표

- 모든 주요 페이지에 하이브리드 패턴 적용
- 성능 모니터링 시스템 구축
- 개발자 가이드라인 문서화

### 장기 목표

- 자동화된 컴포넌트 분석 도구 개발
- 성능 기반 자동 최적화
- 팀 전체의 아키텍처 패턴 표준화
