'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react'

interface ProjectModalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProjectModalError({
  error,
  reset,
}: ProjectModalErrorProps) {
  const router = useRouter()

  useEffect(() => {
    // Log the error for debugging
    console.error('Project modal error:', error)
  }, [error])

  const handleFallbackToFullPage = () => {
    // Extract project ID from current URL
    const pathSegments = window.location.pathname.split('/')
    const projectId = pathSegments[pathSegments.indexOf('projects') + 1]

    if (projectId) {
      router.push(`/projects/${projectId}`)
    } else {
      router.push('/projects')
    }
  }

  const handleClose = () => {
    router.back()
  }

  const getErrorMessage = () => {
    if (error.message.includes('404') || error.message.includes('not found')) {
      return '프로젝트를 찾을 수 없습니다.'
    }
    if (
      error.message.includes('403') ||
      error.message.includes('unauthorized')
    ) {
      return '이 프로젝트에 접근할 권한이 없습니다.'
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return '네트워크 연결에 문제가 있습니다.'
    }
    return '프로젝트 정보를 불러오는 중 오류가 발생했습니다.'
  }

  const getErrorSuggestion = () => {
    if (error.message.includes('404') || error.message.includes('not found')) {
      return '프로젝트가 삭제되었거나 존재하지 않을 수 있습니다.'
    }
    if (
      error.message.includes('403') ||
      error.message.includes('unauthorized')
    ) {
      return '로그인 상태를 확인하거나 프로젝트 소유자에게 문의하세요.'
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return '인터넷 연결을 확인하고 다시 시도해 주세요.'
    }
    return '잠시 후 다시 시도하거나 전체 페이지에서 확인해 주세요.'
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg border max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">오류가 발생했습니다</h2>
              <p className="text-sm text-muted-foreground">프로젝트 모달</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">닫기</span>✕
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium text-destructive">
              {getErrorMessage()}
            </h3>
            <p className="text-sm text-muted-foreground">
              {getErrorSuggestion()}
            </p>
          </div>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                기술적 세부사항 (개발 모드)
              </summary>
              <div className="mt-2 p-3 bg-muted rounded text-xs font-mono whitespace-pre-wrap">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </div>
            </details>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <Button variant="outline" onClick={reset} className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
          <Button onClick={handleFallbackToFullPage} className="flex-1">
            <ExternalLink className="w-4 h-4 mr-2" />
            전체 페이지에서 보기
          </Button>
        </div>
      </div>
    </div>
  )
}
