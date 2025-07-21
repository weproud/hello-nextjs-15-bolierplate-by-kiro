'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, X, Minimize2 } from 'lucide-react'
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
  componentName: string
  fallback?: ReactNode
  inline?: boolean
  minimal?: boolean
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onRecover?: () => void
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
  isMinimized: boolean
  shouldPropagate: boolean
}

/**
 * 컴포넌트별 에러 바운더리
 *
 * 개별 컴포넌트에서 발생하는 에러를 처리하고
 * 컴포넌트 레벨의 복구 옵션을 제공합니다.
 */
export class ComponentErrorBoundary extends Component<Props, State> {
  private errorBoundaryHook = createErrorBoundaryHook(
    'component',
    this.props.componentName,
    {
      component: this.props.componentName,
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
      isMinimized: false,
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
      }, 50)
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
          component: 'ComponentErrorBoundary',
          url: typeof window !== 'undefined' ? window.location.href : '',
          userAgent:
            typeof window !== 'undefined' ? window.navigator.userAgent : '',
          additionalData: {
            componentName: this.props.componentName,
            componentStack: errorInfo.componentStack,
            retryCount: this.state.retryCount,
            severity: error.severity,
            inline: this.props.inline,
            minimal: this.props.minimal,
          },
        })
      })
    } catch (reportingError) {
      console.error('Failed to report component error:', reportingError)
    }
  }

  /**
   * 복구 액션 실행
   */
  private handleRecoveryAction = async (action: ErrorRecoveryAction) => {
    this.setState({ isRecovering: true })

    try {
      await executeRecoveryAction(action, this.handleRetry)

      if (action.type === 'fallback' || action.type === 'dismiss') {
        this.handleDismiss()
      }
    } catch (recoveryError) {
      console.error('Component recovery action failed:', recoveryError)
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

    // 너무 빠른 재시도 방지 (최소 300ms 간격)
    if (timeSinceLastRetry < 300) {
      this.retryTimeoutId = setTimeout(() => {
        this.performRetry()
      }, 300 - timeSinceLastRetry)
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
      isMinimized: false,
      shouldPropagate: false,
    }))

    // 복구 콜백 호출
    if (this.props.onRecover) {
      this.props.onRecover()
    }
  }

  /**
   * 에러 최소화
   */
  private handleMinimize = () => {
    this.setState({ isMinimized: true })
  }

  /**
   * 에러 해제
   */
  private handleDismiss = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isMinimized: false,
    })
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

  /**
   * 최소화된 에러 UI 렌더링
   */
  private renderMinimizedError() {
    if (!this.state.error) return null

    const styles = this.getSeverityStyles(this.state.error.severity)

    return (
      <div
        className={`p-2 rounded ${styles.bgColor} ${styles.borderColor} border flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${styles.iconColor}`} />
          <span className="text-sm font-medium">컴포넌트 오류</span>
          <Badge variant={styles.badgeVariant} className="text-xs">
            {this.state.error.severity}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={this.handleRetry}
            disabled={this.state.isRecovering}
            className="h-6 px-2"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => this.setState({ isMinimized: false })}
            className="h-6 px-2"
          >
            확장
          </Button>
        </div>
      </div>
    )
  }

  /**
   * 인라인 에러 UI 렌더링
   */
  private renderInlineError() {
    if (!this.state.error) return null

    const styles = this.getSeverityStyles(this.state.error.severity)

    return (
      <div
        className={`p-3 rounded-lg ${styles.bgColor} ${styles.borderColor} border`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${styles.iconColor}`} />
            <span className="text-sm font-medium">
              {this.props.componentName} 오류
            </span>
            <Badge variant={styles.badgeVariant} className="text-xs">
              {this.state.error.severity}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={this.handleMinimize}
              className="h-6 px-1"
            >
              <Minimize2 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={this.handleDismiss}
              className="h-6 px-1"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3">{this.state.error.message}</p>

        <div className="flex flex-wrap gap-2">
          {this.state.recoveryActions.slice(0, 2).map(action => (
            <Button
              key={action.id}
              size="sm"
              onClick={() => this.handleRecoveryAction(action)}
              disabled={this.state.isRecovering}
              variant={action.primary ? 'default' : 'outline'}
              className="h-7 text-xs"
            >
              {action.type === 'retry' && (
                <RefreshCw className="w-3 h-3 mr-1" />
              )}
              {this.state.isRecovering ? '처리중' : action.label}
            </Button>
          ))}
        </div>

        {this.props.showDetails && process.env.NODE_ENV === 'development' && (
          <details className="mt-2">
            <summary className="text-xs cursor-pointer text-gray-500">
              개발자 정보
            </summary>
            <div className="mt-1 text-xs text-gray-600">
              <div>ID: {this.state.error.id}</div>
              <div>타입: {this.state.error.type}</div>
              {this.state.retryCount > 0 && (
                <div>재시도: {this.state.retryCount}</div>
              )}
            </div>
          </details>
        )}
      </div>
    )
  }

  /**
   * 전체 에러 UI 렌더링
   */
  private renderFullError() {
    if (!this.state.error) return null

    const styles = this.getSeverityStyles(this.state.error.severity)

    return (
      <Card className={`${styles.borderColor} border`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${styles.iconColor}`} />
              <CardTitle className="text-base">
                {this.props.componentName} 컴포넌트 오류
              </CardTitle>
              <Badge variant={styles.badgeVariant} className="text-xs">
                {this.state.error.severity}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={this.handleMinimize}
                className="h-7 px-2"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={this.handleDismiss}
                className="h-7 px-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {this.state.error.message}
            </p>
            <div className="text-xs text-gray-500">
              <div>오류 ID: {this.state.error.id}</div>
              <div>
                발생 시간:{' '}
                {this.state.error.timestamp.toLocaleTimeString('ko-KR')}
              </div>
              {this.state.retryCount > 0 && (
                <div>재시도 횟수: {this.state.retryCount}</div>
              )}
            </div>
          </div>

          {/* 개발 환경 상세 정보 */}
          {this.props.showDetails && process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 p-3 rounded text-sm">
              <div className="space-y-1">
                <div>
                  <strong>타입:</strong> {this.state.error.type}
                </div>
                <div>
                  <strong>컴포넌트:</strong> {this.props.componentName}
                </div>
                {this.state.error.originalError?.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">
                      스택 트레이스
                    </summary>
                    <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto max-h-24">
                      {this.state.error.originalError.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}

          {/* 복구 액션 버튼들 */}
          <div className="flex flex-wrap gap-2">
            {this.state.recoveryActions.map(action => (
              <Button
                key={action.id}
                size="sm"
                onClick={() => this.handleRecoveryAction(action)}
                disabled={this.state.isRecovering}
                variant={action.primary ? 'default' : 'outline'}
              >
                {action.type === 'retry' && (
                  <RefreshCw className="w-4 h-4 mr-1" />
                )}
                {this.state.isRecovering ? '처리 중...' : action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    )
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

      // 최소화된 상태
      if (this.state.isMinimized) {
        return this.renderMinimizedError()
      }

      // 최소 UI 모드
      if (this.props.minimal) {
        return this.renderInlineError()
      }

      // 인라인 모드
      if (this.props.inline) {
        return this.renderInlineError()
      }

      // 전체 에러 UI
      return this.renderFullError()
    }

    return this.props.children
  }
}

/**
 * 컴포넌트 에러 바운더리 HOC
 */
export function withComponentErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
  options?: {
    fallback?: ReactNode
    inline?: boolean
    minimal?: boolean
    showDetails?: boolean
    parentBoundary?: string
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    onRecover?: () => void
  }
) {
  const WrappedComponent = (props: P) => (
    <ComponentErrorBoundary
      componentName={
        componentName || Component.displayName || Component.name || 'Unknown'
      }
      fallback={options?.fallback}
      inline={options?.inline}
      minimal={options?.minimal}
      showDetails={options?.showDetails}
      parentBoundary={options?.parentBoundary}
      onError={options?.onError}
      onRecover={options?.onRecover}
    >
      <Component {...props} />
    </ComponentErrorBoundary>
  )

  WrappedComponent.displayName = `withComponentErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

/**
 * 컴포넌트 에러 바운더리 훅 (함수형 컴포넌트용)
 */
export function useComponentErrorBoundary(componentName: string) {
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
