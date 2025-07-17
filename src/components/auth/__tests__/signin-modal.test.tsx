/**
 * @fileoverview Unit tests for SigninModal component
 * Tests modal rendering, event handling, and accessibility features
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SigninModal } from '../signin-modal'

// Mock the signin form component
vi.mock('../signin-form', () => ({
  SigninForm: ({ isModal, onSuccess, callbackUrl }: any) => (
    <div data-testid="signin-form">
      <div>Modal: {isModal ? 'true' : 'false'}</div>
      <div>Callback URL: {callbackUrl || 'none'}</div>
      <button onClick={() => onSuccess?.()}>Sign In</button>
    </div>
  ),
}))

describe('SigninModal', () => {
  const mockOnClose = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render modal with backdrop and container', () => {
      render(<SigninModal onClose={mockOnClose} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByTestId('modal-backdrop')).toBeInTheDocument()
      expect(screen.getByTestId('modal-container')).toBeInTheDocument()
    })

    it('should render signin form with modal context', () => {
      render(<SigninModal onClose={mockOnClose} />)

      const form = screen.getByTestId('signin-form')
      expect(form).toBeInTheDocument()
      expect(screen.getByText('Modal: true')).toBeInTheDocument()
    })

    it('should pass callback URL to signin form', () => {
      const callbackUrl = '/dashboard'
      render(<SigninModal onClose={mockOnClose} callbackUrl={callbackUrl} />)

      expect(
        screen.getByText(`Callback URL: ${callbackUrl}`)
      ).toBeInTheDocument()
    })

    it('should render close button', () => {
      render(<SigninModal onClose={mockOnClose} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('Event Handling', () => {
    it('should call onClose when close button is clicked', async () => {
      render(<SigninModal onClose={mockOnClose} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when backdrop is clicked', async () => {
      render(<SigninModal onClose={mockOnClose} />)

      const backdrop = screen.getByTestId('modal-backdrop')
      await user.click(backdrop)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should not close when modal container is clicked', async () => {
      render(<SigninModal onClose={mockOnClose} />)

      const container = screen.getByTestId('modal-container')
      await user.click(container)

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should call onClose when ESC key is pressed', async () => {
      render(<SigninModal onClose={mockOnClose} />)

      await user.keyboard('{Escape}')

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose when signin is successful', async () => {
      render(<SigninModal onClose={mockOnClose} />)

      const signInButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(signInButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<SigninModal onClose={mockOnClose} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby')
    })

    it('should trap focus within modal', async () => {
      render(<SigninModal onClose={mockOnClose} />)

      const dialog = screen.getByRole('dialog')
      const closeButton = screen.getByRole('button', { name: /close/i })
      const signInButton = screen.getByRole('button', { name: /sign in/i })

      // Focus should be trapped within modal
      closeButton.focus()
      expect(document.activeElement).toBe(closeButton)

      await user.tab()
      expect(document.activeElement).toBe(signInButton)

      await user.tab()
      expect(document.activeElement).toBe(closeButton)
    })

    it('should restore focus when modal closes', async () => {
      const triggerButton = document.createElement('button')
      triggerButton.textContent = 'Open Modal'
      document.body.appendChild(triggerButton)
      triggerButton.focus()

      const { unmount } = render(<SigninModal onClose={mockOnClose} />)

      // Modal should be focused
      expect(document.activeElement).not.toBe(triggerButton)

      unmount()

      // Focus should be restored
      await waitFor(() => {
        expect(document.activeElement).toBe(triggerButton)
      })

      document.body.removeChild(triggerButton)
    })

    it('should announce modal state to screen readers', () => {
      render(<SigninModal onClose={mockOnClose} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Responsive Design', () => {
    it('should apply mobile-specific classes on small screens', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<SigninModal onClose={mockOnClose} />)

      const container = screen.getByTestId('modal-container')
      expect(container).toHaveClass('mobile-modal')
    })

    it('should handle touch interactions on mobile', async () => {
      render(<SigninModal onClose={mockOnClose} />)

      const backdrop = screen.getByTestId('modal-backdrop')

      // Simulate touch events
      fireEvent.touchStart(backdrop)
      fireEvent.touchEnd(backdrop)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Handling', () => {
    it('should handle signin form errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock signin form to throw error
      vi.mocked(require('../signin-form').SigninForm).mockImplementation(() => {
        throw new Error('Form error')
      })

      expect(() => render(<SigninModal onClose={mockOnClose} />)).not.toThrow()

      consoleSpy.mockRestore()
    })
  })
})
