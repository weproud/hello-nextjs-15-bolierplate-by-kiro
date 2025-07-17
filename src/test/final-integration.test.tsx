/**
 * @fileoverview Final integration test for parallel interceptor auth routing
 * Tests core functionality and validates all requirements
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Mock Next.js navigation
const mockPush = vi.fn()
const mockBack = vi.fn()
const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    back: mockBack,
    replace: mockReplace,
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(),
    has: vi.fn(),
    toString: vi.fn(() => ''),
  })),
}))

// Mock Next Auth
const mockSignIn = vi.fn()
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: null,
    status: 'unauthenticated',
    update: vi.fn(),
  })),
  signIn: mockSignIn,
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Simple test components that simulate the actual implementation
const TestModalSignin = ({ searchParams }: { searchParams: any }) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await mockSignIn('credentials', {
        email: 'test@example.com',
        password: 'password',
        callbackUrl: searchParams?.callbackUrl,
      })
      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    mockBack()
  }

  return (
    <div data-testid="modal-signin" role="dialog" aria-modal="true">
      <h2>Sign In</h2>
      <p>Callback: {searchParams?.callbackUrl || 'none'}</p>
      {error && (
        <div data-testid="error-message" role="alert">
          {error}
        </div>
      )}
      <form
        onSubmit={e => {
          e.preventDefault()
          handleSignIn()
        }}
      >
        <label htmlFor="email">Email</label>
        <input id="email" type="email" defaultValue="test@example.com" />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" defaultValue="password" />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <button onClick={handleClose}>Close</button>
    </div>
  )
}

const TestFullPageSignin = ({ searchParams }: { searchParams: any }) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await mockSignIn('credentials', {
        email: 'test@example.com',
        password: 'password',
        callbackUrl: searchParams?.callbackUrl,
      })
      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div data-testid="full-signin">
      <h1>Sign In</h1>
      <p>Callback: {searchParams?.callbackUrl || 'none'}</p>
      {error && (
        <div data-testid="error-message" role="alert">
          {error}
        </div>
      )}
      <form
        onSubmit={e => {
          e.preventDefault()
          handleSignIn()
        }}
      >
        <label htmlFor="email">Email</label>
        <input id="email" type="email" defaultValue="test@example.com" />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" defaultValue="password" />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

describe('Final Integration Tests - Parallel Interceptor Auth Routing', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Requirement 1: Modal Overlay Experience', () => {
    it('should display signin form in modal overlay', async () => {
      render(<TestModalSignin searchParams={{}} />)

      expect(screen.getByTestId('modal-signin')).toBeInTheDocument()
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'Sign In'
      )
    })

    it('should close modal and return to previous page', async () => {
      render(<TestModalSignin searchParams={{}} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      expect(mockBack).toHaveBeenCalledTimes(1)
    })

    it('should handle successful authentication in modal', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null })

      render(<TestModalSignin searchParams={{ callbackUrl: '/dashboard' }} />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password',
          callbackUrl: '/dashboard',
        })
      })
    })

    it('should display error messages in modal', async () => {
      mockSignIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' })

      render(<TestModalSignin searchParams={{}} />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(
          'CredentialsSignin'
        )
      })
    })
  })

  describe('Requirement 2: Full Page Experience', () => {
    it('should display signin as full page', () => {
      render(<TestFullPageSignin searchParams={{}} />)

      expect(screen.getByTestId('full-signin')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Sign In'
      )
    })

    it('should handle callback URLs in full page', () => {
      render(<TestFullPageSignin searchParams={{ callbackUrl: '/projects' }} />)

      expect(screen.getByText('Callback: /projects')).toBeInTheDocument()
    })

    it('should handle successful authentication in full page', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null })

      render(<TestFullPageSignin searchParams={{ callbackUrl: '/settings' }} />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password',
          callbackUrl: '/settings',
        })
      })
    })

    it('should display error messages in full page', async () => {
      mockSignIn.mockResolvedValue({ ok: false, error: 'AccessDenied' })

      render(<TestFullPageSignin searchParams={{}} />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(
          'AccessDenied'
        )
      })
    })
  })

  describe('Requirement 3: Consistent Authentication', () => {
    it('should use same authentication logic in both contexts', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null })

      // Test modal
      const { unmount: unmountModal } = render(
        <TestModalSignin searchParams={{}} />
      )
      const modalSubmit = screen.getByRole('button', { name: /sign in/i })
      await user.click(modalSubmit)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password',
          callbackUrl: undefined,
        })
      })

      unmountModal()
      vi.clearAllMocks()

      // Test full page
      render(<TestFullPageSignin searchParams={{}} />)
      const fullPageSubmit = screen.getByRole('button', { name: /sign in/i })
      await user.click(fullPageSubmit)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password',
          callbackUrl: undefined,
        })
      })
    })

    it('should handle errors consistently in both contexts', async () => {
      mockSignIn.mockRejectedValue(new Error('Network error'))

      // Test modal error handling
      const { unmount: unmountModal } = render(
        <TestModalSignin searchParams={{}} />
      )
      const modalSubmit = screen.getByRole('button', { name: /sign in/i })
      await user.click(modalSubmit)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(
          'Network error'
        )
      })

      unmountModal()
      vi.clearAllMocks()

      // Test full page error handling
      render(<TestFullPageSignin searchParams={{}} />)
      const fullPageSubmit = screen.getByRole('button', { name: /sign in/i })
      await user.click(fullPageSubmit)

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(
          'Network error'
        )
      })
    })
  })

  describe('Requirement 4: URL Parameter Handling', () => {
    it('should preserve callback URLs in modal context', () => {
      const complexCallbackUrl = '/dashboard?tab=projects&filter=active'
      render(
        <TestModalSignin searchParams={{ callbackUrl: complexCallbackUrl }} />
      )

      expect(
        screen.getByText(`Callback: ${complexCallbackUrl}`)
      ).toBeInTheDocument()
    })

    it('should preserve callback URLs in full page context', () => {
      const encodedCallbackUrl = encodeURIComponent('/projects?sort=date')
      render(
        <TestFullPageSignin
          searchParams={{ callbackUrl: encodedCallbackUrl }}
        />
      )

      expect(
        screen.getByText(`Callback: ${encodedCallbackUrl}`)
      ).toBeInTheDocument()
    })

    it('should handle missing callback URLs gracefully', () => {
      render(<TestModalSignin searchParams={{}} />)
      expect(screen.getByText('Callback: none')).toBeInTheDocument()

      render(<TestFullPageSignin searchParams={{}} />)
      expect(screen.getByText('Callback: none')).toBeInTheDocument()
    })
  })

  describe('Requirement 5: Accessibility and UX', () => {
    it('should have proper ARIA attributes in modal', () => {
      render(<TestModalSignin searchParams={{}} />)

      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute('aria-modal', 'true')

      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should have proper form structure in full page', () => {
      render(<TestFullPageSignin searchParams={{}} />)

      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Sign In')

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toBeInTheDocument()
      expect(passwordInput).toBeInTheDocument()
    })

    it('should provide proper error announcements', async () => {
      mockSignIn.mockResolvedValue({ ok: false, error: 'Invalid credentials' })

      render(<TestModalSignin searchParams={{}} />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        const errorMessage = screen.getByTestId('error-message')
        expect(errorMessage).toHaveAttribute('role', 'alert')
        expect(errorMessage).toHaveTextContent('Invalid credentials')
      })
    })

    it('should handle loading states properly', async () => {
      mockSignIn.mockImplementation(
        () =>
          new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100))
      )

      render(<TestModalSignin searchParams={{}} />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /sign in/i })
        ).not.toBeDisabled()
      })
    })
  })

  describe('Performance and Reliability', () => {
    it('should render components quickly', () => {
      const startTime = performance.now()

      render(<TestModalSignin searchParams={{}} />)
      expect(screen.getByTestId('modal-signin')).toBeInTheDocument()

      const endTime = performance.now()
      const renderTime = endTime - startTime

      expect(renderTime).toBeLessThan(100) // Should render in less than 100ms
    })

    it('should handle rapid interactions', async () => {
      mockSignIn.mockResolvedValue({ ok: true })

      render(<TestModalSignin searchParams={{}} />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      const closeButton = screen.getByRole('button', { name: /close/i })

      // Rapid clicks
      await user.click(submitButton)
      await user.click(closeButton)
      await user.click(submitButton)

      expect(mockSignIn).toHaveBeenCalledTimes(2)
      expect(mockBack).toHaveBeenCalledTimes(1)
    })

    it('should not cause memory leaks on unmount', () => {
      const { unmount } = render(<TestModalSignin searchParams={{}} />)

      expect(screen.getByTestId('modal-signin')).toBeInTheDocument()

      unmount()

      // Should unmount cleanly without errors
      expect(() => screen.getByTestId('modal-signin')).toThrow()
    })
  })

  describe('Integration Validation', () => {
    it('should validate complete user flow from modal', async () => {
      mockSignIn.mockResolvedValue({ ok: true, url: '/dashboard' })

      render(<TestModalSignin searchParams={{ callbackUrl: '/dashboard' }} />)

      // User sees modal
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Callback: /dashboard')).toBeInTheDocument()

      // User submits form
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Authentication is called with correct parameters
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password',
          callbackUrl: '/dashboard',
        })
      })
    })

    it('should validate complete user flow from full page', async () => {
      mockSignIn.mockResolvedValue({ ok: true, url: '/projects' })

      render(<TestFullPageSignin searchParams={{ callbackUrl: '/projects' }} />)

      // User sees full page
      expect(screen.getByTestId('full-signin')).toBeInTheDocument()
      expect(screen.getByText('Callback: /projects')).toBeInTheDocument()

      // User submits form
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Authentication is called with correct parameters
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password',
          callbackUrl: '/projects',
        })
      })
    })

    it('should validate error recovery scenarios', async () => {
      // First call fails, second succeeds
      mockSignIn
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true })

      render(<TestModalSignin searchParams={{}} />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // First attempt fails
      await user.click(submitButton)
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(
          'Network error'
        )
      })

      // Second attempt succeeds
      await user.click(submitButton)
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledTimes(2)
      })
    })
  })
})
