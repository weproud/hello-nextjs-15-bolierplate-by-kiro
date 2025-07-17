'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useFormAction, useFormActionWithRetry } from '../hooks/use-form-action'
import { useApiError, useFetchWithError } from '../hooks/use-api-error'
import { useServerActionError } from '../hooks/use-server-action-error'
import { ErrorBoundary } from './error-boundary'
import { Button } from './ui/button'
import { Card } from './ui/card'

// Mock server action that can fail
async function mockServerAction(shouldFail: boolean = false) {
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay

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

// Mock API call that can fail
async function mockApiCall(shouldFail: boolean = false) {
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay

  if (shouldFail) {
    throw new Error('API call failed')
  }

  return { message: 'API call completed successfully' }
}

// Component that throws an error for testing error boundary
function ErrorThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Component error for testing error boundary')
  }
  return <div className="text-green-600">Component rendered successfully!</div>
}

export function ErrorHandlingExamples() {
  const [showErrorComponent, setShowErrorComponent] = useState(false)

  // Form action with basic error handling
  const formAction = useFormAction(
    async (formData: FormData) => {
      const shouldFail = formData.get('shouldFail') === 'true'
      return mockServerAction(shouldFail)
    },
    {
      showToast: true,
      successMessage: 'Form submitted successfully!',
      onSuccess: data => console.log('Form success:', data),
      onError: error => console.log('Form error:', error),
    }
  )

  // Form action with retry functionality
  const formActionWithRetry = useFormActionWithRetry(
    async (formData: FormData) => {
      const shouldFail = formData.get('shouldFail') === 'true'
      return mockServerAction(shouldFail)
    },
    {
      showToast: true,
      maxRetries: 3,
      successMessage: 'Form submitted successfully with retry!',
    }
  )

  // API error handling
  const apiError = useApiError({
    showToast: true,
    retryAttempts: 2,
    onError: error => console.log('API error:', error),
  })

  // Fetch with error handling
  const fetchError = useFetchWithError({
    showToast: true,
    retryAttempts: 1,
  })

  // Server action error handling
  const serverActionError = useServerActionError({
    showToast: true,
    retryAttempts: 2,
    successMessage: 'Server action completed!',
  })

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Error Handling Examples</h2>

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
          <Button onClick={() => toast.warning('Warning message!')}>
            Warning Toast
          </Button>
        </div>
      </Card>

      {/* Form Action Error Handling */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          Form Action Error Handling
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Basic Form Action</h4>
            <div className="space-x-2">
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
              <div className="mt-2 text-sm">
                Status: {formAction.isSuccess ? 'Success' : 'Error'}
                {formAction.error && (
                  <div className="text-red-600">Error: {formAction.error}</div>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-2">Form Action with Retry</h4>
            <div className="space-x-2">
              <Button
                onClick={() => {
                  const formData = new FormData()
                  formData.set('shouldFail', 'false')
                  formActionWithRetry.execute(formData)
                }}
                disabled={formActionWithRetry.isPending}
              >
                {formActionWithRetry.isPending
                  ? 'Submitting...'
                  : 'Submit Success'}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const formData = new FormData()
                  formData.set('shouldFail', 'true')
                  formActionWithRetry.execute(formData)
                }}
                disabled={formActionWithRetry.isPending}
              >
                {formActionWithRetry.isPending
                  ? 'Submitting...'
                  : 'Submit Failure (Retry)'}
              </Button>
            </div>
            {formActionWithRetry.retryCount > 0 && (
              <div className="mt-2 text-sm text-orange-600">
                Retry attempt: {formActionWithRetry.retryCount}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* API Error Handling */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">API Error Handling</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Generic API Call</h4>
            <div className="space-x-2">
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
              <div className="mt-2 text-sm text-green-600">
                Success: {JSON.stringify(apiError.data)}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-2">Fetch API Call</h4>
            <div className="space-x-2">
              <Button
                onClick={() => fetchError.fetchData('/api/success')}
                disabled={fetchError.isLoading}
              >
                {fetchError.isLoading ? 'Fetching...' : 'Fetch Success'}
              </Button>
              <Button
                variant="destructive"
                onClick={() => fetchError.fetchData('/api/nonexistent')}
                disabled={fetchError.isLoading}
              >
                {fetchError.isLoading ? 'Fetching...' : 'Fetch 404'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Server Action Error Handling */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          Server Action Error Handling
        </h3>
        <div className="space-x-2">
          <Button
            onClick={() =>
              serverActionError.execute(
                () => mockServerAction(false),
                'Server Action'
              )
            }
            disabled={serverActionError.isPending}
          >
            {serverActionError.isPending
              ? 'Processing...'
              : 'Server Action Success'}
          </Button>
          <Button
            variant="destructive"
            onClick={() =>
              serverActionError.execute(
                () => mockServerAction(true),
                'Server Action'
              )
            }
            disabled={serverActionError.isPending}
          >
            {serverActionError.isPending
              ? 'Processing...'
              : 'Server Action Failure'}
          </Button>
        </div>
        {serverActionError.retryCount > 0 && (
          <div className="mt-2 text-sm text-orange-600">
            Retry attempt: {serverActionError.retryCount}
          </div>
        )}
      </Card>

      {/* Error Boundary */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Error Boundary</h3>
        <div className="space-y-4">
          <div className="space-x-2">
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

          <ErrorBoundary context="Example Error Boundary">
            <div className="p-4 border rounded-md">
              <ErrorThrowingComponent shouldThrow={showErrorComponent} />
            </div>
          </ErrorBoundary>
        </div>
      </Card>

      {/* Global Error Simulation */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Global Error Handling</h3>
        <div className="space-x-2">
          <Button
            onClick={() => {
              // Simulate unhandled promise rejection
              Promise.reject(new Error('Unhandled promise rejection'))
            }}
            variant="destructive"
          >
            Trigger Unhandled Promise
          </Button>
          <Button
            onClick={() => {
              // Simulate global error
              setTimeout(() => {
                throw new Error('Global error')
              }, 100)
            }}
            variant="destructive"
          >
            Trigger Global Error
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          These will be caught by the global error handler and show toast
          notifications.
        </p>
      </Card>
    </div>
  )
}
