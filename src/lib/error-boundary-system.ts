/**
 * 계층적 에러 바운더리 시스템
 *
 * Global → Route → Component 순서로 에러를 처리하고
 * 각 레벨에서 적절한 복구 메커니즘을 제공합니다.
 */

import { type ErrorInfo } from 'react'
import { errorHandler, type AppError, type ErrorContext } from './error-handler'
import { type ErrorType } from './error-types'

export type ErrorBoundaryLevel = 'global' | 'route' | 'component'

export interface ErrorBoundaryContext {
  level: ErrorBoundaryLevel
  name: string
  route?: string
  component?: string
  parentBoundary?: string
}

export interface ErrorRecoveryAction {
  id: string
  label: string
  type: 'retry' | 'fallback' | 'reload' | 'redirect' | 'dismiss'
  primary?: boolean
  href?: string
  handler?: () => void | Promise<void>
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: AppError | null
  errorInfo: ErrorInfo | null
  retryCount: number
  lastRetryTime: number
  recoveryActions: ErrorRecoveryAction[]
}

/**
 * 에러 바운더리 레지스트리
 * 계층적 에러 바운더리들을 관리하고 에러 전파를 제어합니다.
 */
class ErrorBoundaryRegistry {
  private boundaries = new Map<string, ErrorBoundaryContext>()
  private errorHistory = new Map<string, AppError[]>()
  private retryLimits = new Map<ErrorType, number>()

  constructor() {
    // 에러 타입별 재시도 제한 설정
    this.retryLimits.set('network', 3)
    this.retryLimits.set('database', 2)
    this.retryLimits.set('unknown', 1)
    this.retryLimits.set('validation', 0)
    this.retryLimits.set('auth', 0)
    this.retryLimits.set('permission', 0)
  }

  /**
   * 에러 바운더리 등록
   */
  register(id: string, context: ErrorBoundaryContext): void {
    this.boundaries.set(id, context)
  }

  /**
   * 에러 바운더리 해제
   */
  unregister(id: string): void {
    this.boundaries.delete(id)
    this.errorHistory.delete(id)
  }

  /**
   * 에러 처리 및 복구 액션 생성
   */
  handleError(
    boundaryId: string,
    error: Error,
    errorInfo: ErrorInfo,
    retryCount: number = 0
  ): {
    appError: AppError
    recoveryActions: ErrorRecoveryAction[]
    shouldPropagate: boolean
  } {
    const boundary = this.boundaries.get(boundaryId)
    if (!boundary) {
      throw new Error(`Error boundary ${boundaryId} not found`)
    }

    // 에러를 AppError로 변환
    const context: ErrorContext = {
      component: boundary.component || boundary.name,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : '',
      additionalData: {
        boundaryLevel: boundary.level,
        boundaryId,
        componentStack: errorInfo.componentStack,
        retryCount,
      },
    }

    const appError = errorHandler.handleError(error, context)

    // 에러 히스토리에 추가
    const history = this.errorHistory.get(boundaryId) || []
    history.push(appError)
    this.errorHistory.set(boundaryId, history.slice(-10)) // 최근 10개만 유지

    // 복구 액션 생성
    const recoveryActions = this.createRecoveryActions(
      appError,
      boundary,
      retryCount
    )

    // 상위 바운더리로 전파할지 결정
    const shouldPropagate = this.shouldPropagateError(
      appError,
      boundary,
      retryCount
    )

    return { appError, recoveryActions, shouldPropagate }
  }

  /**
   * 복구 액션 생성
   */
  private createRecoveryActions(
    error: AppError,
    boundary: ErrorBoundaryContext,
    retryCount: number
  ): ErrorRecoveryAction[] {
    const actions: ErrorRecoveryAction[] = []
    const maxRetries = this.retryLimits.get(error.type) || 0

    // 재시도 액션 (재시도 가능한 에러이고 제한에 걸리지 않은 경우)
    if (errorHandler.isRetryable(error) && retryCount < maxRetries) {
      actions.push({
        id: 'retry',
        label: '다시 시도',
        type: 'retry',
        primary: true,
      })
    }

    // 레벨별 특화 액션
    switch (boundary.level) {
      case 'component':
        actions.push(
          {
            id: 'fallback',
            label: '기본 화면으로',
            type: 'fallback',
          },
          {
            id: 'reload-component',
            label: '컴포넌트 새로고침',
            type: 'reload',
          }
        )
        break

      case 'route':
        actions.push(
          {
            id: 'reload-page',
            label: '페이지 새로고침',
            type: 'reload',
          },
          {
            id: 'go-back',
            label: '이전 페이지',
            type: 'redirect',
            handler: () => {
              if (typeof window !== 'undefined') {
                window.history.back()
              }
            },
          }
        )
        break

      case 'global':
        actions.push(
          {
            id: 'reload-app',
            label: '앱 새로고침',
            type: 'reload',
          },
          {
            id: 'go-home',
            label: '홈으로 이동',
            type: 'redirect',
            href: '/',
          }
        )
        break
    }

    // 에러 타입별 특화 액션
    if (error.type === 'auth') {
      actions.push({
        id: 'login',
        label: '로그인',
        type: 'redirect',
        href: '/auth/signin',
        primary: !actions.some(a => a.primary),
      })
    }

    if (error.type === 'network') {
      actions.push({
        id: 'check-connection',
        label: '연결 확인',
        type: 'dismiss',
      })
    }

    // 항상 제공되는 액션
    actions.push({
      id: 'dismiss',
      label: '닫기',
      type: 'dismiss',
    })

    return actions
  }

