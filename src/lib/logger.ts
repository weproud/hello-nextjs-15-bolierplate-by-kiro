/**
 * 구조화된 로깅 시스템
 * 환경별 로깅 레벨 지원 및 메타데이터 포함
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type Environment = 'development' | 'production' | 'test'

export interface LogMetadata {
  [key: string]: any
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  metadata?: LogMetadata
  context?: string
  error?: Error
}

export interface LoggerConfig {
  level: LogLevel
  environment: Environment
  enableConsole: boolean
  enableRemote: boolean
  context?: string
}

export interface Logger {
  debug(message: string, metadata?: LogMetadata): void
  info(message: string, metadata?: LogMetadata): void
  warn(message: string, metadata?: LogMetadata): void
  error(message: string, error?: Error, metadata?: LogMetadata): void
  child(context: string): Logger
}

class StructuredLogger implements Logger {
  private config: LoggerConfig
  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  constructor(config: LoggerConfig) {
    this.config = config
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels[level] >= this.logLevels[this.config.level]
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString()
    const context = entry.context ? `[${entry.context}] ` : ''
    const level = entry.level.toUpperCase().padEnd(5)

    let formatted = `${timestamp} ${level} ${context}${entry.message}`

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      formatted += ` ${JSON.stringify(entry.metadata)}`
    }

    return formatted
  }

  private log(
    level: LogLevel,
    message: string,
    error?: Error,
    metadata?: LogMetadata
  ): void {
    if (!this.shouldLog(level)) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      metadata: metadata || {},
      context: this.config.context,
      error,
    }

    if (this.config.enableConsole) {
      this.logToConsole(entry)
    }

    if (this.config.enableRemote && this.config.environment === 'production') {
      this.logToRemote(entry)
    }
  }

  private logToConsole(entry: LogEntry): void {
    const formatted = this.formatLogEntry(entry)

    switch (entry.level) {
      case 'debug':
        if (this.config.environment === 'development') {
          console.debug(formatted)
        }
        break
      case 'info':
        console.info(formatted)
        break
      case 'warn':
        console.warn(formatted)
        if (entry.error) {
          console.warn(entry.error)
        }
        break
      case 'error':
        console.error(formatted)
        if (entry.error) {
          console.error(entry.error)
        }
        break
    }
  }

  private async logToRemote(entry: LogEntry): Promise<void> {
    // TODO: 실제 원격 로깅 서비스 구현 (예: Sentry, LogRocket 등)
    // 현재는 프로덕션 환경에서만 활성화되도록 설정
    try {
      // 원격 로깅 서비스로 전송하는 로직
      // await remoteLoggingService.send(entry)
    } catch (error) {
      // 원격 로깅 실패 시 콘솔에만 출력
      console.error('Failed to send log to remote service:', error)
    }
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.log('debug', message, undefined, metadata)
  }

  info(message: string, metadata?: LogMetadata): void {
    this.log('info', message, undefined, metadata)
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.log('warn', message, undefined, metadata)
  }

  error(message: string, error?: Error, metadata?: LogMetadata): void {
    this.log('error', message, error, metadata)
  }

  child(context: string): Logger {
    const childContext = this.config.context
      ? `${this.config.context}:${context}`
      : context

    return new StructuredLogger({
      ...this.config,
      context: childContext,
    })
  }
}

// 기본 로거 설정
const defaultConfig: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  environment: (process.env.NODE_ENV as Environment) || 'development',
  enableConsole: true,
  enableRemote: process.env.NODE_ENV === 'production',
}

// 전역 로거 인스턴스
export const logger = new StructuredLogger(defaultConfig)

// 컨텍스트별 로거 생성 헬퍼
export function createLogger(
  context: string,
  config?: Partial<LoggerConfig>
): Logger {
  const mergedConfig = { ...defaultConfig, ...config, context }
  return new StructuredLogger(mergedConfig)
}

// 기존 코드와의 호환성을 위한 래퍼 함수들
export const log = {
  debug: (message: string, metadata?: LogMetadata) =>
    logger.debug(message, metadata),
  info: (message: string, metadata?: LogMetadata) =>
    logger.info(message, metadata),
  warn: (message: string, metadata?: LogMetadata) =>
    logger.warn(message, metadata),
  error: (message: string, error?: Error, metadata?: LogMetadata) =>
    logger.error(message, error, metadata),
}
