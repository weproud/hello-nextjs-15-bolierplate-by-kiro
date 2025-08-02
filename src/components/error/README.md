# 통합 에러 바운더리 시스템

이 디렉토리는 Next.js 15 애플리케이션을 위한 계층적 에러 바운더리 시스템을 포함합니다.

## 🎯 주요 기능

- **계층적 에러 처리**: Global → Route → Component 순서로 에러 처리
- **자동 에러 복구**: 재시도, 폴백, 리다이렉트 등 다양한 복구 메커니즘
- **사용자 친화적 UI**: 에러 타입과 심각도에 따른 적절한 UI 제공
- **개발자 도구**: 에러 디버깅과 모니터링을 위한 도구
- **TypeScript 완전 지원**: 타입 안전성과 IntelliSense 지원

## 📁 파일 구조

```
src/components/error/
├── error-boundary-system.ts          # 핵심 에러 바운더리 관리 시스템
├── global-error-boundary.tsx         # 전역 에러 바운더리
├── route-error-boundary.tsx          # 라우트별 에러 바운더리
├── component-error-boundary.tsx      # 컴포넌트별 에러 바운더리
├── error-recovery.tsx               # 에러 복구 UI 컴포넌트
├── unified-error-boundary.tsx       # 통합 에러 바운더리 시스템
├── hierarchical-error-boundary.tsx  # 레거시 호환성 래퍼
├── error-boundary-examples.tsx      # 사용 예제 및 테스트 도구
├── error-fallback.tsx              # 기본 에러 폴백 UI
├── error-boundary.tsx              # 기존 에러 바운더리 (호환성)
└── README.md                       # 이 파일
```

## 🚀 빠른 시작

### 1. 기본 사용법

```tsx
import { UnifiedErrorBoundary } from '@/components/error/unified-error-boundary'

// 컴포넌트 레벨 에러 바운더리
function MyComponent() {
  return (
    <UnifiedErrorBoundary level='component' name='MyComponent' inline={true} minimal={true}>
      <SomeComponentThatMightFail />
    </UnifiedErrorBoundary>
  )
}

// 라우트 레벨 에러 바운더리
function MyPage() {
  return (
    <UnifiedErrorBoundary level='route' name='MyPage' routePath='/my-page'>
      <PageContent />
    </UnifiedErrorBoundary>
  )
}
```

### 2. HOC 패턴 사용

```tsx
import { withComponentErrorBoundary } from '@/components/error/unified-error-boundary'

// 컴포넌트를 에러 바운더리로 감싸기
const ProtectedComponent = withComponentErrorBoundary(MyComponent, 'MyComponent', {
  inline: true,
  minimal: true,
  showDetails: true,
})
```

### 3. 계층적 구조 적용

```tsx
import { HierarchicalErrorBoundaryWrapper } from '@/components/error/unified-error-boundary'

function App() {
  return (
    <HierarchicalErrorBoundaryWrapper
      appName='MyApp'
      routeName='CurrentRoute'
      routePath='/current-route'
      componentName='MainComponent'
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <AppContent />
    </HierarchicalErrorBoundaryWrapper>
  )
}
```

## 🔧 에러 바운더리 레벨

### Global Level

- 애플리케이션 최상위에서 모든 에러 포착
- 시스템 전체 오류에 대한 복구 옵션 제공
- 전역 JavaScript 에러와 처리되지 않은 Promise 거부 처리

### Route Level

- 특정 라우트/페이지에서 발생하는 에러 처리
- 페이지별 컨텍스트에 맞는 복구 옵션 제공
- 라우트 간 에러 격리

### Component Level

- 개별 컴포넌트에서 발생하는 에러 처리
- 인라인/최소화 UI 옵션 지원
- 컴포넌트별 세밀한 에러 제어

## 🛠️ 에러 복구 메커니즘

### 자동 복구

- **재시도 (Retry)**: 네트워크, 데이터베이스 에러
- **폴백 (Fallback)**: 컴포넌트 렌더링 실패
- **자동 새로고침**: 시스템 에러

### 사용자 액션

