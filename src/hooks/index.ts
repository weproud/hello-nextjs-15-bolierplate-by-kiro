// 폼 관련 훅들의 통합 내보내기
export {
  useFormWithAction,
  useMultiStepFormWithAction,
  type FormWithActionHook,
  type MultiStepFormWithActionHook,
  type UseFormWithActionOptions,
} from '@/hooks/use-form-with-action'

export {
  useAutoSaveForm,
  useConditionalForm,
  useFormWithValidation,
  useProgressiveForm,
  useRealtimeValidation,
  type ConditionalForm,
  type FormWithValidation,
  type ProgressiveForm,
  type RealtimeForm,
} from '@/hooks/use-form'

export {
  useBatchFormAction,
  useFormAction,
  useOptimisticFormAction,
  useRetryableFormAction,
  type ActionResult,
  type BatchFormActionHook,
  type FormActionHook,
  type OptimisticFormActionHook,
  type RetryableFormActionHook,
} from '@/hooks/use-form-action'

// 기타 유용한 훅들
export { useDataLoading, useProgress } from '@/hooks/use-loading-state'

// 에러 처리 훅들
export {
  useErrorHandler,
  useGlobalErrorHandler,
  useServerActionErrorHandler,
  type ErrorHandlerOptions,
  type ErrorHandlerResult,
} from '@/hooks/use-error-handler'
export { useServerActionError } from '@/hooks/use-server-action-error'

// 폼 관련 유틸리티 타입들
export type {
  FormAction,
  SafeAction,
  ServerAction,
} from '@/hooks/use-form-action'
