'use client'

import { AlertTriangle, RefreshCw, Home, Bug, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ErrorType =
  | 'component'
  | 'page'
  | 'global'
  | 'network'
  | 'auth'
  | 'validation'

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  title?: string
  message?: string
  showRetry?: boolean
  showHome?: boolean
  className?: string
  children?: React.ReactNode
  severity?: ErrorSeverity
  type?: ErrorType
  errorId?: string
  showDetails?: boolean
  retryCount?: number
  onGoBack?: () => void
  compact?: boolean
}

/**
 * 통합 에러 폴백 컴포넌트
 *
 * 다양한 에러 상황에 대응할 수 있는 재사용 가능한 에러 표시 컴포넌트
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
  severity = 'medium',
  type = 'component',
  errorId,
  showDetails = false,
  retryCount = 0,
  onGoBack,
  compact = false,
}: ErrorFallbackProps) {
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

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack()
    } else if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        window.location.href = '/'
      }
    }
  }

  /**
   * 심각도에 따른 스타일 반환
   */
  const getSeverityStyles = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          badgeVariant: 'destructive' as const,
          icon: Shield,
        }
      case 'high':
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          titleColor: 'text-orange-800',
          badgeVariant: 'secondary' as const,
          icon: AlertTriangle,
        }
      case 'medium':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          badgeVariant: 'outline' as const,
          icon: AlertTriangle,
        }
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-800',
          badgeVariant: 'secondary' as const,
          icon: AlertTriangle,
        }
    }
  }

  /**
   * 에러 타입에 따른 라벨 반환
   */
  const getTypeLabel = (type: ErrorType) => {
    switch (type) {
      case 'component':
        return 'COMPONENT'
      case 'page':
        return 'PAGE'
      case 'global':
        return 'SYSTEM'
      case 'network':
        return 'NETWORK'
      case 'auth':
        return 'AUTH'
      case 'validation':
        return 'VALIDATION'
      default:
        return 'ERROR'
    }
  }

  const styles = getSeverityStyles(severity)
  const IconComponent = styles.icon

  // 컴팩트 모드
  if (compact) {
    return (
      <div
        className={`${styles.bgColor} border ${styles.borderColor} rounded-lg p-3 ${className}`}
      >
        <div className='flex items-center space-x-3'>
          <IconComponent
            className={`w-5 h-5 ${styles.iconColor} flex-shrink-0`}
          />
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-1'>
              <h4 className={`text-sm font-medium ${styles.titleColor}`}>
                {title}
              </h4>
              <Badge variant={styles.badgeVariant} className='text-xs'>
                {getTypeLabel(type)}
              </Badge>
            </div>
            <p className='text-sm text-gray-600'>{message}</p>

            {/* 에러 정보 */}
            {(errorId || retryCount > 0) && (
              <div className='text-xs text-gray-500 mt-1 space-y-0.5'>
                {errorId && (
                  <div>
                    ID:{' '}
                    <code className='bg-white px-1 py-0.5 rounded'>
                      {errorId}
                    </code>
                  </div>
                )}
                {retryCount > 0 && <div>재시도: {retryCount}회</div>}
              </div>
            )}

            {/* 개발 환경 에러 상세 정보 */}
            {showDetails && error && process.env.NODE_ENV === 'development' && (
              <div className='bg-white p-2 rounded text-xs text-gray-700 mt-2'>
                <strong>Error:</strong> {error.message}
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className='flex gap-1'>
            {showRetry && resetError && (
              <Button size='sm' variant='outline' onClick={resetError}>
                <RefreshCw className='w-3 h-3' />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 일반 모드
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Card className={`w-full max-w-md ${styles.borderColor} border`}>
        <CardHeader className='text-center'>
          <div
            className={`mx-auto w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center mb-3`}
          >
            <IconComponent className={`w-6 h-6 ${styles.iconColor}`} />
          </div>
          <div className='flex items-center justify-center gap-2 mb-2'>
            <CardTitle className={`text-lg ${styles.titleColor}`}>
              {title}
            </CardTitle>
            <Badge variant={styles.badgeVariant} className='text-xs'>
              {getTypeLabel(type)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          <p className='text-center text-gray-600 text-sm'>{message}</p>

          {/* 에러 정보 */}
          {(errorId || retryCount > 0) && (
            <div className='text-center text-xs text-gray-500 space-y-1'>
              {errorId && (
                <p>
                  오류 ID:{' '}
                  <code className='bg-gray-100 px-2 py-1 rounded'>
                    {errorId}
                  </code>
                </p>
              )}
              {retryCount > 0 && <p>재시도 횟수: {retryCount}회</p>}
            </div>
          )}

          {/* 개발 환경 에러 상세 정보 */}
          {showDetails && error && process.env.NODE_ENV === 'development' && (
            <div className='bg-gray-100 p-3 rounded text-xs'>
              <div className='flex items-center gap-2 mb-2'>
                <Bug className='w-4 h-4' />
                <strong>개발자 정보</strong>
              </div>
              <div className='space-y-1'>
                <div>
                  <strong>메시지:</strong> {error.message}
                </div>
                {error.stack && (
                  <details className='mt-2'>
                    <summary className='cursor-pointer font-medium'>
                      스택 트레이스 보기
                    </summary>
                    <pre className='mt-1 text-xs bg-white p-2 rounded border overflow-auto max-h-32'>
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className='flex flex-col gap-2'>
            {showRetry && resetError && (
              <Button onClick={resetError} className='w-full'>
                <RefreshCw className='w-4 h-4 mr-2' />
                다시 시도
              </Button>
            )}
            {showRetry && !resetError && (
              <Button onClick={handleReload} className='w-full'>
                <RefreshCw className='w-4 h-4 mr-2' />
                페이지 새로고침
              </Button>
            )}

            <div className='flex gap-2'>
              {onGoBack && (
                <Button
                  variant='outline'
                  onClick={handleGoBack}
                  className='flex-1'
                >
                  이전으로
                </Button>
              )}
              {showHome && (
                <Button
                  variant='outline'
                  onClick={handleGoHome}
                  className={onGoBack ? 'flex-1' : 'w-full'}
                >
                  <Home className='w-4 h-4 mr-2' />
                  홈으로 이동
                </Button>
              )}
            </div>
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
      <div className='space-y-3'>
        <div className='flex items-center justify-center text-red-600'>
          <AlertTriangle className='w-5 h-5 mr-2' />
          <span className='text-sm font-medium'>{message}</span>
        </div>

        {error && process.env.NODE_ENV === 'development' && (
          <p className='text-xs text-gray-500'>{error.message}</p>
        )}

        {onRetry && (
          <Button size='sm' variant='outline' onClick={onRetry}>
            <RefreshCw className='w-3 h-3 mr-1' />
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
      title='연결 문제'
      message='네트워크 연결을 확인하고 다시 시도해 주세요.'
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
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3'>
            <AlertTriangle className='w-6 h-6 text-yellow-600' />
          </div>
          <CardTitle className='text-lg text-yellow-600'>{title}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-center text-gray-600 text-sm'>{message}</p>

          <div className='flex flex-col gap-2'>
            <Button onClick={handleGoBack} className='w-full'>
              이전으로 돌아가기
            </Button>
            <Button
              variant='outline'
              onClick={() => (window.location.href = '/')}
              className='w-full'
            >
              <Home className='w-4 h-4 mr-2' />
              홈으로 이동
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
