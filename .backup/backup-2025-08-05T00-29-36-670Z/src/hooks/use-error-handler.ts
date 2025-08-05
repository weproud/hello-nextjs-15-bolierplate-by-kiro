'use client'

import { useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  transformAuthError,
  reportAuthError,
  isAuthError,
  isRetryableAuthError,
  getAuthErrorRecoveryActions,
  type AuthErrorContext,
} from '@/lib/auth-error-handler'
import { handleError, ActionLogger, type AppError } from '@/lib/error-handling'

/**
 * 에러 처리 옵션
 */
export interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  reportError?: boolean
  redirectOnAuth?: boolean
  retryable?: boolean
  context?: string
}

/**
 * 에러 처리 결과
 */
export interface ErrorHandlerResult {
  handled: boolean
  canRetry: boolean
  recoveryActions: Array<{
    id: string
    label: string
    action: string
    primary?: boolean
  }>
}

/**
 * 통합 에러 처리 훅
 */
export function useErrorHandler(defaultOptions: ErrorHandlerOptions = {}) {
  const router = useRouter()
  const retryCountRef = useRef<Map<string, number>>(new Map())

  const handleError = useCallback(
    async (
      error: unknown,
      options: ErrorHandlerOptions = {}
    ): Promise<ErrorHandlerResult> => {
      const opts = { ...defaultOptions, ...options }
      const {
        showToast = true,
        logError = true,
        reportError = true,
        redirectOnAuth = true,
        retryable = false,
        context = 'client',
      } = opts

      try {
        let appError: AppError
        let recoveryActions: Array<{
          id: string
          label: string
          action: string
          primary?: boolean
        }> = []

        // 에러 변환
        if (isAuthError(error)) {
          const authContext: Partial<AuthErrorContext> = {
            url:
              typeof window !== 'undefined' ? window.location.href : undefined,
            userAgent:
              typeof window !== 'undefined'
                ? window.navigator.userAgent
                : undefined,
          }
          appError = transformAuthError(error, authContext)
          recoveryActions = getAuthErrorRecoveryActions(appError)

          // 인증 에러 리포팅
          if (reportError) {
            await reportAuthError(appError, {
              timestamp: new Date(),
              requestId: crypto.randomUUID(),
              ...authContext,
            })
          }
        } else {
          appError = handleError(error) as AppError
        }

        // 에러 로깅
        if (logError) {
          ActionLogger.error(context, 'Client error handled', appError, {
            url:
              typeof window !== 'undefined' ? window.location.href : undefined,
            userAgent:
              typeof window !== 'undefined'
                ? window.navigator.userAgent
                : undefined,
            timestamp: new Date().toISOString(),
          })
        }

        // 토스트 알림 표시
        if (showToast) {
          showErrorToast(appError, recoveryActions)
        }

        // 인증 에러 시 리다이렉트
        if (redirectOnAuth && appError.code === 'UNAUTHORIZED') {
          const currentPath =
            typeof window !== 'undefined' ? window.location.pathname : '/'
          router.push(
            `/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`
          )
        }

        // 재시도 가능 여부 확인
        const canRetry =
          retryable &&
          (isRetryableAuthError(appError) ||
            appError.code === 'SERVICE_UNAVAILABLE' ||
            appError.code === 'DATABASE_ERROR')

        return {
          handled: true,
          canRetry,
          recoveryActions,
        }
      } catch (handlingError) {
        console.error('Error handling failed:', handlingError)

        // 폴백 토스트
        if (showToast) {
          toast.error('오류 처리 중 문제가 발생했습니다.')
        }

        return {
          handled: false,
          canRetry: false,
          recoveryActions: [],
        }
      }
    },
    [defaultOptions, router]
  )

  /**
   * 재시도 가능한 에러 처리
   */
  const handleRetryableError = useCallback(
    async (
      error: unknown,
      retryFn: () => Promise<void> | void,
      options: ErrorHandlerOptions & { maxRetries?: number } = {}
    ): Promise<boolean> => {
      const { maxRetries = 3 } = options
      const errorKey = error instanceof Error ? error.message : String(error)
      const currentRetries = retryCountRef.current.get(errorKey) || 0

      const result = await handleError(error, options)

      if (result.canRetry && currentRetries < maxRetries) {
        retryCountRef.current.set(errorKey, currentRetries + 1)

        try {
          await retryFn()
          retryCountRef.current.delete(errorKey) // 성공 시 카운트 리셋
          return true
        } catch (retryError) {
          return handleRetryableError(retryError, retryFn, options)
        }
      }

      retryCountRef.current.delete(errorKey)
      return false
    },
    [handleError]
  )

  /**
   * 폼 에러 처리
   */
  const handleFormError = useCallback(
    async (error: unknown, formName?: string): Promise<ErrorHandlerResult> => {
      return handleError(error, {
        context: `form:${formName || 'unknown'}`,
        showToast: true,
        logError: true,
        reportError: false, // 폼 에러는 일반적으로 리포팅하지 않음
      })
    },
    [handleError]
  )

  /**
   * API 에러 처리
   */
  const handleApiError = useCallback(
    async (error: unknown, endpoint?: string): Promise<ErrorHandlerResult> => {
      return handleError(error, {
        context: `api:${endpoint || 'unknown'}`,
        showToast: true,
        logError: true,
        reportError: true,
        retryable: true,
      })
    },
    [handleError]
  )

  /**
   * 네트워크 에러 처리
   */
  const handleNetworkError = useCallback(
    async (error: unknown): Promise<ErrorHandlerResult> => {
      return handleError(error, {
        context: 'network',
        showToast: true,
        logError: true,
        reportError: true,
        retryable: true,
      })
    },
    [handleError]
  )

  /**
   * 컴포넌트 에러 처리
   */
  const handleComponentError = useCallback(
    async (
      error: unknown,
      componentName?: string
    ): Promise<ErrorHandlerResult> => {
      return handleError(error, {
        context: `component:${componentName || 'unknown'}`,
        showToast: false, // 컴포넌트 에러는 에러 바운더리에서 처리
        logError: true,
        reportError: true,
      })
    },
    [handleError]
  )

  /**
   * 에러 복구 액션 실행
   */
  const executeRecoveryAction = useCallback(
    async (action: { id: string; action: string }): Promise<void> => {
      try {
        const [actionType, actionValue] = action.action.split(':')

        switch (actionType) {
          case 'redirect':
            router.push(actionValue || '/')
            break
          case 'refresh':
            if (typeof window !== 'undefined') {
              window.location.reload()
            }
            break
          case 'retry':
            // 재시도는 호출자가 처리
            break
          case 'signout':
            // 로그아웃 처리
            router.push('/auth/signout')
            break
          default:
            console.warn('Unknown recovery action:', actionType)
        }
      } catch (actionError) {
        console.error('Recovery action failed:', actionError)
        toast.error('복구 작업 중 오류가 발생했습니다.')
      }
    },
    [router]
  )

  /**
   * 에러 상태 초기화
   */
  const clearErrorState = useCallback(() => {
    retryCountRef.current.clear()
  }, [])

  return {
    handleError,
    handleRetryableError,
    handleFormError,
    handleApiError,
    handleNetworkError,
    handleComponentError,
    executeRecoveryAction,
    clearErrorState,
  }
}

