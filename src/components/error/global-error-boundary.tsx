'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  createErrorBoundaryHook,
  executeRecoveryAction,
  type ErrorRecoveryAction,
} from '@/lib/error-boundary-system'
import { type AppError } from '@/lib/error-handler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error: AppError | null
  errorInfo: ErrorInfo | null
  retryCount: number
  lastRetryTime: number
  recoveryActions: ErrorRecoveryAction[]
  isRecovering: boolean
}

/**
 * 전역 에러 바운더리
 *
 * 애플리케이션 최상위에서 모든 에러를 포착하고
 * 사용자에게 복구 옵션을 제공합니다.
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  private errorBoundaryHook = createErrorBoundaryHook('global', 'app-root')
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      lastRetryTime: 0,
      recoveryActions: [],
      isRecovering: false,
    }
  }

  override componentDidMount() {
    this.errorBoundaryHook.register()

    // 전역 에러 리스너 등록
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError)
      window.addEventListener(
        'unhandledrejection',
        this.handleUnhandledRejection
      )
    }
  }

  override componentWillUnmount() {
    this.errorBoundaryHook.unregister()

    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }

    // 전역 에러 리스너 해제
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.handleGlobalError)
      window.removeEventListener(
        'unhandledrejection',
        this.handleUnhandledRejection
      )
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { appError, recoveryActions } = this.errorBoundaryHook.handleError(
      error,
      errorInfo,
      this.state.retryCount
    )

    this.setState({
      error: appError,
      errorInfo,
      recoveryActions,
      lastRetryTime: Date.now(),
    })

    // 커스텀 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 에러 리포팅
    this.reportError(appError, errorInfo)
  }

  /**
   * 전역 JavaScript 에러 처리
   */
  private handleGlobalError = (event: ErrorEvent) => {
    const error = new Error(event.message)
    error.stack = `${event.filename}:${event.lineno}:${event.colno}`

    const errorInfo: ErrorInfo = {
      componentStack: 'Global JavaScript Error',
    }

    this.componentDidCatch(error, errorInfo)
  }

  /**
   * 처리되지 않은 Promise 거부 처리
   */
  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason))

    const errorInfo: ErrorInfo = {
      componentStack: 'Unhandled Promise Rejection',
    }

    this.componentDidCatch(error, errorInfo)
  }

  /**
   * 에러 리포팅
   */
  private async reportError(error: AppError, errorInfo: ErrorInfo) {
    try {
      // 에러 핸들러를 통한 리포팅
      await import('@/lib/error-handler').then(({ reportError }) => {
        reportError(error.originalError || new Error(error.message), {
          component: 'GlobalErrorBoundary',
          url: typeof window !== 'undefined' ? window.location.href : '',
          userAgent:
            typeof window !== 'undefined' ? window.navigator.userAgent : '',
          additionalData: {
            componentStack: errorInfo.componentStack,
            retryCount: this.state.retryCount,
            severity: error.severity,
          },
        })
      })
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  /**
   * 복구 액션 실행
   */
  private handleRecoveryAction = async (action: ErrorRecoveryAction) => {
    this.setState({ isRecovering: true })

    try {
      await executeRecoveryAction(action, this.handleRetry)
    } catch (recoveryError) {
      console.error('Recovery action failed:', recoveryError)
    } finally {
      this.setState({ isRecovering: false })
    }
  }

  /**
   * 재시도 처리
   */
  private handleRetry = () => {
    const now = Date.now()
    const timeSinceLastRetry = now - this.state.lastRetryTime

    // 너무 빠른 재시도 방지 (최소 1초 간격)
    if (timeSinceLastRetry < 1000) {
      this.retryTimeoutId = setTimeout(() => {
        this.performRetry()
      }, 1000 - timeSinceLastRetry)
    } else {
      this.performRetry()
    }
  }

  /**
   * 실제 재시도 수행
   */
  private performRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      lastRetryTime: Date.now(),
      recoveryActions: [],
      isRecovering: false,
    }))
  }

  /**
   * 에러 심각도에 따른 스타일 반환
   */
  private getSeverityStyles(severity: string) {
    switch (severity) {
      case 'critical':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          badgeVariant: 'destructive' as const,
        }
      case 'high':
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600',
          badgeVariant: 'secondary' as const,
        }
      case 'medium':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          badgeVariant: 'outline' as const,
        }
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          badgeVariant: 'secondary' as const,
        }
    }
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      // 커스텀 폴백 UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      const styles = this.getSeverityStyles(this.state.error.severity)

      // 기본 전역 에러 UI
      return (
        <div
          className={`min-h-screen flex items-center justify-center p-4 ${styles.bgColor}`}
        >
          <Card className={`w-full max-w-2xl ${styles.borderColor} border-2`}>
            <CardHeader className="text-center">
              <div
                className={`mx-auto w-20 h-20 ${styles.bgColor} rounded-full flex items-center justify-center mb-4`}
              >
                <Shield className={`w-10 h-10 ${styles.iconColor}`} />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CardTitle className={`text-2xl ${styles.iconColor}`}>
                  시스템 오류가 발생했습니다
                </CardTitle>
                <Badge variant={styles.badgeVariant}>
                  {this.state.error.severity.toUpperCase()}
                </Badge>
              </div>
              <p className="text-gray-600">
                애플리케이션에서 예상치 못한 오류가 발생했습니다
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 에러 정보 */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">
                  오류 ID:{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {this.state.error.id}
                  </code>
                </p>
                <p className="text-sm text-gray-500">
                  발생 시간:{' '}
                  {this.state.error.timestamp.toLocaleString('ko-KR')}
                </p>
                {this.state.retryCount > 0 && (
                  <p className="text-sm text-gray-500">
                    재시도 횟수: {this.state.retryCount}
                  </p>
                )}
              </div>

              {/* 개발 환경 에러 상세 정보 */}
              {this.props.showDetails &&
                process.env.NODE_ENV === 'development' && (
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <Bug className="w-4 h-4 mr-2" />
                      개발자 정보
                    </h4>
                    <div className="text-sm text-gray-700 space-y-2">
                      <div>
                        <strong>타입:</strong> {this.state.error.type}
                      </div>
                      <div>
                        <strong>메시지:</strong> {this.state.error.message}
                      </div>
                      {this.state.error.originalError?.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer font-medium">
                            스택 트레이스 보기
                          </summary>
                          <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                            {this.state.error.originalError.stack}
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

              {/* 복구 액션 버튼들 */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {this.state.recoveryActions.map(action => (
                  <Button
                    key={action.id}
                    onClick={() => this.handleRecoveryAction(action)}
                    disabled={this.state.isRecovering}
                    variant={action.primary ? 'default' : 'outline'}
                    className="flex items-center"
                  >
                    {action.type === 'retry' && (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    {action.type === 'redirect' && action.href === '/' && (
                      <Home className="w-4 h-4 mr-2" />
                    )}
                    {this.state.isRecovering ? '처리 중...' : action.label}
                  </Button>
                ))}
              </div>

              {/* 고객 지원 안내 */}
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
                <p className="mt-1 text-xs">
                  문의 시 오류 ID를 함께 알려주시면 빠른 해결에 도움이 됩니다.
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
 * 전역 에러 바운더리 HOC
 */
export function withGlobalErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <GlobalErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </GlobalErrorBoundary>
  )

  WrappedComponent.displayName = `withGlobalErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
