'use client'

import { useCallback, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { handleError, logError } from '../lib/error-handling'
import type { AppError } from '../lib/error-handling'
import { getUserFriendlyErrorMessage } from '../lib/global-error-handler'

interface ServerActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

interface ServerActionOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: AppError) => void
  showToast?: boolean
  successMessage?: string
  retryAttempts?: number
  retryDelay?: number
}

export function useServerActionError<T = any>(
  options: ServerActionOptions<T> = {}
) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<ServerActionResult<T> | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const {
    onSuccess,
    onError,
    showToast = true,
    successMessage = 'Operation completed successfully',
    retryAttempts = 0,
    retryDelay = 1000,
  } = options

  const executeAction = useCallback(
    async (action: () => Promise<ServerActionResult<T>>, context?: string) => {
      let attempt = 0
      let lastError: AppError | null = null

      const attemptAction = async (): Promise<void> => {
        try {
          const actionResult = await action()
          setResult(actionResult)

          if (actionResult.success) {
            setRetryCount(0) // Reset retry count on success

            if (showToast && successMessage) {
              toast.success(successMessage)
            }

            if (onSuccess && actionResult.data) {
              onSuccess(actionResult.data)
            }
          } else {
            const error = handleError(
              new Error(actionResult.error || 'Action failed')
            )
            lastError = error

            if (showToast) {
              toast.error(getUserFriendlyErrorMessage(error))
            }

            if (onError) {
              onError(error)
            }
          }
        } catch (error) {
          const appError = handleError(error)
          lastError = appError

          if (context) {
            logError(appError, context)
          }

          setResult({
            success: false,
            error: appError.message,
          })

          if (showToast) {
            toast.error(getUserFriendlyErrorMessage(appError))
          }

          if (onError) {
            onError(appError)
          }
        }
      }

      startTransition(async () => {
        while (attempt <= retryAttempts) {
          await attemptAction()

          // If successful or no more retries, break
          if (result?.success || attempt >= retryAttempts) {
            break
          }

          // Wait before retry
          if (attempt < retryAttempts) {
            setRetryCount(attempt + 1)
            await new Promise(resolve =>
              setTimeout(resolve, retryDelay * Math.pow(2, attempt))
            )
            attempt++
          }
        }
      })
    },
    [
      onSuccess,
      onError,
      showToast,
      successMessage,
      retryAttempts,
      retryDelay,
      result?.success,
    ]
  )

  const reset = useCallback(() => {
    setResult(null)
    setRetryCount(0)
  }, [])

  return {
    execute: executeAction,
    isPending,
    result,
    retryCount,
    canRetry: retryCount < retryAttempts,
    isSuccess: result?.success ?? false,
    isError: result?.success === false,
    error: result?.error,
    data: result?.data,
    fieldErrors: result?.fieldErrors,
    reset,
  }
}
