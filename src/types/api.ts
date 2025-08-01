/**
 * API Type Definitions
 *
 * API 요청, 응답 및 관련 기능을 위한 타입 정의들입니다.
 */

import type { BaseEntity } from './common'

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// API Response Types - 표준화된 API 응답 구조
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

// Pagination Types - 페이지네이션을 위한 타입들
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

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

// Sorting and Filtering - 정렬 및 필터링을 위한 타입들
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

// API Request Configuration
export interface ApiRequestConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  withCredentials?: boolean
  validateStatus?: (status: number) => boolean
}

export interface ApiRequest {
  method: HttpMethod
  url: string
  headers?: Record<string, string>
  params?: Record<string, any>
  body?: any
  timeout?: number
}

// User API Types
export interface UpdateUserRequest {
  name?: string
  email?: string
}

export interface UserResponse extends BaseEntity {
  name?: string | null
  email: string
  image?: string | null
  emailVerified?: Date | null
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

// Project API Types
export interface CreateProjectRequest {
  title: string
  description?: string
}

export interface UpdateProjectRequest {
  title?: string
  description?: string
}

export interface ProjectResponse extends BaseEntity {
  title: string
  description?: string | null
  userId: string
  user: {
    id: string
    name?: string | null
    email: string
  }
}

export interface ProjectListResponse
  extends PaginatedResponse<ProjectResponse> {}

// Post API Types
export interface CreatePostRequest {
  title: string
  content: string
  published?: boolean
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  published?: boolean
}

export interface PostResponse extends BaseEntity {
  title: string
  content: string
  published: boolean
  authorId: string
  author: {
    id: string
    name?: string | null
    email: string
    image?: string | null
  }
}

export interface PostListResponse extends PaginatedResponse<PostResponse> {}

// File Upload API Types
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

// Search API Types
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
  type: 'project' | 'user' | 'post'
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

// Statistics API Types
export interface StatsResponse {
  totalProjects: number
  projectsThisMonth: number
  projectsLastMonth: number
  monthlyGrowth: number
  recentProjects: ProjectResponse[]
}

// Contact Form API Types
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

// Batch Operations
export interface BatchDeleteRequest {
  ids: string[]
  type: 'projects' | 'posts' | 'files'
}

export interface BatchDeleteResponse {
  success: string[]
  failed: string[]
  total: number
  successCount: number
  failedCount: number
}

// API Error Classes
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

// API Client Interface
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

// API Hook Types
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
