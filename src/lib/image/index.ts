/**
 * Image Processing Index
 *
 * 이미지 처리 및 최적화 관련 유틸리티들을 중앙에서 관리하고 내보냅니다.
 * Next.js Image 컴포넌트와 함께 사용할 수 있는 헬퍼 함수들을 제공합니다.
 */

// =============================================================================
// Image Utilities
// =============================================================================
export * from '@/lib/image/image-utils'

// =============================================================================
// Image Types and Utilities
// =============================================================================
// Re-export commonly used types from the central types system
export type {
  ImageConfig,
  ImageMetadata,
  ImageOptimizationOptions,
} from '@/types'
