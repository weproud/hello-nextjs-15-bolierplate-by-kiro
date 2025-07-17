'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { handleError, logError, type AppError } from '../lib/error-handling'

interface ApiErrorOptions {
  showToast?: boolean
  logError?: boolean
  onError?: (error: AppError) => void
  retryAttempts?: number
  retryDelay?: number
}

interface ApiState<T> {
  data: T | null
  error: AppError | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
}

export function useApiError<T = any>(options: ApiErrorOptions = {}) {
  const {
    showToast = true,
    logError: shouldLogError = true,
    onError,
    retryAttempts = 0,
    retryDelay = 1000,
  } = options

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
  })

  const executeWithErrorHandling = useCallback(
    async <R = T>(
      apiCall: () => Promise<R>,
      context?: string
    ): Promise<R | null> => {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        isError: false,
        isSuccess: false,
      }))

      let lastError: AppError | null = null
      let attempt = 0

      while (attempt <= retryAttempts) {
        try {
          const result = await apiCall()
          setState(prev => ({
            ...prev,
            data: result as T,
            isLoading: false,
            isSuccess: true,
            error: null,
            isError: false,
          }))
          return result
        } catch (error) {
          const appError = handleError(error)
          lastError = appError

          if (shouldLogError) {
            logError(appError, context || 'API Call')
          }

          // If we have more retry attempts, wait and try again
          if (attempt < retryAttempts) {
            await new Promise(resolve =>
              setTimeout(resolve, retryDelay * Math.pow(2, attempt))
            )
            attempt++
            continue
          }

          // Final attempt failed
          setState(prev => ({
            ...prev,
            error: appError,
            isLoading: false,
            isError: true,
            isSuccess: false,
          }))

          if (showToast) {
            toast.error(appError.message || 'An error occurred')
          }

          if (onError) {
            onError(appError)
          }

          break
        }
      }

      return null
    },
    [showToast, shouldLogError, onError, retryAttempts, retryDelay]
  )

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isError: false,
      isSuccess: false,
    })
  }, [])

  return {
    ...state,
    execute: executeWithErrorHandling,
    reset,
  }
}

// Specialized hook for fetch API calls
export function useFetchWithError<T = any>(options: ApiErrorOptions = {}) {
  const apiError = useApiError<T>(options)

  const fetchData = useCallback(
    async (url: string, init?: RequestInit) => {
      return apiError.execute(async () => {
        const response = await fetch(url, init)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          return response.json()
        }

        return response.text()
      }, `Fetch: ${url}`)
    },
    [apiError.execute]
  )

  return {
    ...apiError,
    fetchData,
  }
}
