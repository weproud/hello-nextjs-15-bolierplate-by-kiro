/**
 * 계층적 에러 바운더리 시스템
 *
 * Global → Route Group → Page → Component → Modal 순서로
 * 에러를 계층적으로 처리하는 시스템
 */

import { errorHandler, type AppError, type ErrorContext } from './error-handler'

export type ErrorBoundaryLevel =
  | 'global'
  | 'route-group'
  | 'page'
  | 'component'
  | 'modal'

export interface ErrorBoundaryConfig {
  level: ErrorBoundaryLevel
  name: string
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: AppError, context: ErrorContext) => void
  retryable?: boolean
  autoRetry?: boolean
  maxRetries?: number
  retryDelay?: number
  escalateToParent?: boolean
}

export interface ErrorFallbackProps {
  error: AppError
  resetError: () => void
  retry?: () => void
  canRetry?: boolean
  level: ErrorBoundaryLevel
  config: ErrorBoundaryConfig
}

export interface ErrorRecoveryOptions {
  retry: () => void
  fallback: () => void
  escalate: () => void
  dismiss: () => void
}

/**
 * 에러 복구 전략
 */
export class ErrorRecoveryStrategy {
  private retryCount = 0
  private maxRetries: number
  private retryDelay: number
  private autoRetry: boolean

  constructor(maxRetries = 3, retryDelay = 1000, autoRetry = false) {
    this.maxRetries = maxRetries
    this.retryDelay = retryDelay
    this.autoRetry = autoRetry
  }

  canRetry(): boolean {
    return this.retryCount < this.maxRetries
  }

  async retry(fn: () => Promise<void> | void): Promise<boolean> {
    if (!this.canRetry()) {
      return false
    }

    try {
      this.retryCount++

      if (this.retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay))
      }

      await fn()
      this.retryCount = 0 // 성공시 카운트 리셋
      return true
    } catch (error) {
      console.warn(`Retry ${this.retryCount}/${this.maxRetries} failed:`, error)
      return false
    }
  }

  reset(): void {
    this.retryCount = 0
  }

  getRetryCount(): number {
    return this.retryCount
  }

  getRemainingRetries(): number {
    return Math.max(0, this.maxRetries - this.retryCount)
  }
}

/**
 * 계층적 에러 컨텍스트 관리
 */
export class ErrorBoundaryContext {
  private static instance: ErrorBoundaryContext
  private boundaryStack: ErrorBoundaryConfig[] = []
  private recoveryStrategies = new Map<string, ErrorRecoveryStrategy>()

  static getInstance(): ErrorBoundaryContext {
    if (!ErrorBoundaryContext.instance) {
      ErrorBoundaryContext.instance = new ErrorBoundaryContext()
    }
    return ErrorBoundaryContext.instance
  }

  registerBoundary(config: ErrorBoundaryConfig): void {
    this.boundaryStack.push(config)

    // 복구 전략 초기화
    const strategyKey = `${config.level}-${config.name}`
    if (!this.recoveryStrategies.has(strategyKey)) {
      this.recoveryStrategies.set(
        strategyKey,
        new ErrorRecoveryStrategy(
          config.maxRetries,
          config.retryDelay,
          config.autoRetry
        )
      )
    }
  }

  unregisterBoundary(config: ErrorBoundaryConfig): void {
    const index = this.boundaryStack.findIndex(
      b => b.level === config.level && b.name === config.name
    )
    if (index !== -1) {
      this.boundaryStack.splice(index, 1)
    }
  }

  getCurrentBoundary(): ErrorBoundaryConfig | null {
    return this.boundaryStack[this.boundaryStack.length - 1] || null
  }

  getParentBoundary(
    currentLevel: ErrorBoundaryLevel
  ): ErrorBoundaryConfig | null {
    const levelHierarchy: ErrorBoundaryLevel[] = [
      'modal',
      'component',
      'page',
      'route-group',
      'global',
    ]

    const currentIndex = levelHierarchy.indexOf(currentLevel)
    if (currentIndex === -1 || currentIndex === levelHierarchy.length - 1) {
      return null
    }

    // 현재 레벨보다 상위 레벨의 바운더리 찾기
    for (let i = currentIndex + 1; i < levelHierarchy.length; i++) {
      const parentLevel = levelHierarchy[i]
      const parentBoundary = this.boundaryStack.find(
        b => b.level === parentLevel
      )
      if (parentBoundary) {
        return parentBoundary
      }
    }

    return null
  }

  getRecoveryStrategy(config: ErrorBoundaryConfig): ErrorRecoveryStrategy {
    const strategyKey = `${config.level}-${config.name}`
    let strategy = this.recoveryStrategies.get(strategyKey)

    if (!strategy) {
      strategy = new ErrorRecoveryStrategy(
        config.maxRetries,
        config.retryDelay,
        config.autoRetry
      )
      this.recoveryStrategies.set(strategyKey, strategy)
    }

    return strategy
  }

