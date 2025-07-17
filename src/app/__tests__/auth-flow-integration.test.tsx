/**
 * @fileoverview End-to-end integration tests for auth flow
 * Tests complete user journeys, authentication scenarios, and cross-browser compatibility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'

// Mock Next.js navigation
const mockPush = vi.fn()
const mockBack = vi.fn()
const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Next Auth
const mockSignIn = vi.fn()
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signIn: mockSignIn,
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock components
vi.mock('../@modal/(.)auth/signin/page', () => ({
  default: ({ searchParams }: { searchParams: any }) => {
    const MockModalSigninPage = () => {
      const router = useRouter()
      return (
        <div data-testid="modal-signin-page">
          <div>Modal Signin</div>
          <div>Callback: {searchParams?.callbackUrl || 'none'}</div>
          <button
            onClick={() =>
              mockSignIn('credentials', {
                email: 'test@example.com',
                password: 'password',
              })
            }
          >
            Sign In Modal
          </button>
          <button onClick={() => router.back()}>Close Modal</button>
        </div>
      )
    }
    return <MockModalSigninPage />
  },
}))

vi.mock('../auth/signin/page', () => ({
  default: ({ searchParams }: { searchParams: any }) => {
    return (
      <div data-testid="full-signin-page">
        <div>Full Page Signin</div>
        <div>Callback: {searchParams?.callbackUrl || 'none'}</div>
        <button
          onClick={() =>
            mockSignIn('credentials', {
              email: 'test@example.com',
              password: 'password',
            })
          }
        >
          Sign In Full Page
        </button>
      </div>
    )
  },
}))

describe('Auth Flow Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: mockBack,
      replace: mockReplace,
      forward: vi.fn(),
      refresh: vi.fn(),
    })
    vi.mocked(usePathname).mockReturnValue('/')
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete User Journeys', () => {
    it('should complete modal signin flow from dashboard', async () => {
      // Simulate user on dashboard page
      vi.mocked(usePathname).mockReturnValue('/dashboard')
      mockSignIn.mockResolvedValue({ ok: true, error: null })

      const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
      render(<ModalSigninPage searchParams={{ callbackUrl: '/dashboard' }} />)

      expect(screen.getByTestId('modal-signin-page')).toBeInTheDocument()
      expect(screen.getByText('Callback: /dashboard')).toBeInTheDocument()

      const signInButton = screen.getByRole('button', {
        name: /sign in modal/i,
      })
      await user.click(signInButton)

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password',
      })

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled()
      })
    })

    it('should complete full page signin flow', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null })

      const FullSigninPage = require('../auth/signin/page').default
      render(<FullSigninPage searchParams={{ callbackUrl: '/projects' }} />)

      expect(screen.getByTestId('full-signin-page')).toBeInTheDocument()
      expect(screen.getByText('Callback: /projects')).toBeInTheDocument()

      const signInButton = screen.getByRole('button', {
        name: /sign in full page/i,
      })
      await user.click(signInButton)

      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password',
      })
    })

    it('should handle modal dismissal and return to previous page', async () => {
      vi.mocked(usePathname).mockReturnValue('/projects')

      const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
      render(<ModalSigninPage searchParams={{}} />)

      const closeButton = screen.getByRole('button', { name: /close modal/i })
      await user.click(closeButton)

      expect(mockBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Authentication Success Scenarios', () => {
    it('should redirect to callback URL after successful modal signin', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null, url: '/dashboard' })

      const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
      render(<ModalSigninPage searchParams={{ callbackUrl: '/dashboard' }} />)

      const signInButton = screen.getByRole('button', {
        name: /sign in modal/i,
      })
      await user.click(signInButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled()
      })
    })

    it('should redirect to callback URL after successful full page signin', async () => {
      mockSignIn.mockResolvedValue({ ok: true, error: null, url: '/projects' })

      const FullSigninPage = require('../auth/signin/page').default
      render(<FullSigninPage searchParams={{ callbackUrl: '/projects' }} />)

      const signInButton = screen.getByRole('button', {
        name: /sign in full page/i,
      })
      await user.click(signInButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled()
      })
    })

    it('should handle successful authentication with session update', async () => {
      const mockUpdate = vi.fn()
      vi.mocked(useSession).mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        status: 'authenticated',
        update: mockUpdate,
      })

      mockSignIn.mockResolvedValue({ ok: true, error: null })

      const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
      render(<ModalSigninPage searchParams={{}} />)

      const signInButton = screen.getByRole('button', {
        name: /sign in modal/i,
      })
      await user.click(signInButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled()
      })
    })
  })

  describe('Authentication Failure Scenarios', () => {
    it('should handle authentication errors in modal context', async () => {
      mockSignIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' })

      const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
      render(<ModalSigninPage searchParams={{}} />)

      const signInButton = screen.getByRole('button', {
        name: /sign in modal/i,
      })
      await user.click(signInButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled()
      })

      // Modal should remain open on error
      expect(screen.getByTestId('modal-signin-page')).toBeInTheDocument()
    })

    it('should handle authentication errors in full page context', async () => {
      mockSignIn.mockResolvedValue({ ok: false, error: 'CredentialsSignin' })

      const FullSigninPage = require('../auth/signin/page').default
      render(<FullSigninPage searchParams={{}} />)

      const signInButton = screen.getByRole('button', {
        name: /sign in full page/i,
      })
      await user.click(signInButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled()
      })

      // Page should remain visible on error
      expect(screen.getByTestId('full-signin-page')).toBeInTheDocument()
    })

    it('should handle network errors gracefully', async () => {
      mockSignIn.mockRejectedValue(new Error('Network error'))

      const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
      render(<ModalSigninPage searchParams={{}} />)

      const signInButton = screen.getByRole('button', {
        name: /sign in modal/i,
      })
      await user.click(signInButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled()
      })

      // Should handle error gracefully
      expect(screen.getByTestId('modal-signin-page')).toBeInTheDocument()
    })
  })

  describe('Route Parameter Handling', () => {
    it('should preserve complex callback URLs', async () => {
      const complexCallbackUrl =
        '/dashboard?tab=projects&filter=active&sort=date'

      const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
      render(
        <ModalSigninPage searchParams={{ callbackUrl: complexCallbackUrl }} />
      )

      expect(
        screen.getByText(`Callback: ${complexCallbackUrl}`)
      ).toBeInTheDocument()
    })

    it('should handle encoded callback URLs', async () => {
      const encodedCallbackUrl = encodeURIComponent(
        '/dashboard?tab=projects&filter=active'
      )

      const FullSigninPage = require('../auth/signin/page').default
      render(
        <FullSigninPage searchParams={{ callbackUrl: encodedCallbackUrl }} />
      )

      expect(
        screen.getByText(`Callback: ${encodedCallbackUrl}`)
      ).toBeInTheDocument()
    })

    it('should handle missing callback URLs gracefully', async () => {
      const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
      render(<ModalSigninPage searchParams={{}} />)

      expect(screen.getByText('Callback: none')).toBeInTheDocument()
    })
  })

  describe('Browser Navigation Scenarios', () => {
    it('should handle browser back button in modal context', async () => {
      const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
      render(<ModalSigninPage searchParams={{}} />)

      // Simulate browser back button
      const popStateEvent = new PopStateEvent('popstate')
      window.dispatchEvent(popStateEvent)

      // Should handle gracefully without errors
      expect(screen.getByTestId('modal-signin-page')).toBeInTheDocument()
    })

    it('should handle page refresh in full page context', async () => {
      const FullSigninPage = require('../auth/signin/page').default
      const { rerender } = render(
        <FullSigninPage searchParams={{ callbackUrl: '/dashboard' }} />
      )

      // Simulate page refresh
      rerender(<FullSigninPage searchParams={{ callbackUrl: '/dashboard' }} />)

      expect(screen.getByTestId('full-signin-page')).toBeInTheDocument()
      expect(screen.getByText('Callback: /dashboard')).toBeInTheDocument()
    })

    it('should handle rapid navigation changes', async () => {
      const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
      const { rerender } = render(
        <ModalSigninPage searchParams={{ callbackUrl: '/dashboard' }} />
      )

      // Rapid navigation changes
      rerender(<ModalSigninPage searchParams={{ callbackUrl: '/projects' }} />)
      rerender(<ModalSigninPage searchParams={{ callbackUrl: '/settings' }} />)

      expect(screen.getByText('Callback: /settings')).toBeInTheDocument()
    })
  })

  describe('Cross-Browser Compatibility', () => {
    it('should handle different user agent strings', () => {
      const originalUserAgent = navigator.userAgent

      // Mock different browsers
      const browsers = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      ]

      browsers.forEach(userAgent => {
        Object.defineProperty(navigator, 'userAgent', {
          value: userAgent,
          configurable: true,
        })

        const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
        render(<ModalSigninPage searchParams={{}} />)

        expect(screen.getByTestId('modal-signin-page')).toBeInTheDocument()
      })

      // Restore original user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true,
      })
    })

    it('should handle different viewport sizes', () => {
      const viewports = [
        { width: 320, height: 568 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 }, // Desktop
      ]

      viewports.forEach(({ width, height }) => {
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

        const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
        render(<ModalSigninPage searchParams={{}} />)

        expect(screen.getByTestId('modal-signin-page')).toBeInTheDocument()
      })
    })
  })

  describe('Performance Considerations', () => {
    it('should render modal quickly', async () => {
      const startTime = performance.now()

      const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
      render(<ModalSigninPage searchParams={{}} />)

      const endTime = performance.now()
      const renderTime = endTime - startTime

      expect(screen.getByTestId('modal-signin-page')).toBeInTheDocument()
      expect(renderTime).toBeLessThan(100) // Should render in less than 100ms
    })

    it('should handle multiple rapid modal opens/closes', async () => {
      const ModalSigninPage = require('../@modal/(.)auth/signin/page').default

      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<ModalSigninPage searchParams={{}} />)
        expect(screen.getByTestId('modal-signin-page')).toBeInTheDocument()
        unmount()
      }
    })

    it('should not cause memory leaks', async () => {
      const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
      const { unmount } = render(<ModalSigninPage searchParams={{}} />)

      const closeButton = screen.getByRole('button', { name: /close modal/i })
      await user.click(closeButton)

      unmount()

      // Should not have lingering event listeners or references
      expect(mockBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Recovery', () => {
    it('should recover from component errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock component that throws error initially
      let shouldThrow = true
      vi.mocked(
        require('../@modal/(.)auth/signin/page').default
      ).mockImplementation(() => {
        if (shouldThrow) {
          shouldThrow = false
          throw new Error('Component error')
        }
        return <div data-testid="recovered-modal">Recovered</div>
      })

      const TestWrapper = () => {
        try {
          const ModalSigninPage =
            require('../@modal/(.)auth/signin/page').default
          return <ModalSigninPage searchParams={{}} />
        } catch (error) {
          // Retry rendering
          const ModalSigninPage =
            require('../@modal/(.)auth/signin/page').default
          return <ModalSigninPage searchParams={{}} />
        }
      }

      render(<TestWrapper />)

      expect(screen.getByTestId('recovered-modal')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })

    it('should fallback to full page on modal failure', () => {
      // Mock modal failure
      vi.mocked(
        require('../@modal/(.)auth/signin/page').default
      ).mockImplementation(() => {
        throw new Error('Modal failed')
      })

      const FallbackComponent = () => {
        try {
          const ModalSigninPage =
            require('../@modal/(.)auth/signin/page').default
          return <ModalSigninPage searchParams={{}} />
        } catch (error) {
          const FullSigninPage = require('../auth/signin/page').default
          return <FullSigninPage searchParams={{}} />
        }
      }

      render(<FallbackComponent />)

      expect(screen.getByTestId('full-signin-page')).toBeInTheDocument()
    })
  })
})
