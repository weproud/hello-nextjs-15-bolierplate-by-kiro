'use client'

import React from 'react'
import { ErrorBoundary } from './error-boundary'
import type { AppError } from '@/types/common'

interface ComponentErrorBoundaryProps {
  children: React.ReactNode
  componentName?: string
  fallbackMessage?: string
  showRetry?: boolean
}

const ComponentErrorFallback: React.FC<{
  error: AppError
  resetError: () => void
  componentName?: string
  fallbackMessage?: string
  showRetry?: boolean
}> = ({
  error,
  resetError,
  componentName,
  fallbackMessage,
  showRetry = true,
}) => {
  return (
    <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-destructive">
            {componentName ? `${componentName} Error` : 'Component Error'}
          </h4>

          <p className="mt-1 text-sm text-muted-foreground">
            {fallbackMessage || 'This component failed to render properly.'}
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Debug Info
              </summary>
              <div className="mt-1 text-xs">
                <p>
                  <strong>Code:</strong> {error.code}
                </p>
                <p>
                  <strong>Message:</strong> {error.message}
                </p>
                {error.details && (
                  <pre className="mt-1 bg-muted p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                )}
              </div>
            </details>
          )}

          {showRetry && (
            <button
              onClick={resetError}
              className="mt-2 text-xs px-2 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export const ComponentErrorBoundary: React.FC<ComponentErrorBoundaryProps> = ({
  children,
  componentName,
  fallbackMessage,
  showRetry = true,
}) => {
  return (
    <ErrorBoundary
      fallback={props => (
        <ComponentErrorFallback
          {...props}
          componentName={componentName}
          fallbackMessage={fallbackMessage}
          showRetry={showRetry}
        />
      )}
      context={componentName ? `Component: ${componentName}` : 'Component'}
    >
      {children}
    </ErrorBoundary>
  )
}
