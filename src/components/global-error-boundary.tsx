'use client'

import React from 'react'
import { ErrorBoundary } from './error/error-boundary'
import type { AppError } from '@/types/common'

interface GlobalErrorBoundaryProps {
  children: React.ReactNode
}

const GlobalErrorFallback: React.FC<{
  error: AppError
  resetError: () => void
}> = ({ error, resetError }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
          <svg
            className="h-10 w-10 text-red-600 dark:text-red-400"
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

        <h1 className="text-2xl font-bold text-foreground mb-4">
          Application Error
        </h1>

        <p className="text-muted-foreground mb-8">
          The application encountered an unexpected error. We apologize for the
          inconvenience.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-muted rounded-lg text-left">
            <h3 className="font-semibold text-sm mb-3">Development Info:</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Error Code:</span> {error.code}
              </div>
              <div>
                <span className="font-medium">Message:</span> {error.message}
              </div>
              <div>
                <span className="font-medium">Timestamp:</span>{' '}
                {error.timestamp.toLocaleString()}
              </div>
              {error.details && (
                <details className="mt-3">
                  <summary className="cursor-pointer font-medium">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-xs bg-background p-3 rounded border overflow-auto">
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                </details>
              )}
              {error.stack && (
                <details className="mt-3">
                  <summary className="cursor-pointer font-medium">
                    Stack Trace
                  </summary>
                  <pre className="mt-2 text-xs bg-background p-3 rounded border overflow-auto whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={resetError}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors font-medium"
          >
            Go Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 border border-border rounded-md hover:bg-accent transition-colors font-medium"
          >
            Reload App
          </button>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>
            If this problem persists, please contact support with error code:{' '}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">
              {error.code}
            </code>
          </p>
        </div>
      </div>
    </div>
  )
}

export const GlobalErrorBoundary: React.FC<GlobalErrorBoundaryProps> = ({
  children,
}) => {
  return (
    <ErrorBoundary
      fallback={GlobalErrorFallback}
      context="Global"
      onError={(error: AppError) => {
        // Global error reporting could go here
        console.error('Global application error:', error)

        // In production, you might want to send this to an error reporting service
        if (process.env.NODE_ENV === 'production') {
          // Example: Send to error reporting service
          // errorReportingService.captureError(error)
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
