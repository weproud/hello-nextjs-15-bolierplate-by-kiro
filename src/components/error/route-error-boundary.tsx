'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, ArrowLeft, Home, Route } from 'lucide-react'
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
  routeName: string
  routePath?: string
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  parentBoundary?: string
}

interface State {
  hasError: boolean
  error: AppError | null
  errorInfo: ErrorInfo | null
  retryCount: number
  lastRetryTime: number
  recoveryActions: ErrorRecoveryAction[]
  isRecovering: boolean
  shouldPropagate: boolean
}

/**
 * 라우트별 에러 바운더리
 *
 * 특정 라우트에서 발생하는 에러를 처리하고
 * 라우트 컨텍스트에 맞는 복구 옵션을 제공합니다.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  private errorBoundaryHook = createErrorBoundaryHook(
    'route',
    this.props.routeName,
    {
      route: this.props.routePath,
      parentBoundary: this.props.parentBoundary,
    }
  )
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
      shouldPropagate: false,
    }
  }

  override componentDidMount() {
    this.errorBoundaryHook.register()
  }

  override componentWillUnmount() {
    this.errorBoundaryHook.unregister()

    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { appError, recoveryActions, shouldPropagate } =
      this.errorBoundaryHook.handleError(
        error,
        errorInfo,
        this.state.retryCount
      )

    this.setState({
      error: appError,
      errorInfo,
      recoveryActions,
      shouldPropagate,
      lastRetryTime: Date.now(),
    })

    // 커스텀 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // 상위 바운더리로 전파해야 하는 경우
    if (shouldPropagate) {
      // 약간의 지연 후 다시 throw하여 상위 바운더리에서 처리하도록 함
      setTimeout(() => {
        throw error
      }, 100)
    }

    // 에러 리포팅
    this.reportError(appError, errorInfo)
  }

  /**
   * 에러 리포팅
   */
  private async reportError(error: AppError, errorInfo: ErrorInfo) {
    try {
      await import('@/lib/error-handler').then(({ reportError }) => {
        reportError(error.originalError || new Error(error.message), {
          component: 'RouteErrorBoundary',
          url: typeof window !== 'undefined' ? window.location.href : '',
          userAgent:
            typeof window !== 'undefined' ? window.navigator.userAgent : '',
          additionalData: {
            routeName: this.props.routeName,
            routePath: this.props.routePath,
            componentStack: errorInfo.componentStack,
            retryCount: this.state.retryCount,
            severity: error.severity,
          },
        })
      })
    } catch (reportingError) {
      console.error('Failed to report route error:', reportingError)
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
      console.error('Route recovery action failed:', recoveryError)
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

    // 너무 빠른 재시도 방지 (최소 500ms 간격)
    if (timeSinceLastRetry < 500) {
      this.retryTimeoutId = setTimeout(() => {
        this.performRetry()
      }, 500 - timeSinceLastRetry)
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
      shouldPropagate: false,
    }))
  }

  /**
   * 이전 페이지로 이동
   */
  private handleGoBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        window.location.href = '/'
      }
    }
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
    if (
      this.state.hasError &&
      this.state.error &&
      !this.state.shouldPropagate
    ) {
      // 커스텀 폴백 UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      const styles = this.getSeverityStyles(this.state.error.severity)

      // 기본 라우트 에러 UI
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-4">
          <Card className={`w-full max-w-lg ${styles.borderColor} border`}>
            <CardHeader className="text-center">
              <div
                className={`mx-auto w-16 h-16 ${styles.bgColor} rounded-full flex items-center justify-center mb-4`}
              >
                <Route className={`w-8 h-8 ${styles.iconColor}`} />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CardTitle className={`text-xl ${styles.iconColor}`}>
                  페이지 로딩 중 오류 발생
                </CardTitle>
                <Badge variant={styles.badgeVariant} className="text-xs">
                  {this.state.error.severity}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm">
                {this.props.routeName} 페이지에서 문제가 발생했습니다
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 라우트 정보 */}
              <div className="text-center text-sm text-gray-500">
                {this.props.routePath && (
                  <p className="mb-1">
                    경로:{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {this.props.routePath}
                    </code>
                  </p>
                )}
                <p>
                  오류 ID:{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {this.state.error.id}
                  </code>
                </p>
                {this.state.retryCount > 0 && (
                  <p className="mt-1">재시도 횟수: {this.state.retryCount}</p>
                )}
              </div>

              {/* 개발 환경 에러 상세 정보 */}
              {this.props.showDetails &&
                process.env.NODE_ENV === 'development' && (
                  <div className="bg-gray-100 p-3 rounded text-sm">
                    <div className="space-y-1">
                      <div>
                        <strong>타입:</strong> {this.state.error.type}
                      </div>
                      <div>
                        <strong>메시지:</strong> {this.state.error.message}
                      </div>
                      {this.state.error.originalError?.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer font-medium">
                            스택 트레이스
                          </summary>
                          <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                            {this.state.error.originalError.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}

              {/* 복구 액션 버튼들 */}
              <div className="flex flex-col gap-2">
                {this.state.recoveryActions.map(action => (
                  <Button
                    key={action.id}
                    onClick={() => this.handleRecoveryAction(action)}
                    disabled={this.state.isRecovering}
                    variant={action.primary ? 'default' : 'outline'}
                    className="w-full flex items-center justify-center"
                  >
                    {action.type === 'retry' && (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    {action.id === 'go-back' && (
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    )}
                    {action.type === 'redirect' && action.href === '/' && (
                      <Home className="w-4 h-4 mr-2" />
                    )}
                    {this.state.isRecovering ? '처리 중...' : action.label}
                  </Button>
                ))}

                {/* 기본 액션들 */}
                <Button
                  variant="outline"
                  onClick={this.handleGoBack}
                  disabled={this.state.isRecovering}
                  className="w-full flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  이전 페이지로
                </Button>
              </div>

              {/* 추가 도움말 */}
              <div className="text-center text-xs text-gray-500 border-t pt-3">
                <p>
                  문제가 지속되면{' '}
                  <a
                    href="/"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    홈페이지
                  </a>
                  로 이동하거나 고객지원에 문의해주세요.
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
 * 라우트 에러 바운더리 HOC
 */
export function withRouteErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  routeName: string,
  options?: {
    routePath?: string
    fallback?: ReactNode
    showDetails?: boolean
    parentBoundary?: string
  }
) {
  const WrappedComponent = (props: P) => (
    <RouteErrorBoundary
      routeName={routeName}
      routePath={options?.routePath}
      fallback={options?.fallback}
      showDetails={options?.showDetails}
      parentBoundary={options?.parentBoundary}
    >
      <Component {...props} />
    </RouteErrorBoundary>
  )

  WrappedComponent.displayName = `withRouteErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

/**
 * 라우트 에러 바운더리 훅 (함수형 컴포넌트용)
 */
export function useRouteErrorBoundary(routeName: string, routePath?: string) {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      // 에러가 설정되면 에러 바운더리에서 처리하도록 throw
      throw error
    }
  }, [error])

  return {
    error,
    resetError,
    captureError,
  }
}
