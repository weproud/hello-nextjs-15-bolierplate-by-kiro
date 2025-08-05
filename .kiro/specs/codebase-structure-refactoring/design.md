# Design Document

## Overview

Next.js 15 보일러플레이트 프로젝트의 코드베이스를 표준화된 디렉토리 구조로 리팩토링하는 설계입니다.
현재 분산되어 있는 파일들을 기능과 역할에 따라 적절한 위치로 재구성하여 개발자 경험과 코드
유지보수성을 향상시킵니다.

## Architecture

### Current State Analysis

현재 프로젝트 구조를 분석한 결과:

```
src/
├── app/                    # Next.js App Router (유지)
├── components/             # 이미 적절한 위치
├── contexts/               # 이미 적절한 위치
├── data/                   # 이미 적절한 위치
├── hooks/                  # 이미 적절한 위치
├── i18n/                   # 이미 적절한 위치
├── lib/                    # 이미 적절한 위치
├── providers/              # 이미 적절한 위치
├── services/               # 이미 적절한 위치
├── stores/                 # 이미 적절한 위치
├── styles/                 # 이미 적절한 위치
├── test/                   # 이미 적절한 위치
├── types/                  # 이미 적절한 위치
├── auth.ts                 # 루트 레벨 설정 (유지)
└── middleware.ts           # 루트 레벨 설정 (유지)
```

### Target Architecture

분석 결과, 현재 프로젝트는 이미 표준화된 구조를 가지고 있습니다. 하지만 다음과 같은 개선사항이
필요합니다:

1. **Import 경로 표준화**: 모든 import를 절대 경로(@/)로 통일
2. **Index 파일 최적화**: 각 디렉토리의 index.ts 파일 개선
3. **컴포넌트 분류 검증**: 기능별 컴포넌트 분류 확인 및 개선
4. **타입 정의 정리**: 중복되거나 불필요한 타입 정의 정리

## Components and Interfaces

### Directory Structure Standards

```typescript
// 표준 디렉토리 구조 인터페이스
interface DirectoryStructure {
  src: {
    app: AppRouterStructure
    components: ComponentStructure
    contexts: ContextStructure
    data: DataStructure
    hooks: HookStructure
    i18n: I18nStructure
    lib: LibStructure
    providers: ProviderStructure
    services: ServiceStructure
    stores: StoreStructure
    styles: StyleStructure
    test: TestStructure
    types: TypeStructure
    'auth.ts': AuthConfig
    'middleware.ts': MiddlewareConfig
  }
}
```

### Component Organization

```typescript
interface ComponentStructure {
  ui: UIComponents // shadcn/ui 기본 컴포넌트
  auth: AuthComponents // 인증 관련 컴포넌트
  dashboard: DashboardComponents
  editor: EditorComponents
  error: ErrorComponents
  forms: FormComponents
  posts: PostComponents
  projects: ProjectComponents
  layout: LayoutComponents
  loading: LoadingComponents
  patterns: PatternComponents
  performance: PerformanceComponents
  providers: ProviderComponents
  lazy: LazyComponents
}
```

### Hook Organization

```typescript
interface HookStructure {
  'use-api-error.ts': ApiErrorHook
  'use-error-boundary.ts': ErrorBoundaryHook
  'use-error-handler.ts': ErrorHandlerHook
  'use-form-action.ts': FormActionHook
  'use-form-with-action.ts': FormWithActionHook
  'use-form.ts': FormHook
  'use-infinite-posts.ts': InfinitePostsHook
  'use-keyboard-navigation.ts': KeyboardNavigationHook
  'use-loading-state.ts': LoadingStateHook
  'use-mobile.ts': MobileHook
  'use-performance.ts': PerformanceHook
  'use-server-action-error.ts': ServerActionErrorHook
  'index.ts': HookExports
}
```

### Library Organization

```typescript
interface LibStructure {
  actions: {
    'form-actions.ts': FormActions
    'post-actions.ts': PostActions
    'project-actions.ts': ProjectActions
    'safe-action-wrapper.ts': SafeActionWrapper
  }
  cache: {
    'config.ts': CacheConfig
    'strategies.ts': CacheStrategies
    'invalidation.ts': CacheInvalidation
    // ... 기타 캐시 관련 파일들
  }
  validations: {
    'auth.ts': AuthValidations
    'common.ts': CommonValidations
    'post.ts': PostValidations
    'project.ts': ProjectValidations
    // ... 기타 검증 스키마들
  }
  repositories: {
    'base-repository.ts': BaseRepository
    'post-repository.ts': PostRepository
    'project-repository.ts': ProjectRepository
    'user-repository.ts': UserRepository
  }
  // ... 기타 유틸리티 파일들
}
```

