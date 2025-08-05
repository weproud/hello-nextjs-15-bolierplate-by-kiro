/**
 * Library Index
 *
 * 모든 라이브러리 유틸리티와 헬퍼 함수들을 중앙에서 관리하고 내보냅니다.
 * Tree shaking을 위해 개별 export를 사용합니다.
 */

// =============================================================================
// Core Utilities
// =============================================================================
export * from '@/lib/utils'
export * from '@/lib/type-guards'
export * from '@/lib/type-utils'
export * from '@/lib/env'
export * from '@/lib/logger'

// =============================================================================
// Database and ORM
// =============================================================================
export * from '@/lib/prisma'

// =============================================================================
// Authentication and Authorization
// =============================================================================
export * from '@/lib/safe-action'

// =============================================================================
// Error Handling System
// =============================================================================
export * from '@/lib/error-handler'
export * from '@/lib/error-handling'
export * from '@/lib/error-recovery'
export * from '@/lib/error-types'
export * from '@/lib/error-boundary-system'
export * from '@/lib/global-error-handler'
export * from '@/lib/auth-error-handler'
export * from '@/lib/auth-error-utils'
export * from '@/lib/form-error-handler'

// =============================================================================
// Performance Monitoring
// =============================================================================
export * from '@/lib/performance-monitor'
export * from '@/lib/performance-utils'

// =============================================================================
// Accessibility
// =============================================================================
export * from '@/lib/accessibility'

// =============================================================================
// Sub-modules (Barrel Exports)
// =============================================================================

// Actions
export * from '@/lib/actions'

// Cache System
export * from '@/lib/cache'

// Image Processing
export * from '@/lib/image'

// Lazy Loading
export * from '@/lib/lazy'

// Performance Tools
export * from '@/lib/performance'

// Repository Pattern
export * from '@/lib/repositories'

// Validation Schemas
export * from '@/lib/validations'