  async handleError(
    error: Error,
    config: ErrorBoundaryConfig,
    context?: Partial<ErrorContext>
  ): Promise<{
    appError: AppError
    shouldEscalate: boolean
    recoveryOptions: ErrorRecoveryOptions
  }> {
    // 에러를 AppError로 변환
    const fullContext: ErrorContext = {
      component: config.name,
      ...context,
      additionalData: {
        ...context?.additionalData,
        boundaryLevel: config.level,
        boundaryStack: this.boundaryStack.map(b => `${b.level}:${b.name}`),
      },
    }

    const appError = errorHandler.handleError(error, fullContext)

    // 에러 리포팅
    await errorHandler.reportError(appError, fullContext)

    // 커스텀 에러 핸들러 호출
    if (config.onError) {
      config.onError(appError, fullContext)
    }

    // 복구 전략 가져오기
    const recoveryStrategy = this.getRecoveryStrategy(config)

    // 에스컬레이션 여부 결정
    const shouldEscalate = this.shouldEscalateError(
      appError,
      config,
      recoveryStrategy
    )

    // 복구 옵션 생성
    const recoveryOptions = this.createRecoveryOptions(
      appError,
      config,
      recoveryStrategy
    )

    return {
      appError,
      shouldEscalate,
      recoveryOptions,
    }
  }

  private shouldEscalateError(
    error: AppError,
    config: ErrorBoundaryConfig,
    strategy: ErrorRecoveryStrategy
  ): boolean {
    // 설정에서 에스컬레이션을 비활성화한 경우
    if (config.escalateToParent === false) {
      return false
    }

    // 재시도 가능하고 아직 재시도 횟수가 남은 경우
    if (config.retryable && strategy.canRetry()) {
      return false
    }

    // Critical 에러는 항상 에스컬레이션
    if (error.severity === 'critical') {
      return true
    }

    // 모달 레벨에서는 페이지로 에스컬레이션
    if (config.level === 'modal') {
      return true
    }

    // 컴포넌트 레벨에서는 페이지로 에스컬레이션 (선택적)
    if (config.level === 'component' && error.severity === 'high') {
      return true
    }

    return false
  }

  private createRecoveryOptions(
    error: AppError,
    config: ErrorBoundaryConfig,
    strategy: ErrorRecoveryStrategy
  ): ErrorRecoveryOptions {
    return {
      retry: () => {
        if (strategy.canRetry()) {
          // 실제 재시도 로직은 컴포넌트에서 구현
          console.warn(
            `Retrying... (${strategy.getRemainingRetries()} attempts left)`
          )
        }
      },

      fallback: () => {
        // Graceful degradation 로직
        console.warn('Falling back to degraded mode')
      },

      escalate: () => {
        const parentBoundary = this.getParentBoundary(config.level)
        if (parentBoundary) {
          console.warn(
            `Escalating to parent boundary: ${parentBoundary.level}:${parentBoundary.name}`
          )
          // 부모 바운더리로 에러 전파
        }
      },

      dismiss: () => {
        // 에러 무시 (모달 등에서 사용)
        console.warn('Dismissing error')
        strategy.reset()
      },
    }
  }
}

/**
 * 에러 바운더리 레벨별 기본 설정
 */
export const DEFAULT_BOUNDARY_CONFIGS: Record<
  ErrorBoundaryLevel,
  Partial<ErrorBoundaryConfig>
> = {
  global: {
    level: 'global',
    retryable: false,
    escalateToParent: false,
    maxRetries: 0,
  },

  'route-group': {
    level: 'route-group',
    retryable: true,
    escalateToParent: true,
    maxRetries: 2,
    retryDelay: 1000,
  },

  page: {
    level: 'page',
    retryable: true,
    escalateToParent: true,
    maxRetries: 3,
    retryDelay: 500,
  },

  component: {
    level: 'component',
    retryable: true,
    escalateToParent: true,
    maxRetries: 2,
    retryDelay: 200,
  },

  modal: {
    level: 'modal',
    retryable: true,
    escalateToParent: true,
    maxRetries: 1,
    retryDelay: 500,
  },
}

/**
 * 에러 바운더리 설정 생성 헬퍼
 */
export function createBoundaryConfig(
  level: ErrorBoundaryLevel,
  name: string,
  overrides?: Partial<ErrorBoundaryConfig>
): ErrorBoundaryConfig {
  const defaults = DEFAULT_BOUNDARY_CONFIGS[level]

  return {
    ...defaults,
    level,
    name,
    ...overrides,
  } as ErrorBoundaryConfig
}

/**
 * 전역 에러 바운더리 컨텍스트 인스턴스
 */
export const errorBoundaryContext = ErrorBoundaryContext.getInstance()
