# Requirements Document

## Introduction

Next.js 15 보일러플레이트 프로젝트의 코드베이스 구조를 표준화하고 정리하는 리팩토링 작업입니다. 현재
일부 파일들이 적절하지 않은 위치에 있어서, 각 파일 유형별로 올바른 디렉토리 구조로 재구성해야
합니다. 이를 통해 코드의 가독성, 유지보수성, 그리고 개발자 경험을 향상시키고자 합니다.

## Requirements

### Requirement 1

**User Story:** 개발자로서, 컴포넌트 파일들이 적절한 위치에 정리되어 있기를 원합니다. 그래야
컴포넌트를 쉽게 찾고 관리할 수 있습니다.

#### Acceptance Criteria

1. WHEN 컴포넌트 파일들을 찾을 때 THEN 시스템은 모든 컴포넌트를 src/components 디렉토리 하위에
   배치해야 합니다
2. WHEN 기능별 컴포넌트를 구분할 때 THEN 시스템은 auth, dashboard, editor, error, forms, posts,
   projects 등의 하위 디렉토리로 분류해야 합니다
3. WHEN UI 컴포넌트를 찾을 때 THEN 시스템은 재사용 가능한 기본 컴포넌트들을 src/components/ui
   디렉토리에 배치해야 합니다

### Requirement 2

**User Story:** 개발자로서, 커스텀 훅들이 표준 위치에 정리되어 있기를 원합니다. 그래야 로직을
재사용하고 관리하기 쉽습니다.

#### Acceptance Criteria

1. WHEN 커스텀 훅을 찾을 때 THEN 시스템은 모든 훅을 src/hooks 디렉토리에 배치해야 합니다
2. WHEN 훅의 기능을 파악할 때 THEN 시스템은 use-\* 네이밍 컨벤션을 유지해야 합니다
3. WHEN 훅을 import할 때 THEN 시스템은 절대 경로(@/hooks/\*)를 사용할 수 있어야 합니다

### Requirement 3

**User Story:** 개발자로서, Provider 컴포넌트들이 명확한 위치에 정리되어 있기를 원합니다. 그래야
애플리케이션의 컨텍스트 구조를 이해하기 쉽습니다.

#### Acceptance Criteria

1. WHEN Provider 컴포넌트를 찾을 때 THEN 시스템은 모든 Provider를 src/providers 디렉토리에 배치해야
   합니다
2. WHEN 클라이언트와 서버 Provider를 구분할 때 THEN 시스템은 client-providers.tsx와
   server-providers.tsx로 분리해야 합니다
3. WHEN Provider를 import할 때 THEN 시스템은 절대 경로(@/providers/\*)를 사용할 수 있어야 합니다

### Requirement 4

**User Story:** 개발자로서, 서비스 레이어 파일들이 적절한 위치에 정리되어 있기를 원합니다. 그래야
비즈니스 로직을 명확하게 분리할 수 있습니다.

#### Acceptance Criteria

1. WHEN 서비스 파일을 찾을 때 THEN 시스템은 모든 서비스를 src/services 디렉토리에 배치해야 합니다
2. WHEN API 관련 로직을 찾을 때 THEN 시스템은 api.ts, auth.ts, database.ts 등으로 기능별 분리해야
   합니다
3. WHEN 서비스를 import할 때 THEN 시스템은 절대 경로(@/services/\*)를 사용할 수 있어야 합니다

### Requirement 5

**User Story:** 개발자로서, 상태 관리 파일들이 명확한 위치에 정리되어 있기를 원합니다. 그래야
애플리케이션 상태를 효율적으로 관리할 수 있습니다.

#### Acceptance Criteria

1. WHEN 스토어 파일을 찾을 때 THEN 시스템은 모든 스토어를 src/stores 디렉토리에 배치해야 합니다
2. WHEN Zustand 스토어를 구분할 때 THEN 시스템은 기능별로 posts-store.ts, projects-store.ts 등으로
   분리해야 합니다
3. WHEN 스토어를 import할 때 THEN 시스템은 절대 경로(@/stores/\*)를 사용할 수 있어야 합니다

### Requirement 6

**User Story:** 개발자로서, 타입 정의 파일들이 중앙화된 위치에 정리되어 있기를 원합니다. 그래야 타입
안전성을 보장하고 일관성을 유지할 수 있습니다.

#### Acceptance Criteria

1. WHEN 타입 정의를 찾을 때 THEN 시스템은 모든 타입을 src/types 디렉토리에 배치해야 합니다
2. WHEN 도메인별 타입을 구분할 때 THEN 시스템은 api.ts, database.ts, post.ts 등으로 기능별 분리해야
   합니다
3. WHEN 타입을 import할 때 THEN 시스템은 절대 경로(@/types/\*)를 사용할 수 있어야 합니다

### Requirement 7

**User Story:** 개발자로서, Context 파일들이 적절한 위치에 정리되어 있기를 원합니다. 그래야 React
Context를 효율적으로 관리할 수 있습니다.

#### Acceptance Criteria

1. WHEN Context 파일을 찾을 때 THEN 시스템은 모든 Context를 src/contexts 디렉토리에 배치해야 합니다
2. WHEN 기능별 Context를 구분할 때 THEN 시스템은 app-context.tsx, user-context.tsx 등으로 분리해야
   합니다
3. WHEN Context를 import할 때 THEN 시스템은 절대 경로(@/contexts/\*)를 사용할 수 있어야 합니다

### Requirement 8

