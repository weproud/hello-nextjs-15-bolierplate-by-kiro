'use client'

import React, { type ReactNode, type ErrorInfo } from 'react'
import { GlobalErrorBoundary } from './global-error-boundary'
import { RouteErrorBoundary } from './route-error-boundary'
import { ComponentErrorBoundary } from './component-error-boundary'
import { ErrorRecovery } from './error-recovery'
import { type AppError } from '@/lib/error-handler'
import { type ErrorRecoveryAction } from '@/lib/error-boundary-system'

/**
 * 통합 에러 바운더리 시스템
 *
 * 애플리케이션 전체에서 사용할 수 있는 통합된 에러 처리 시스템을 제공합니다.
 * Global → Route → Component 순서로 계층적 에러 처리를 지원합니다.
 */

interface UnifiedErrorBoundaryProps {
  children: ReactNode
  level: 'global' | 'route' | 'component'
  name: string
  routePath?: string
  fallback?: ReactNode
  inline?: boolean
  minimal?: boolean
  showDetails?: boolean
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onRecover?: () => void
}

/**
 * 통합 에러 바운더리 컴포넌트
 *
 * 레벨에 따라 적절한 에러 바운더리를 선택하여 사용합니다.
 */
export function UnifiedErrorBoundary({
  children,
  level,
  name,
  routePath,
  fallback,
  inline = false,
  minimal = false,
  showDetails = false,
  onError,
  onRecover,
}: UnifiedErrorBoundaryProps) {
  switch (level) {
    case 'global':
      return (
        <GlobalErrorBoundary
          fallback={fallback}
          onError={onError}
          showDetails={showDetails}
        >
          {children}
        </GlobalErrorBoundary>
      )

    case 'route':
      return (
        <RouteErrorBoundary
          routeName={name}
          routePath={routePath}
          fallback={fallback}
          onError={onError}
          showDetails={showDetails}
        >
          {children}
        </RouteErrorBoundary>
      )

    case 'component':
      return (
        <ComponentErrorBoundary
          componentName={name}
          inline={inline}
          minimal={minimal}
          fallback={fallback}
          onError={onError}
          onRecover={onRecover}
          showDetails={showDetails}
        >
          {children}
        </ComponentErrorBoundary>
      )

    default:
      console.warn(`Unknown error boundary level: ${level}`)
      return <>{children}</>
  }
}

/**
 * 계층적 에러 바운더리 래퍼
 *
 * 여러 레벨의 에러 바운더리를 자동으로 중첩하여 적용합니다.
 */
export function HierarchicalErrorBoundaryWrapper({
  children,
  appName = 'app',
  routeName,
  routePath,
  componentName,
  showDetails = false,
}: {
  children: ReactNode
  appName?: string
  routeName?: string
  routePath?: string
  componentName?: string
  showDetails?: boolean
}) {
  let wrappedChildren = children

  // Component level (가장 안쪽)
  if (componentName) {
    wrappedChildren = (
      <UnifiedErrorBoundary
        level='component'
        name={componentName}
        inline={true}
        minimal={true}
        showDetails={showDetails}
      >
        {wrappedChildren}
      </UnifiedErrorBoundary>
    )
  }

  // Route level (중간)
  if (routeName) {
    wrappedChildren = (
      <UnifiedErrorBoundary
        level='route'
        name={routeName}
        routePath={routePath}
        showDetails={showDetails}
      >
        {wrappedChildren}
      </UnifiedErrorBoundary>
    )
  }

  // Global level (가장 바깥쪽)
  wrappedChildren = (
    <UnifiedErrorBoundary
      level='global'
      name={appName}
      showDetails={showDetails}
    >
      {wrappedChildren}
    </UnifiedErrorBoundary>
  )

  return <>{wrappedChildren}</>
}

/**
 * 에러 바운더리 HOC 팩토리
 */
