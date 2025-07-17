'use client'

import React, { useState } from 'react'
import { ComponentErrorBoundary } from './component-error-boundary'
import { PageErrorBoundary } from './page-error-boundary'
import { useErrorBoundary } from '@/hooks/use-error-boundary'
import { createAppError, ERROR_CODES } from '@/lib/error-handling'

// Component that throws an error
const ErrorThrowingComponent: React.FC<{ shouldError: boolean }> = ({
  shouldError,
}) => {
  if (shouldError) {
    throw createAppError(
      ERROR_CODES.INTERNAL_ERROR,
      'This is a test error from a component'
    )
  }

  return (
    <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
      <p className="text-green-800 dark:text-green-200">
        Component rendered successfully!
      </p>
    </div>
  )
}

// Component that uses the error boundary hook
const HookErrorComponent: React.FC = () => {
  const { captureError, safeExecute } = useErrorBoundary({
    context: 'HookErrorComponent',
  })

  const handleAsyncError = async () => {
    await safeExecute(async () => {
      // Simulate an async operation that fails
      await new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Async operation failed')), 1000)
      )
    })
  }

  const handleSyncError = () => {
    try {
      throw createAppError(
        ERROR_CODES.VALIDATION_ERROR,
        'Manual error triggered'
      )
    } catch (error) {
      captureError(error)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Error Boundary Hook Example</h3>
      <div className="flex gap-2">
        <button
          onClick={handleSyncError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Trigger Sync Error
        </button>
        <button
          onClick={handleAsyncError}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Trigger Async Error
        </button>
      </div>
    </div>
  )
}

// Main example component
export const ErrorBoundaryExamples: React.FC = () => {
  const [componentError, setComponentError] = useState(false)
  const [pageError, setPageError] = useState(false)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Error Boundary Examples</h1>

      {/* Component Error Boundary Example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Component Error Boundary</h2>
        <p className="text-muted-foreground">
          This demonstrates how individual components can be wrapped with error
          boundaries to prevent the entire page from crashing.
        </p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setComponentError(!componentError)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {componentError ? 'Fix Component' : 'Break Component'}
          </button>
        </div>

        <ComponentErrorBoundary
          componentName="TestComponent"
          fallbackMessage="The test component failed to render."
        >
          <ErrorThrowingComponent shouldError={componentError} />
        </ComponentErrorBoundary>
      </section>

      {/* Page Error Boundary Example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Page Error Boundary</h2>
        <p className="text-muted-foreground">
          This demonstrates how page-level errors are handled with a more
          comprehensive error display.
        </p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setPageError(!pageError)}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            {pageError ? 'Fix Page Section' : 'Break Page Section'}
          </button>
        </div>

        <PageErrorBoundary pageName="ExamplePage">
          <div className="p-4 border rounded-lg">
            <ErrorThrowingComponent shouldError={pageError} />
          </div>
        </PageErrorBoundary>
      </section>

      {/* Hook Example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Error Boundary Hook</h2>
        <p className="text-muted-foreground">
          This demonstrates how to use the useErrorBoundary hook to handle
          errors programmatically.
        </p>

        <ComponentErrorBoundary componentName="HookErrorComponent">
          <HookErrorComponent />
        </ComponentErrorBoundary>
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Best Practices</h2>
        <div className="bg-muted p-4 rounded-lg">
          <ul className="space-y-2 text-sm">
            <li>• Use ComponentErrorBoundary for individual UI components</li>
            <li>• Use PageErrorBoundary for page-level error handling</li>
            <li>
              • GlobalErrorBoundary is automatically applied at the app level
            </li>
            <li>
              • Use the useErrorBoundary hook for programmatic error handling
            </li>
            <li>• Error details are only shown in development mode</li>
            <li>• All errors are automatically logged with context</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