/**
 * 에러 토스트 표시
 */
function showErrorToast(
  error: AppError,
  recoveryActions: Array<{
    id: string
    label: string
    action: string
    primary?: boolean
  }>
) {
  const primaryAction = recoveryActions.find(action => action.primary)

  if (primaryAction && primaryAction.action.startsWith('redirect:')) {
    // 리다이렉트 액션이 있는 경우 액션 버튼과 함께 표시
    toast.error(error.message, {
      action: {
        label: primaryAction.label,
        onClick: () => {
          const [, path] = primaryAction.action.split(':')
          if (typeof window !== 'undefined') {
            window.location.href = path
          }
        },
      },
      duration: 5000,
    })
  } else {
    // 일반 에러 토스트
    toast.error(error.message, {
      duration: error.code === 'VALIDATION_ERROR' ? 3000 : 5000,
    })
  }
}

/**
 * 전역 에러 처리 훅
 */
export function useGlobalErrorHandler() {
  const { handleError } = useErrorHandler({
    showToast: true,
    logError: true,
    reportError: true,
    redirectOnAuth: true,
  })

  // 전역 에러 리스너 등록
  const registerGlobalHandlers = useCallback(() => {
    if (typeof window === 'undefined') return

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(event.reason, { context: 'unhandled-promise' })
    }

    const handleGlobalError = (event: ErrorEvent) => {
      const error = new Error(event.message)
      error.stack = `${event.filename}:${event.lineno}:${event.colno}`
      handleError(error, { context: 'global-error' })
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleGlobalError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleGlobalError)
    }
  }, [handleError])

  return {
    handleError,
    registerGlobalHandlers,
  }
}

/**
 * 서버 액션 에러 처리 훅
 */
export function useServerActionErrorHandler() {
  const { handleError } = useErrorHandler({
    showToast: true,
    logError: true,
    reportError: false, // 서버 액션 에러는 서버에서 이미 리포팅됨
    redirectOnAuth: true,
  })

  const handleServerActionError = useCallback(
    async (result: { serverError?: string; validationErrors?: any }) => {
      if (result.serverError) {
        await handleError(new Error(result.serverError), {
          context: 'server-action',
        })
      }

      if (result.validationErrors) {
        // 검증 에러는 폼에서 직접 처리하므로 토스트만 표시
        toast.error('입력한 정보를 확인해 주세요.')
      }
    },
    [handleError]
  )

  return {
    handleServerActionError,
  }
}
