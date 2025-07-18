'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  errorHandler,
  type AppError,
  type ErrorContext,
} from '@/lib/error-handler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * React Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report error using unified error handler
    this.reportError(error, errorInfo)
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    const context: ErrorContext = {
      component: 'ErrorBoundary',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      additionalData: {
        componentStack: errorInfo.componentStack,
      },
    }

    // Use unified error handler
    const appError = errorHandler.handleError(error, context)
    await errorHandler.reportError(appError, context)
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">
                앗! 문제가 발생했습니다
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-gray-600">
                <p className="mb-2">
                  예상치 못한 오류가 발생했습니다. 불편을 드려 죄송합니다.
                </p>
                <p className="text-sm">
                  문제가 지속되면 고객 지원팀에 문의해 주세요.
                </p>
              </div>

              {/* Error details (only in development) */}
              {this.props.showDetails &&
                process.env.NODE_ENV === 'development' && (
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <Bug className="w-4 h-4 mr-2" />
                      개발자 정보
                    </h4>
                    <div className="text-sm text-gray-700 space-y-2">
                      <div>
                        <strong>오류:</strong> {this.state.error?.message}
                      </div>
                      {this.state.error?.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer font-medium">
                            스택 트레이스 보기
                          </summary>
                          <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                            {this.state.error.stack}
                          </pre>
                        </details>
                      )}
                      {this.state.errorInfo?.componentStack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer font-medium">
                            컴포넌트 스택 보기
                          </summary>
                          <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 시도
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleReload}
                  className="flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  페이지 새로고침
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  홈으로 이동
                </Button>
              </div>

              {/* Contact support */}
              <div className="text-center text-sm text-gray-500 border-t pt-4">
                <p>
                  문제가 계속 발생하나요?{' '}
                  <a
                    href="/contact"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    고객 지원팀에 문의하기
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

/**
 * Hook for error boundary (for functional components)
 */
export function useErrorHandler() {
  return async (error: Error, errorInfo?: ErrorInfo) => {
    const context: ErrorContext = {
      component: 'useErrorHandler',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      additionalData: errorInfo
        ? { componentStack: errorInfo.componentStack }
        : undefined,
    }

    // Use unified error handler
    const appError = errorHandler.handleError(error, context)
    await errorHandler.reportError(appError, context)
  }
}
