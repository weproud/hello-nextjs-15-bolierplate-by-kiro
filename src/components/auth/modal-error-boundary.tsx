'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  onFallbackToFullPage?: () => void
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

/**
 * Modal-specific Error Boundary Component
 *
 * Handles errors within the signin modal context and provides
 * fallback options including graceful degradation to full page signin.
 */
export class ModalErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Modal Error Boundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report error to monitoring service
    this.reportModalError(error, errorInfo)
  }

  private reportModalError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      context: 'modal-signin',
      retryCount: this.state.retryCount,
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    }

    console.error('Modal Error Report:', errorReport)

    // TODO: Send to error reporting service with modal context
    // errorReportingService.captureException(error, {
    //   extra: errorReport,
    //   tags: {
    //     component: 'ModalErrorBoundary',
    //     context: 'auth-modal',
    //   },
    // })
  }

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }))
    }
  }

  private handleFallbackToFullPage = () => {
    if (this.props.onFallbackToFullPage) {
      this.props.onFallbackToFullPage()
    } else {
      // Default fallback behavior - redirect to full page signin
      const currentUrl = new URL(window.location.href)
      const callbackUrl =
        currentUrl.searchParams.get('callbackUrl') || currentUrl.pathname
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
    }
  }

  private handleCloseModal = () => {
    // Try to go back in history, or close the modal
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        window.location.href = '/'
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const canRetry = this.state.retryCount < this.maxRetries
      const isNetworkError =
        this.state.error?.message.includes('fetch') ||
        this.state.error?.message.includes('network') ||
        this.state.error?.message.includes('NetworkError')

      return (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-error-title"
          aria-describedby="modal-error-description"
        >
          <div className="relative w-full max-w-md" role="document">
            <Card className="w-full">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                  <AlertTriangle
                    className="w-6 h-6 text-red-600"
                    aria-hidden="true"
                  />
                </div>
                <CardTitle
                  id="modal-error-title"
                  className="text-lg text-red-600"
                >
                  로그인 중 문제가 발생했습니다
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  id="modal-error-description"
                  className="text-center text-gray-600 text-sm"
                >
                  {isNetworkError ? (
                    <p>네트워크 연결을 확인하고 다시 시도해 주세요.</p>
                  ) : (
                    <p>
                      예상치 못한 오류가 발생했습니다. 다른 방법으로 로그인을
                      시도해 보세요.
                    </p>
                  )}
                </div>

                {/* Error details in development */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="bg-gray-100 p-3 rounded text-xs">
                    <div className="font-semibold mb-1">개발자 정보:</div>
                    <div className="text-gray-700">
                      <div>
                        <strong>오류:</strong> {this.state.error.message}
                      </div>
                      <div>
                        <strong>재시도 횟수:</strong> {this.state.retryCount}/
                        {this.maxRetries}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-2">
                  {canRetry && (
                    <Button
                      onClick={this.handleRetry}
                      className="w-full"
                      variant="default"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      다시 시도 ({this.maxRetries - this.state.retryCount}회
                      남음)
                    </Button>
                  )}

                  <Button
                    onClick={this.handleFallbackToFullPage}
                    variant="outline"
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    전체 페이지에서 로그인
                  </Button>

                  <Button
                    onClick={this.handleCloseModal}
                    variant="ghost"
                    className="w-full"
                  >
                    취소
                  </Button>
                </div>

                {!canRetry && (
                  <div className="text-center text-xs text-gray-500 border-t pt-3">
                    최대 재시도 횟수에 도달했습니다. 전체 페이지에서 로그인을
                    시도해 주세요.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook for handling modal errors in functional components
 */
export function useModalErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`Modal error${context ? ` in ${context}` : ''}:`, error)

    // Report error with modal context
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context: `modal-${context || 'unknown'}`,
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    }

    console.error('Modal Error Report:', errorReport)

    // TODO: Send to error reporting service
  }, [])

  const fallbackToFullPage = React.useCallback((callbackUrl?: string) => {
    const url =
      callbackUrl ||
      (typeof window !== 'undefined' ? window.location.pathname : '/')
    window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(url)}`
  }, [])

  return { handleError, fallbackToFullPage }
}
