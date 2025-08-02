'use client'

import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormErrorProps {
  message?: string
  type?: 'error' | 'warning' | 'info' | 'success'
  className?: string
}

export function FormError({
  message,
  type = 'error',
  className,
}: FormErrorProps) {
  if (!message) return null

  const icons = {
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle2,
  }

  const Icon = icons[type]

  const variants = {
    error: 'text-destructive',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm font-medium',
        variants[type],
        className
      )}
    >
      <Icon className='h-4 w-4 shrink-0' />
      <span>{message}</span>
    </div>
  )
}

interface FormErrorListProps {
  errors: string[]
  type?: 'error' | 'warning' | 'info' | 'success'
  className?: string
}

export function FormErrorList({
  errors,
  type = 'error',
  className,
}: FormErrorListProps) {
  if (!errors.length) return null

  return (
    <div className={cn('space-y-1', className)}>
      {errors.map((error, index) => (
        <FormError key={index} message={error} type={type} />
      ))}
    </div>
  )
}

interface FormFieldErrorProps {
  error?: {
    message?: string
    type?: string
  }
  className?: string
}

export function FormFieldError({ error, className }: FormFieldErrorProps) {
  if (!error?.message) return null

  return (
    <FormError
      message={error.message}
      type={error.type === 'server' ? 'error' : 'error'}
      className={className}
    />
  )
}

// Enhanced form error summary component
interface FormErrorSummaryProps {
  errors: Record<string, string[]>
  title?: string
  className?: string
  showFieldNames?: boolean
  maxErrors?: number
}

export function FormErrorSummary({
  errors,
  title = '다음 오류를 수정해주세요:',
  className,
  showFieldNames = false,
  maxErrors = 10,
}: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors)
  const displayErrors = errorEntries.slice(0, maxErrors)
  const hasMoreErrors = errorEntries.length > maxErrors

  if (errorEntries.length === 0) return null

  return (
    <div
      className={cn(
        'p-4 border border-destructive/20 bg-destructive/5 rounded-md',
        className
      )}
    >
      <div className='flex items-center gap-2 mb-3'>
        <AlertCircle className='h-5 w-5 text-destructive' />
        <h3 className='text-sm font-medium text-destructive'>{title}</h3>
      </div>

      <div className='space-y-1'>
        {displayErrors.map(([field, messages]) => (
          <div key={field} className='text-sm text-destructive'>
            {showFieldNames && <span className='font-medium'>{field}: </span>}
            {messages[0]}
          </div>
        ))}

        {hasMoreErrors && (
          <div className='text-sm text-muted-foreground mt-2'>
            그 외 {errorEntries.length - maxErrors}개의 오류가 더 있습니다.
          </div>
        )}
      </div>
    </div>
  )
}

// Inline field validation indicator
interface FieldValidationIndicatorProps {
  isValid?: boolean
  isValidating?: boolean
  error?: string
  className?: string
}

export function FieldValidationIndicator({
  isValid,
  isValidating,
  error,
  className,
}: FieldValidationIndicatorProps) {
  if (isValidating) {
    return (
      <div
        className={cn(
          'flex items-center gap-1 text-xs text-muted-foreground',
          className
        )}
      >
        <div className='animate-spin h-3 w-3 border border-current border-t-transparent rounded-full' />
        <span>검증 중...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center gap-1 text-xs text-destructive',
          className
        )}
      >
        <AlertCircle className='h-3 w-3' />
        <span>{error}</span>
      </div>
    )
  }

  if (isValid) {
    return (
      <div
        className={cn(
          'flex items-center gap-1 text-xs text-green-600',
          className
        )}
      >
        <CheckCircle2 className='h-3 w-3' />
        <span>유효함</span>
      </div>
    )
  }

  return null
}

// Form progress indicator
interface FormProgressProps {
  totalFields: number
  validFields: number
  className?: string
  showPercentage?: boolean
  showText?: boolean
}

export function FormProgress({
  totalFields,
  validFields,
  className,
  showPercentage = true,
  showText = true,
}: FormProgressProps) {
  const percentage = totalFields > 0 ? (validFields / totalFields) * 100 : 0
  const isComplete = validFields === totalFields

  return (
    <div className={cn('space-y-2', className)}>
      {showText && (
        <div className='flex items-center justify-between text-sm'>
          <span className='font-medium'>폼 완성도</span>
          <span
            className={isComplete ? 'text-green-600' : 'text-muted-foreground'}
          >
            {validFields}/{totalFields} 필드
            {showPercentage && ` (${Math.round(percentage)}%)`}
          </span>
        </div>
      )}

      <div className='w-full bg-muted rounded-full h-2'>
        <div
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            isComplete ? 'bg-green-500' : 'bg-primary'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
