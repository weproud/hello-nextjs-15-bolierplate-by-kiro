/**
 * Lazy Loading Index
 *
 * 지연 로딩 관련 유틸리티들을 중앙에서 관리하고 내보냅니다.
 * Next.js dynamic import와 React lazy loading을 지원합니다.
 */

// =============================================================================
// Route Loader
// =============================================================================
export * from '@/lib/lazy/route-loader'

// =============================================================================
// Lazy Loading Types and Utilities
// =============================================================================
// Re-export commonly used types from the central types system
export type {
  LazyComponentProps,
  LazyLoadingOptions,
  RouteLoaderConfig,
} from '@/types'
