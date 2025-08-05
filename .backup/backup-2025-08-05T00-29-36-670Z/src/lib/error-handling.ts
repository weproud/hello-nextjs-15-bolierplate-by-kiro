import type {
  AppError as AppErrorType,
  ValidationError as ValidationErrorType,
} from '../types/common'

// Error classes
export class AppErrorClass extends Error implements AppErrorType {
  code: string
  details: Record<string, unknown> | undefined
  timestamp: Date

  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.timestamp = new Date()
  }
}

export class ValidationErrorClass extends Error {
  errors: ValidationErrorType[]

  constructor(errors: ValidationErrorType[]) {
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
  details?: Record<string, unknown>
): AppErrorClass => {
  return new AppErrorClass(code, message, details)
}

export const createValidationError = (
  errors: ValidationErrorType[]
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
    return createAppError(ERROR_CODES.VALIDATION_ERROR, error.message, {
      errors: error.errors,
    })
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
  constructor(message: string, details?: Record<string, unknown>) {
    super('ACTION_ERROR', message, details)
    this.name = 'ActionError'
  }
}

export class AuthenticationError extends AppErrorClass {
  constructor(message = '인증이 필요합니다.') {
    super(ERROR_CODES.UNAUTHORIZED, message)
    this.name = 'AuthenticationError'
  }
}

// Action logger
export const ActionLogger = {
  info: (
    action: string,
    message: string,
    details?: Record<string, unknown>
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[${action}] ${message}`, details)
    }
  },
  warn: (
    action: string,
    message: string,
    details?: Record<string, unknown>
  ) => {
    console.warn(`[${action}] ${message}`, details)
  },
  error: (
    action: string,
    message: string,
    error: unknown,
    details?: Record<string, unknown>
  ) => {
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

// Additional error classes that are imported by other files
export class NotFoundError extends AppErrorClass {
  constructor(message = '리소스를 찾을 수 없습니다.') {
    super(ERROR_CODES.NOT_FOUND, message)
    this.name = 'NotFoundError'
  }
}

export class AuthorizationError extends AppErrorClass {
  constructor(message = '권한이 없습니다.') {
    super(ERROR_CODES.FORBIDDEN, message)
    this.name = 'AuthorizationError'
  }
}

export class DatabaseError extends AppErrorClass {
  constructor(message = '데이터베이스 오류가 발생했습니다.') {
    super(ERROR_CODES.DATABASE_ERROR, message)
    this.name = 'DatabaseError'
  }
}

// Export ValidationError as alias for ValidationErrorClass
export const ValidationError = ValidationErrorClass

// Safe execution wrapper
export const safeExecute = async <T>(
  fn: () => Promise<T>,
  context?: string
): Promise<
  { success: true; data: T } | { success: false; error: AppError }
> => {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (error) {
    const appError = handleError(error)
    if (context) {
      logError(appError, context)
    }
    return { success: false, error: appError }
  }
}

// Rate limiting helper
export const checkRateLimit = (
  _key: string,
  _limit = 10,
  _windowMs = 60000
): boolean => {
  // Simple in-memory rate limiting for development
  // In production, use Redis or similar
  return true // Always allow for now
}

// Object sanitization helper
export const sanitizeObject = <T extends Record<string, unknown>>(
  obj: T,
  allowedKeys: Array<keyof T>
): Partial<T> => {
  const sanitized: Partial<T> = {}
  allowedKeys.forEach(key => {
    if (key in obj) {
      sanitized[key] = obj[key]
    }
  })
  return sanitized
}
