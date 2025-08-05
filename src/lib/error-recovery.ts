/**
 * 에러 복구 메커니즘
 *
 * 다양한 에러 복구 전략을 제공합니다:
 * - 자동 재시도 (Automatic Retry)
 * - 점진적 성능 저하 (Graceful Degradation)
 * - 폴백 UI (Fallback UI)
 * - 네트워크 복구 (Network Recovery)
 */

import { type AppError, type ErrorType } from '@/lib/error-handler'

export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  jitter: boolean
}

export interface RecoveryStrategy {
  canRecover(error: AppError): boolean
  recover(error: AppError, context?: any): Promise<RecoveryResult>
}

export interface RecoveryResult {
  success: boolean
  fallbackData?: any
  message?: string
  shouldRetry?: boolean
  retryDelay?: number
}

/**
 * 지수 백오프를 사용한 재시도 유틸리티
 */
export class RetryManager {
  private config: RetryConfig

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      jitter: true,
      ...config,
    }
  }

  async retry<T>(
    fn: () => Promise<T>,
    errorHandler?: (error: Error, attempt: number) => boolean
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error

        // 커스텀 에러 핸들러가 false를 반환하면 재시도 중단
        if (errorHandler && !errorHandler(lastError, attempt)) {
          break
        }

        // 마지막 시도인 경우 에러 throw
        if (attempt === this.config.maxAttempts) {
          break
        }

        // 재시도 전 대기
        await this.delay(this.calculateDelay(attempt))
      }
    }

    throw lastError!
  }

  private calculateDelay(attempt: number): number {
    let delay =
      this.config.baseDelay *
      Math.pow(this.config.backoffMultiplier, attempt - 1)
    delay = Math.min(delay, this.config.maxDelay)

    // 지터 추가 (랜덤 요소)
    if (this.config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5)
    }

    return delay
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 네트워크 에러 복구 전략
 */
export class NetworkRecoveryStrategy implements RecoveryStrategy {
  private retryManager: RetryManager

  constructor(retryConfig?: Partial<RetryConfig>) {
    this.retryManager = new RetryManager(retryConfig)
  }

  canRecover(error: AppError): boolean {
    return (
      error.type === 'network' ||
      (error.originalError && this.isNetworkError(error.originalError))
    )
  }

  async recover(error: AppError, context?: any): Promise<RecoveryResult> {
    if (!this.canRecover(error)) {
      return { success: false, message: '네트워크 에러가 아닙니다.' }
    }

    // 네트워크 상태 확인
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        success: false,
        message: '인터넷 연결을 확인해주세요.',
        shouldRetry: false,
      }
    }

    // 재시도 가능한 네트워크 에러인지 확인
    if (this.isRetryableNetworkError(error)) {
      return {
        success: false,
        message: '네트워크 연결 문제로 인해 재시도가 필요합니다.',
        shouldRetry: true,
        retryDelay: 2000,
      }
    }

    return {
      success: false,
      message: '네트워크 에러를 복구할 수 없습니다.',
      shouldRetry: false,
    }
  }

  private isNetworkError(error: Error): boolean {
    const message = error.message.toLowerCase()
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      error.name === 'NetworkError' ||
      (error.name === 'TypeError' && message.includes('failed to fetch'))
    )
  }

  private isRetryableNetworkError(error: AppError): boolean {
    if (!error.originalError) return false

    const message = error.originalError.message.toLowerCase()

    // 재시도 가능한 네트워크 에러들
    return (
      message.includes('timeout') ||
      message.includes('connection reset') ||
      message.includes('temporary failure') ||
      message.includes('service unavailable')
    )
  }
}

/**
 * 데이터베이스 에러 복구 전략
 */
export class DatabaseRecoveryStrategy implements RecoveryStrategy {
  canRecover(error: AppError): boolean {
    return error.type === 'database'
  }

  async recover(error: AppError, context?: any): Promise<RecoveryResult> {
    if (!this.canRecover(error)) {
      return { success: false, message: '데이터베이스 에러가 아닙니다.' }
    }

    // 연결 에러인 경우 재시도 권장
    if (this.isConnectionError(error)) {
      return {
        success: false,
        message:
          '데이터베이스 연결 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        shouldRetry: true,
        retryDelay: 3000,
      }
    }

    // 타임아웃 에러인 경우
    if (this.isTimeoutError(error)) {
      return {
        success: false,
        message: '요청 처리 시간이 초과되었습니다. 다시 시도해주세요.',
        shouldRetry: true,
        retryDelay: 5000,
      }
    }

    // 캐시된 데이터로 폴백
    if (context?.cachedData) {
      return {
        success: true,
        fallbackData: context.cachedData,
        message: '캐시된 데이터를 사용합니다.',
      }
    }

    return {
      success: false,
      message: '데이터베이스 에러를 복구할 수 없습니다.',
      shouldRetry: false,
    }
  }

  private isConnectionError(error: AppError): boolean {
    const message = error.originalError?.message.toLowerCase() || ''
    return (
      message.includes('connection') ||
      message.includes('connect') ||
      message.includes('econnrefused')
    )
  }

  private isTimeoutError(error: AppError): boolean {
    const message = error.originalError?.message.toLowerCase() || ''
    return message.includes('timeout') || message.includes('timed out')
  }
}

/**
 * 인증 에러 복구 전략
 */
export class AuthRecoveryStrategy implements RecoveryStrategy {
  canRecover(error: AppError): boolean {
    return error.type === 'auth'
  }

