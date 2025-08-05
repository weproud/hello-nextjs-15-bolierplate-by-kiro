'use client'

import { ComponentErrorBoundary as NewComponentErrorBoundary } from '@/components/error/component-error-boundary'
import { ErrorFallback } from '@/components/error/error-fallback'
import { GlobalErrorBoundary as NewGlobalErrorBoundary } from '@/components/error/global-error-boundary'
import { RouteErrorBoundary as NewRouteErrorBoundary } from '@/components/error/route-error-boundary'
import { type AppError } from '@/lib/error-handler'
import React, { Component, type ErrorInfo, type ReactNode } from 'react'

// 레거시 타입 정의 (하위 호환성을 위해 유지)
export type ErrorBoundaryLevel =
  | 'global'
  | 'route-group'
  | 'page'
  | 'component'
  | 'modal'

export interface ErrorBoundaryConfig {
  level: ErrorBoundaryLevel
  name: string
  onError?: (error: AppError, context: any) => void
  retryable?: boolean
  autoRetry?: boolean
  maxRetries?: number
  retryDelay?: number
  escalateToParent?: boolean
}

// 레거시 컨텍스트 (하위 호환성을 위해 유지)
export const errorBoundaryContext = {
  registerBoundary: (config: ErrorBoundaryConfig) => {
    console.log('Legacy boundary registered:', config)
  },
  unregisterBoundary: (config: ErrorBoundaryConfig) => {
    console.log('Legacy boundary unregistered:', config)
  },
  handleError: async (
    error: Error,
    config: ErrorBoundaryConfig,
    context: any
  ) => {
    return {
      appError: {
        id: `legacy_${Date.now()}`,
        type: 'unknown' as const,
        message: error.message,
        originalError: error,
        timestamp: new Date(),
        severity: 'medium' as const,
      },
      shouldEscalate: false,
    }
  },
}

export function createBoundaryConfig(
  level: ErrorBoundaryLevel,
  name: string,
  options?: Partial<ErrorBoundaryConfig>
): ErrorBoundaryConfig {
  return {
    level,
    name,
    ...options,
  }
}

interface HierarchicalErrorBoundaryProps {
  level: ErrorBoundaryLevel
  name: string
  children: ReactNode
  fallback?: React.ComponentType<HierarchicalErrorFallbackProps>
  onError?: (error: AppError, context: any) => void
  retryable?: boolean
  autoRetry?: boolean
  maxRetries?: number
  retryDelay?: number
  escalateToParent?: boolean
  className?: string
}

interface HierarchicalErrorBoundaryState {
  hasError: boolean
  error: Error | null
  appError: AppError | null
  retryCount: number
  isRetrying: boolean
}

export interface HierarchicalErrorFallbackProps {
  error: AppError
  resetError: () => void
  retry: () => void
  canRetry: boolean
  retryCount: number
  maxRetries: number
  level: ErrorBoundaryLevel
  config: ErrorBoundaryConfig
  isRetrying: boolean
}

/**
 * 계층적 에러 바운더리 컴포넌트
 *
 * Global → Route Group → Page → Component → Modal 순서로
 * 에러를 계층적으로 처리합니다.
 */
export class HierarchicalErrorBoundary extends Component<
  HierarchicalErrorBoundaryProps,
  HierarchicalErrorBoundaryState
