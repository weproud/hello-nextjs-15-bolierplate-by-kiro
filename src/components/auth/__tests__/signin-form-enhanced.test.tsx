/**
 * @fileoverview Unit tests for enhanced SigninForm component
 * Tests modal context behavior, authentication logic, and error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SigninForm } from '../signin-form'

// Mock next-auth
const mockSignIn = vi.fn()
vi.mock('next-auth/react', () => ({
  signIn: mockSignIn,
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}))

// Mock next/navigation
const mockPush = vi.fn()
const mockBack = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}))

describe('SigninForm Enhanced', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Modal Context Behavior', () => {
    it('should render with modal-specific styling when isModal is true', () => {
      render(<SigninForm isModal={true} />)

      const form = screen.getByRole('form')
      expect(form).toHaveClass('modal-form')
    })

    it('should render with page styling when isModal is false', () => {
      render(<SigninForm isModal={false} />)

      const form = screen.getByRole('form')
      expect(form).toHaveClass('page-form')
    })

    it('should call onSuccess callback in modal context after successful auth', async () => {
      const mockOnSuccess = vi.fn()
      mockSignIn.mockResolvedValue({ ok: true, error: null })

      render(<SigninForm isModal={true} onSuccess={mockOnSuccess} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1)
      })
    })

    it('should not call onSuccess callback in page context', async () => {
      const mockOnSuccess = vi.fn()
      mockSignIn.mockResolvedValue({ ok: true, error: null })

      render(<SigninForm isModal={false} onSuccess={mockOnSuccess} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      })

      expect(mockOnSuccess).not.toHaveBeenCalled()
    })
  })

  describe('Authentication Logic', () => {
    it('should call signIn with correct credentials', async () => {
      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      })
    })

    it('should handle callback URL in authentication', async () => {
      const callbackUrl = '/dashboard'
      render(<SigninForm callbackUrl={callbackUrl} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
        callbackUrl,
      })
    })

    it('should redirect to callback URL after successful authentication in page context', async () => {
      const callbackUrl = '/dashboard'
      mockSignIn.mockResolvedValue({ ok: true, error: null })

      render(<SigninForm isModal={false} callbackUrl={callbackUrl} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(callbackUrl)
      })
    })

    it('should redirect to default page if no callback URL in page context', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null })

      render(<SigninForm isModal={false} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })
    })
  })

  describe('Error Handling', () => {
    it('should display authentication errors consistently in both contexts', async () => {
      const errorMessage = 'Invalid credentials'
      mockSignIn.mockResolvedValue({ ok: false, error: errorMessage })

      // Test modal context
      render(<SigninForm isModal={true} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('should handle network errors gracefully', async () => {
      mockSignIn.mockRejectedValue(new Error('Network error'))

      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })

    it('should clear errors when user starts typing', async () => {
      const errorMessage = 'Invalid credentials'
      mockSignIn.mockResolvedValue({ ok: false, error: errorMessage })

      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Trigger error
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })

      // Clear error by typing
      await user.clear(passwordInput)
      await user.type(passwordInput, 'newpassword')

      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })

    it('should validate required fields', async () => {
      render(<SigninForm />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })

    it('should validate password minimum length', async () => {
      render(<SigninForm />)

      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(passwordInput, '123')
      await user.click(submitButton)

      expect(screen.getByText(/password must be at least/i)).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should show loading state during authentication', async () => {
      mockSignIn.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('should disable form inputs during loading', async () => {
      mockSignIn.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<SigninForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
    })
  })
})
