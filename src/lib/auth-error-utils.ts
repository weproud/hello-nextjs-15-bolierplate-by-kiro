/**
 * Authentication Error Utilities
 *
 * Provides utilities for handling authentication errors consistently
 * across modal and full page contexts.
 */

import { createLogger } from '@/lib/logger'

const logger = createLogger('auth-error-utils')

export interface AuthError extends Error {
  type?: string
  code?: string
  context?: 'modal' | 'page'
}

export interface ErrorHandlingOptions {
  maxRetries?: number
  fallbackToFullPage?: boolean
  callbackUrl?: string
}

/**
 * Maps NextAuth error types to user-friendly messages
 */
export function getAuthErrorMessage(error: AuthError): string {
  if (!error.message) {
    return '로그인 중 오류가 발생했습니다.'
  }

  const message = error.message.toLowerCase()

  // Handle specific error types
  if (
    message.includes('popup_closed_by_user') ||
    message.includes('user_cancelled')
  ) {
    return '로그인이 취소되었습니다.'
  }

  if (message.includes('network') || message.includes('fetch')) {
    return '네트워크 연결을 확인해 주세요.'
  }

  if (error.code === 'access_denied') {
    return '로그인 권한이 거부되었습니다.'
  }

  if (error.type === 'OAuthAccountNotLinked') {
    return '이미 다른 방법으로 가입된 계정입니다.'
  }

  if (message.includes('timeout')) {
    return '로그인 요청 시간이 초과되었습니다.'
  }

  if (message.includes('invalid_request')) {
    return '잘못된 로그인 요청입니다.'
  }

  if (message.includes('server_error')) {
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  }

  // Default error message
  return '로그인 중 오류가 발생했습니다.'
}

/**
 * Determines if an error is retryable
 */
export function isRetryableError(error: AuthError): boolean {
  if (!error.message) return true

  const message = error.message.toLowerCase()

  // Don't retry user-cancelled actions
  if (
    message.includes('popup_closed_by_user') ||
    message.includes('user_cancelled')
  ) {
    return false
  }

  // Don't retry access denied errors
  if (error.code === 'access_denied') {
    return false
  }

  // Don't retry account linking errors
  if (error.type === 'OAuthAccountNotLinked') {
    return false
  }

  // Retry network and server errors
  return true
}

/**
 * Creates a fallback URL for full page signin
 */
export function createFallbackUrl(callbackUrl?: string): string {
  const callback =
    callbackUrl ||
    (typeof window !== 'undefined' ? window.location.pathname : '/')
  return `/auth/signin?callbackUrl=${encodeURIComponent(callback)}`
}

/**
 * Handles graceful degradation from modal to full page
 */
export function handleGracefulDegradation(
  error: AuthError,
  callbackUrl?: string,
  delay = 0
): void {
  logger.warn('Graceful degradation triggered', {
    errorMessage: error.message,
    callbackUrl,
    delay,
  })

  const fallbackUrl = createFallbackUrl(callbackUrl)

  if (delay > 0) {
    setTimeout(() => {
      window.location.href = fallbackUrl
    }, delay)
  } else {
    window.location.href = fallbackUrl
  }
}

/**
 * Reports authentication errors to monitoring service
 */
export function reportAuthError(
  error: AuthError,
  context: 'modal' | 'page',
  additionalInfo?: Record<string, any>
): void {
  const errorReport = {
    message: error.message,
    stack: error.stack,
    type: error.type,
    code: error.code,
    context,
    timestamp: new Date().toISOString(),
    userAgent:
      typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
    url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    ...additionalInfo,
  }

  logger.error('Auth error report', undefined, errorReport)

  // TODO: Send to error reporting service
  // Example:
  // errorReportingService.captureException(error, {
  //   extra: errorReport,
  //   tags: {
  //     component: 'auth',
  //     context,
  //   },
  // })
}

/**
 * Creates a comprehensive error handler for authentication
 */
export function createAuthErrorHandler(
  context: 'modal' | 'page',
  options: ErrorHandlingOptions = {}
) {
  const {
    maxRetries = 3,
    fallbackToFullPage = context === 'modal',
    callbackUrl,
  } = options

  let retryCount = 0

  return {
    handleError: (error: AuthError) => {
      // Report the error
      reportAuthError(error, context, { retryCount })

      // Get user-friendly message
      const message = getAuthErrorMessage(error)

      // Check if error is retryable
      const canRetry = isRetryableError(error) && retryCount < maxRetries

      return {
        message,
        canRetry,
        shouldFallback: !canRetry && fallbackToFullPage,
        retryCount,
        maxRetries,
      }
    },

    incrementRetry: () => {
      retryCount++
    },

    reset: () => {
      retryCount = 0
    },

    fallback: () => {
      if (fallbackToFullPage) {
        handleGracefulDegradation(
          {
            name: 'FallbackError',
            message: 'Manual fallback triggered',
          } as AuthError,
          callbackUrl
        )
      }
    },
  }
}
