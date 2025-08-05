/**
 * Loading Components
 *
 * 로딩 상태 관련 컴포넌트들을 중앙에서 관리하고 내보냅니다.
 */

// Loading coordination components
export { ServerClientCoordination } from '@/components/loading/server-client-coordination'

// Re-export types from the central types system
export type { LoadingState } from '@/types'
