'use client'

import { toast } from 'sonner'
import { handleError, logError } from './error-handling'

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandling() {
  // Handle unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', event => {
      const error = handleError(event.reason)
      logError(error, 'Unhandled Promise Rejection')

      // Show user-friendly error message
      toast.error('Something went wrong. Please try again.')

      // Prevent the default browser error handling
      event.preventDefault()
    })

    // Handle general JavaScript errors
    window.addEventListener('error', event => {
      const error = handleError(event.error || new Error(event.message))
      logError(error, 'Global Error')

      // Show user-friendly error message for critical errors
      if (event.error && !event.error.handled) {
        toast.error('An unexpected error occurred. Please refresh the page.')
      }
    })
  }
}

// Error boundary fallback component error handler
export function handleErrorBoundaryError(
  error: Error,
  errorInfo: { componentStack: string }
) {
  const appError = handleError(error)
  logError(appError, 'Error Boundary')

  // Show user-friendly error message
  toast.error('Something went wrong. The page will reload automatically.')

  // Optional: Auto-reload after a delay
  setTimeout(() => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }, 3000)
}

// Network error handler
export function handleNetworkError(error: unknown) {
  const appError = handleError(error)
  logError(appError, 'Network Error')

  // Check if it's a network connectivity issue
  if (!navigator.onLine) {
    toast.error('No internet connection. Please check your network.')
    return
  }

  // Generic network error
  toast.error('Network error. Please try again.')
}

// Authentication error handler
export function handleAuthError(error: unknown) {
  const appError = handleError(error)
  logError(appError, 'Authentication Error')

  toast.error('Authentication failed. Please sign in again.')

  // Redirect to sign-in page after a delay
  setTimeout(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signin'
    }
  }, 2000)
}

// Validation error handler
export function handleValidationError(fieldErrors: Record<string, string[]>) {
  const errorMessages = Object.entries(fieldErrors)
    .map(([field, errors]) => `${field}: ${errors[0]}`)
    .join(', ')

  toast.error(`Validation failed: ${errorMessages}`)
}

// Generic user-friendly error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'You need to sign in to access this feature.',
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: 'The requested resource was not found.',
  TIMEOUT: 'Request timed out. Please try again.',
  GENERIC: 'Something went wrong. Please try again.',
} as const

// Helper function to get user-friendly error message
export function getUserFriendlyErrorMessage(error: unknown): string {
  const appError = handleError(error)

  switch (appError.code) {
    case 'UNAUTHORIZED':
      return ERROR_MESSAGES.UNAUTHORIZED
    case 'FORBIDDEN':
      return ERROR_MESSAGES.FORBIDDEN
    case 'NOT_FOUND':
      return ERROR_MESSAGES.NOT_FOUND
    case 'VALIDATION_ERROR':
      return ERROR_MESSAGES.VALIDATION_ERROR
    case 'DATABASE_ERROR':
    case 'INTERNAL_ERROR':
      return ERROR_MESSAGES.SERVER_ERROR
    default:
      // Check if it's a network error
      if (
        appError.message.toLowerCase().includes('network') ||
        appError.message.toLowerCase().includes('fetch')
      ) {
        return ERROR_MESSAGES.NETWORK_ERROR
      }
      return ERROR_MESSAGES.GENERIC
  }
}
