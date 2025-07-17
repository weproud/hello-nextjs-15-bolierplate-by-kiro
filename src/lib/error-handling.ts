import type { AppError, ValidationError } from '../types/common'

// Error classes
export class AppErrorClass extends Error implements AppError {
  code: string
  details?: any
  timestamp: Date

  constructor(code: string, message: string, details?: any) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.timestamp = new Date()
  }
}

export class ValidationErrorClass extends Error {
  errors: ValidationError[]

  constructor(errors: ValidationError[]) {
    const message = errors.map(e => `${e.field}: ${e.message}`).join(', ')
    super(`Validation failed: ${message}`)
    this.name = 'ValidationError'
    this.errors = errors
  }
}

// Export AppError type alias for easier usage
export type AppError = AppErrorClass

// Error factory functions
export const createAppError = (
  code: string,
  message: string,
  details?: any
): AppErrorClass => {
  return new AppErrorClass(code, message, details)
}

export const createValidationError = (
  errors: ValidationError[]
): ValidationErrorClass => {
  return new ValidationErrorClass(errors)
}

// Common error codes
export const ERROR_CODES = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Database
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  DATABASE_ERROR: 'DATABASE_ERROR',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const

// Error handling utilities
export const handleError = (error: unknown): AppError => {
  if (error instanceof AppErrorClass) {
    return error
  }

  if (error instanceof ValidationErrorClass) {
    return createAppError(
      ERROR_CODES.VALIDATION_ERROR,
      error.message,
      error.errors
    )
  }

  if (error instanceof Error) {
    return createAppError(ERROR_CODES.INTERNAL_ERROR, error.message)
  }

  return createAppError(ERROR_CODES.INTERNAL_ERROR, 'An unknown error occurred')
}

// Error logging
export const logError = (error: AppError | Error, context?: string): void => {
  const timestamp = new Date().toISOString()
  const contextStr = context ? `[${context}] ` : ''

  console.error(`${timestamp} ${contextStr}Error:`, {
    name: error.name,
    message: error.message,
    ...(error instanceof AppErrorClass && {
      code: error.code,
      details: error.details,
    }),
    stack: error.stack,
  })
}

// Action-specific error classes
export class ActionError extends AppErrorClass {
  constructor(message: string, details?: any) {
    super('ACTION_ERROR', message, details)
    this.name = 'ActionError'
  }
}

export class AuthenticationError extends AppErrorClass {
  constructor(message: string = '인증이 필요합니다.') {
    super(ERROR_CODES.UNAUTHORIZED, message)
    this.name = 'AuthenticationError'
  }
}

// Action logger
export const ActionLogger = {
  info: (action: string, message: string, details?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${action}] ${message}`, details)
    }
  },
  warn: (action: string, message: string, details?: any) => {
    console.warn(`[${action}] ${message}`, details)
  },
  error: (action: string, message: string, error: unknown, details?: any) => {
    console.error(`[${action}] ${message}`, { error, details })
  },
}

// Action error handler
export const handleActionError = (
  error: unknown,
  actionName: string
): never => {
  const appError = handleError(error)
  logError(appError, actionName)
  throw appError
}

// Safe async wrapper
export const safeAsync = async <T>(
  fn: () => Promise<T>,
  context?: string
): Promise<{ data?: T; error?: AppError }> => {
  try {
    const data = await fn()
    return { data }
  } catch (error) {
    const appError = handleError(error)
    if (context) {
      logError(appError, context)
    }
    return { error: appError }
  }
}