export function createErrorBoundaryHOC<P extends object>(
  level: 'global' | 'route' | 'component',
  name: string,
  options?: {
    routePath?: string
    inline?: boolean
    minimal?: boolean
    showDetails?: boolean
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    onRecover?: () => void
  }
) {
  return function withErrorBoundary(Component: React.ComponentType<P>) {
    const WrappedComponent = (props: P) => (
      <UnifiedErrorBoundary
        level={level}
        name={name}
        routePath={options?.routePath}
        inline={options?.inline}
        minimal={options?.minimal}
        showDetails={options?.showDetails}
        onError={options?.onError}
        onRecover={options?.onRecover}
      >
        <Component {...props} />
      </UnifiedErrorBoundary>
    )

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

    return WrappedComponent
  }
}

/**
 * 편의 HOC 함수들
 */

// 전역 에러 바운더리 HOC
export const withGlobalErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    showDetails?: boolean
    onError?: (error: Error, errorInfo: ErrorInfo) => void
  }
) => createErrorBoundaryHOC<P>('global', 'app', options)(Component)

// 라우트 에러 바운더리 HOC
export const withRouteErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  routeName: string,
  options?: {
    routePath?: string
    showDetails?: boolean
    onError?: (error: Error, errorInfo: ErrorInfo) => void
  }
) => createErrorBoundaryHOC<P>('route', routeName, options)(Component)

// 컴포넌트 에러 바운더리 HOC
export const withComponentErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
  options?: {
    inline?: boolean
    minimal?: boolean
    showDetails?: boolean
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    onRecover?: () => void
  }
) =>
  createErrorBoundaryHOC<P>(
    'component',
    componentName || Component.displayName || Component.name || 'Unknown',
    options
  )(Component)

/**
 * 에러 복구 컴포넌트 래퍼
 */
export function ErrorRecoveryWrapper({
  error,
  actions,
  onActionExecute,
  onDismiss,
  children,
  className = '',
}: {
  error?: AppError
  actions?: ErrorRecoveryAction[]
  onActionExecute?: (action: ErrorRecoveryAction) => Promise<void>
  onDismiss?: () => void
  children: ReactNode
  className?: string
}) {
  if (error && actions && onActionExecute) {
    return (
      <ErrorRecovery
        error={error}
        actions={actions}
        onActionExecute={onActionExecute}
        onDismiss={onDismiss}
        className={className}
      />
    )
  }

  return <>{children}</>
}

/**
 * 에러 바운더리 테스트 컴포넌트
 */
export function ErrorBoundaryTester({
  level = 'component',
  errorType = 'unknown',
  message = 'Test error',
  children,
}: {
  level?: 'global' | 'route' | 'component'
  errorType?:
    | 'validation'
    | 'network'
    | 'auth'
    | 'database'
    | 'permission'
    | 'unknown'
  message?: string
  children?: ReactNode
}) {
  const [shouldThrow, setShouldThrow] = React.useState(false)

  React.useEffect(() => {
    if (shouldThrow) {
      const error = new Error(message)
      error.name = `${errorType}Error`
      throw error
    }
  }, [shouldThrow, errorType, message])

  return (
    <div className='p-4 border rounded-lg'>
      <h3 className='text-lg font-semibold mb-2'>
        에러 바운더리 테스터 ({level})
      </h3>
      <div className='space-y-2'>
        <button
          onClick={() => setShouldThrow(true)}
          className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'
        >
          {errorType} 에러 발생시키기
        </button>
        <p className='text-sm text-gray-600'>메시지: {message}</p>
      </div>
      {children}
    </div>
  )
}

/**
 * 개발 도구용 에러 바운더리 디버거
 */
export function ErrorBoundaryDebugger() {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className='fixed bottom-4 right-4 p-4 bg-gray-900 text-white rounded-lg shadow-lg max-w-sm'>
      <h4 className='font-semibold mb-2'>🚨 Error Boundary Debug</h4>
      <div className='space-y-2 text-sm'>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              ;(window as any).debugErrorBoundaries?.()
            }
          }}
          className='block w-full text-left px-2 py-1 bg-gray-700 rounded hover:bg-gray-600'
        >
          Show Error Stats
        </button>
        <button
          onClick={() => {
            console.log('Error Boundary System:', {
              global: 'GlobalErrorBoundary',
              route: 'RouteErrorBoundary',
              component: 'ComponentErrorBoundary',
            })
          }}
          className='block w-full text-left px-2 py-1 bg-gray-700 rounded hover:bg-gray-600'
        >
          Show System Info
        </button>
      </div>
    </div>
  )
}
