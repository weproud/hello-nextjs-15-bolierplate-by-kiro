'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useFormAction } from '../hooks/use-form-action'
import { useApiError } from '../hooks/use-api-error'
import { ErrorBoundary } from './error-boundary'
import { Button } from './ui/button'
import { Card } from './ui/card'

// Mock server action for testing
async function mockServerAction(shouldFail: boolean = false) {
  await new Promise(resolve => setTimeout(resolve, 1000))

  if (shouldFail) {
    return {
      success: false,
      error: 'Server action failed',
      fieldErrors: { email: ['Invalid email format'] },
    }
  }

  return {
    success: true,
    data: { message: 'Server action completed successfully' },
  }
}

// Mock API call for testing
async function mockApiCall(shouldFail: boolean = false) {
  await new Promise(resolve => setTimeout(resolve, 1000))

  if (shouldFail) {
    throw new Error('API call failed')
  }

  return { message: 'API call completed successfully' }
}

// Component that throws an error for testing error boundary
function ErrorComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Component error for testing')
  }
  return <div className="text-green-600">Component rendered successfully!</div>
}

export function TestClientErrorHandling() {
  const [showErrorComponent, setShowErrorComponent] = useState(false)

  // Form action with error handling
  const formAction = useFormAction(
    async (formData: FormData) => {
      const shouldFail = formData.get('shouldFail') === 'true'
      return mockServerAction(shouldFail)
    },
    {
      showToast: true,
      successMessage: 'Form submitted successfully!',
    }
  )

  // API error handling
  const apiError = useApiError({
    showToast: true,
    retryAttempts: 1,
  })

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold">Client-Side Error Handling Test</h2>

      {/* Toast Notifications */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Toast Notifications</h3>
        <div className="space-x-2">
          <Button onClick={() => toast.success('Success message!')}>
            Success Toast
          </Button>
          <Button onClick={() => toast.error('Error message!')}>
            Error Toast
          </Button>
          <Button onClick={() => toast.info('Info message!')}>
            Info Toast
          </Button>
        </div>
      </Card>

      {/* Form Action Error Handling */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          Form Action Error Handling
        </h3>
        <div className="space-x-2 mb-4">
          <Button
            onClick={() => {
              const formData = new FormData()
              formData.set('shouldFail', 'false')
              formAction.execute(formData)
            }}
            disabled={formAction.isPending}
          >
            {formAction.isPending ? 'Submitting...' : 'Submit Success'}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              const formData = new FormData()
              formData.set('shouldFail', 'true')
              formAction.execute(formData)
            }}
            disabled={formAction.isPending}
          >
            {formAction.isPending ? 'Submitting...' : 'Submit Failure'}
          </Button>
        </div>
        {formAction.result && (
          <div className="text-sm">
            Status: {formAction.isSuccess ? 'Success' : 'Error'}
            {formAction.error && (
              <div className="text-red-600">Error: {formAction.error}</div>
            )}
          </div>
        )}
      </Card>

      {/* API Error Handling */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">API Error Handling</h3>
        <div className="space-x-2 mb-4">
          <Button
            onClick={() =>
              apiError.execute(() => mockApiCall(false), 'Success API Call')
            }
            disabled={apiError.isLoading}
          >
            {apiError.isLoading ? 'Loading...' : 'API Success'}
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              apiError.execute(() => mockApiCall(true), 'Failed API Call')
            }
            disabled={apiError.isLoading}
          >
            {apiError.isLoading ? 'Loading...' : 'API Failure'}
          </Button>
        </div>
        {apiError.data && (
          <div className="text-sm text-green-600">
            Success: {JSON.stringify(apiError.data)}
          </div>
        )}
      </Card>

      {/* Error Boundary */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Error Boundary</h3>
        <div className="space-x-2 mb-4">
          <Button
            onClick={() => setShowErrorComponent(false)}
            variant={!showErrorComponent ? 'default' : 'outline'}
          >
            Show Normal Component
          </Button>
          <Button
            onClick={() => setShowErrorComponent(true)}
            variant={showErrorComponent ? 'destructive' : 'outline'}
          >
            Trigger Error Boundary
          </Button>
        </div>

        <ErrorBoundary context="Test Error Boundary">
          <div className="p-4 border rounded-md">
            <ErrorComponent shouldThrow={showErrorComponent} />
          </div>
        </ErrorBoundary>
      </Card>

      {/* Global Error Simulation */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Global Error Handling</h3>
        <div className="space-x-2 mb-4">
          <Button
            onClick={() => {
              Promise.reject(new Error('Unhandled promise rejection'))
            }}
            variant="destructive"
          >
            Trigger Unhandled Promise
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          This will be caught by the global error handler and show a toast
          notification.
        </p>
      </Card>
    </div>
  )
}
