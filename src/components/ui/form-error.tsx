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
      <Icon className="h-4 w-4 shrink-0" />
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
