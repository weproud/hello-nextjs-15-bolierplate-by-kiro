'use client'

import { useCallback, useState, useTransition } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'

type ActionResult<T = any> = {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

interface UseFormActionOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  form?: UseFormReturn<any>
  showToast?: boolean
  successMessage?: string
  errorMessage?: string
}

export function useFormAction<T = any>(
  action: (formData: FormData) => Promise<ActionResult<T>>,
  options: UseFormActionOptions<T> = {}
) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult<T> | null>(null)
  const {
    onSuccess,
    onError,
    form,
    showToast = false,
    successMessage = '성공적으로 처리되었습니다.',
    errorMessage = '처리 중 오류가 발생했습니다.',
  } = options

  const execute = useCallback(
    (formData: FormData) => {
      startTransition(async () => {
        try {
          const actionResult = await action(formData)
          setResult(actionResult)

          if (actionResult.success) {
            // Clear form errors
            if (form) {
              form.clearErrors()
            }

            // Show success toast
            if (showToast) {
              toast.success(successMessage)
            }

            // Call success callback
            if (onSuccess && actionResult.data) {
              onSuccess(actionResult.data)
            }
          } else {
            // Set field errors if available
            if (form && actionResult.fieldErrors) {
              Object.entries(actionResult.fieldErrors).forEach(
                ([field, errors]) => {
                  if (errors[0]) {
                    form.setError(field as any, {
                      type: 'server',
                      message: errors[0],
                    })
                  }
                }
              )
            }

            // Show error toast
            if (showToast) {
              toast.error(actionResult.error || errorMessage)
            }

            // Call error callback
            if (onError) {
              onError(actionResult.error || errorMessage)
            }
          }
        } catch (error) {
          const fallbackErrorMessage = '예상치 못한 오류가 발생했습니다.'
          setResult({
            success: false,
            error: fallbackErrorMessage,
          })

          // Show error toast
          if (showToast) {
            toast.error(fallbackErrorMessage)
          }

          if (onError) {
            onError(fallbackErrorMessage)
          }
        }
      })
    },
    [action, form, onSuccess, onError, showToast, successMessage, errorMessage]
  )

  const reset = useCallback(() => {
    setResult(null)
    if (form) {
      form.clearErrors()
    }
  }, [form])

  return {
    execute,
    isPending,
    result,
    reset,
    isSuccess: result?.success ?? false,
    isError: result?.success === false,
    error: result?.error,
    data: result?.data,
  }
}

// Enhanced form action hook with retry functionality
export function useFormActionWithRetry<T = any>(
  action: (formData: FormData) => Promise<ActionResult<T>>,
  options: UseFormActionOptions<T> & { maxRetries?: number } = {}
) {
  const [retryCount, setRetryCount] = useState(0)
  const { maxRetries = 3, ...formActionOptions } = options

  const executeWithRetry = useCallback(
    async (formData: FormData) => {
      const attemptExecution = async (
        attempt: number
      ): Promise<ActionResult<T>> => {
        try {
          const result = await action(formData)
          if (result.success) {
            setRetryCount(0) // Reset retry count on success
          }
          return result
        } catch (error) {
          if (attempt < maxRetries) {
            setRetryCount(attempt + 1)
            // Exponential backoff: wait 1s, 2s, 4s...
            await new Promise(resolve =>
              setTimeout(resolve, Math.pow(2, attempt) * 1000)
            )
            return attemptExecution(attempt + 1)
          }
          throw error
        }
      }

      return attemptExecution(0)
    },
    [action, maxRetries]
  )

  const baseFormAction = useFormAction(executeWithRetry, formActionOptions)

  return {
    ...baseFormAction,
    retryCount,
    canRetry: retryCount < maxRetries,
  }
}