  async recover(error: AppError, context?: any): Promise<RecoveryResult> {
    if (!this.canRecover(error)) {
      return { success: false, message: '인증 에러가 아닙니다.' }
    }

    // 토큰 만료인 경우
    if (this.isTokenExpired(error)) {
      return {
        success: false,
        message: '로그인이 만료되었습니다. 다시 로그인해주세요.',
        shouldRetry: false,
      }
    }

    // 권한 부족인 경우
    if (this.isPermissionDenied(error)) {
      return {
        success: false,
        message: '이 작업을 수행할 권한이 없습니다.',
        shouldRetry: false,
      }
    }

    return {
      success: false,
      message: '인증 에러를 복구할 수 없습니다.',
      shouldRetry: false,
    }
  }

  private isTokenExpired(error: AppError): boolean {
    const message = error.originalError?.message.toLowerCase() || ''
    return (
      message.includes('token expired') ||
      message.includes('jwt expired') ||
      message.includes('session expired')
    )
  }

  private isPermissionDenied(error: AppError): boolean {
    const message = error.originalError?.message.toLowerCase() || ''
    return (
      message.includes('permission denied') ||
      message.includes('access denied') ||
      message.includes('forbidden')
    )
  }
}

/**
 * 점진적 성능 저하 전략
 */
export class GracefulDegradationStrategy implements RecoveryStrategy {
  private fallbackStrategies: Map<ErrorType, () => any> = new Map()

  constructor() {
    this.setupDefaultFallbacks()
  }

  canRecover(error: AppError): boolean {
    return this.fallbackStrategies.has(error.type)
  }

  async recover(error: AppError, context?: any): Promise<RecoveryResult> {
    const fallbackStrategy = this.fallbackStrategies.get(error.type)

    if (!fallbackStrategy) {
      return { success: false, message: '폴백 전략이 없습니다.' }
    }

    try {
      const fallbackData = await fallbackStrategy()
      return {
        success: true,
        fallbackData,
        message: '기본 기능으로 동작합니다.',
      }
    } catch (fallbackError) {
      return {
        success: false,
        message: '폴백 전략도 실패했습니다.',
      }
    }
  }

  addFallbackStrategy(errorType: ErrorType, strategy: () => any): void {
    this.fallbackStrategies.set(errorType, strategy)
  }

  private setupDefaultFallbacks(): void {
    // 네트워크 에러 시 캐시된 데이터 사용
    this.fallbackStrategies.set('network', () => {
      return {
        message: '오프라인 모드로 동작합니다.',
        data: null,
      }
    })

    // 데이터베이스 에러 시 정적 데이터 사용
    this.fallbackStrategies.set('database', () => {
      return {
        message: '기본 데이터를 사용합니다.',
        data: [],
      }
    })

    // 유효성 검사 에러 시 기본값 사용
    this.fallbackStrategies.set('validation', () => {
      return {
        message: '기본 설정을 사용합니다.',
        data: {},
      }
    })
  }
}

/**
 * 통합 에러 복구 매니저
 */
export class ErrorRecoveryManager {
  private strategies: RecoveryStrategy[] = []
  private retryManager: RetryManager

  constructor() {
    this.retryManager = new RetryManager()
    this.setupDefaultStrategies()
  }

  addStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy)
  }

  async attemptRecovery(
    error: AppError,
    context?: any
  ): Promise<RecoveryResult> {
    // 적용 가능한 복구 전략 찾기
    const applicableStrategy = this.strategies.find(strategy =>
      strategy.canRecover(error)
    )

    if (!applicableStrategy) {
      return {
        success: false,
        message: '적용 가능한 복구 전략이 없습니다.',
        shouldRetry: false,
      }
    }

    try {
      return await applicableStrategy.recover(error, context)
    } catch (recoveryError) {
      console.error('Error during recovery attempt:', recoveryError)
      return {
        success: false,
        message: '복구 시도 중 에러가 발생했습니다.',
        shouldRetry: false,
      }
    }
  }

  async retryWithRecovery<T>(
    fn: () => Promise<T>,
    errorContext?: any
  ): Promise<T> {
    return this.retryManager.retry(fn, async (error, attempt) => {
      const appError = {
        id: `retry_${Date.now()}`,
        type: 'unknown' as ErrorType,
        message: error.message,
        originalError: error,
        timestamp: new Date(),
        severity: 'medium' as const,
      }

      const recoveryResult = await this.attemptRecovery(appError, errorContext)

      // 복구 전략이 재시도를 권장하는 경우에만 계속 진행
      return recoveryResult.shouldRetry === true
    })
  }

  private setupDefaultStrategies(): void {
    this.addStrategy(new NetworkRecoveryStrategy())
    this.addStrategy(new DatabaseRecoveryStrategy())
    this.addStrategy(new AuthRecoveryStrategy())
    this.addStrategy(new GracefulDegradationStrategy())
  }
}

// 전역 에러 복구 매니저 인스턴스
export const errorRecoveryManager = new ErrorRecoveryManager()

// 편의 함수들
export function createRetryManager(
  config?: Partial<RetryConfig>
): RetryManager {
  return new RetryManager(config)
}

export async function attemptErrorRecovery(
  error: AppError,
  context?: any
): Promise<RecoveryResult> {
  return errorRecoveryManager.attemptRecovery(error, context)
}

export async function retryWithRecovery<T>(
  fn: () => Promise<T>,
  context?: any
): Promise<T> {
  return errorRecoveryManager.retryWithRecovery(fn, context)
}
