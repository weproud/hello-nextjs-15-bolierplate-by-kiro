/**
 * API Type Definitions
 *
 * Type definitions for API requests, responses, and related functionality.
 */

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// API Request types
export interface ApiRequest {
  method: HttpMethod
  url: string
  headers?: Record<string, string>
  params?: Record<string, any>
  body?: any
  timeout?: number
}

export interface ApiRequestConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  withCredentials?: boolean
  validateStatus?: (status: number) => boolean
}

// API Response types
export interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: ApiRequestConfig
}

export interface ApiErrorResponse {
  error: {
    message: string
    code?: string
    details?: Record<string, any>
  }
  status: number
  timestamp: string
}

// Pagination types
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginationMeta {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedApiResponse<T> {
  data: T[]
  meta: PaginationMeta
}

// Sorting and filtering
export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  [key: string]: any
}

export interface QueryParams
  extends PaginationParams,
    SortParams,
    FilterParams {}

// Project API types
export interface CreateProjectRequest {
  title: string
  description?: string
}

export interface UpdateProjectRequest {
  title?: string
  description?: string
}

export interface ProjectResponse {
  id: string
  title: string
  description?: string
  userId: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name?: string
    email: string
  }
}

export interface ProjectListResponse
  extends PaginatedApiResponse<ProjectResponse> {}

export interface UpdateUserRequest {
  name?: string
  email?: string
}

export interface UserResponse {
  id: string
  name?: string
  email: string
  image?: string
  createdAt: string
  updatedAt: string
}

export interface UserPreferencesRequest {
  theme?: 'light' | 'dark' | 'system'
  language?: 'ko' | 'en'
  notifications?: {
    email: boolean
    push: boolean
    marketing: boolean
  }
}

export interface UserPreferencesResponse {
  theme: 'light' | 'dark' | 'system'
  language: 'ko' | 'en'
  notifications: {
    email: boolean
    push: boolean
    marketing: boolean
  }
  dashboard: {
    layout: 'grid' | 'list'
    itemsPerPage: number
  }
}

// File upload API types
export interface FileUploadRequest {
  file: File
  category: 'avatar' | 'document' | 'image'
}

export interface FileUploadResponse {
  id: string
  filename: string
  originalName: string
  size: number
  type: string
  url: string
  category: string
  uploadedAt: string
}

// Search API types
export interface SearchRequest {
  query: string
  filters?: {
    type?: string[]
    category?: string
    dateRange?: {
      from?: string
      to?: string
    }
  }
  sort?: {
    field: string
    order: 'asc' | 'desc'
  }
  pagination?: PaginationParams
}

export interface SearchResultItem {
  id: string
  title: string
  description?: string
  type: 'project' | 'user'
  relevanceScore: number
  metadata?: Record<string, any>
  createdAt: string
}

export interface SearchResponse {
  items: SearchResultItem[]
  pagination: PaginationMeta
  query: string
  filters?: SearchRequest['filters']
  searchTime: number
}

// Statistics API types
export interface StatsResponse {
  totalProjects: number
  projectsThisMonth: number
  projectsLastMonth: number
  monthlyGrowth: number
  recentProjects: ProjectResponse[]
}

// Contact form API types
export interface ContactFormRequest {
  name: string
  email: string
  subject: string
  message: string
}

export interface ContactFormResponse {
  message: string
  id: string
}

// Newsletter API types
export interface NewsletterSubscriptionRequest {
  email: string
  preferences: string[]
  frequency: 'daily' | 'weekly' | 'monthly'
}

export interface NewsletterSubscriptionResponse {
  message: string
  subscriptionId: string
}

// Feedback API types
export interface FeedbackRequest {
  type: 'bug' | 'feature' | 'improvement' | 'other'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  attachments?: File[]
}

export interface FeedbackResponse {
  id: string
  type: string
  title: string
  description: string
  priority: string
  status: 'pending' | 'reviewed' | 'resolved'
  createdAt: string
}

// Batch operations
export interface BatchDeleteRequest {
  ids: string[]
  type: 'projects' | 'files'
}

export interface BatchDeleteResponse {
  success: string[]
  failed: string[]
  total: number
  successCount: number
  failedCount: number
}

// API Client types
export interface ApiClient {
  get<T = any>(url: string, config?: ApiRequestConfig): Promise<ApiResponse<T>>
  post<T = any>(
    url: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>>
  put<T = any>(
    url: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>>
  delete<T = any>(
    url: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>>
  patch<T = any>(
    url: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponse<T>>
}

// API Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public errors: Record<string, string[]>
  ) {
    super(message, 422, 'VALIDATION_ERROR', { errors })
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

export class ServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'SERVER_ERROR')
    this.name = 'ServerError'
  }
}

// API Hook types
export interface UseApiOptions<T> {
  initialData?: T
  enabled?: boolean
  refetchOnWindowFocus?: boolean
  refetchInterval?: number
  onSuccess?: (data: T) => void
  onError?: (error: ApiError) => void
}

export interface UseApiReturn<T> {
  data: T | undefined
  error: ApiError | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  refetch: () => Promise<void>
  mutate: (data: T) => void
}

export interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: ApiError, variables: TVariables) => void
  onSettled?: (
    data: TData | undefined,
    error: ApiError | null,
    variables: TVariables
  ) => void
}

export interface UseMutationReturn<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>
  mutateAsync: (variables: TVariables) => Promise<TData>
  data: TData | undefined
  error: ApiError | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  reset: () => void
}
