'use client'

import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from 'lucide-react'
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
  pageName?: string
  allowNavigation?: boolean
}

interface State {
  hasError: boolean
  error: AppError | null
  errorInfo: ErrorInfo | null
  retryCount: number
  recoveryActions: ErrorRecoveryAction[]
  isRecovering: boolean
}

/**
 * 페이지 레벨 에러 바운더리
 *
 * 특정 페이지나 라우트에서 발생하는 에러를 포착하고
 * 페이지 수준의 복구 옵션을 제공합니다.
 */
export class PageErrorBoundary extends Component<Props, State> {
  private errorBoundaryHook = createErrorBoundaryHook(
    'page',
    this.props.pageName || 'unknown-page'
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
          component: 'PageErrorBoundary',
          page: this.props.pageName || 'unknown',
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
      console.error('Failed to report page error:', reportingError)
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
      console.error('Page recovery action failed:', recoveryError)
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
    }))
  }

  /**
   * 뒤로 가기
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
   * 홈으로 이동
   */
  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      // 커스텀 폴백 UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 기본 페이지 에러 UI
      return (
        <div className='min-h-[60vh] flex items-center justify-center p-4'>
          <Card className='w-full max-w-lg'>
            <CardHeader className='text-center'>
              <div className='mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4'>
                <AlertTriangle className='w-8 h-8 text-orange-600' />
              </div>
              <div className='flex items-center justify-center gap-2 mb-2'>
                <CardTitle className='text-xl text-orange-600'>
                  페이지 로드 중 오류 발생
                </CardTitle>
                <Badge variant='outline' className='text-xs'>
                  PAGE ERROR
                </Badge>
              </div>
              {this.props.pageName && (
                <p className='text-sm text-gray-500'>
                  페이지: {this.props.pageName}
                </p>
              )}
            </CardHeader>

            <CardContent className='space-y-6'>
              <div className='text-center text-gray-600'>
                <p className='mb-2'>
                  이 페이지를 불러오는 중에 문제가 발생했습니다.
                </p>
                <p className='text-sm'>
                  잠시 후 다시 시도하거나 다른 페이지로 이동해 주세요.
                </p>
              </div>

              {/* 에러 정보 */}
              <div className='text-center'>
                <p className='text-xs text-gray-500'>
                  오류 ID:{' '}
                  <code className='bg-gray-100 px-2 py-1 rounded'>
                    {this.state.error.id}
                  </code>
                </p>
                {this.state.retryCount > 0 && (
                  <p className='text-xs text-gray-500 mt-1'>
                    재시도 횟수: {this.state.retryCount}
                  </p>
                )}
              </div>

              {/* 개발 환경 에러 상세 정보 */}
              {this.props.showDetails &&
                process.env.NODE_ENV === 'development' && (
                  <div className='bg-gray-50 p-3 rounded-lg'>
                    <h4 className='font-medium text-gray-800 mb-2 text-sm'>
                      개발자 정보
                    </h4>
                    <div className='text-xs text-gray-600 space-y-1'>
                      <div>
                        <strong>타입:</strong> {this.state.error.type}
                      </div>
                      <div>
                        <strong>메시지:</strong> {this.state.error.message}
                      </div>
                      {this.state.error.originalError?.stack && (
                        <details className='mt-2'>
                          <summary className='cursor-pointer font-medium'>
                            스택 트레이스
                          </summary>
                          <pre className='mt-1 text-xs bg-white p-2 rounded border overflow-auto max-h-32'>
                            {this.state.error.originalError.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}

              {/* 복구 액션 버튼들 */}
              <div className='flex flex-col gap-2'>
                {this.state.recoveryActions.map(action => (
                  <Button
                    key={action.id}
                    onClick={() => this.handleRecoveryAction(action)}
                    disabled={this.state.isRecovering}
                    variant={action.primary ? 'default' : 'outline'}
                    className='flex items-center justify-center'
                    size='sm'
                  >
                    {action.type === 'retry' && (
                      <RefreshCw className='w-4 h-4 mr-2' />
                    )}
                    {this.state.isRecovering ? '처리 중...' : action.label}
                  </Button>
                ))}

                {/* 네비게이션 버튼들 */}
                {this.props.allowNavigation !== false && (
                  <div className='flex gap-2 mt-2'>
                    <Button
                      variant='outline'
                      onClick={this.handleGoBack}
                      className='flex-1 flex items-center justify-center'
                      size='sm'
                    >
                      <ArrowLeft className='w-4 h-4 mr-2' />
                      이전 페이지
                    </Button>
                    <Button
                      variant='outline'
                      onClick={this.handleGoHome}
                      className='flex-1 flex items-center justify-center'
                      size='sm'
                    >
                      <Home className='w-4 h-4 mr-2' />
                      홈으로
                    </Button>
                  </div>
                )}
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
 * 페이지 에러 바운더리 HOC
 */
export function withPageErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <PageErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </PageErrorBoundary>
  )

  WrappedComponent.displayName = `withPageErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
