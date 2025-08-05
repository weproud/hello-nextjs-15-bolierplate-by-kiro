/**
 * API Service
 *
 * Centralized API client and utilities for making HTTP requests
 * with proper error handling and type safety.
 */

import { getCurrentSession } from '@/services/auth'

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  status: number
  success: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
}

export interface ApiSuccessResponse<T = unknown> extends ApiResponse<T> {
  success: true
  data: T
  error?: never
}

export interface ApiErrorResponse extends ApiResponse<never> {
  success: false
  data?: never
  error: string
  details?: ApiError
}

export interface ApiRequestOptions<TBody = unknown> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: TBody
  cache?: RequestCache
  next?: NextFetchRequestConfig
}

/**
 * Base API client with authentication and error handling
 */
export class ApiClient {
  private baseUrl: string

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl
  }

  /**
   * Make an authenticated API request
   */
  async request<T = unknown, TBody = unknown>(
    endpoint: string,
    options: ApiRequestOptions<TBody> = {}
  ): Promise<ApiSuccessResponse<T> | ApiErrorResponse> {
    try {
      const session = await getCurrentSession()

      const url = `${this.baseUrl}${endpoint}`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      }

      // Add authorization header if user is authenticated
      if (session?.user) {
        headers['Authorization'] = `Bearer ${session.user.id}`
      }

      const config: RequestInit = {
        method: options.method || 'GET',
        headers,
        ...(options.cache && { cache: options.cache }),
        ...(options.next && { next: options.next }),
      }

      // Add body for non-GET requests
      if (options.body && options.method !== 'GET') {
        config.body = JSON.stringify(options.body)
      }

      const response = await fetch(url, config)

      let data: T | null = null
      let errorData: any = null

      try {
        const responseData = await response.json()
        if (response.ok) {
          data = responseData
        } else {
          errorData = responseData
        }
      } catch {
        // JSON 파싱 실패 시 처리
        if (!response.ok) {
          errorData = { message: response.statusText }
        }
      }

      if (!response.ok) {
        const apiError: ApiError = {
          code: errorData?.code || `HTTP_${response.status}`,
          message:
            errorData?.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          details: errorData?.details,
          timestamp: new Date().toISOString(),
        }

        return {
          success: false,
          error: apiError.message,
          details: apiError,
          status: response.status,
        }
      }

      return {
        success: true,
        data: data as T,
        status: response.status,
      }
    } catch (error) {
      console.error('API request failed:', error)

      const apiError: ApiError = {
        code: 'NETWORK_ERROR',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }

      return {
        success: false,
        error: apiError.message,
        details: apiError,
        status: 500,
      }
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, 'method'>
  ) {
    return this.request<T, TBody>(endpoint, {
      ...options,
      method: 'POST',
      body,
    })
  }

  /**
   * PUT request
   */
  async put<T = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, 'method'>
  ) {
    return this.request<T, TBody>(endpoint, { ...options, method: 'PUT', body })
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * PATCH request
   */
  async patch<T = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, 'method'>
  ) {
    return this.request<T, TBody>(endpoint, {
      ...options,
      method: 'PATCH',
      body,
    })
  }
}

// Default API client instance
export const apiClient = new ApiClient('/api')

// Type definitions for API responses
export interface ProjectListResponse {
  projects: Array<{
    id: string
    title: string
    description?: string
    userId: string
    createdAt: string
    updatedAt: string
    user: {
      id: string
      name: string
      email: string
    }
  }>
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
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
    name: string
    email: string
  }
}

export interface UserProfileResponse {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface FileUploadResponse {
  url: string
  key: string
  size: number
  type: string
  filename: string
}

// Utility functions for common API operations
export const api = {
  // Projects
  projects: {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      apiClient.get<ProjectListResponse>('/projects', {
        next: { tags: ['projects'] },
      }),

    get: (id: string) =>
      apiClient.get<ProjectResponse>(`/projects/${id}`, {
        next: { tags: [`project-${id}`] },
      }),

    create: (data: { title: string; description?: string }) =>
      apiClient.post<ProjectResponse>('/projects', data),

    update: (id: string, data: { title: string; description?: string }) =>
      apiClient.put<ProjectResponse>(`/projects/${id}`, data),

    delete: (id: string) =>
      apiClient.delete<{ success: boolean; message: string }>(
        `/projects/${id}`
      ),
  },

  // User profile
  profile: {
    get: () =>
      apiClient.get<UserProfileResponse>('/profile', {
        next: { tags: ['profile'] },
      }),

    update: (data: { name?: string; email?: string }) =>
      apiClient.put<UserProfileResponse>('/profile', data),
  },

  // File uploads
  files: {
    upload: async (
      file: File,
      category: string
    ): Promise<FileUploadResponse> => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      return response.json()
    },
  },
}
