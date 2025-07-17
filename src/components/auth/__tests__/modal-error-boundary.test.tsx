/**
 * @fileoverview Unit tests for Modal Error Boundary component
 * Tests error catching, fallback rendering, and recovery mechanisms
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModalErrorBoundary } from '../modal-error-boundary'

// Mock error component that throws
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Mock fallback component
const ErrorFallback = ({
  error,
  resetError,
}: {
  error: Error
  resetError: () => void
}) => (
  <div data-testid="error-fallback">
    <div>Error: {error.message}</div>
    <button onClick={resetError}>Try Again</button>
  </div>
)

describe('ModalErrorBoundary', () => {
  const user = userEvent.setup()
  const mockOnError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Suppress console.error for error boundary tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('Error Catching', () => {
    it('should catch errors from child components', () => {
      render(
        <ModalErrorBoundary fallback={ErrorFallback} onError={mockOnError}>
          <ThrowError shouldThrow={true} />
        </ModalErrorBoundary>
      )

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument()
      expect(screen.getByText('Error: Test error')).toBeInTheDocument()
      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error))
    })

    it('should render children normally when no error occurs', () => {
      render(
        <ModalErrorBoundary fallback={ErrorFallback} onError={mockOnError}>
          <ThrowError shouldThrow={false} />
        </ModalErrorBoundary>
      )

      expect(screen.getByText('No error')).toBeInTheDocument()
      expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument()
      expect(mockOnError).not.toHaveBeenCalled()
    })

    it('should catch async errors', async () => {
      const AsyncErrorComponent = () => {
        const [shouldThrow, setShouldThrow] = React.useState(false)

        React.useEffect(() => {
          if (shouldThrow) {
            throw new Error('Async error')
          }
        }, [shouldThrow])

        return (
          <button onClick={() => setShouldThrow(true)}>
            Trigger Async Error
          </button>
        )
      }

      render(
        <ModalErrorBoundary fallback={ErrorFallback} onError={mockOnError}>
          <AsyncErrorComponent />
        </ModalErrorBoundary>
      )

      const button = screen.getByRole('button', {
        name: /trigger async error/i,
      })
      await user.click(button)

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument()
      expect(mockOnError).toHaveBeenCalled()
    })
  })

  describe('Fallback Rendering', () => {
    it('should render custom fallback component', () => {
      const CustomFallback = ({ error }: { error: Error }) => (
        <div data-testid="custom-fallback">Custom error: {error.message}</div>
      )

      render(
        <ModalErrorBoundary fallback={CustomFallback} onError={mockOnError}>
          <ThrowError shouldThrow={true} />
        </ModalErrorBoundary>
      )

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument()
      expect(screen.getByText('Custom error: Test error')).toBeInTheDocument()
    })

    it('should provide error details to fallback component', () => {
      render(
        <ModalErrorBoundary fallback={ErrorFallback} onError={mockOnError}>
          <ThrowError shouldThrow={true} />
        </ModalErrorBoundary>
      )

      expect(screen.getByText('Error: Test error')).toBeInTheDocument()
    })

    it('should render default fallback when no custom fallback provided', () => {
      render(
        <ModalErrorBoundary onError={mockOnError}>
          <ThrowError shouldThrow={true} />
        </ModalErrorBoundary>
      )

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
  })

  describe('Error Recovery', () => {
    it('should allow error recovery through resetError', async () => {
      const RecoverableComponent = ({
        shouldThrow,
      }: {
        shouldThrow: boolean
      }) => {
        if (shouldThrow) {
          throw new Error('Recoverable error')
        }
        return <div>Component recovered</div>
      }

      const { rerender } = render(
        <ModalErrorBoundary fallback={ErrorFallback} onError={mockOnError}>
          <RecoverableComponent shouldThrow={true} />
        </ModalErrorBoundary>
      )

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument()

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      await user.click(tryAgainButton)

      // Rerender with no error
      rerender(
        <ModalErrorBoundary fallback={ErrorFallback} onError={mockOnError}>
          <RecoverableComponent shouldThrow={false} />
        </ModalErrorBoundary>
      )

      expect(screen.getByText('Component recovered')).toBeInTheDocument()
      expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument()
    })

    it('should reset error state when children change', () => {
      const { rerender } = render(
        <ModalErrorBoundary fallback={ErrorFallback} onError={mockOnError}>
          <ThrowError shouldThrow={true} />
        </ModalErrorBoundary>
      )

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument()

      // Rerender with different children
      rerender(
        <ModalErrorBoundary fallback={ErrorFallback} onError={mockOnError}>
          <div>New content</div>
        </ModalErrorBoundary>
      )

      expect(screen.getByText('New content')).toBeInTheDocument()
      expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument()
    })
  })

  describe('Modal-Specific Error Handling', () => {
    it('should handle modal rendering errors', () => {
      const ModalComponent = () => {
        throw new Error('Modal failed to render')
      }

      render(
        <ModalErrorBoundary fallback={ErrorFallback} onError={mockOnError}>
          <ModalComponent />
        </ModalErrorBoundary>
      )

      expect(
        screen.getByText('Error: Modal failed to render')
      ).toBeInTheDocument()
      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Modal failed to render',
        })
      )
    })

    it('should handle authentication errors in modal context', () => {
      const AuthComponent = () => {
        throw new Error('Authentication failed')
      }

      render(
        <ModalErrorBoundary fallback={ErrorFallback} onError={mockOnError}>
          <AuthComponent />
        </ModalErrorBoundary>
      )

      expect(
        screen.getByText('Error: Authentication failed')
      ).toBeInTheDocument()
    })

    it('should provide modal-specific error recovery options', async () => {
      const ModalFallback = ({
        error,
        resetError,
      }: {
        error: Error
        resetError: () => void
      }) => (
        <div data-testid="modal-error-fallback">
          <div>Modal Error: {error.message}</div>
          <button onClick={resetError}>Retry Modal</button>
          <button onClick={() => (window.location.href = '/auth/signin')}>
            Go to Full Page
          </button>
        </div>
      )

      render(
        <ModalErrorBoundary fallback={ModalFallback} onError={mockOnError}>
          <ThrowError shouldThrow={true} />
        </ModalErrorBoundary>
      )

      expect(screen.getByTestId('modal-error-fallback')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /retry modal/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /go to full page/i })
      ).toBeInTheDocument()
    })
  })

  describe('Error Logging and Reporting', () => {
    it('should call onError callback with error details', () => {
      render(
        <ModalErrorBoundary fallback={ErrorFallback} onError={mockOnError}>
          <ThrowError shouldThrow={true} />
        </ModalErrorBoundary>
      )

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
          name: 'Error',
        })
      )
    })

    it('should include component stack in error info', () => {
      const onErrorWithInfo = vi.fn()

      render(
        <ModalErrorBoundary fallback={ErrorFallback} onError={onErrorWithInfo}>
          <ThrowError shouldThrow={true} />
        </ModalErrorBoundary>
      )

      expect(onErrorWithInfo).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      )
    })

    it('should handle multiple consecutive errors', () => {
      const MultiErrorComponent = ({ errorCount }: { errorCount: number }) => {
        if (errorCount > 0) {
          throw new Error(`Error ${errorCount}`)
        }
        return <div>No errors</div>
      }

      const { rerender } = render(
        <ModalErrorBoundary fallback={ErrorFallback} onError={mockOnError}>
          <MultiErrorComponent errorCount={1} />
        </ModalErrorBoundary>
      )

      expect(mockOnError).toHaveBeenCalledTimes(1)

      rerender(
        <ModalErrorBoundary fallback={ErrorFallback} onError={mockOnError}>
          <MultiErrorComponent errorCount={2} />
        </ModalErrorBoundary>
      )

      expect(mockOnError).toHaveBeenCalledTimes(2)
    })
  })

  describe('Accessibility', () => {
    it('should maintain accessibility in error state', () => {
      const AccessibleErrorFallback = ({ error }: { error: Error }) => (
        <div role="alert" aria-live="assertive" data-testid="accessible-error">
          <h2>An error occurred</h2>
          <p>{error.message}</p>
        </div>
      )

      render(
        <ModalErrorBoundary
          fallback={AccessibleErrorFallback}
          onError={mockOnError}
        >
          <ThrowError shouldThrow={true} />
        </ModalErrorBoundary>
      )

      const errorElement = screen.getByTestId('accessible-error')
      expect(errorElement).toHaveAttribute('role', 'alert')
      expect(errorElement).toHaveAttribute('aria-live', 'assertive')
    })

    it('should focus error message for screen readers', () => {
      const FocusableErrorFallback = ({ error }: { error: Error }) => (
        <div tabIndex={-1} data-testid="focusable-error" autoFocus>
          Error: {error.message}
        </div>
      )

      render(
        <ModalErrorBoundary
          fallback={FocusableErrorFallback}
          onError={mockOnError}
        >
          <ThrowError shouldThrow={true} />
        </ModalErrorBoundary>
      )

      const errorElement = screen.getByTestId('focusable-error')
      expect(errorElement).toHaveAttribute('tabIndex', '-1')
    })
  })
})
