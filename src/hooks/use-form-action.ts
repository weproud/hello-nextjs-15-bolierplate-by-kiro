import { useState, useTransition } from 'react'
import { type UseFormReturn, type FieldValues } from 'react-hook-form'
import { toast } from 'sonner'
import { T } from 'vitest/dist/reporters-w_64AS5f.js'
import { T } from 'vitest/dist/reporters-w_64AS5f.js'
import { T } from 'vitest/dist/reporters-w_64AS5f.js'

// Type for server action result (compatible with next-safe-action)
export interface ActionResult<T = unknown> {
  success?: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
  serverError?: string
  validationErrors?: Record<string, string[]>
}

// Type for next-safe-action compatible actions
export interface SafeAction<TInput, TOutput> {
  execute: (input: TInput) => Promise<ActionResult<TOutput>>
}

// Type for traditional server actions
export type ServerAction<TInput, TOutput> = (
  input: TInput
) => Promise<ActionResult<TOutput>>

// Union type for all supported action types
export type FormAction<TInput, TOutput> =
  | SafeAction<TInput, TOutput>
  | ServerAction<TInput, TOutput>

// Options for form action hook
export interface UseFormActionOptions<
  TFormData extends FieldValues = FieldValues,
  TResult = unknown,
> {
  form?: UseFormReturn<TFormData>
  showToast?: boolean
  successMessage?: string
  errorMessage?: string
  onSuccess?: (data?: TResult) => void
  onError?: (error: string) => void
}

// Type guard to check if action is a SafeAction
function isSafeAction<TInput, TOutput>(
  action: FormAction<TInput, TOutput>
): action is SafeAction<TInput, TOutput> {
  return (
    typeof action === 'object' &&
    action !== null &&
    'execute' in action &&
    typeof action.execute === 'function'
  )
}

// Hook for handling server actions with forms (compatible with next-safe-action)
export function useFormAction<
  TInput = FormData,
  TOutput = unknown,
  TFormData extends FieldValues = FieldValues,
>(
  action: FormAction<TInput, TOutput>,
  options: UseFormActionOptions<TFormData, TOutput> = {}
) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult<TOutput> | null>(null)

  const {
    form,
    showToast = true,
    successMessage = '성공적으로 처리되었습니다.',
    errorMessage = '처리 중 오류가 발생했습니다.',
    onSuccess,
    onError,
  } = options

  const execute = (formDataOrInput: TInput) => {
    startTransition(async () => {
      try {
        let actionResult: ActionResult<TOutput>

        // Check if action is a next-safe-action (has execute method) or traditional action
        if (isSafeAction(action)) {
          // next-safe-action format
          actionResult = await action.execute(formDataOrInput)
        } else {
          // Traditional server action format
          actionResult = await action(formDataOrInput)
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
                    form.setError(field as keyof TFormData, {
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

          // Handle other error formats
          if (actionResult.error || actionResult.fieldErrors) {
            const result: ActionResult<T> = {
              success: false,
              error: actionResult.error || errorMessage,
              fieldErrors: actionResult.fieldErrors,
            }
            setResult(result)

            // Set field errors if available
            if (form && actionResult.fieldErrors) {
              Object.entries(actionResult.fieldErrors).forEach(
                ([field, errors]) => {
                  if (Array.isArray(errors) && errors[0]) {
                    form.setError(field as keyof TFormData, {
                      type: 'server',
                      message: errors[0],
                    })
                  }
                }
              )
            }

            const message = actionResult.error || errorMessage
            if (showToast) {
              toast.error(message)
            }
            onError?.(message)
            return
          }
        }

        // If we get here, assume success with the result as data
        const result: ActionResult<TOutput> = {
          success: true,
          data: actionResult as TOutput,
        }
        setResult(result)

        if (showToast) {
          toast.success(successMessage)
        }
        onSuccess?.(actionResult as TOutput)
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
export function useOptimisticFormAction<
  TOutput = unknown,
  TFormData extends FieldValues = FieldValues,
>(
  action: ServerAction<FormData, TOutput>,
  optimisticUpdate: (formData: FormData) => TOutput,
  options: UseFormActionOptions<TFormData, TOutput> = {}
) {
  const [optimisticData, setOptimisticData] = useState<TOutput | null>(null)
  const formAction = useFormAction<FormData, TOutput, TFormData>(action, {
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
export function useBatchFormAction<
  TOutput = unknown,
  TFormData extends FieldValues = FieldValues,
>(
  actions: Array<ServerAction<FormData, TOutput>>,
  options: UseFormActionOptions<TFormData, TOutput[]> = {}
) {
  const [isPending, startTransition] = useTransition()
  const [results, setResults] = useState<Array<ActionResult<TOutput>>>([])

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
export function useRetryableFormAction<
  TOutput = unknown,
  TFormData extends FieldValues = FieldValues,
>(
  action: ServerAction<FormData, TOutput>,
  options: UseFormActionOptions<TFormData, TOutput> & {
    maxRetries?: number
    retryDelay?: number
  } = {}
) {
  const { maxRetries = 3, retryDelay = 1000, ...formActionOptions } = options
  const [retryCount, setRetryCount] = useState(0)

  const executeWithRetry = async (
    formData: FormData
  ): Promise<ActionResult<TOutput>> => {
    const attemptExecution = async (
      attempt: number
    ): Promise<ActionResult<TOutput>> => {
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
  }

  const baseFormAction = useFormAction<FormData, TOutput, TFormData>(
    executeWithRetry,
    formActionOptions
  )

  const reset = () => {
    setRetryCount(0)
    baseFormAction.reset()
  }

  return {
    ...baseFormAction,
    retryCount,
    reset,
  }
}

// Export types
export type FormActionHook<
  TInput = FormData,
  TOutput = unknown,
  TFormData extends FieldValues = FieldValues,
> = ReturnType<typeof useFormAction<TInput, TOutput, TFormData>>
export type OptimisticFormActionHook<
  TOutput = unknown,
  TFormData extends FieldValues = FieldValues,
> = ReturnType<typeof useOptimisticFormAction<TOutput, TFormData>>
export type BatchFormActionHook<
  TOutput = unknown,
  TFormData extends FieldValues = FieldValues,
> = ReturnType<typeof useBatchFormAction<TOutput, TFormData>>
export type RetryableFormActionHook<
  TOutput = unknown,
  TFormData extends FieldValues = FieldValues,
> = ReturnType<typeof useRetryableFormAction<TOutput, TFormData>>
