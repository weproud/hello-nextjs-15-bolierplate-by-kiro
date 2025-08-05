/**
 * Components Index
 *
 * 모든 컴포넌트들을 중앙에서 관리하고 내보냅니다.
 */

// UI Components (shadcn/ui based)
export * from './ui'

// Layout Components
export * from './layout'

// Feature Components
export * from './auth'
export * from './dashboard'
export * from './editor'
export * from './error'
export * from './forms'
export * from './posts'
export * from './projects'

// Global Components
export { Providers } from './providers'
export { ThemeProvider } from './theme-provider'
export { ThemeToggle } from './theme-toggle'
export { GlobalErrorBoundary } from './error/global-error-boundary'
export { ErrorHandlerProvider } from './error-handler-provider'

// Performance Components
export { PerformanceMonitor } from './performance/performance-monitor'

// Pattern Components
export { ServerClientBoundary } from './patterns/server-client-boundary'
export { HybridExamples } from './patterns/hybrid-examples'
export { HybridExamplesClient } from './patterns/hybrid-examples-client'

// Loading Components
export { ServerClientCoordination } from './loading/server-client-coordination'

// Example and Demo Components
export { FeaturesSection } from './features-section'
export { StoreExample } from './store-example'
export { PerformanceOptimizedExamples } from './performance-optimized-examples'
export { ErrorBoundaryExamples } from './error-boundary-examples'
