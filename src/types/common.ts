/**
 * Common Type Definitions
 *
 * 애플리케이션 전반에서 사용되는 공통 타입들을 정의합니다.
 */

// Base Entity - 모든 데이터베이스 엔티티의 기본 구조
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// Utility Types - 타입 조작을 위한 유틸리티 타입들
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

export type ValueOf<T> = T[keyof T]

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

// Result Type - 성공/실패를 나타내는 타입
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

// Status Types - 애플리케이션 상태를 나타내는 타입들
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export type Theme = 'light' | 'dark' | 'system'

export type Environment = 'development' | 'production' | 'test'

// Component Props Helpers - 컴포넌트 props를 위한 헬퍼 타입들
export type WithClassName<T = {}> = T & {
  className?: string
}

export type WithChildren<T = {}> = T & {
  children: React.ReactNode
}

export type WithOptionalChildren<T = {}> = T & {
  children?: React.ReactNode
}

export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Common Component Props - 자주 사용되는 컴포넌트 props 타입들
export interface ModalProps extends BaseComponentProps {
  open: boolean
  onOpenChange: (open: boolean) => void | Promise<void>
  title?: string
  description?: string
}

export interface ButtonProps extends BaseComponentProps {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void | Promise<void>
}

export interface InputProps extends BaseComponentProps {
  type?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  disabled?: boolean
  required?: boolean
  error?: string
  onChange?: (value: string) => void | Promise<void>
}

export interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void | Promise<void>
  showRetry?: boolean
  title?: string
  description?: string
}

export interface ProtectedRouteProps extends WithChildren {
  fallback?: React.ReactNode
  title?: string
  description?: string
}

export interface ProvidersProps extends WithChildren {}

// Error Types - 에러 처리를 위한 타입들
export interface AppError extends Error {
  code?: string
  statusCode?: number
  details?: Record<string, any>
}

export interface ValidationError {
  field: string
  message: string
  code?: string
}

// Form Types - 폼 처리를 위한 공통 타입들
export interface FormState<T = any> {
  data: T
  errors: Record<string, string[]>
  isSubmitting: boolean
  isValid: boolean
}

export interface FormField {
  name: string
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'file'
    | 'date'
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: Array<{ value: string; label: string }>
  validation?: {
    min?: number
    max?: number
    pattern?: RegExp
    message?: string
  }
}

export interface FormConfig {
  fields: FormField[]
  submitText?: string
  resetText?: string
}

// Navigation Types - 네비게이션을 위한 타입들
export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: any
  description?: string
  badge?: string | number
  children?: NavigationItem[]
  requireAuth?: boolean
  roles?: string[]
  external?: boolean
}

// Notification Types - 알림을 위한 타입들
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  timestamp: Date
  read?: boolean
  actions?: Array<{
    label: string
    action: () => void
  }>
}

// File Upload Types - 파일 업로드를 위한 타입들
export interface FileUpload {
  id: string
  filename: string
  originalName: string
  size: number
  type: string
  url: string
  category: 'avatar' | 'document' | 'image'
  uploadedBy: string
  uploadedAt: Date
}

export interface UploadOptions {
  maxSize?: number
  allowedTypes?: string[]
  folder?: string
}

export interface UploadResult {
  url: string
  key: string
  size: number
  type: string
  filename: string
}

// Search Types - 검색 기능을 위한 타입들
export interface SearchResult {
  id: string
  title: string
  description?: string
  type: 'project' | 'user' | 'post'
  relevanceScore: number
  metadata?: Record<string, any>
}

export interface SearchOptions {
  query: string
  filters?: {
    type?: string[]
    category?: string
    dateRange?: {
      from?: Date
      to?: Date
    }
  }
  sort?: {
    field: string
    order: 'asc' | 'desc'
  }
  pagination?: {
    page: number
    limit: number
  }
}

// Hook Return Types - 커스텀 훅의 반환 타입들
export interface UseAsyncReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  execute: (...args: any[]) => Promise<void>
  reset: () => void
}

export interface UseFormReturn<T> {
  values: T
  errors: Record<keyof T, string>
  touched: Record<keyof T, boolean>
  isValid: boolean
  isSubmitting: boolean
  handleChange: (field: keyof T, value: any) => void | Promise<void>
  handleSubmit: (
    onSubmit: (values: T) => void | Promise<void>
  ) => void | Promise<void>
  reset: () => void | Promise<void>
  setFieldError: (field: keyof T, error: string) => void
}

// Utility Function Types - 유틸리티 함수를 위한 타입들
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>

export type EventHandler<T = any> = (event: T) => void | Promise<void>

export type Validator<T> = (value: T) => string | null

export type Formatter<T, R = string> = (value: T) => R

export type Predicate<T> = (value: T) => boolean
