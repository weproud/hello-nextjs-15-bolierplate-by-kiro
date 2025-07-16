import { useState, useTransition } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'

// Type for server action result (compatible with next-safe-action)
export interface ActionResult<T = any> {
  success?: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
  serverError?: string
  validationErrors?: Record<string, string[]>
}

// Options for form action hook
export interface UseFormActionOptions {
  form?: UseFormReturn<any>
  showToast?: boolean
  successMessage?: string
  errorMessage?: string
  onSuccess?: (data?: any) => void
  onError?: (error: string) => void
}

// Hook for handling server actions with forms (compatible with next-safe-action)
export function useFormAction<T = any>(
  action: any, // next-safe-action or traditional action
  options: UseFormActionOptions = {}
) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult<T> | null>(null)

  const {
    form,
    showToast = true,
    successMessage = '성공적으로 처리되었습니다.',
    errorMessage = '처리 중 오류가 발생했습니다.',
    onSuccess,
    onError,
  } = options

  const execute = (formDataOrInput: FormData | any) => {
    startTransition(async () => {
      try {
        let actionResult: any

        // Check if action is a next-safe-action (has execute method) or traditional action
        if (typeof action === 'function' && action.execute) {
          // next-safe-action format
          actionResult = await action.execute(formDataOrInput)
        } else if (typeof action === 'function') {
          // Traditional server action format
          actionResult = await action(formDataOrInput)
        } else {
          throw new Error('Invalid action format')
        }

        // Handle next-safe-action result format
        if (actionResult && typeof actionResult === 'object') {
          // next-safe-action success case
          if (
            actionResult.data !== undefined &&
            !actionResult.serverError &&
            !actionResult.validationErrors
          ) {
            const result: ActionResult<T> = {
              success: true,
              data: actionResult.data,
            }
            setResult(result)

            if (showToast) {
              toast.success(successMessage)
            }
            onSuccess?.(actionResult.data)
            return
          }

          // next-safe-action error case
          if (actionResult.serverError || actionResult.validationErrors) {
            const result: ActionResult<T> = {
              success: false,
              error: actionResult.serverError || 'Validation failed',
              fieldErrors: actionResult.validationErrors,
            }
            setResult(result)

            // Handle field errors
            if (actionResult.validationErrors && form) {
              Object.entries(actionResult.validationErrors).forEach(
                ([field, errors]) => {
                  if (Array.isArray(errors) && errors.length > 0) {
                    form.setError(field as any, {
                      type: 'server',
                      message: errors[0],
                    })
                  }
                }
              )
            }

            const message = actionResult.serverError || errorMessage
            if (showToast) {
              toast.error(message)
            }
            onError?.(message)
            return
          }

          // Traditional ActionResult format
          if (actionResult.success !== undefined) {
            setResult(actionResult)

            if (actionResult.success) {
              if (showToast) {
                toast.success(successMessage)
              }
              onSuccess?.(actionResult.data)
            } else {
              // Handle field errors
              if (actionResult.fieldErrors && form) {
                Object.entries(actionResult.fieldErrors).forEach(
                  ([field, errors]) => {
                    form.setError(field as any, {
                      type: 'server',
                      message: errors[0],
                    })
                  }
                )
              }

              const message = actionResult.error || errorMessage
              if (showToast) {
                toast.error(message)
              }
              onError?.(message)
            }
            return
          }
        }

        // If we get here, assume success with the result as data
        const result: ActionResult<T> = {
          success: true,
          data: actionResult,
        }
        setResult(result)

        if (showToast) {
          toast.success(successMessage)
        }
        onSuccess?.(actionResult)
      } catch (error) {
        const message = error instanceof Error ? error.message : errorMessage
        setResult({
          success: false,
          error: message,
        })

        if (showToast) {
          toast.error(message)
        }
        onError?.(message)
      }
    })
  }

  const reset = () => {
    setResult(null)
  }

  return {
    execute,
    isPending,
    result,
    reset,
    isSuccess: result?.success === true,
    isError: result?.success === false,
  }
}

