/**
 * API Service
 *
 * Centralized API client and utilities for making HTTP requests
 * with proper error handling and type safety.
 */

import { auth } from '@/auth'

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  status: number
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  cache?: RequestCache
  next?: NextFetchRequestConfig
}

/**
 * Base API client with authentication and error handling
 */
export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  /**
   * Make an authenticated API request
   */
  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const session = await auth()

      const url = `${this.baseUrl}${endpoint}`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      }

      // Add authorization header if user is authenticated
      if (session?.user) {
        headers.Authorization = `Bearer ${session.user.id}`
      }

      const config: RequestInit = {
        method: options.method || 'GET',
        headers,
        cache: options.cache,
        next: options.next,
      }

      // Add body for non-GET requests
      if (options.body && options.method !== 'GET') {
        config.body = JSON.stringify(options.body)
      }

      const response = await fetch(url, config)

      let data: any
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
  async get<T = any>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, 'method'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, 'method'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    body?: any,
    options?: Omit<ApiRequestOptions, 'method'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body })
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
