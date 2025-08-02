# Hybrid Component Architecture Patterns

이 문서는 Server Component와 Client Component를 효율적으로 조합하는 하이브리드 패턴들을 설명합니다.

## 1. Server-Client Boundary Pattern

### 개념

Server Component가 데이터를 가져와서 Client Component에 props로 전달하는 패턴

### 사용 사례

- 데이터 페칭은 서버에서, 상호작용은 클라이언트에서 처리
- SEO와 성능을 위해 초기 렌더링은 서버에서, 동적 기능은 클라이언트에서

### 구현 예시

```tsx
// Server Component
export async function ProjectListServer() {
  const projects = await fetchProjects()

  return (
    <div>
      <h1>프로젝트 목록</h1>
      <ProjectListClient projects={projects} />
    </div>
  )
}

// Client Component
;('use client')
export function ProjectListClient({ projects }) {
  const [filteredProjects, setFilteredProjects] = useState(projects)
  // 클라이언트 상호작용 로직...
}
```

## 2. Static-Dynamic Separation Pattern

### 개념

컴포넌트 내에서 정적 부분과 동적 부분을 분리하는 패턴

### 사용 사례

- 폼의 레이블과 설명은 정적, 입력과 검증은 동적
- 에러 메시지 구조는 정적, 버튼 액션은 동적

### 구현 예시

```tsx
// Server Component - 정적 구조
export function ErrorFallbackOptimized({ error, title, message }) {
  return (
    <div className='error-container'>
      <h2>{title}</h2>
      <p>{message}</p>
      {/* 동적 액션 버튼 - Client Component */}
      <ErrorFallbackClient resetError={resetError} />
    </div>
  )
}

// Client Component - 동적 상호작용
;('use client')
export function ErrorFallbackClient({ resetError }) {
  const handleRetry = () => {
    // 클라이언트 로직
  }
  return <button onClick={handleRetry}>다시 시도</button>
}
```

## 3. Conditional Client Loading Pattern

### 개념

특정 조건에서만 Client Component를 로드하는 패턴

### 사용 사례

- 인증된 사용자에게만 상호작용 기능 제공
- 디바이스 성능에 따른 조건부 기능 로딩

### 구현 예시

```tsx
// Server Component
export function ConditionalFeature({ user, isLowEndDevice }) {
  if (!user) {
    return <StaticLoginPrompt />
  }

  if (isLowEndDevice) {
    return <LiteVersionComponent />
  }

  return <FullFeatureClient user={user} />
}
```

## 4. Progressive Enhancement Pattern

### 개념

기본 기능은 Server Component로, 향상된 기능은 Client Component로 점진적 개선

### 사용 사례

- 기본 폼 제출은 서버 액션으로, 실시간 검증은 클라이언트로
- 기본 네비게이션은 링크로, 부드러운 전환은 클라이언트로

### 구현 예시

```tsx
// Server Component - 기본 기능
export function EnhancedForm({ action }) {
  return (
    <form action={action}>
      <input name='email' type='email' required />
      <button type='submit'>제출</button>
      {/* 향상된 기능 - Client Component */}
      <FormEnhancementClient />
    </form>
  )
}

// Client Component - 향상된 기능
;('use client')
export function FormEnhancementClient() {
  // 실시간 검증, 자동완성 등
}
```

## 5. Data Streaming Pattern

### 개념

Server Component에서 데이터를 스트리밍하면서 Client Component에서 점진적으로 표시

### 사용 사례

- 대용량 데이터 목록의 점진적 로딩
- 실시간 데이터 업데이트

### 구현 예시

```tsx
// Server Component
export async function StreamingDataContainer() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DataStreamClient />
    </Suspense>
  )
}

// Client Component
;('use client')
export function DataStreamClient() {
  const [data, setData] = useState([])
  // 스트리밍 로직...
}
```

## 6. Layout-Content Separation Pattern

### 개념

레이아웃은 Server Component로, 콘텐츠는 Client Component로 분리

### 사용 사례

- 사이드바, 헤더 등 정적 레이아웃과 동적 콘텐츠 분리
- SEO를 위한 메타데이터는 서버에서, 상호작용은 클라이언트에서

### 구현 예시

```tsx
// Server Component - 레이아웃
export function PageLayout({ children, metadata }) {
  return (
    <html>
      <head>
        <title>{metadata.title}</title>
        <meta name='description' content={metadata.description} />
      </head>
      <body>
        <header>정적 헤더</header>
        <main>{children}</main>
        <footer>정적 푸터</footer>
      </body>
    </html>
  )
}

// Client Component - 동적 콘텐츠
;('use client')
export function DynamicContent() {
  // 상호작용 로직...
}
```

## Best Practices

### 1. 명확한 책임 분리

- Server Component: 데이터 페칭, SEO, 초기 렌더링
- Client Component: 상호작용, 상태 관리, 브라우저 API

### 2. Props 최적화

- 직렬화 가능한 데이터만 Server에서 Client로 전달
- 큰 객체는 필요한 부분만 추출하여 전달

### 3. 성능 고려사항

- Client Component는 필요한 경우에만 사용
- 지연 로딩(Lazy Loading) 적극 활용
- 번들 크기 최적화

### 4. 타입 안전성

- Server와 Client 간 인터페이스 명확히 정의
- TypeScript를 활용한 타입 검증

### 5. 에러 처리

- Server Component 에러는 Error Boundary로
- Client Component 에러는 try-catch와 상태로
- 사용자 친화적인 fallback UI 제공

## 마이그레이션 가이드

### 기존 Client Component를 하이브리드로 변환하는 단계

1. **분석**: 컴포넌트에서 정적 부분과 동적 부분 식별
2. **분리**: 정적 부분을 Server Component로 추출
3. **인터페이스 정의**: Server와 Client 간 props 인터페이스 정의
4. **테스트**: 기능 동작 확인 및 성능 측정
5. **최적화**: 번들 크기와 렌더링 성능 개선

### 체크리스트

- [ ] Server Component에서 브라우저 API 사용하지 않음
- [ ] Client Component에서 서버 전용 코드 사용하지 않음
- [ ] Props는 직렬화 가능한 데이터만 포함
- [ ] 에러 경계 적절히 설정
- [ ] 로딩 상태 적절히 처리
- [ ] 타입 안전성 확보
- [ ] 성능 최적화 적용
