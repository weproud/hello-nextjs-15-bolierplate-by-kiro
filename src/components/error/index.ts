/**
 * Error Handling Components
 *
 * 에러 처리 관련 컴포넌트들을 중앙에서 관리하고 내보냅니다.
 */

// Core error boundary components
export { ErrorBoundary } from './error-boundary'
export { GlobalErrorBoundary } from './global-error-boundary'
export { ComponentErrorBoundary } from './component-error-boundary'
export { RouteErrorBoundary } from './route-error-boundary'
export { HierarchicalErrorBoundary } from './hierarchical-error-boundary'
export { UnifiedErrorBoundary } from './unified-error-boundary'

// Error fallback components
export { ErrorFallback } from './error-fallback'
export { ErrorFallbackClient } from './error-fallback-client'
export { ErrorFallbackOptimized } from './error-fallback-optimized'

// Error recovery components
export { ErrorRecovery } from './error-recovery'

// Test and example components
export { ErrorBoundaryTest } from './error-boundary-test'
export { ErrorBoundaryExamples } from './error-boundary-examples'

// Re-export types from the central types system
export type { ErrorFallbackProps, AppError } from '@/types'
