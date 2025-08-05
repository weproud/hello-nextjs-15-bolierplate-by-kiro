/**
 * Pattern Components
 *
 * 아키텍처 패턴 관련 컴포넌트들을 중앙에서 관리하고 내보냅니다.
 */

// Hybrid pattern components
export { HybridExamples } from '@/components/patterns/hybrid-examples'
export { HybridExamplesClient } from '@/components/patterns/hybrid-examples-client'
export { ServerClientBoundary } from '@/components/patterns/server-client-boundary'

// Re-export types from the central types system
export type { HybridPatternProps } from '@/types'
