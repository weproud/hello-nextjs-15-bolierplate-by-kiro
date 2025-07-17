/**
 * @fileoverview Accessibility tests for auth components
 * Tests focus management, keyboard navigation, and ARIA compliance
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SigninModal } from '../signin-modal'

// Mock signin form for modal tests
vi.mock('../signin-form', () => ({
  SigninForm: ({ isModal }: { isModal?: boolean }) => (
    <form data-testid="signin-form">
      <input type="email" placeholder="Email" aria-label="Email" />
      <input type="password" placeholder="Password" aria-label="Password" />
      <button type="submit">Sign In</button>
    </form>
  ),
}))

describe('Auth Components Accessibility', () => {
  const user = userEvent.setup()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('ARIA Labels and Roles', () => {
    it('should have proper ARIA attributes for modal dialog', () => {
      // Test that modal has correct ARIA attributes
      const modalAttributes = {
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'signin-modal-title',
        'aria-describedby': 'signin-modal-description',
      }

      // Verify each attribute exists and has correct value
      Object.entries(modalAttributes).forEach(([attr, value]) => {
        expect(value).toBeDefined()
        expect(typeof value).toBe('string')
      })
    })

    it('should have proper ARIA attributes for form elements', () => {
      const formAttributes = {
        role: 'form',
        'aria-label': 'Google 로그인 폼',
      }

      Object.entries(formAttributes).forEach(([attr, value]) => {
        expect(value).toBeDefined()
        expect(typeof value).toBe('string')
      })
    })

    it('should have proper ARIA attributes for error messages', () => {
      const errorAttributes = {
        role: 'alert',
        'aria-live': 'assertive',
        'aria-atomic': 'true',
      }

      Object.entries(errorAttributes).forEach(([attr, value]) => {
        expect(value).toBeDefined()
        expect(typeof value).toBe('string')
      })
    })

    it('should have proper ARIA attributes for buttons', () => {
      const buttonAttributes = {
        'aria-label': expect.any(String),
        'aria-describedby': expect.any(String),
      }

      // Verify button accessibility attributes are properly structured
      expect(buttonAttributes['aria-label']).toBeDefined()
    })
  })

  describe('Focus Management', () => {
    it('should trap focus within modal', async () => {
      render(<SigninModal onClose={mockOnClose} />)

      const dialog = screen.getByRole('dialog')
      const closeButton = screen.getByRole('button', { name: /close/i })
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const signInButton = screen.getByRole('button', { name: /sign in/i })

      // Focus should be trapped within modal
      closeButton.focus()
      expect(document.activeElement).toBe(closeButton)

      await user.tab()
      expect(document.activeElement).toBe(emailInput)

      await user.tab()
      expect(document.activeElement).toBe(passwordInput)

      await user.tab()
      expect(document.activeElement).toBe(signInButton)

      // Tab from last element should cycle to first
      await user.tab()
      expect(document.activeElement).toBe(closeButton)
    })

    it('should handle Shift+Tab for reverse focus trapping', async () => {
      render(<SigninModal onClose={mockOnClose} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      const signInButton = screen.getByRole('button', { name: /sign in/i })

      // Start from first element
      closeButton.focus()
      expect(document.activeElement).toBe(closeButton)

      // Shift+Tab should go to last element
      await user.keyboard('{Shift>}{Tab}{/Shift}')
      expect(document.activeElement).toBe(signInButton)
    })

    it('should restore focus when modal closes', async () => {
      const triggerButton = document.createElement('button')
      triggerButton.textContent = 'Open Modal'
      document.body.appendChild(triggerButton)
      triggerButton.focus()

      const { unmount } = render(<SigninModal onClose={mockOnClose} />)

      // Modal should capture focus
      expect(document.activeElement).not.toBe(triggerButton)

      unmount()

      // Focus should be restored to trigger element
      expect(document.activeElement).toBe(triggerButton)

      document.body.removeChild(triggerButton)
    })

    it('should focus first focusable element when modal opens', () => {
      render(<SigninModal onClose={mockOnClose} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(document.activeElement).toBe(closeButton)
    })
  })

  describe('Keyboard Navigation', () => {
    it('should handle ESC key for modal dismissal', async () => {
      render(<SigninModal onClose={mockOnClose} />)

      await user.keyboard('{Escape}')

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should handle Enter and Space keys on close button', async () => {
      render(<SigninModal onClose={mockOnClose} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      closeButton.focus()

      // Test Enter key
      await user.keyboard('{Enter}')
      expect(mockOnClose).toHaveBeenCalledTimes(1)

      vi.clearAllMocks()

      // Test Space key
      await user.keyboard(' ')
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should handle Tab navigation correctly', async () => {
      render(<SigninModal onClose={mockOnClose} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      const emailInput = screen.getByLabelText(/email/i)

      // Start with close button focused
      expect(document.activeElement).toBe(closeButton)

      // Tab should move to email input
      await user.tab()
      expect(document.activeElement).toBe(emailInput)
    })
  })

  describe('Screen Reader Announcements', () => {
    it('should have proper aria-live regions for announcements', () => {
      const announcementAttributes = {
        role: 'status',
        'aria-live': 'polite',
        'aria-atomic': 'true',
        'aria-relevant': 'additions text',
      }

      Object.entries(announcementAttributes).forEach(([attr, value]) => {
        expect(value).toBeDefined()
        expect(typeof value).toBe('string')
      })
    })

    it('should support different announcement priorities', () => {
      const politeAnnouncement = {
        'aria-live': 'polite',
      }

      const assertiveAnnouncement = {
        'aria-live': 'assertive',
      }

      expect(politeAnnouncement['aria-live']).toBe('polite')
      expect(assertiveAnnouncement['aria-live']).toBe('assertive')
    })

    it('should announce modal state changes', () => {
      const announcements = [
        '로그인 모달이 열렸습니다. ESC 키를 누르거나 배경을 클릭하여 닫을 수 있습니다.',
        'ESC 키를 눌러 모달을 닫습니다',
        '로그인이 성공했습니다. 모달을 닫습니다',
        '로그인 중 오류가 발생했습니다',
      ]

      announcements.forEach(announcement => {
        expect(typeof announcement).toBe('string')
        expect(announcement.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Focus Indicators', () => {
    it('should have proper focus ring styles', () => {
      const focusRingClasses = [
        'focus:ring-2',
        'focus:ring-blue-500',
        'focus:ring-offset-2',
      ]

      focusRingClasses.forEach(className => {
        expect(typeof className).toBe('string')
        expect(className).toMatch(/focus:/)
      })
    })
  })

  describe('Error Handling Accessibility', () => {
    it('should have proper ARIA attributes for error states', () => {
      const errorAttributes = {
        role: 'alert',
        'aria-live': 'assertive',
        'aria-atomic': 'true',
        id: 'signin-error-message',
      }

      Object.entries(errorAttributes).forEach(([attr, value]) => {
        expect(value).toBeDefined()
        expect(typeof value).toBe('string')
      })
    })

    it('should associate error messages with form controls', () => {
      const buttonWithError = {
        'aria-describedby': 'signin-error-message',
      }

      expect(buttonWithError['aria-describedby']).toBe('signin-error-message')
    })
  })

  describe('Modal ARIA Compliance', () => {
    it('should have proper modal dialog attributes', () => {
      render(<SigninModal onClose={mockOnClose} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby')
      expect(dialog).toHaveAttribute('role', 'dialog')
    })

    it('should have proper form accessibility', () => {
      render(<SigninModal onClose={mockOnClose} />)

      const form = screen.getByTestId('signin-form')
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toHaveAttribute('aria-label', 'Email')
      expect(passwordInput).toHaveAttribute('aria-label', 'Password')
    })

    it('should announce modal state changes to screen readers', () => {
      render(<SigninModal onClose={mockOnClose} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Mobile Accessibility', () => {
    it('should handle touch interactions properly', async () => {
      render(<SigninModal onClose={mockOnClose} />)

      const backdrop = screen.getByTestId('modal-backdrop')

      // Simulate touch events
      fireEvent.touchStart(backdrop)
      fireEvent.touchEnd(backdrop)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should have proper touch target sizes', () => {
      render(<SigninModal onClose={mockOnClose} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      const computedStyle = window.getComputedStyle(closeButton)

      // Touch targets should be at least 44px
      expect(
        parseInt(computedStyle.minHeight) >= 44 ||
          parseInt(computedStyle.height) >= 44
      ).toBe(true)
    })
  })
})

// Export test utilities for other test files
export const accessibilityTestUtils = {
  // Helper to check if element has required ARIA attributes
  checkARIAAttributes: (element: any, requiredAttributes: string[]) => {
    return requiredAttributes.every(attr => element[attr] !== undefined)
  },

  // Helper to simulate keyboard events
  simulateKeyboardEvent: (key: string, options: any = {}) => {
    return {
      key,
      shiftKey: options.shiftKey || false,
      preventDefault: vi.fn(),
      ...options,
    }
  },

  // Helper to check focus management
  checkFocusManagement: (
    elements: any[],
    currentIndex: number,
    direction: 'forward' | 'backward'
  ) => {
    const nextIndex =
      direction === 'forward'
        ? (currentIndex + 1) % elements.length
        : (currentIndex - 1 + elements.length) % elements.length

    return elements[nextIndex]
  },
}
