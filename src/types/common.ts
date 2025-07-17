// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Form types
export type FormState<T = any> = {
  data: T
  errors: Record<string, string[]>
  isSubmitting: boolean
  isValid: boolean
}

export type FormAction<T = any> = {
  type: 'SET_DATA' | 'SET_ERRORS' | 'SET_SUBMITTING' | 'RESET'
  payload?: any
}

// API types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type RequestConfig = {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: any
  timeout?: number
}

// Error types
export type AppError = {
  code: string
  message: string
  details?: any
  timestamp: Date
}

export type ValidationError = {
  field: string
  message: string
  code: string
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Status types
export type Status = 'idle' | 'loading' | 'success' | 'error'

// Generic response wrapper
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E }

// Environment types
export type Environment = 'development' | 'production' | 'test'

// Component props helpers
export type WithClassName<T = {}> = T & {
  className?: string
}

export type WithChildren<T = {}> = T & {
  children: React.ReactNode
}

export type WithOptionalChildren<T = {}> = T & {
  children?: React.ReactNode
}
