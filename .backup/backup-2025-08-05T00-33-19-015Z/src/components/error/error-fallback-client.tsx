'use client'

import { RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCallback } from 'react'

interface ErrorFallbackClientProps {
  resetError?: () => void
  showRetry?: boolean
  showHome?: boolean
  showGoBack?: boolean
  isInline?: boolean
}

/**
 * Client Component - Interactive error actions
 * 에러 상호작용을 담당하는 클라이언트 컴포넌트
 */
export function ErrorFallbackClient({
  resetError,
  showRetry = true,
  showHome = true,
  showGoBack = false,
  isInline = false,
}: ErrorFallbackClientProps) {
  const handleReload = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }, [])

  const handleGoHome = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }, [])

  const handleGoBack = useCallback(() => {
    if (resetError) {
      resetError()
    } else if (typeof window !== 'undefined') {
      window.history.back()
    }
  }, [resetError])

  if (isInline) {
    return (
      <Button size='sm' variant='outline' onClick={resetError || handleReload}>
        <RefreshCw className='w-3 h-3 mr-1' />
        다시 시도
      </Button>
    )
  }

  return (
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
      {showGoBack && (
        <Button onClick={handleGoBack} className='w-full'>
          <ArrowLeft className='w-4 h-4 mr-2' />
          이전으로 돌아가기
        </Button>
      )}
      {showHome && (
        <Button variant='outline' onClick={handleGoHome} className='w-full'>
          <Home className='w-4 h-4 mr-2' />
          홈으로 이동
        </Button>
      )}
    </div>
  )
}