// Hook for optimistic updates with form actions
export function useOptimisticFormAction<T = any>(
  action: (formData: FormData) => Promise<ActionResult<T>>,
  optimisticUpdate: (formData: FormData) => T,
  options: UseFormActionOptions = {}
) {
  const [optimisticData, setOptimisticData] = useState<T | null>(null)
  const formAction = useFormAction(action, {
    ...options,
    onSuccess: data => {
      setOptimisticData(null)
      options.onSuccess?.(data)
    },
    onError: error => {
      setOptimisticData(null)
      options.onError?.(error)
    },
  })

  const executeOptimistic = (formData: FormData) => {
    // Apply optimistic update immediately
    const optimistic = optimisticUpdate(formData)
    setOptimisticData(optimistic)

    // Execute the actual action
    formAction.execute(formData)
  }

  return {
    ...formAction,
    execute: executeOptimistic,
    optimisticData,
  }
}

// Hook for batch form actions
export function useBatchFormAction<T = any>(
  actions: Array<(formData: FormData) => Promise<ActionResult<T>>>,
  options: UseFormActionOptions = {}
) {
  const [isPending, startTransition] = useTransition()
  const [results, setResults] = useState<ActionResult<T>[]>([])

  const executeBatch = (formDataArray: FormData[]) => {
    startTransition(async () => {
      try {
        const promises = actions.map((action, index) =>
          action(formDataArray[index] || new FormData())
        )

        const batchResults = await Promise.all(promises)
        setResults(batchResults)

        const allSuccessful = batchResults.every(result => result.success)

        if (allSuccessful) {
          if (options.showToast) {
            toast.success(
              options.successMessage || '모든 작업이 성공적으로 완료되었습니다.'
            )
          }
          options.onSuccess?.(batchResults.map(r => r.data))
        } else {
          const failedCount = batchResults.filter(r => !r.success).length
          const message = `${failedCount}개의 작업이 실패했습니다.`

          if (options.showToast) {
            toast.error(message)
          }
          options.onError?.(message)
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : '배치 처리 중 오류가 발생했습니다.'

        if (options.showToast) {
          toast.error(message)
        }
        options.onError?.(message)
      }
    })
  }

  return {
    executeBatch,
    isPending,
    results,
    isAllSuccess: results.length > 0 && results.every(r => r.success),
    hasErrors: results.some(r => !r.success),
  }
}

// Hook for form action with retry functionality
export function useRetryableFormAction<T = any>(
  action: (formData: FormData) => Promise<ActionResult<T>>,
  options: UseFormActionOptions & {
    maxRetries?: number
    retryDelay?: number
  } = {}
) {
  const { maxRetries = 3, retryDelay = 1000, ...formActionOptions } = options
  const [retryCount, setRetryCount] = useState(0)

  const formAction = useFormAction(action, formActionOptions)

  const executeWithRetry = async (formData: FormData) => {
    let attempts = 0

    const attemptAction = async (): Promise<void> => {
      attempts++
      setRetryCount(attempts)

      try {
        await new Promise(resolve => {
          formAction.execute(formData)
          // Wait for the action to complete
          const checkComplete = () => {
            if (!formAction.isPending) {
              resolve(undefined)
            } else {
              setTimeout(checkComplete, 100)
            }
          }
          checkComplete()
        })

        if (!formAction.result?.success && attempts < maxRetries) {
          setTimeout(() => {
            attemptAction()
          }, retryDelay)
        }
      } catch (error) {
        if (attempts < maxRetries) {
          setTimeout(() => {
            attemptAction()
          }, retryDelay)
        }
      }
    }

    await attemptAction()
  }

  const reset = () => {
    setRetryCount(0)
    formAction.reset()
  }

  return {
    ...formAction,
    execute: executeWithRetry,
    retryCount,
    reset,
  }
}

// Export types
export type FormActionHook<T = any> = ReturnType<typeof useFormAction<T>>
export type OptimisticFormActionHook<T = any> = ReturnType<
  typeof useOptimisticFormAction<T>
>
export type BatchFormActionHook<T = any> = ReturnType<
  typeof useBatchFormAction<T>
>
export type RetryableFormActionHook<T = any> = ReturnType<
  typeof useRetryableFormAction<T>
>
