'use client'

import { ReactNode, useCallback, useEffect, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { useFormAction } from '@/hooks/use-form-action'
import { toast } from 'sonner'

interface AdvancedFormProps<T extends FieldValues> {
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
  autoSave?: boolean
  autoSaveDelay?: number
  onAutoSave?: (data: T) => void | Promise<void>
}

export function AdvancedForm<T extends FieldValues>({
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
  autoSave = false,
  autoSaveDelay = 2000,
  onAutoSave,
}: AdvancedFormProps<T>) {
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')

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

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onAutoSave) return

    const subscription = form.watch(data => {
      const timeoutId = setTimeout(async () => {
        if (form.formState.isValid && form.formState.isDirty) {
          setAutoSaveStatus('saving')
          try {
            await onAutoSave(data as T)
            setAutoSaveStatus('saved')
            setTimeout(() => setAutoSaveStatus('idle'), 2000)
          } catch (error) {
            setAutoSaveStatus('error')
            setTimeout(() => setAutoSaveStatus('idle'), 3000)
          }
        }
      }, autoSaveDelay)

      return () => clearTimeout(timeoutId)
    })

    return () => subscription.unsubscribe()
  }, [form, autoSave, onAutoSave, autoSaveDelay])

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
              } else if (typeof value === 'object') {
                // Handle nested objects
                Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                  if (nestedValue !== undefined && nestedValue !== null) {
                    formData.append(`${key}.${nestedKey}`, String(nestedValue))
                  }
                })
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

  // Auto-save status indicator
  const AutoSaveIndicator = () => {
    if (!autoSave) return null

    const statusMessages = {
      idle: '',
      saving: '저장 중...',
      saved: '자동 저장됨',
      error: '저장 실패',
    }

    const statusColors = {
      idle: '',
      saving: 'text-blue-600',
      saved: 'text-green-600',
      error: 'text-red-600',
    }

    if (autoSaveStatus === 'idle') return null

    return (
      <div className={`text-xs ${statusColors[autoSaveStatus]} mb-2`}>
        {statusMessages[autoSaveStatus]}
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={className}
        noValidate
      >
        <AutoSaveIndicator />

        {showSummaryErrors && formErrors.length > 0 && (
          <div className="mb-6 p-4 border border-destructive/20 bg-destructive/5 rounded-md">
            <h3 className="text-sm font-medium text-destructive mb-2">
              다음 오류를 수정해주세요:
            </h3>
            <FormErrorList errors={formErrors} />
          </div>
        )}

        {children}

        <div className="flex gap-4 pt-4">
          {form.formState.isDirty && (
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isPending}
            >
              초기화
            </Button>
          )}
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? '처리 중...' : submitText}
          </Button>
        </div>
      </form>
    </Form>
  )
}

// Enhanced form field with real-time validation
interface AdvancedFormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>
  name: Path<T>
  label: string
  description?: string
  required?: boolean
  children: (field: any) => ReactNode
  className?: string
  showError?: boolean
  validateOnBlur?: boolean
  validateOnChange?: boolean
  debounceMs?: number
}

export function AdvancedFormField<T extends FieldValues>({
  form,
  name,
  label,
  description,
  required = false,
  children,
  className,
  showError = true,
  validateOnBlur = true,
  validateOnChange = false,
  debounceMs = 300,
}: AdvancedFormFieldProps<T>) {
  const [isValidating, setIsValidating] = useState(false)

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
            {isValidating && (
              <span className="text-xs text-muted-foreground ml-2">
                (검증 중...)
              </span>
            )}
          </FormLabel>
          <FormControl>
            {children({
              ...field,
              onBlur: (e: any) => {
                field.onBlur(e)
                if (validateOnBlur) {
                  setIsValidating(true)
                  setTimeout(() => setIsValidating(false), 500)
                }
              },
              onChange: (e: any) => {
                field.onChange(e)
                if (validateOnChange) {
                  setIsValidating(true)
                  setTimeout(() => setIsValidating(false), debounceMs)
                }
              },
            })}
          </FormControl>
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

// Form validation status component
interface FormValidationStatusProps {
  form: UseFormReturn<any>
  showProgress?: boolean
}

export function FormValidationStatus({
  form,
  showProgress = true,
}: FormValidationStatusProps) {
  const { formState } = form
  const totalFields = Object.keys(form.getValues()).length
  const validFields = totalFields - Object.keys(formState.errors).length
  const progress = totalFields > 0 ? (validFields / totalFields) * 100 : 0

  return (
    <div className="mb-4 p-3 bg-muted/50 rounded-md">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">폼 검증 상태</span>
        <span
          className={formState.isValid ? 'text-green-600' : 'text-orange-600'}
        >
          {validFields}/{totalFields} 필드 완료
        </span>
      </div>

      {showProgress && (
        <div className="mt-2">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                formState.isValid ? 'bg-green-500' : 'bg-orange-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {formState.isDirty && !formState.isValid && (
        <div className="mt-2 text-xs text-muted-foreground">
          {Object.keys(formState.errors).length}개의 오류를 수정해주세요.
        </div>
      )}
    </div>
  )
}

// Conditional form field component
interface ConditionalFormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>
  condition: (values: T) => boolean
  children: ReactNode
}

export function ConditionalFormField<T extends FieldValues>({
  form,
  condition,
  children,
}: ConditionalFormFieldProps<T>) {
  const values = form.watch()
  const shouldShow = condition(values as T)

  if (!shouldShow) return null

  return <>{children}</>
}

// Form section component for better organization
interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  collapsible?: boolean
  defaultExpanded?: boolean
}

export function FormSection({
  title,
  description,
  children,
  className,
  collapsible = false,
  defaultExpanded = true,
}: FormSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <div
        className={`flex items-center justify-between mb-4 ${
          collapsible ? 'cursor-pointer' : ''
        }`}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {collapsible && (
          <Button variant="ghost" size="sm">
            {isExpanded ? '접기' : '펼치기'}
          </Button>
        )}
      </div>

      {(!collapsible || isExpanded) && (
        <div className="space-y-4">{children}</div>
      )}
    </div>
  )
}
