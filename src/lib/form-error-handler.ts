'use client'

import { toast } from 'sonner'
import { type UseFormReturn } from 'react-hook-form'

interface FormErrorOptions {
  showToast?: boolean
  toastMessage?: string
}

// Handle form validation errors with toast notifications
export function handleFormErrors(
  form: UseFormReturn<any>,
  fieldErrors: Record<string, string[]>,
  options: FormErrorOptions = {}
) {
  const { showToast = true, toastMessage } = options

  // Set field errors on the form
  Object.entries(fieldErrors).forEach(([field, errors]) => {
    if (errors[0]) {
      form.setError(field as any, {
        type: 'server',
        message: errors[0],
      })
    }
  })

  // Show toast notification if enabled
  if (showToast) {
    const message = toastMessage || getFormErrorMessage(fieldErrors)
    toast.error(message)
  }
}

// Generate user-friendly error message from field errors
function getFormErrorMessage(fieldErrors: Record<string, string[]>): string {
  const errorCount = Object.keys(fieldErrors).length

  if (errorCount === 1) {
    const firstEntry = Object.entries(fieldErrors)[0]
    if (firstEntry) {
      const [field, errors] = firstEntry
      return `${field}: ${errors[0]}`
    }
    return 'Validation error occurred'
  }

  if (errorCount <= 3) {
    return Object.entries(fieldErrors)
      .map(([field, errors]) => `${field}: ${errors[0]}`)
      .join(', ')
  }

  return `Please fix ${errorCount} validation errors`
}

// Clear form errors and reset error state
export function clearFormErrors(form: UseFormReturn<any>) {
  form.clearErrors()
}

// Handle successful form submission
export function handleFormSuccess<T>(
  data: T,
  options: {
    showToast?: boolean
    successMessage?: string
    onSuccess?: (data: T) => void
    form?: UseFormReturn<any>
  } = {}
) {
  const {
    showToast = true,
    successMessage = 'Form submitted successfully',
    onSuccess,
    form,
  } = options

  // Clear form errors
  if (form) {
    clearFormErrors(form)
  }

  // Show success toast
  if (showToast) {
    toast.success(successMessage)
  }

  // Call success callback
  if (onSuccess) {
    onSuccess(data)
  }
}

// Comprehensive form submission handler
export async function handleFormSubmission<T>(
  form: UseFormReturn<any>,
  submitAction: () => Promise<{
    success: boolean
    data?: T
    error?: string
    fieldErrors?: Record<string, string[]>
  }>,
  options: {
    showToast?: boolean
    successMessage?: string
    errorMessage?: string
    onSuccess?: (data: T) => void
    onError?: (error: string) => void
  } = {}
) {
  const {
    showToast = true,
    successMessage = 'Form submitted successfully',
    errorMessage = 'Form submission failed',
    onSuccess,
    onError,
  } = options

  try {
    const result = await submitAction()

    if (result.success) {
      if (result.data) {
        handleFormSuccess(result.data, {
          showToast,
          successMessage,
          onSuccess,
          form,
        })
      }
      return result
    } else {
      // Handle field errors
      if (result.fieldErrors) {
        handleFormErrors(form, result.fieldErrors, {
          showToast,
          toastMessage: result.error || errorMessage,
        })
      } else if (showToast) {
        toast.error(result.error || errorMessage)
      }

      if (onError) {
        onError(result.error || errorMessage)
      }

      return result
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : errorMessage

    if (showToast) {
      toast.error(errorMsg)
    }

    if (onError) {
      onError(errorMsg)
    }

    return {
      success: false,
      error: errorMsg,
    }
  }
}