  /**
   * 에러를 상위 바운더리로 전파할지 결정
   */
  private shouldPropagateError(
    error: AppError,
    boundary: ErrorBoundaryContext,
    retryCount: number
  ): boolean {
    // 전역 바운더리에서는 전파하지 않음
    if (boundary.level === 'global') {
      return false
    }

    // 치명적 에러는 항상 전파
    if (error.severity === 'critical') {
      return true
    }

    // 재시도 횟수가 많으면 전파
    const maxRetries = this.retryLimits.get(error.type) || 0
    if (retryCount >= maxRetries) {
      return true
    }

    // 특정 에러 타입은 상위로 전파
    const propagateTypes: ErrorType[] = ['auth', 'permission']
    if (propagateTypes.includes(error.type)) {
      return true
    }

    return false
  }

  /**
   * 에러 히스토리 조회
   */
  getErrorHistory(boundaryId: string): AppError[] {
    return this.errorHistory.get(boundaryId) || []
  }

  /**
   * 재시도 제한 확인
   */
  canRetry(errorType: ErrorType, currentRetryCount: number): boolean {
    const maxRetries = this.retryLimits.get(errorType) || 0
    return currentRetryCount < maxRetries
  }

  /**
   * 전체 에러 통계
   */
  getErrorStats(): {
    totalBoundaries: number
    totalErrors: number
    errorsByType: Record<ErrorType, number>
    errorsByLevel: Record<ErrorBoundaryLevel, number>
  } {
    const stats = {
      totalBoundaries: this.boundaries.size,
      totalErrors: 0,
      errorsByType: {} as Record<ErrorType, number>,
      errorsByLevel: {} as Record<ErrorBoundaryLevel, number>,
    }

    // 모든 에러 히스토리를 순회하여 통계 생성
    for (const [boundaryId, errors] of this.errorHistory) {
      const boundary = this.boundaries.get(boundaryId)
      if (!boundary) continue

      stats.totalErrors += errors.length

      // 레벨별 통계
      stats.errorsByLevel[boundary.level] =
        (stats.errorsByLevel[boundary.level] || 0) + errors.length

      // 타입별 통계
      for (const error of errors) {
        stats.errorsByType[error.type] =
          (stats.errorsByType[error.type] || 0) + 1
      }
    }

    return stats
  }
}

// 전역 에러 바운더리 레지스트리 인스턴스
export const errorBoundaryRegistry = new ErrorBoundaryRegistry()

/**
 * 에러 바운더리 훅 생성 함수
 */
export function createErrorBoundaryHook(
  level: ErrorBoundaryLevel,
  name: string,
  options?: {
    route?: string
    component?: string
    parentBoundary?: string
  }
) {
  const boundaryId = `${level}-${name}-${Date.now()}`

  return {
    boundaryId,
    register: () => {
      errorBoundaryRegistry.register(boundaryId, {
        level,
        name,
        route: options?.route,
        component: options?.component,
        parentBoundary: options?.parentBoundary,
      })
    },
    unregister: () => {
      errorBoundaryRegistry.unregister(boundaryId)
    },
    handleError: (
      error: Error,
      errorInfo: ErrorInfo,
      retryCount: number = 0
    ) => {
      return errorBoundaryRegistry.handleError(
        boundaryId,
        error,
        errorInfo,
        retryCount
      )
    },
    getHistory: () => {
      return errorBoundaryRegistry.getErrorHistory(boundaryId)
    },
  }
}

/**
 * 에러 복구 실행 함수
 */
export async function executeRecoveryAction(
  action: ErrorRecoveryAction,
  onRetry?: () => void
): Promise<void> {
  switch (action.type) {
    case 'retry':
      if (onRetry) {
        onRetry()
      }
      break

    case 'reload':
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
      break

    case 'redirect':
      if (action.href && typeof window !== 'undefined') {
        window.location.href = action.href
      } else if (action.handler) {
        await action.handler()
      }
      break

    case 'fallback':
      // 폴백은 컴포넌트에서 처리
      break

    case 'dismiss':
      // 닫기는 UI에서 처리
      break

    default:
      console.warn(`Unknown recovery action type: ${action.type}`)
  }
}

/**
 * 개발자 도구용 에러 바운더리 디버깅 함수
 */
export function debugErrorBoundaries(): void {
  if (process.env.NODE_ENV === 'development') {
    const stats = errorBoundaryRegistry.getErrorStats()
    console.group('🚨 Error Boundary Debug Info')
    console.log('📊 Statistics:', stats)
    console.log('🔍 Registry:', errorBoundaryRegistry)
    console.groupEnd()
  }
}

// 개발 환경에서 전역 디버그 함수 노출
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  ;(window as any).debugErrorBoundaries = debugErrorBoundaries
}