- **수동 재시도**: 사용자가 직접 재시도
- **페이지 새로고침**: 전체 페이지 리로드
- **홈으로 이동**: 안전한 페이지로 이동
- **이전 페이지**: 브라우저 히스토리 백

### 에러 타입별 처리

- **Validation**: 입력 수정 유도
- **Network**: 연결 확인 및 재시도
- **Auth**: 로그인 페이지로 리다이렉트
- **Permission**: 권한 안내 및 관리자 문의
- **Database**: 재시도 및 고객지원 안내

## 📊 에러 모니터링

### 개발 환경

```javascript
// 브라우저 콘솔에서 실행
debugErrorBoundaries()
```

### 에러 통계 확인

- 총 에러 바운더리 수
- 에러 타입별 통계
- 레벨별 에러 분포
- 복구 성공률

## 🎨 UI 커스터마이징

### 에러 심각도별 스타일

- **Critical**: 빨간색 (시스템 치명적 오류)
- **High**: 주황색 (중요한 기능 오류)
- **Medium**: 노란색 (일반적인 오류)
- **Low**: 회색 (경미한 오류)

### 컴포넌트별 UI 옵션

- **Full**: 전체 카드 UI (기본)
- **Inline**: 인라인 에러 표시
- **Minimal**: 최소화된 에러 표시
- **Custom**: 사용자 정의 폴백 UI

## 🧪 테스트 도구

### ErrorBoundaryTester

```tsx
import { ErrorBoundaryTester } from '@/components/error/unified-error-boundary'
;<ErrorBoundaryTester level='component' errorType='network' message='Test network error' />
```

### 예제 페이지

```tsx
import { ErrorBoundaryExamples } from '@/components/error/error-boundary-examples'

// 전체 예제와 테스트 도구를 포함한 페이지
;<ErrorBoundaryExamples />
```

## 🔄 마이그레이션 가이드

### 기존 ErrorBoundary에서 마이그레이션

**Before:**

```tsx
import { ErrorBoundary } from '@/components/error/error-boundary'
;<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

**After:**

```tsx
import { UnifiedErrorBoundary } from '@/components/error/unified-error-boundary'
;<UnifiedErrorBoundary level='component' name='MyComponent'>
  <MyComponent />
</UnifiedErrorBoundary>
```

### 레거시 HierarchicalErrorBoundary 호환성

기존 `HierarchicalErrorBoundary` 컴포넌트는 새로운 시스템으로 자동 래핑되어 호환성을 유지합니다.

## 📝 베스트 프랙티스

### 1. 적절한 레벨 선택

- **Global**: 앱 루트에서만 사용
- **Route**: 페이지/라우트 컴포넌트에서 사용
- **Component**: 개별 기능 컴포넌트에서 사용

### 2. 에러 메시지 작성

- 사용자 친화적인 언어 사용
- 구체적인 해결 방법 제시
- 기술적 세부사항은 개발 환경에서만 표시

### 3. 복구 옵션 제공

- 에러 타입에 맞는 복구 액션 제공
- 재시도 횟수 제한
- 사용자가 쉽게 이해할 수 있는 액션 라벨

### 4. 성능 고려사항

- 에러 바운더리 중첩 최소화
- 불필요한 에러 리포팅 방지
- 메모리 누수 방지를 위한 정리 작업

## 🐛 디버깅

### 개발 환경 디버깅

1. `showDetails={true}` 옵션 사용
2. 브라우저 콘솔에서 `debugErrorBoundaries()` 실행
3. React DevTools에서 에러 바운더리 상태 확인

### 프로덕션 에러 추적

- 에러 ID를 통한 에러 추적
- 사용자 컨텍스트 정보 수집
- 에러 발생 패턴 분석

## 🤝 기여하기

에러 바운더리 시스템 개선에 기여하려면:

1. 새로운 에러 타입 추가
2. 복구 메커니즘 개선
3. UI/UX 향상
4. 테스트 케이스 추가
5. 문서 업데이트

## 📚 참고 자료

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js Error Handling](https://nextjs.org/docs/advanced-features/error-handling)
- [Error Boundary Best Practices](https://kentcdodds.com/blog/use-react-error-boundary-to-handle-errors-in-react)
