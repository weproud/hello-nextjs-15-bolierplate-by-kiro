/**
 * 통합 에러 처리 시스템
 *
 * 애플리케이션 전반의 에러를 일관되게 처리하고
 * 분류, 로깅, 리포팅을 담당합니다.
 */

import { createLogger } from './logger'
import {
  classifyErrorAdvanced,
  determineErrorSeverityAdvanced,
  createUserFriendlyErrorMessage,
  type ErrorContext as ErrorTypeContext,
} from './error-types'

const logger = createLogger('error-handler')

export type ErrorType =
  | 'validation'
  | 'network'
  | 'auth'
  | 'database'
  | 'permission'
  | 'unknown'
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface AppError {
  id: string
  type: ErrorType
  message: string
  originalError?: Error
  stack?: string
  context?: string
  timestamp: Date
  severity: ErrorSeverity
  metadata?: Record<string, any>
}

export interface ErrorContext {
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  component?: string
  action?: string
  additionalData?: Record<string, any>
}

export interface ErrorReporter {
  report(error: AppError, context?: ErrorContext): Promise<void>
}

export interface ErrorHandler {
  handleError(error: Error | AppError, context?: ErrorContext): AppError
  reportError(error: AppError, context?: ErrorContext): Promise<void>
  createUserFriendlyMessage(error: AppError): string
  isRetryable(error: AppError): boolean
}

/**
 * 기본 에러 리포터 (콘솔 및 원격 서비스)
 */
class DefaultErrorReporter implements ErrorReporter {
  async report(error: AppError, context?: ErrorContext): Promise<void> {
    // 로컬 로깅
    logger.error('Error reported', error.originalError, {
      errorId: error.id,
      type: error.type,
      severity: error.severity,
      context: error.context,
      metadata: error.metadata,
      userContext: context,
    })

    // 프로덕션 환경에서는 원격 에러 리포팅 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      try {
        await this.sendToRemoteService(error, context)
      } catch (reportingError) {
        logger.error(
          'Failed to send error to remote service',
          reportingError as Error
        )
      }
    }
  }

  private async sendToRemoteService(
    error: AppError,
    context?: ErrorContext
  ): Promise<void> {
    // TODO: 실제 에러 리포팅 서비스 구현 (Sentry, LogRocket 등)
    // 현재는 placeholder
    logger.info('Would send to remote error service', {
      errorId: error.id,
      type: error.type,
      severity: error.severity,
    })
  }
}

/**
 * 통합 에러 핸들러 구현
 */
class UnifiedErrorHandler implements ErrorHandler {
  private reporter: ErrorReporter

  constructor(reporter: ErrorReporter = new DefaultErrorReporter()) {
    this.reporter = reporter
  }

  /**
   * 에러를 AppError 형태로 변환하고 분류
   */
  handleError(error: Error | AppError, context?: ErrorContext): AppError {
    // 이미 AppError인 경우 그대로 반환
    if (this.isAppError(error)) {
      return error
    }

    // 일반 Error를 AppError로 변환
    const errorType = this.classifyError(error, context)
    const appError: AppError = {
      id: this.generateErrorId(),
      type: errorType,
      message: error.message || 'Unknown error occurred',
      originalError: error,
      stack: error.stack || '',
      context: context?.component || context?.action,
      timestamp: new Date(),
      severity: this.determineSeverity(error, errorType, context),
      metadata: {
        name: error.name,
        ...context?.additionalData,
      },
    }

    return appError
  }

  /**
   * 에러 리포팅
   */
  async reportError(error: AppError, context?: ErrorContext): Promise<void> {
    await this.reporter.report(error, context)
  }

  /**
   * 사용자 친화적 에러 메시지 생성 (개선된 버전)
   */
  createUserFriendlyMessage(error: AppError, context?: ErrorContext): string {
    const typeContext: ErrorTypeContext = {
      component: context?.component,
      action: context?.action,
      route: context?.url,
    }

    const friendlyError = createUserFriendlyErrorMessage(
      error.type,
      error.message,
      typeContext
    )

    return friendlyError.actionMessage
  }

  /**
   * 에러가 재시도 가능한지 판단
   */
  isRetryable(error: AppError): boolean {
    switch (error.type) {
      case 'network':
      case 'database':
        return true

      case 'validation':
      case 'auth':
      case 'permission':
        return false

      default:
        // 알 수 없는 에러는 재시도 가능으로 처리
        return true
    }
  }

  /**
   * AppError 타입 가드
   */
  private isAppError(error: any): error is AppError {
    return (
      error && typeof error === 'object' && 'id' in error && 'type' in error
    )
  }

  /**
   * 에러 분류 (개선된 버전)
   */
  private classifyError(error: Error, context?: ErrorContext): ErrorType {
    const typeContext: ErrorTypeContext = {
      component: context?.component,
      action: context?.action,
      route: context?.url,
    }

    return classifyErrorAdvanced(error, typeContext)
  }

  /**
   * 에러 심각도 결정 (개선된 버전)
   */
  private determineSeverity(
    error: Error,
    errorType: ErrorType,
    context?: ErrorContext
  ): ErrorSeverity {
    const typeContext: ErrorTypeContext = {
      component: context?.component,
      action: context?.action,
      route: context?.url,
    }

    return determineErrorSeverityAdvanced(error, errorType, typeContext)
  }

  /**
   * 고유한 에러 ID 생성
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  }
}

// 전역 에러 핸들러 인스턴스
export const errorHandler = new UnifiedErrorHandler()

// 편의 함수들
export function handleError(
  error: Error | AppError,
  context?: ErrorContext
): AppError {
  return errorHandler.handleError(error, context)
}

export async function reportError(
  error: Error | AppError,
  context?: ErrorContext
): Promise<void> {
  const appError = errorHandler.handleError(error, context)
  await errorHandler.reportError(appError, context)
}

export function getUserFriendlyMessage(error: Error | AppError): string {
  const appError = errorHandler.handleError(error)
  return errorHandler.createUserFriendlyMessage(appError)
}

export function isRetryableError(error: Error | AppError): boolean {
  const appError = errorHandler.handleError(error)
  return errorHandler.isRetryable(appError)
}

/**
 * React 컴포넌트에서 사용할 수 있는 에러 처리 훅
 */
export function createErrorHandler(componentName: string) {
  return {
    handleError: (error: Error, additionalContext?: Record<string, any>) => {
      const context: ErrorContext = {
        component: componentName,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent:
          typeof window !== 'undefined' ? window.navigator.userAgent : '',
        additionalData: additionalContext,
      }

      return handleError(error, context)
    },

    reportError: async (
      error: Error,
      additionalContext?: Record<string, any>
    ) => {
      const context: ErrorContext = {
        component: componentName,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent:
          typeof window !== 'undefined' ? window.navigator.userAgent : '',
        additionalData: additionalContext,
      }

      await reportError(error, context)
    },
  }
}
