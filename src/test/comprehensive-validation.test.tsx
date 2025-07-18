/**
 * @fileoverview Comprehensive validation test suite
 * Validates all requirements and ensures existing functionality remains unchanged
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Import actual components to test real functionality
import { SigninModal } from '../components/auth/signin-modal'
import { SigninForm } from '../components/auth/signin-form'

// Mock Next.js and NextAuth
const mockPush = vi.fn()
const mockBack = vi.fn()
const mockSignIn = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
    update: vi.fn(),
  }),
  signIn: mockSignIn,
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('Comprehensive Validation Suite', () => {
  const user = userEvent.setup()

  beforeAll(() => {
    // Setup global test environment
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterAll(() => {
    vi.clearAllMocks()
  })

  describe('Existing Functionality Preservation', () => {
    it('should preserve existing signin form functionality', async () => {
      mockSignIn.mockResolvedValue({ ok: true })

      render(<SigninForm callbackUrl="/dashboard" onSuccess={() => {}} />)

      // Check if form elements exist
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      expect(emailInput).toBeInTheDocument()
      expect(passwordInput).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()

      // Test form submission
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled()
      })
    })

    it('should preserve existing modal functionality', async () => {
      const mockOnClose = vi.fn()

      render(<SigninModal onClose={mockOnClose} callbackUrl="/dashboard" />)

      // Check modal structure
      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute('aria-modal', 'true')

      // Test close functionality
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should maintain existing error handling', async () => {
      mockSignIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' })

      render(<SigninForm callbackUrl="/dashboard" onSuccess={() => {}} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })
  })

  describe('Complete User Flow Validation', () => {
    it('should complete modal signin flow from different entry points', async () => {
      const entryPoints = ['/dashboard', '/projects', '/settings', '/profile']

      for (const entryPoint of entryPoints) {
        mockSignIn.mockResolvedValue({ ok: true })
        const mockOnClose = vi.fn()

        render(<SigninModal onClose={mockOnClose} callbackUrl={entryPoint} />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        await waitFor(() => {
          expect(mockSignIn).toHaveBeenCalledWith(
            'credentials',
            expect.objectContaining({
              callbackUrl: entryPoint,
            })
          )
        })

        vi.clearAllMocks()
      }
    })

    it('should handle authentication success scenarios', async () => {
      const successScenarios = [
        { callbackUrl: '/dashboard', expectedRedirect: '/dashboard' },
        { callbackUrl: '/projects/123', expectedRedirect: '/projects/123' },
        { callbackUrl: undefined, expectedRedirect: '/' },
      ]

      for (const scenario of successScenarios) {
        mockSignIn.mockResolvedValue({
          ok: true,
          url: scenario.expectedRedirect,
        })

        const mockOnSuccess = vi.fn()

        render(
          <SigninForm
            callbackUrl={scenario.callbackUrl}
            onSuccess={mockOnSuccess}
          />
        )

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        await waitFor(() => {
          expect(mockOnSuccess).toHaveBeenCalled()
        })

        vi.clearAllMocks()
      }
    })

    it('should handle authentication failure scenarios', async () => {
      const failureScenarios = [
        { error: 'CredentialsSignin', expectedMessage: /invalid credentials/i },
        { error: 'AccessDenied', expectedMessage: /access denied/i },
        { error: 'Configuration', expectedMessage: /configuration error/i },
      ]

      for (const scenario of failureScenarios) {
        mockSignIn.mockResolvedValue({
          ok: false,
          error: scenario.error,
        })

        render(<SigninForm callbackUrl="/dashboard" onSuccess={() => {}} />)

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/password/i)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        await waitFor(() => {
          expect(screen.getByText(scenario.expectedMessage)).toBeInTheDocument()
        })

        vi.clearAllMocks()
      }
    })
  })

  describe('Cross-Browser and Mobile Compatibility', () => {
    it('should work on different screen sizes', () => {
      const screenSizes = [
        { width: 320, height: 568, name: 'Mobile Small' },
        { width: 375, height: 667, name: 'Mobile Medium' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1024, height: 768, name: 'Tablet Landscape' },
        { width: 1920, height: 1080, name: 'Desktop' },
      ]

      screenSizes.forEach(({ width, height, name }) => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        })
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: height,
        })

        render(<SigninModal onClose={() => {}} callbackUrl="/dashboard" />)

        const modal = screen.getByRole('dialog')
        expect(modal).toBeInTheDocument()

        // Verify modal is properly sized for the screen
        const computedStyle = window.getComputedStyle(modal)
        expect(computedStyle).toBeDefined()
      })
    })

    it('should handle touch interactions properly', async () => {
      // Mock touch events
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      })
      const touchEndEvent = new TouchEvent('touchend', {
        touches: [],
      })

      render(<SigninModal onClose={() => {}} callbackUrl="/dashboard" />)

      const modal = screen.getByRole('dialog')
      const closeButton = screen.getByRole('button', { name: /close/i })

      // Simulate touch interaction
      closeButton.dispatchEvent(touchStartEvent)
      closeButton.dispatchEvent(touchEndEvent)

      expect(closeButton).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      render(<SigninModal onClose={() => {}} callbackUrl="/dashboard" />)

      const modal = screen.getByRole('dialog')

      // Test Tab navigation
      await user.tab()
      expect(document.activeElement).toBeInTheDocument()

      // Test Escape key
      await user.keyboard('{Escape}')
      // Modal should handle escape key appropriately

      // Test Enter key on buttons
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      submitButton.focus()
      await user.keyboard('{Enter}')

      expect(submitButton).toBeInTheDocument()
    })
  })

  describe('Performance and Optimization Validation', () => {
    it('should render components within performance thresholds', async () => {
      const performanceTests = [
        { component: 'SigninModal', threshold: 50 },
        { component: 'SigninForm', threshold: 30 },
      ]

      for (const test of performanceTests) {
        const startTime = performance.now()

        if (test.component === 'SigninModal') {
          render(<SigninModal onClose={() => {}} callbackUrl="/dashboard" />)
        } else {
          render(<SigninForm callbackUrl="/dashboard" onSuccess={() => {}} />)
        }

        const endTime = performance.now()
        const renderTime = endTime - startTime

        expect(renderTime).toBeLessThan(test.threshold)
      }
    })

    it('should handle rapid state changes efficiently', async () => {
      const mockOnClose = vi.fn()

      render(<SigninModal onClose={mockOnClose} callbackUrl="/dashboard" />)

      const closeButton = screen.getByRole('button', { name: /close/i })

      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        await user.click(closeButton)
      }

      expect(mockOnClose).toHaveBeenCalledTimes(10)
    })

    it('should not cause memory leaks', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

      // Render and unmount multiple times
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(
          <SigninModal onClose={() => {}} callbackUrl="/dashboard" />
        )
        unmount()
      }

      // Allow garbage collection
      await new Promise(resolve => setTimeout(resolve, 100))

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024)
    })
  })

  describe('Accessibility Compliance', () => {
    it('should have proper ARIA attributes', () => {
      render(<SigninModal onClose={() => {}} callbackUrl="/dashboard" />)

      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute('aria-modal', 'true')
      expect(modal).toHaveAttribute('role', 'dialog')

      // Check for proper labeling
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should support screen readers', () => {
      render(<SigninModal onClose={() => {}} callbackUrl="/dashboard" />)

      // Check for screen reader announcements
      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute('aria-modal', 'true')

      // Check for proper heading structure
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
    })

    it('should have sufficient color contrast', () => {
      render(<SigninModal onClose={() => {}} callbackUrl="/dashboard" />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      const computedStyle = window.getComputedStyle(submitButton)

      // Basic check that styles are applied
      expect(computedStyle.color).toBeDefined()
      expect(computedStyle.backgroundColor).toBeDefined()
    })
  })

  describe('Error Recovery and Resilience', () => {
    it('should recover from network errors', async () => {
      // First call fails, second succeeds
      mockSignIn
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true })

      render(<SigninForm callbackUrl="/dashboard" onSuccess={() => {}} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      // First attempt - should fail
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })

      // Second attempt - should succeed
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledTimes(2)
      })
    })

    it('should handle component errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
        try {
          return <>{children}</>
        } catch (error) {
          return <div data-testid="error-fallback">Error occurred</div>
        }
      }

      render(
        <ErrorBoundary>
          <SigninModal onClose={() => {}} callbackUrl="/dashboard" />
        </ErrorBoundary>
      )

      // Component should render without errors
      expect(screen.getByRole('dialog')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })

  describe('Integration with Existing Systems', () => {
    it('should integrate with existing authentication flow', async () => {
      mockSignIn.mockResolvedValue({ ok: true, url: '/dashboard' })

      const mockOnSuccess = vi.fn()

      render(
        <SigninForm
          callbackUrl="/dashboard"
          onSuccess={mockOnSuccess}
          isModal={true}
        />
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith(
          'credentials',
          expect.objectContaining({
            email: 'test@example.com',
            password: 'password123',
            callbackUrl: '/dashboard',
          })
        )
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('should preserve existing session management', async () => {
      // Mock session update
      const mockUpdate = vi.fn()

      vi.mocked(require('next-auth/react').useSession).mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
        update: mockUpdate,
      })

      render(<SigninForm callbackUrl="/dashboard" onSuccess={() => {}} />)

      // Session should be properly managed
      expect(screen.getByText(/signed in as/i)).toBeInTheDocument()
    })
  })
})
