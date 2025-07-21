'use client'

import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorFallbackProps {
  error: Error | undefined
  resetError: (() => void) | undefined
  title: string | undefined
  message: string | undefined
  showRetry: boolean | undefined
  showHome: boolean | undefined
  className: string | undefined
}

/**
 * Simple Error Fallback Component
 *
 * A reusable error display component that can be used
 * as a fallback UI for error boundaries or error states.
 */
export function ErrorFallback({
  error,
  resetError,
  title = '문제가 발생했습니다',
  message = '예상치 못한 오류가 발생했습니다. 다시 시도해 주세요.',
  showRetry = true,
  showHome = true,
  className = '',
  children,
}: {
  error?: Error
  resetError?: () => void
  title?: string
  message?: string
  showRetry?: boolean
  showHome?: boolean
  className?: string
  children?: React.ReactNode
}) {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-lg text-red-600">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600 text-sm">{message}</p>

          {/* Error details in development */}
          {error && process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 p-3 rounded text-xs">
              <strong>Error:</strong> {error.message}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            {showRetry && resetError && (
              <Button onClick={resetError} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 시도
              </Button>
            )}
            {showRetry && !resetError && (
              <Button onClick={handleReload} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                페이지 새로고침
              </Button>
            )}
            {showHome && (
              <Button
                variant="outline"
                onClick={handleGoHome}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                홈으로 이동
              </Button>
            )}
          </div>

          {/* 추가 컨텐츠 */}
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Inline Error Component
 *
 * A smaller error component for inline error states
 */
export function InlineError({
  error,
  message = '오류가 발생했습니다',
  onRetry,
  className = '',
}: {
  error?: Error
  message?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      className={`flex items-center justify-center p-4 text-center ${className}`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-center text-red-600">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">{message}</span>
        </div>

        {error && process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-gray-500">{error.message}</p>
        )}

        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="w-3 h-3 mr-1" />
            다시 시도
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Network Error Component
 *
 * Specific error component for network-related errors
 */
export function NetworkError({
  onRetry,
  className = '',
}: {
  onRetry?: () => void
  className?: string
}) {
  return (
    <ErrorFallback
      title="연결 문제"
      message="네트워크 연결을 확인하고 다시 시도해 주세요."
      {...(onRetry && { resetError: onRetry })}
      showHome={false}
      className={className}
    />
  )
}

/**
 * Not Found Error Component
 *
 * Specific error component for 404-like errors
 */
export function NotFoundError({
  title = '찾을 수 없음',
  message = '요청하신 내용을 찾을 수 없습니다.',
  onGoBack,
  className = '',
}: {
  title?: string
  message?: string
  onGoBack?: () => void
  className?: string
}) {
  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack()
    } else if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <CardTitle className="text-lg text-yellow-600">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600 text-sm">{message}</p>

          <div className="flex flex-col gap-2">
            <Button onClick={handleGoBack} className="w-full">
              이전으로 돌아가기
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/')}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              홈으로 이동
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