## Data Models

### File Movement Mapping

```typescript
interface FileMoveMapping {
  // 현재 위치 -> 목표 위치 매핑
  moves: Array<{
    from: string
    to: string
    type: 'file' | 'directory'
    dependencies: string[] // 이 파일에 의존하는 파일들
  }>
}

// 실제 이동이 필요한 파일들 (현재 분석 결과 대부분 적절한 위치)
const fileMoves: FileMoveMapping = {
  moves: [
    // 대부분의 파일이 이미 적절한 위치에 있음
    // 필요시 개별 파일 이동 계획 추가
  ],
}
```

### Import Path Transformation

```typescript
interface ImportTransformation {
  pattern: RegExp
  replacement: string
  description: string
}

const importTransformations: ImportTransformation[] = [
  {
    pattern:
      /from ['"]\.\.\/\.\.\/(components|hooks|lib|types|contexts|providers|services|stores|data|i18n|test|styles)/g,
    replacement: "from '@/$1",
    description: '상대 경로를 절대 경로로 변환',
  },
  {
    pattern:
      /from ['"]\.\.?\/(components|hooks|lib|types|contexts|providers|services|stores|data|i18n|test|styles)/g,
    replacement: "from '@/$1",
    description: '단일 레벨 상대 경로를 절대 경로로 변환',
  },
]
```

## Error Handling

### Migration Error Prevention

```typescript
interface MigrationSafety {
  preValidation: {
    // 이동 전 검증 단계
    checkBuildStatus: () => Promise<boolean>
    validateImports: () => Promise<ImportValidationResult>
    backupFiles: () => Promise<void>
  }

  postValidation: {
    // 이동 후 검증 단계
    verifyBuild: () => Promise<boolean>
    runTests: () => Promise<TestResult>
    validateAllImports: () => Promise<ImportValidationResult>
  }

  rollback: {
    // 롤백 전략
    restoreFromBackup: () => Promise<void>
    revertImportChanges: () => Promise<void>
  }
}
```

### Import Resolution Strategy

```typescript
interface ImportResolutionStrategy {
  phases: {
    analysis: {
      // 1단계: 현재 import 분석
      scanAllFiles: () => Promise<ImportMap>
      identifyProblematicImports: () => Promise<ProblematicImport[]>
    }

    transformation: {
      // 2단계: import 경로 변환
      updateRelativeToAbsolute: () => Promise<void>
      validateTransformations: () => Promise<ValidationResult>
    }

    verification: {
      // 3단계: 변환 결과 검증
      checkTypeScript: () => Promise<TypeCheckResult>
      verifyRuntime: () => Promise<RuntimeResult>
    }
  }
}
```

## Testing Strategy

### Migration Testing Approach

```typescript
interface MigrationTestStrategy {
  unitTests: {
    // 개별 모듈 테스트
    testComponentImports: () => Promise<TestResult>
    testHookImports: () => Promise<TestResult>
    testUtilityImports: () => Promise<TestResult>
  }

  integrationTests: {
    // 통합 테스트
    testPageRendering: () => Promise<TestResult>
    testUserFlows: () => Promise<TestResult>
    testAPIEndpoints: () => Promise<TestResult>
  }

  buildTests: {
    // 빌드 테스트
    developmentBuild: () => Promise<BuildResult>
    productionBuild: () => Promise<BuildResult>
    typeCheck: () => Promise<TypeCheckResult>
  }
}
```

### Validation Checkpoints

```typescript
interface ValidationCheckpoints {
  beforeMigration: {
    currentBuildStatus: boolean
    currentTestStatus: boolean
    importMapSnapshot: ImportMap
  }

  duringMigration: {
    phaseCompletionChecks: ValidationCheck[]
    incrementalValidation: boolean
  }

  afterMigration: {
    finalBuildStatus: boolean
    finalTestStatus: boolean
    importValidation: boolean
    performanceCheck: boolean
  }
}
```

