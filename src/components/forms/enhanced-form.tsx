'use client'

import { ReactNode, useCallback, useEffect } from 'react'
import { UseFormReturn, FieldValues, Path } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FormError, FormErrorList } from '@/components/ui/form-error'
import { useFormAction } from '@/hooks/use-form-action'
import { toast } from 'sonner'

interface EnhancedFormProps<T extends FieldValues> {
  form: UseFormReturn<T>
  onSubmit: (data: T) => void | Promise<void>
  children: ReactNode
  className?: string
  submitText?: string
  isLoading?: boolean
  showToast?: boolean
  successMessage?: string
  errorMessage?: string
  serverAction?: (formData: FormData) => Promise<any>
  resetOnSuccess?: boolean
  validateOnChange?: boolean
  showFieldErrors?: boolean
  showSummaryErrors?: boolean
}

export function EnhancedForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  submitText = '제출',
  isLoading = false,
  showToast = true,
  successMessage = '성공적으로 처리되었습니다.',
  errorMessage = '처리 중 오류가 발생했습니다.',
  serverAction,
  resetOnSuccess = true,
  validateOnChange = true,
  showFieldErrors = true,
  showSummaryErrors = true,
}: EnhancedFormProps<T>) {
  const formAction = serverAction
    ? useFormAction(serverAction, {
        form,
        showToast,
        successMessage,
        errorMessage,
        onSuccess: () => {
          if (resetOnSuccess) {
            form.reset()
          }
        },
      })
    : null

  const handleSubmit = useCallback(
    async (data: T) => {
      try {
        if (serverAction && formAction) {
          // Convert data to FormData for server action
          const formData = new FormData()
          Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (Array.isArray(value)) {
                value.forEach(item => formData.append(key, String(item)))
              } else if (value instanceof Date) {
                formData.append(key, value.toISOString().split('T')[0])
              } else if (typeof value === 'boolean') {
                formData.append(key, value ? 'on' : 'off')
              } else {
                formData.append(key, String(value))
              }
            }
          })
          formAction.execute(formData)
        } else {
          await onSubmit(data)
          if (showToast) {
            toast.success(successMessage)
          }
          if (resetOnSuccess) {
            form.reset()
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : errorMessage
        if (showToast) {
          toast.error(message)
        }
        console.error('Form submission error:', error)
      }
    },
    [
      onSubmit,
      serverAction,
      formAction,
      showToast,
      successMessage,
      errorMessage,
      resetOnSuccess,
      form,
    ]
  )

  // Get form errors for summary display
  const formErrors = Object.values(form.formState.errors)
    .map(error => error?.message)
    .filter(Boolean) as string[]

  const isPending = formAction?.isPending || isLoading

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={className}
        noValidate
      >
        {showSummaryErrors && formErrors.length > 0 && (
          <div className="mb-6 p-4 border border-destructive/20 bg-destructive/5 rounded-md">
            <h3 className="text-sm font-medium text-destructive mb-2">
              다음 오류를 수정해주세요:
            </h3>
            <FormErrorList errors={formErrors} />
          </div>
        )}

        {children}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? '처리 중...' : submitText}
        </Button>
      </form>
    </Form>
  )
}

// Enhanced form field component with better error handling
interface EnhancedFormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>
  name: Path<T>
  label: string
  description?: string
  required?: boolean
  children: (field: any) => ReactNode
  className?: string
  showError?: boolean
}

export function EnhancedFormField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  required = false,
  children,
  className,
  showError = true,
}: EnhancedFormFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>{children(field)}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {showError && <FormMessage />}
          {fieldState.error?.type === 'server' && (
            <FormError
              message={fieldState.error.message}
              type="error"
              className="mt-1"
            />
          )}
        </FormItem>
      )}
    />
  )
}

// Hook for enhanced form validation with real-time feedback
export function useEnhancedFormValidation<T extends z.ZodType>(
  schema: T,
  options?: {
    validateOnChange?: boolean
    validateOnBlur?: boolean
    debounceMs?: number
  }
) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
  } = options || {}

  // Real-time validation function
  const validateField = useCallback(
    async (fieldName: keyof z.infer<T>, value: any) => {
      try {
        // Create partial schema for single field validation
        const partialData = { [fieldName]: value } as Partial<z.infer<T>>
        await schema.partial().parseAsync(partialData)
        return { isValid: true, error: null }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors.find(
            err => err.path.length > 0 && err.path[0] === fieldName
          )
          return {
            isValid: false,
            error: fieldError?.message || 'Invalid value',
          }
        }
        return { isValid: false, error: 'Validation error' }
      }
    },
    [schema]
  )

  // Debounced validation
  const debouncedValidate = useCallback(
    (
      fieldName: keyof z.infer<T>,
      value: any,
      callback: (result: any) => void
    ) => {
      const timeoutId = setTimeout(async () => {
        const result = await validateField(fieldName, value)
        callback(result)
      }, debounceMs)

      return () => clearTimeout(timeoutId)
    },
    [validateField, debounceMs]
  )

  return {
    validateField,
    debouncedValidate,
    schema,
  }
}
