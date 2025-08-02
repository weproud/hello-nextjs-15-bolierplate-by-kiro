import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorFallbackClient } from './error-fallback-client'

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  title?: string
  message?: string
  showRetry?: boolean
  showHome?: boolean
  className?: string
}

/**
 * Server Component - Static error display structure
 * 정적 에러 표시 구조를 담당하는 서버 컴포넌트
 */
export function ErrorFallbackOptimized({
  error,
  resetError,
  title = '문제가 발생했습니다',
  message = '예상치 못한 오류가 발생했습니다. 다시 시도해 주세요.',
  showRetry = true,
  showHome = true,
  className = '',
}: ErrorFallbackProps) {
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3'>
            <AlertTriangle className='w-6 h-6 text-red-600' />
          </div>
          <CardTitle className='text-lg text-red-600'>{title}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-center text-gray-600 text-sm'>{message}</p>

          {/* Error details in development - Static content */}
          {error && process.env.NODE_ENV === 'development' && (
            <div className='bg-gray-100 p-3 rounded text-xs'>
              <strong>Error:</strong> {error.message}
            </div>
          )}

          {/* Dynamic action buttons - Client Component */}
          <ErrorFallbackClient
            resetError={resetError}
            showRetry={showRetry}
            showHome={showHome}
          />
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Server Component - Inline error display
 * 인라인 에러 표시를 위한 서버 컴포넌트
 */
export function InlineErrorOptimized({
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
      <div className='space-y-3'>
        <div className='flex items-center justify-center text-red-600'>
          <AlertTriangle className='w-5 h-5 mr-2' />
          <span className='text-sm font-medium'>{message}</span>
        </div>

        {error && process.env.NODE_ENV === 'development' && (
          <p className='text-xs text-gray-500'>{error.message}</p>
        )}

        {/* Dynamic retry button - Client Component */}
        {onRetry && (
          <ErrorFallbackClient
            resetError={onRetry}
            showRetry={true}
            showHome={false}
            isInline={true}
          />
        )}
      </div>
    </div>
  )
}

/**
 * Server Component - Network error display
 * 네트워크 에러 표시를 위한 서버 컴포넌트
 */
export function NetworkErrorOptimized({
  onRetry,
  className = '',
}: {
  onRetry?: () => void
  className?: string
}) {
  return (
    <ErrorFallbackOptimized
      title='연결 문제'
      message='네트워크 연결을 확인하고 다시 시도해 주세요.'
      resetError={onRetry}
      showHome={false}
      className={className}
    />
  )
}

/**
 * Server Component - Not found error display
 * 404 에러 표시를 위한 서버 컴포넌트
 */
export function NotFoundErrorOptimized({
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
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3'>
            <AlertTriangle className='w-6 h-6 text-yellow-600' />
          </div>
          <CardTitle className='text-lg text-yellow-600'>{title}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-center text-gray-600 text-sm'>{message}</p>

          {/* Dynamic navigation buttons - Client Component */}
          <ErrorFallbackClient
            resetError={onGoBack}
            showRetry={false}
            showHome={true}
            showGoBack={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