## Implementation Phases

### Phase 1: Analysis and Preparation

```typescript
interface Phase1Tasks {
  codebaseAnalysis: {
    scanCurrentStructure: () => Promise<StructureMap>
    identifyMisplacedFiles: () => Promise<MisplacedFile[]>
    analyzeImportPatterns: () => Promise<ImportPattern[]>
  }

  preparationTasks: {
    createBackup: () => Promise<void>
    setupValidationTools: () => Promise<void>
    prepareIndexFiles: () => Promise<void>
  }
}
```

### Phase 2: Import Path Standardization

```typescript
interface Phase2Tasks {
  importTransformation: {
    convertRelativeToAbsolute: () => Promise<void>
    updateComponentImports: () => Promise<void>
    updateHookImports: () => Promise<void>
    updateLibraryImports: () => Promise<void>
  }

  validation: {
    validateTypeScript: () => Promise<TypeCheckResult>
    testBuild: () => Promise<BuildResult>
  }
}
```

### Phase 3: Index File Optimization

```typescript
interface Phase3Tasks {
  indexFileCreation: {
    createComponentIndexes: () => Promise<void>
    createHookIndexes: () => Promise<void>
    createLibraryIndexes: () => Promise<void>
    createTypeIndexes: () => Promise<void>
  }

  barrelExportOptimization: {
    optimizeExports: () => Promise<void>
    removeUnusedExports: () => Promise<void>
    addMissingExports: () => Promise<void>
  }
}
```

### Phase 4: Final Validation and Cleanup

```typescript
interface Phase4Tasks {
  finalValidation: {
    runFullTestSuite: () => Promise<TestResult>
    validateAllImports: () => Promise<ImportValidationResult>
    checkBundleSize: () => Promise<BundleAnalysis>
  }

  cleanup: {
    removeUnusedFiles: () => Promise<void>
    updateDocumentation: () => Promise<void>
    generateMigrationReport: () => Promise<MigrationReport>
  }
}
```

## Performance Considerations

### Bundle Impact Analysis

```typescript
interface BundleImpactAnalysis {
  beforeMigration: {
    bundleSize: number
    chunkSizes: Record<string, number>
    importGraph: ImportGraph
  }

  afterMigration: {
    bundleSize: number
    chunkSizes: Record<string, number>
    importGraph: ImportGraph
    improvements: BundleImprovement[]
  }
}
```

### Tree Shaking Optimization

```typescript
interface TreeShakingStrategy {
  indexFileOptimization: {
    // 배럴 export 최적화로 tree shaking 개선
    createSelectiveExports: () => Promise<void>
    avoidNamespaceImports: () => Promise<void>
  }

  importOptimization: {
    // 개별 모듈 import 최적화
    preferDirectImports: () => Promise<void>
    eliminateUnusedImports: () => Promise<void>
  }
}
```

## Migration Tools and Utilities

### Automated Migration Scripts

```typescript
interface MigrationTools {
  fileAnalyzer: {
    // 파일 분석 도구
    scanImports: (filePath: string) => Promise<ImportInfo[]>
    detectCircularDependencies: () => Promise<CircularDependency[]>
    generateDependencyGraph: () => Promise<DependencyGraph>
  }

  pathTransformer: {
    // 경로 변환 도구
    transformImportPaths: (content: string) => string
    validateTransformation: (original: string, transformed: string) => boolean
  }

  validator: {
    // 검증 도구
    validateTypeScript: () => Promise<TypeCheckResult>
    validateBuild: () => Promise<BuildResult>
    validateRuntime: () => Promise<RuntimeResult>
  }
}
```

## Success Metrics

### Migration Success Criteria

```typescript
interface SuccessMetrics {
  technicalMetrics: {
    buildSuccess: boolean
    testPassRate: number
    typeCheckSuccess: boolean
    importErrorCount: number
  }

  qualityMetrics: {
    codeOrganization: OrganizationScore
    developerExperience: DXScore
    maintainabilityIndex: number
  }

  performanceMetrics: {
    bundleSizeChange: number
    buildTimeChange: number
    treeShakingEfficiency: number
  }
}
```

이 설계는 현재 프로젝트가 이미 적절한 구조를 가지고 있다는 분석을 바탕으로, 주로 import 경로
표준화와 index 파일 최적화에 중점을 둡니다.
