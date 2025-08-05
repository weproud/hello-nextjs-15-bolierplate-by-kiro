'use client'

import { useCallback, useState } from 'react'
import { handleError, logError } from '@/lib/error-handling'
import type { AppError } from '@/types'

interface UseErrorBoundaryOptions {
  onError?: (error: AppError) => void
  context?: string
}

export const useErrorBoundary = (options: UseErrorBoundaryOptions = {}) => {
  const [error, setError] = useState<AppError | null>(null)

  const captureError = useCallback(
    (error: unknown) => {
      const appError = handleError(error)

      // Log the error
      logError(appError, options.context)

      // Call custom error handler if provided
      if (options.onError) {
        options.onError(appError)
      }

      // Set error state to trigger error boundary
      setError(appError)

      // Throw the error to trigger React error boundary
      throw appError
    },
    [options.onError, options.context]
  )

  const resetError = useCallback(() => {
    setError(null)
  }, [])

  const safeExecute = useCallback(
    async <T>(fn: () => Promise<T> | T): Promise<T | null> => {
      try {
        const result = await fn()
        return result
      } catch (error) {
        captureError(error)
        return null
      }
    },
    [captureError]
  )

  return {
    error,
    captureError,
    resetError,
    safeExecute,
    hasError: error !== null,
  }
}

// Hook for throwing errors that will be caught by error boundaries
export const useThrowError = () => {
  const [, setError] = useState<Error>()

  return useCallback((error: unknown) => {
    const appError = handleError(error)
    setError(() => {
      throw appError
    })
  }, [])
}
