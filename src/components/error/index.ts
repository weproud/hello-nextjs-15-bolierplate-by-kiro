/**
 * Error Handling Components
 *
 * 에러 처리 관련 컴포넌트들을 중앙에서 관리하고 내보냅니다.
 */

// Core error boundary components
export { ComponentErrorBoundary } from '@/components/error/component-error-boundary'
export { ErrorBoundary } from '@/components/error/error-boundary'
export { GlobalErrorBoundary } from '@/components/error/global-error-boundary'
export { HierarchicalErrorBoundary } from '@/components/error/hierarchical-error-boundary'
export { PageErrorBoundary } from '@/components/error/page-error-boundary'
export { RouteErrorBoundary } from '@/components/error/route-error-boundary'
export { UnifiedErrorBoundary } from '@/components/error/unified-error-boundary'

// Error fallback components
export { ErrorFallback } from '@/components/error/error-fallback'
export { ErrorFallbackClient } from '@/components/error/error-fallback-client'
export { ErrorFallbackOptimized } from '@/components/error/error-fallback-optimized'

// Error recovery components
export { ErrorRecovery } from '@/components/error/error-recovery'

// Test and example components
export { ErrorBoundaryExamples } from '@/components/error/error-boundary-examples'
export { ErrorBoundaryTest } from '@/components/error/error-boundary-test'

// Re-export types from the central types system
export type { AppError, ErrorFallbackProps } from '@/types'
