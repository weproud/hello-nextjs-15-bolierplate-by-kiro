/**
 * Global Type Definitions
 *
 * Centralized type definitions used throughout the application
 * for consistency and type safety.
 */

// Re-export NextAuth types
export * from './next-auth'

// Re-export Editor types
export * from './editor'

// Re-export Post types
export * from './post'

// Common utility types
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

export type NonNullable<T> = T extends null | undefined ? never : T

export type ValueOf<T> = T[keyof T]

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  status: number
  timestamp?: string
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, any>
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// Database entity types
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface User extends BaseEntity {
  name?: string | null
  email: string
  emailVerified?: Date | null
  image?: string | null
}

export interface Project extends BaseEntity {
  title: string
  description?: string | null
  userId: string
  user?: User
}

// Form types
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

// Navigation types
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

// Theme types
export type Theme = 'light' | 'dark' | 'system'

export interface ThemeConfig {
  theme: Theme
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
  }
}

// Notification types
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

// File upload types
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

// Search types
export interface SearchResult {
  id: string
  title: string
  description?: string
  type: 'project' | 'user'
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

// Statistics types
export interface ProjectStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  archivedProjects: number
  projectsThisMonth: number
  projectsLastMonth: number
  monthlyGrowth: number
}

export interface ActivityData {
  day: string
  projects: number
}

export interface CategoryDistribution {
  category: string
  count: number
  percentage: number
}

// Error types
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

// State management types
export interface AppState {
  user: User | null
  theme: Theme
  notifications: Notification[]
  isLoading: boolean
  error: string | null
}

export interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  error: string | null
  filters: {
    search: string
    category?: string
    status?: string
  }
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

// Event types
export interface AppEvent {
  type: string
  payload?: any
  timestamp: Date
  userId?: string
}

export interface ProjectEvent extends AppEvent {
  projectId: string
  type:
    | 'project.created'
    | 'project.updated'
    | 'project.deleted'
    | 'project.duplicated'
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
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
  onClick?: () => void
}

export interface InputProps extends BaseComponentProps {
  type?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  disabled?: boolean
  required?: boolean
  error?: string
  onChange?: (value: string) => void
}

export interface ModalProps extends BaseComponentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
}

// Hook return types
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
  handleChange: (field: keyof T, value: any) => void
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => void
  reset: () => void
  setFieldError: (field: keyof T, error: string) => void
}

// Utility function types
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>

export type EventHandler<T = any> = (event: T) => void

export type Validator<T> = (value: T) => string | null

export type Formatter<T, R = string> = (value: T) => R

export type Predicate<T> = (value: T) => boolean

// Configuration types
export interface AppConfig {
  name: string
  version: string
  description: string
  url: string
  api: {
    baseUrl: string
    timeout: number
  }
  features: {
    auth: boolean
    notifications: boolean
    analytics: boolean
  }
  limits: {
    fileUpload: {
      maxSize: number
      allowedTypes: string[]
    }
    pagination: {
      defaultLimit: number
      maxLimit: number
    }
  }
}

// Environment types
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test'
  DATABASE_URL: string
  NEXTAUTH_URL: string
  NEXTAUTH_SECRET: string
  AUTH_GOOGLE_ID?: string
  AUTH_GOOGLE_SECRET?: string
}

// Metadata types
export interface PageMetadata {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
}

export interface SEOData {
  title: string
  description: string
  canonical?: string
  openGraph?: {
    title: string
    description: string
    image: string
    url: string
  }
  twitter?: {
    card: 'summary' | 'summary_large_image'
    title: string
    description: string
    image: string
  }
}
