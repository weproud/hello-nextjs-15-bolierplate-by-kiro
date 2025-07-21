'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react'
import { useModalErrorHandler } from './modal-error-boundary'
import { createAuthErrorHandler, type AuthError } from '@/lib/auth-error-utils'

interface SignInFormProps {
  isModal?: boolean
  onSuccess?: () => void
  onError?: (error: Error) => void
  callbackUrl?: string
}

export function SignInForm({
  isModal = false,
  onSuccess,
  onError,
  callbackUrl: propCallbackUrl,
}: SignInFormProps = {}) {
  const searchParams = useSearchParams()
  const callbackUrl = propCallbackUrl || searchParams.get('callbackUrl') || '/'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { handleError: handleModalError, fallbackToFullPage } =
    useModalErrorHandler()

  // Create error handler with consistent behavior
  const errorHandler = useMemo(
    () =>
      createAuthErrorHandler(isModal ? 'modal' : 'page', {
        maxRetries: 3,
        fallbackToFullPage: isModal,
        callbackUrl,
      }),
    [isModal, callbackUrl]
  )

  const handleGoogleSignIn = useCallback(async () => {
    try {
      console.log('Google 로그인 시도 - 모달:', isModal)
      setIsLoading(true)
      setError(null)

      // 모달과 일반 페이지 모두 redirect: true를 사용하여 Google OAuth 플로우가 정상 작동하도록 함
      await signIn('google', {
        callbackUrl,
        redirect: true,
      })
    } catch (error) {
      const authError = error as AuthError
      console.error('로그인 오류:', authError)

      // Use the error handler to get consistent error handling
      const errorResult = errorHandler.handleError(authError)
      setError(errorResult.message)

      // Report error to modal error handler if in modal context
      if (isModal) {
        await handleModalError(authError, 'signin-form')
      }

      // Call custom error handler if provided
      if (onError) {
        onError(authError)
      }
    } finally {
      setIsLoading(false)
    }
  }, [callbackUrl, isModal, onSuccess, onError, errorHandler, handleModalError])

  const handleRetry = useCallback(async () => {
    errorHandler.incrementRetry()
    setError(null)
    await handleGoogleSignIn()
  }, [errorHandler, handleGoogleSignIn])

  const handleFallbackToFullPage = useCallback(() => {
    fallbackToFullPage(callbackUrl)
  }, [fallbackToFullPage, callbackUrl])

  // Get current retry state from error handler
  const errorResult = error
    ? errorHandler.handleError({
        name: 'RetryCheck',
        message: error,
      } as AuthError)
    : null
  const canRetry = errorResult?.canRetry || false

  return (
    <div className="space-y-4" role="form" aria-label="Google 로그인 폼">
      {/* Error display with enhanced accessibility */}
      {error && (
        <div
          className="p-3 bg-red-50 border border-red-200 rounded-md"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="flex items-start">
            <AlertTriangle
              className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0"
              aria-hidden="true"
            />
            <div className="flex-1">
              <p className="text-sm text-red-800" id="signin-error-message">
                {error}
              </p>
              {errorResult && errorResult.retryCount > 0 && (
                <p
                  className="text-xs text-red-600 mt-1"
                  aria-label={`재시도 횟수: ${errorResult.retryCount}회 중 최대 ${errorResult.maxRetries}회`}
                >
                  재시도 {errorResult.retryCount}/{errorResult.maxRetries}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main signin button with enhanced accessibility */}
      <Button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        size="lg"
        aria-describedby={error ? 'signin-error-message' : undefined}
        aria-label={isLoading ? '로그인 진행 중' : 'Google 계정으로 로그인'}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
            <span aria-live="polite">로그인 중...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 로그인
          </div>
        )}
      </Button>

      {/* Retry and fallback options with enhanced accessibility */}
      {error && (
        <div
          className="space-y-2"
          role="group"
          aria-label="로그인 재시도 및 대안 옵션"
        >
          {canRetry && (
            <Button
              onClick={handleRetry}
              variant="outline"
              className="w-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              size="sm"
              aria-label={`로그인 다시 시도. ${errorResult ? errorResult.maxRetries - errorResult.retryCount : 3}회 남음`}
            >
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              다시 시도 (
              {errorResult
                ? errorResult.maxRetries - errorResult.retryCount
                : 3}
              회 남음)
            </Button>
          )}

          {isModal && (
            <Button
              onClick={handleFallbackToFullPage}
              variant="ghost"
              className="w-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              size="sm"
              aria-label="전체 페이지에서 로그인하기"
            >
              <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
              전체 페이지에서 로그인
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
