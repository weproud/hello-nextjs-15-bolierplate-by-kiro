'use client'

import React from 'react'
import { ErrorBoundary } from './error-boundary'
import type { AppError } from '@/types/common'

interface PageErrorBoundaryProps {
  children: React.ReactNode
  pageName?: string
}

const PageErrorFallback: React.FC<{
  error: AppError
  resetError: () => void
}> = ({ error, resetError }) => {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <svg
            className="h-8 w-8 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-2">
          Page Error
        </h2>

        <p className="text-muted-foreground mb-6">
          This page encountered an error and couldn't load properly.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-muted rounded-lg text-left">
            <h4 className="font-medium text-sm mb-2">Error Details:</h4>
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Code:</strong> {error.code}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Message:</strong> {error.message}
            </p>
            {error.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">
                  Additional Details
                </summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(error.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={resetError}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}

export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
  children,
  pageName,
}) => {
  return (
    <ErrorBoundary
      fallback={PageErrorFallback}
      context={pageName ? `Page: ${pageName}` : 'Page'}
      onError={error => {
        // Additional page-specific error handling
        console.error(`Page error in ${pageName || 'unknown page'}:`, error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
