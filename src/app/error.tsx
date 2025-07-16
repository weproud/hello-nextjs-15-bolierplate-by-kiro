'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Global Error Page
 *
 * This page is shown when an unhandled error occurs in the app.
 * It provides options to retry, go home, or report the bug.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error page:', error)
    }

    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      logErrorToService(error)
    }
  }, [error])

  const logErrorToService = (error: Error) => {
    // TODO: Implement error logging service (e.g., Sentry, LogRocket)
    const errorData = {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    console.error('Error logged to service:', errorData)

    // Example: Send to error tracking service
    // errorTrackingService.captureException(error, {
    //   extra: errorData,
    // })
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleReportBug = () => {
    const bugReport = {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    }

    // TODO: Open bug report form or redirect to issue tracker
    console.log('Bug report data:', bugReport)

    // Example: Open mailto link or redirect to bug report form
    const subject = encodeURIComponent(`서버 오류 신고: ${error.message}`)
    const body = encodeURIComponent(`
오류 세부사항:
${JSON.stringify(bugReport, null, 2)}

오류가 발생했을 때 수행하던 작업을 설명해주세요:
    `)

    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-600">
            서버 오류가 발생했습니다
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              일시적인 서버 문제로 인해 요청을 처리할 수 없습니다.
            </p>
            <p className="text-sm text-muted-foreground">
              잠시 후 다시 시도해주시거나, 문제가 지속되면 관리자에게
              문의해주세요.
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h4 className="font-semibold text-red-800 mb-2">
                개발 모드 - 오류 정보:
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-red-700">
                  <strong>메시지:</strong> {error.message}
                </p>
                {error.digest && (
                  <p className="text-sm text-red-700">
                    <strong>Digest:</strong> {error.digest}
                  </p>
                )}
                {error.stack && (
                  <details className="text-xs text-red-700">
                    <summary className="cursor-pointer font-medium">
                      스택 트레이스
                    </summary>
                    <pre className="mt-2 overflow-auto max-h-32 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={reset} className="flex-1" variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
            <Button onClick={handleGoHome} className="flex-1" variant="outline">
              <Home className="w-4 h-4 mr-2" />
              홈으로
            </Button>
          </div>

          <Button
            onClick={handleReportBug}
            className="w-full"
            variant="ghost"
            size="sm"
          >
            <Bug className="w-4 h-4 mr-2" />
            오류 신고하기
          </Button>

          <div className="pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground">
              오류 ID: {error.digest || 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              이 ID를 문의 시 함께 알려주시면 빠른 해결에 도움이 됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