> {
  private config: ErrorBoundaryConfig
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: HierarchicalErrorBoundaryProps) {
    super(props)

    this.config = createBoundaryConfig(props.level, props.name, {
      onError: props.onError,
      retryable: props.retryable,
      autoRetry: props.autoRetry,
      maxRetries: props.maxRetries,
      retryDelay: props.retryDelay,
      escalateToParent: props.escalateToParent,
    })

    this.state = {
      hasError: false,
      error: null,
      appError: null,
      retryCount: 0,
      isRetrying: false,
    }
  }

  componentDidMount() {
    // 에러 바운더리를 컨텍스트에 등록
    errorBoundaryContext.registerBoundary(this.config)
  }

  componentWillUnmount() {
    // 에러 바운더리를 컨텍스트에서 제거
    errorBoundaryContext.unregisterBoundary(this.config)

    // 재시도 타이머 정리
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<HierarchicalErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    try {
      // 에러 바운더리 시스템을 통해 에러 처리
      const result = await errorBoundaryContext.handleError(
        error,
        this.config,
        {
          url: typeof window !== 'undefined' ? window.location.href : 'SSR',
          userAgent:
            typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
          additionalData: {
            componentStack: errorInfo.componentStack,
            errorBoundary: `${this.config.level}:${this.config.name}`,
          },
        }
      )

      this.setState({
        appError: result.appError,
      })

      // 자동 재시도가 활성화되어 있고 재시도 가능한 경우
      if (this.config.autoRetry && result.appError && this.canRetry()) {
        this.scheduleAutoRetry()
      }

      // 에스컬레이션이 필요한 경우 부모로 에러 전파
      if (result.shouldEscalate) {
        this.escalateToParent(error, errorInfo)
      }
    } catch (handlingError) {
      console.error('Error in error boundary handling:', handlingError)

      // 에러 처리 중 에러가 발생한 경우 기본 처리
      this.setState({
        appError: {
          id: `fallback_${Date.now()}`,
          type: 'unknown',
          message: error.message,
          originalError: error,
          timestamp: new Date(),
          severity: 'high',
        },
      })
    }
  }

  private canRetry(): boolean {
    const maxRetries = this.config.maxRetries || 3
    return this.state.retryCount < maxRetries
  }

  private scheduleAutoRetry = () => {
    if (!this.canRetry()) return

    this.setState({ isRetrying: true })

    const delay = this.config.retryDelay || 1000
    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry()
    }, delay)
  }

  private handleRetry = () => {
    if (!this.canRetry()) return

    this.setState(prevState => ({
      hasError: false,
      error: null,
      appError: null,
      retryCount: prevState.retryCount + 1,
      isRetrying: false,
    }))

    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
      this.retryTimeoutId = null
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      appError: null,
      retryCount: 0,
      isRetrying: false,
    })

    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
      this.retryTimeoutId = null
    }
  }

  private escalateToParent = (error: Error, errorInfo: ErrorInfo) => {
    // 부모 컴포넌트로 에러를 다시 throw하여 상위 에러 바운더리에서 처리하도록 함
    setTimeout(() => {
      throw new Error(
        `Escalated from ${this.config.level}:${this.config.name} - ${error.message}`
      )
    }, 0)
  }

  render() {
    if (this.state.hasError && this.state.appError) {
      const FallbackComponent =
        this.props.fallback || DefaultHierarchicalErrorFallback

      return (
        <div className={this.props.className}>
          <FallbackComponent
            error={this.state.appError}
            resetError={this.handleReset}
            retry={this.handleRetry}
            canRetry={this.canRetry()}
            retryCount={this.state.retryCount}
            maxRetries={this.config.maxRetries || 3}
            level={this.props.level}
            config={this.config}
            isRetrying={this.state.isRetrying}
          />
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * 기본 계층적 에러 폴백 컴포넌트
 */
function DefaultHierarchicalErrorFallback({
  error,
  resetError,
  retry,
  canRetry,
  retryCount,
  maxRetries,
  level,
  isRetrying,
}: HierarchicalErrorFallbackProps) {
  const getLevelDisplayName = (level: ErrorBoundaryLevel): string => {
    switch (level) {
      case 'global':
        return '전역'
      case 'route-group':
        return '라우트 그룹'
      case 'page':
        return '페이지'
      case 'component':
        return '컴포넌트'
      case 'modal':
        return '모달'
      default:
        return level
    }
  }

  const getErrorTitle = (level: ErrorBoundaryLevel): string => {
    switch (level) {
      case 'global':
        return '시스템 오류가 발생했습니다'
      case 'route-group':
        return '페이지 로딩 중 오류가 발생했습니다'
      case 'page':
        return '페이지 오류가 발생했습니다'
      case 'component':
        return '일부 기능에서 오류가 발생했습니다'
      case 'modal':
        return '모달 로딩 중 오류가 발생했습니다'
      default:
        return '오류가 발생했습니다'
    }
  }

  const getErrorMessage = (level: ErrorBoundaryLevel): string => {
    switch (level) {
      case 'global':
        return '시스템에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
      case 'route-group':
        return '페이지를 불러오는 중 문제가 발생했습니다.'
      case 'page':
        return '이 페이지에서 문제가 발생했습니다.'
      case 'component':
        return '일부 기능이 일시적으로 사용할 수 없습니다.'
      case 'modal':
        return '모달을 불러오는 중 문제가 발생했습니다.'
      default:
        return '문제가 발생했습니다.'
    }
  }

  // 레벨에 따른 UI 크기 조정
  const isCompact = level === 'component' || level === 'modal'

  return (
    <ErrorFallback
      error={error.originalError}
      resetError={resetError}
      title={getErrorTitle(level)}
      message={getErrorMessage(level)}
      showRetry={canRetry}
      showHome={level === 'global' || level === 'route-group'}
      className={isCompact ? 'min-h-32' : 'min-h-64'}
    >
      {/* 추가 정보 표시 */}
      <div className='mt-4 space-y-2'>
        {isRetrying && (
          <div className='text-sm text-blue-600 text-center'>
            재시도 중... ({retryCount + 1}/{maxRetries})
          </div>
        )}

        {canRetry && !isRetrying && (
          <div className='text-xs text-gray-500 text-center'>
            재시도 가능: {maxRetries - retryCount}회 남음
          </div>
        )}

        {process.env.NODE_ENV === 'development' && (
          <div className='text-xs text-gray-400 text-center'>
            에러 레벨: {getLevelDisplayName(level)} | ID: {error.id}
          </div>
        )}
      </div>
    </ErrorFallback>
  )
}

/**
 * 새로운 계층적 에러 바운더리 시스템 (권장)
 *
 * 기존 HierarchicalErrorBoundary 대신 이 컴포넌트들을 사용하세요.
 */

// Global Error Boundary (새로운 시스템)
export function GlobalErrorBoundary({
  children,
  fallback,
  onError,
  showDetails = false,
}: {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}) {
  return (
    <NewGlobalErrorBoundary
      fallback={fallback}
      onError={onError}
      showDetails={showDetails}
    >
      {children}
    </NewGlobalErrorBoundary>
  )
}

// Route Error Boundary (새로운 시스템)
export function RouteGroupErrorBoundary({
  children,
  routeName,
  routePath,
  fallback,
  onError,
  showDetails = false,
}: {
  children: ReactNode
  routeName: string
  routePath?: string
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}) {
  return (
    <NewRouteErrorBoundary
      routeName={routeName}
      routePath={routePath}
      fallback={fallback}
      onError={onError}
      showDetails={showDetails}
    >
      {children}
    </NewRouteErrorBoundary>
  )
}

// Page Error Boundary (새로운 시스템)
export function PageErrorBoundary({
  children,
  pageName,
  routePath,
  fallback,
  onError,
  showDetails = false,
}: {
  children: ReactNode
  pageName: string
  routePath?: string
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}) {
  return (
    <NewRouteErrorBoundary
      routeName={pageName}
      routePath={routePath}
      fallback={fallback}
      onError={onError}
      showDetails={showDetails}
    >
      {children}
    </NewRouteErrorBoundary>
  )
}

// Component Error Boundary (새로운 시스템)
export function ComponentErrorBoundary({
  children,
  componentName,
  inline = false,
  minimal = false,
  fallback,
  onError,
  onRecover,
  showDetails = false,
}: {
  children: ReactNode
  componentName: string
  inline?: boolean
  minimal?: boolean
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onRecover?: () => void
  showDetails?: boolean
}) {
  return (
    <NewComponentErrorBoundary
      componentName={componentName}
      inline={inline}
      minimal={minimal}
      fallback={fallback}
      onError={onError}
      onRecover={onRecover}
      showDetails={showDetails}
    >
      {children}
    </NewComponentErrorBoundary>
  )
}

// Modal Error Boundary (새로운 시스템)
export function ModalErrorBoundary({
  children,
  modalName,
  fallback,
  onError,
  onRecover,
  showDetails = false,
}: {
  children: ReactNode
  modalName: string
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onRecover?: () => void
  showDetails?: boolean
}) {
  return (
    <NewComponentErrorBoundary
      componentName={modalName}
      inline={true}
      minimal={true}
      fallback={fallback}
      onError={onError}
      onRecover={onRecover}
      showDetails={showDetails}
    >
      {children}
    </NewComponentErrorBoundary>
  )
}
