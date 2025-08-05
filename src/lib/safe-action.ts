/**
 * Safe Action Configuration
 *
 * 이 파일은 하위 호환성을 위해 유지되며, 새로운 통합 래퍼를 re-export합니다.
 * 새로운 코드에서는 @/lib/actions/safe-action-wrapper를 직접 사용하는 것을 권장합니다.
 */

// 새로운 통합 래퍼에서 클라이언트들을 re-export
export {
  actionClient,
  adminActionClient,
  authActionClient,
  createAction,
  createRetryableAction,
  createTransactionAction,
  publicActionClient,
  type ActionContext,
  type ErrorSeverity,
} from '@/lib/actions/safe-action-wrapper'

// 하위 호환성을 위한 기존 export 유지
import {
  actionClient as baseActionClient,
  authActionClient as baseAuthActionClient,
  publicActionClient as basePublicActionClient,
} from '@/lib/actions/safe-action-wrapper'

// 기존 이름으로도 접근 가능하도록 alias 제공
export const safeActionClient = baseActionClient
export const authenticatedActionClient = baseAuthActionClient
export const unauthenticatedActionClient = basePublicActionClient
