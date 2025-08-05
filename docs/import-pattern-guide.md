# Import 패턴 가이드

## 개요

이 문서는 Next.js 15 보일러플레이트 프로젝트에서 사용하는 표준화된 import 패턴과 모범 사례를 설명합니다. 코드베이스 구조 리팩토링을 통해 모든 import 경로가 절대 경로로 표준화되었습니다.

## 기본 원칙

### 1. 절대 경로 사용 (Required)
모든 내부 모듈 import는 `@/` 접두사를 사용한 절대 경로를 사용해야 합니다.

```typescript
// ✅ 올바른 방법
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { User } from '@/types/database'

// ❌ 잘못된 방법
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { User } from './types/database'
```

### 2. Named Import 우선 사용 (Recommended)
Tree shaking 최적화를 위해 Named Import를 우선적으로 사용합니다.

```typescript
// ✅ 권장 방법 (Tree shaking에 유리)
import { Button, Card, Input } from '@/components/ui'
import { formatDate, truncate } from '@/lib/utils'

// ⚠️ 가능하지만 권장하지 않음
import * as UI from '@/components/ui'
import utils from '@/lib/utils'
```

## 디렉토리별 Import 패턴

### Components
```typescript
// UI 컴포넌트
import { Button, Card, Input } from '@/components/ui'

// 기능별 컴포넌트
import { SignInForm, UserProfile } from '@/components/auth'
import { ProjectList, CreateProjectModal } from '@/components/projects'
import { PostCard, InfinitePostList } from '@/components/posts'

// 레이아웃 컴포넌트
import { PageLayout, SidebarLayout } from '@/components/layout'

// 에러 처리 컴포넌트
import { ErrorBoundary, ErrorFallback } from '@/components/error'
```

### Hooks
```typescript
// 폼 관련 훅
import { useFormWithAction, useFormWithValidation } from '@/hooks'

// 에러 처리 훅
import { useErrorHandler, useServerActionError } from '@/hooks'

// 상태 관리 훅
import { useDataLoading, useProgress } from '@/hooks'

// 개별 훅 (필요시)
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
```

### Library & Utils
```typescript
// 유틸리티 함수
import { cn, formatDate, truncate } from '@/lib/utils'

// 타입 가드
import { isString, isNumber } from '@/lib/type-guards'

// 에러 처리
import { handleError, createErrorHandler } from '@/lib/error-handler'

// 액션
import { createProject, updateProject } from '@/lib/actions'

// 검증 스키마
import { projectSchema, userSchema } from '@/lib/validations'
```

### Types
```typescript
// 공통 타입
import { BaseEntity, ApiResponse } from '@/types/common'

// 도메인 타입
import { User, Project, Post } from '@/types/database'

// API 타입
import { CreateProjectRequest, UpdateUserRequest } from '@/types/api'

// 에디터 타입
import { EditorContent, EditorConfig } from '@/types/editor'
```

### Services & Stores
```typescript
// 서비스
import { apiClient, authService } from '@/services'

// 스토어
import { useProjectStore, useAppStore } from '@/stores'

// 프로바이더
import { SessionProvider, ThemeProvider } from '@/providers'

// 컨텍스트
import { useAppContext, useProjectContext } from '@/contexts'
```

## 외부 라이브러리 Import

### React & Next.js
```typescript
import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
```

### UI 라이브러리
```typescript
import { Button } from '@radix-ui/react-button'
import { Dialog } from '@radix-ui/react-dialog'
import { ChevronDown, User } from 'lucide-react'
```

### 폼 & 검증
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
```

## Import 순서 (ESLint 규칙)

1. **React & Next.js** (외부 React 관련)
2. **외부 라이브러리** (node_modules)
3. **내부 모듈** (@/ 경로)
4. **상대 경로** (같은 디렉토리 내부만)

```typescript
// 1. React & Next.js
import React from 'react'
import { NextPage } from 'next'
import Link from 'next/link'

// 2. 외부 라이브러리
import { Button } from '@radix-ui/react-button'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// 3. 내부 모듈 (@/ 경로)
import { Card } from '@/components/ui/card'
import { useProjectStore } from '@/stores'
import { Project } from '@/types/database'

// 4. 상대 경로 (같은 디렉토리만)
import { ProjectFormSchema } from './schema'
import './styles.css'
```

## 성능 최적화 팁

### 1. 배럴 Export 활용
```typescript
// 여러 컴포넌트를 한 번에 import
import { 
  Button, 
  Card, 
  Input, 
  Dialog 
} from '@/components/ui'

// 개별 import보다 효율적
```

### 2. 동적 Import 사용
```typescript
// 큰 컴포넌트나 라이브러리는 동적으로 로드
const HeavyComponent = dynamic(() => import('@/components/heavy-component'))

// 조건부 로드
const AdminPanel = dynamic(() => import('@/components/admin-panel'), {
  ssr: false
})
```

### 3. Tree Shaking 최적화
```typescript
// ✅ Tree shaking에 유리
import { debounce } from '@/lib/utils'

// ❌ 전체 라이브러리 로드
import * as utils from '@/lib/utils'
```

## 마이그레이션 가이드

### 기존 상대 경로를 절대 경로로 변경

```typescript
// Before (상대 경로)
import { Button } from '../../../components/ui/button'
import { useAuth } from '../../hooks/use-auth'
import { User } from '../types/user'

// After (절대 경로)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { User } from '@/types/user'
```

### 자동 변환 도구
프로젝트에는 import 경로 변환을 위한 스크립트가 포함되어 있습니다:

```bash
# Import 경로 검증
tsx scripts/validate-imports.ts

# Import 경로 변환 (필요시)
tsx scripts/import-path-transformer-v2.ts
```

## 개발 도구 설정

### VSCode 설정
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "typescript.suggest.autoImports": true,
  "typescript.suggest.paths": true
}
```

### ESLint 규칙
```javascript
// eslint.config.ts에 포함된 규칙들
"import/order": ["error", {
  "groups": [
    "builtin",
    "external", 
    "internal",
    "parent",
    "sibling",
    "index"
  ],
  "pathGroups": [
    {
      "pattern": "@/**",
      "group": "internal"
    }
  ]
}]
```

## 문제 해결

### 자주 발생하는 문제들

1. **Import 경로를 찾을 수 없음**
   ```
   해결: tsconfig.json의 paths 설정 확인
   ```

2. **순환 의존성 오류**
   ```
   해결: scripts/check-circular-deps.js 실행하여 확인
   ```

3. **Tree shaking이 작동하지 않음**
   ```
   해결: Named import 사용, 배럴 export 최적화
   ```

## 결론

표준화된 import 패턴을 따르면:
- 코드 가독성 향상
- 번들 크기 최적화
- 개발자 경험 개선
- 유지보수성 증대

모든 새로운 코드는 이 가이드를 따라 작성해주세요.
