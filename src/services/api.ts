/**
 * API Service
 *
 * Centralized API client and utilities for making HTTP requests
 * with proper error handling and type safety.
 */

import { getCurrentSession } from './auth'

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  status: number
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
  ): Promise<ApiResponse<T>> {
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
      try {
        data = await response.json()
      } catch {
        data = null
      }

      if (!response.ok) {
        return {
          error:
            data?.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        }
      }

      return {
        data,
        status: response.status,
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
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

// Utility functions for common API operations
export const api = {
  // Projects
  projects: {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      apiClient.get('/projects', { next: { tags: ['projects'] } }),

    get: (id: string) =>
      apiClient.get(`/projects/${id}`, { next: { tags: [`project-${id}`] } }),

    create: (data: { title: string; description?: string }) =>
      apiClient.post('/projects', data),

    update: (id: string, data: { title: string; description?: string }) =>
      apiClient.put(`/projects/${id}`, data),

    delete: (id: string) => apiClient.delete(`/projects/${id}`),
  },

  // User profile
  profile: {
    get: () => apiClient.get('/profile', { next: { tags: ['profile'] } }),

    update: (data: { name?: string; email?: string }) =>
      apiClient.put('/profile', data),
  },

  // File uploads
  files: {
    upload: async (file: File, category: string) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)

      return fetch('/api/upload', {
        method: 'POST',
        body: formData,
      }).then(res => res.json())
    },
  },
}
