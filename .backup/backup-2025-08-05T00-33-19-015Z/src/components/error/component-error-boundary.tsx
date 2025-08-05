'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, X } from 'lucide-react'
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
  componentName?: string
  inline?: boolean
  dismissible?: boolean
  onDismiss?: () => void
}

interface State {
  hasError: boolean
  error: AppError | null
  errorInfo: ErrorInfo | null
  retryCount: number
  recoveryActions: ErrorRecoveryAction[]
  isRecovering: boolean
  isDismissed: boolean
}

/**
 * 컴포넌트 레벨 에러 바운더리
 *
 * 개별 컴포넌트에서 발생하는 에러를 포착하고
 * 컴포넌트 수준의 복구 옵션을 제공합니다.
 */
export class ComponentErrorBoundary extends Component<Props, State> {
  private errorBoundaryHook = createErrorBoundaryHook(
    'component',
    this.props.componentName || 'unknown-component'
  )

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      recoveryActions: [],
      isRecovering: false,
      isDismissed: false,
    }
  }

  override componentDidMount() {
    this.errorBoundaryHook.register()
  }

  override componentWillUnmount() {
    this.errorBoundaryHook.unregister()
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      isDismissed: false,
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
    })

    // 커스텀 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
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
          component: this.props.componentName || 'ComponentErrorBoundary',
          url: typeof window !== 'undefined' ? window.location.href : '',
          userAgent:
            typeof window !== 'undefined' ? window.navigator.userAgent : '',
          additionalData: {
            componentStack: errorInfo.componentStack,
            retryCount: this.state.retryCount,
            severity: error.severity,
            inline: this.props.inline,
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
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      recoveryActions: [],
      isRecovering: false,
      isDismissed: false,
    }))
  }

  /**
   * 에러 무시 처리
   */
  private handleDismiss = () => {
    this.setState({ isDismissed: true })
    if (this.props.onDismiss) {
      this.props.onDismiss()
    }
  }

  /**
   * 인라인 에러 UI 렌더링
   */
  private renderInlineError() {
    if (!this.state.error) return null

    return (
      <div className='relative bg-red-50 border border-red-200 rounded-lg p-4 my-2'>
        {this.props.dismissible && (
          <Button
            variant='ghost'
            size='sm'
            onClick={this.handleDismiss}
            className='absolute top-2 right-2 h-6 w-6 p-0 text-red-600 hover:text-red-800'
          >
            <X className='w-4 h-4' />
          </Button>
        )}

        <div className='flex items-start space-x-3'>
          <AlertTriangle className='w-5 h-5 text-red-600 mt-0.5 flex-shrink-0' />
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-1'>
              <h4 className='text-sm font-medium text-red-800'>
                컴포넌트 오류
              </h4>
              <Badge variant='destructive' className='text-xs'>
                COMPONENT
              </Badge>
            </div>

            {this.props.componentName && (
              <p className='text-xs text-red-600 mb-2'>
                컴포넌트: {this.props.componentName}
              </p>
            )}

            <p className='text-sm text-red-700 mb-3'>
              이 컴포넌트를 불러오는 중에 문제가 발생했습니다.
            </p>

            {/* 개발 환경 에러 상세 정보 */}
            {this.props.showDetails &&
              process.env.NODE_ENV === 'development' && (
                <div className='bg-red-100 p-2 rounded text-xs text-red-800 mb-3'>
                  <div>
                    <strong>메시지:</strong> {this.state.error.message}
                  </div>
                  <div className='mt-1'>
                    <strong>ID:</strong> {this.state.error.id}
                  </div>
                </div>
              )}

            {/* 복구 액션 버튼들 */}
            <div className='flex flex-wrap gap-2'>
              {this.state.recoveryActions.map(action => (
                <Button
                  key={action.id}
                  onClick={() => this.handleRecoveryAction(action)}
                  disabled={this.state.isRecovering}
                  variant='outline'
                  size='sm'
                  className='h-7 text-xs'
                >
                  {action.type === 'retry' && (
                    <RefreshCw className='w-3 h-3 mr-1' />
                  )}
                  {this.state.isRecovering ? '처리 중...' : action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /**
   * 카드 형태 에러 UI 렌더링
   */
  private renderCardError() {
    if (!this.state.error) return null

    return (
      <Card className='border-red-200 bg-red-50'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <AlertTriangle className='w-5 h-5 text-red-600' />
              <CardTitle className='text-base text-red-800'>
                컴포넌트 오류
              </CardTitle>
              <Badge variant='destructive' className='text-xs'>
                COMPONENT
              </Badge>
            </div>
            {this.props.dismissible && (
              <Button
                variant='ghost'
                size='sm'
                onClick={this.handleDismiss}
                className='h-6 w-6 p-0 text-red-600 hover:text-red-800'
              >
                <X className='w-4 h-4' />
              </Button>
            )}
          </div>
          {this.props.componentName && (
            <p className='text-sm text-red-600'>
              컴포넌트: {this.props.componentName}
            </p>
          )}
        </CardHeader>

        <CardContent className='space-y-4'>
          <p className='text-sm text-red-700'>
            이 컴포넌트를 불러오는 중에 문제가 발생했습니다.
          </p>

          {/* 에러 정보 */}
          <div className='text-xs text-red-600'>
            <p>
              오류 ID:{' '}
              <code className='bg-red-100 px-1 py-0.5 rounded'>
                {this.state.error.id}
              </code>
            </p>
            {this.state.retryCount > 0 && (
              <p className='mt-1'>재시도 횟수: {this.state.retryCount}</p>
            )}
          </div>

          {/* 개발 환경 에러 상세 정보 */}
          {this.props.showDetails && process.env.NODE_ENV === 'development' && (
            <div className='bg-red-100 p-3 rounded text-xs text-red-800'>
              <div>
                <strong>타입:</strong> {this.state.error.type}
              </div>
              <div className='mt-1'>
                <strong>메시지:</strong> {this.state.error.message}
              </div>
              {this.state.error.originalError?.stack && (
                <details className='mt-2'>
                  <summary className='cursor-pointer font-medium'>
                    스택 트레이스
                  </summary>
                  <pre className='mt-1 text-xs bg-white p-2 rounded border overflow-auto max-h-24'>
                    {this.state.error.originalError.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* 복구 액션 버튼들 */}
          <div className='flex flex-wrap gap-2'>
            {this.state.recoveryActions.map(action => (
              <Button
                key={action.id}
                onClick={() => this.handleRecoveryAction(action)}
                disabled={this.state.isRecovering}
                variant={action.primary ? 'default' : 'outline'}
                size='sm'
                className='flex items-center'
              >
                {action.type === 'retry' && (
                  <RefreshCw className='w-3 h-3 mr-1' />
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
    // 에러가 무시된 경우 자식 컴포넌트 렌더링
    if (this.state.isDismissed) {
      return this.props.children
    }

    if (this.state.hasError && this.state.error) {
      // 커스텀 폴백 UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 인라인 또는 카드 형태로 렌더링
      return this.props.inline
        ? this.renderInlineError()
        : this.renderCardError()
    }

    return this.props.children
  }
}

/**
 * 컴포넌트 에러 바운더리 HOC
 */
export function withComponentErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ComponentErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ComponentErrorBoundary>
  )

  WrappedComponent.displayName = `withComponentErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

/**
 * 간단한 컴포넌트 에러 래퍼
 */
export function ComponentErrorWrapper({
  children,
  componentName,
  inline = true,
  dismissible = true,
}: {
  children: ReactNode
  componentName?: string
  inline?: boolean
  dismissible?: boolean
}) {
  return (
    <ComponentErrorBoundary
      componentName={componentName}
      inline={inline}
      dismissible={dismissible}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ComponentErrorBoundary>
  )
}