**User Story:** 개발자로서, 스타일 관련 파일들이 명확한 위치에 정리되어 있기를 원합니다. 그래야
디자인 시스템을 일관되게 관리할 수 있습니다.

#### Acceptance Criteria

1. WHEN 스타일 파일을 찾을 때 THEN 시스템은 모든 스타일을 src/styles 디렉토리에 배치해야 합니다
2. WHEN 글로벌 스타일을 관리할 때 THEN 시스템은 globals.css를 적절한 위치에 유지해야 합니다
3. WHEN 스타일을 import할 때 THEN 시스템은 절대 경로(@/styles/\*)를 사용할 수 있어야 합니다

### Requirement 9

**User Story:** 개발자로서, 모든 import 경로가 일관되게 업데이트되기를 원합니다. 그래야 리팩토링
후에도 애플리케이션이 정상적으로 작동합니다.

#### Acceptance Criteria

1. WHEN 파일을 이동한 후 THEN 시스템은 모든 import 경로를 새로운 위치에 맞게 업데이트해야 합니다
2. WHEN 절대 경로를 사용할 때 THEN 시스템은 @/ 접두사를 사용한 경로로 변경해야 합니다
3. WHEN 빌드를 실행할 때 THEN 시스템은 import 에러 없이 성공적으로 빌드되어야 합니다

### Requirement 10

**User Story:** 개발자로서, 각 디렉토리에 적절한 index.ts 파일이 있기를 원합니다. 그래야 모듈을
깔끔하게 export하고 import할 수 있습니다.

#### Acceptance Criteria

1. WHEN 디렉토리에서 모듈을 export할 때 THEN 시스템은 각 주요 디렉토리에 index.ts 파일을 제공해야
   합니다
2. WHEN 여러 모듈을 import할 때 THEN 시스템은 배럴 export 패턴을 사용할 수 있어야 합니다
3. WHEN 모듈 구조를 파악할 때 THEN 시스템은 각 index.ts에서 해당 디렉토리의 주요 export를 명확히
   표시해야 합니다

### Requirement 11

**User Story:** 개발자로서, 라이브러리와 유틸리티 함수들이 적절한 위치에 정리되어 있기를 원합니다.
그래야 공통 로직을 효율적으로 관리할 수 있습니다.

#### Acceptance Criteria

1. WHEN 유틸리티 함수를 찾을 때 THEN 시스템은 모든 유틸리티를 src/lib 디렉토리에 배치해야 합니다
2. WHEN 기능별 라이브러리를 구분할 때 THEN 시스템은 actions, cache, validations 등의 하위 디렉토리로
   분류해야 합니다
3. WHEN 공통 설정을 관리할 때 THEN 시스템은 auth.ts, prisma.ts, utils.ts 등으로 목적별 분리해야
   합니다

### Requirement 12

**User Story:** 개발자로서, 데이터 관련 파일들이 명확한 위치에 정리되어 있기를 원합니다. 그래야
상수와 설정을 일관되게 관리할 수 있습니다.

#### Acceptance Criteria

1. WHEN 상수와 설정을 찾을 때 THEN 시스템은 모든 데이터를 src/data 디렉토리에 배치해야 합니다
2. WHEN 애플리케이션 상수를 구분할 때 THEN 시스템은 constants.ts, navigation.ts, forms.ts 등으로
   분류해야 합니다
3. WHEN 설정 데이터를 import할 때 THEN 시스템은 절대 경로(@/data/\*)를 사용할 수 있어야 합니다

### Requirement 13

**User Story:** 개발자로서, 국제화 관련 파일들이 적절한 위치에 정리되어 있기를 원합니다. 그래야
다국어 지원을 효율적으로 관리할 수 있습니다.

#### Acceptance Criteria

1. WHEN 국제화 파일을 찾을 때 THEN 시스템은 모든 i18n 관련 파일을 src/i18n 디렉토리에 배치해야
   합니다
2. WHEN 언어별 리소스를 구분할 때 THEN 시스템은 언어 코드별로 하위 디렉토리를 생성해야 합니다
3. WHEN 번역 함수를 import할 때 THEN 시스템은 절대 경로(@/i18n/\*)를 사용할 수 있어야 합니다

### Requirement 14

**User Story:** 개발자로서, 테스트 관련 파일들이 명확한 위치에 정리되어 있기를 원합니다. 그래야
테스트 코드를 체계적으로 관리할 수 있습니다.

#### Acceptance Criteria

1. WHEN 테스트 유틸리티를 찾을 때 THEN 시스템은 모든 테스트 관련 파일을 src/test 디렉토리에 배치해야
   합니다
2. WHEN 테스트 설정을 구분할 때 THEN 시스템은 setup.ts, mocks.ts, fixtures.ts 등으로 분류해야 합니다
3. WHEN 테스트 유틸리티를 import할 때 THEN 시스템은 절대 경로(@/test/\*)를 사용할 수 있어야 합니다

### Requirement 15

**User Story:** 개발자로서, 미들웨어와 설정 파일들이 적절한 위치에 정리되어 있기를 원합니다. 그래야
애플리케이션 설정을 명확하게 관리할 수 있습니다.

#### Acceptance Criteria

1. WHEN 미들웨어를 찾을 때 THEN 시스템은 middleware.ts를 src 루트에 유지해야 합니다
2. WHEN 인증 설정을 찾을 때 THEN 시스템은 auth.ts를 src 루트에 유지해야 합니다
3. WHEN Next.js 설정을 관리할 때 THEN 시스템은 프로젝트 루트의 설정 파일들을 그대로 유지해야 합니다
