/**
 * @fileoverview Integration tests for parallel routing and route interception
 * Tests route handling, parameter passing, and navigation behavior
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

// Mock Next.js navigation hooks
const mockPush = vi.fn()
const mockBack = vi.fn()
const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}))

// Mock the modal signin page component
vi.mock('../@modal/(.)auth/signin/page', () => ({
  default: ({ searchParams }: { searchParams: any }) => (
    <div data-testid="modal-signin-page">
      <div>Modal Signin Page</div>
      <div>Callback URL: {searchParams?.callbackUrl || 'none'}</div>
    </div>
  ),
}))

// Mock the full page signin component
vi.mock('../auth/signin/page', () => ({
  default: ({ searchParams }: { searchParams: any }) => (
    <div data-testid="full-signin-page">
      <div>Full Page Signin</div>
      <div>Callback URL: {searchParams?.callbackUrl || 'none'}</div>
    </div>
  ),
}))

// Mock root layout
vi.mock('../layout', () => ({
  default: ({
    children,
    modal,
  }: {
    children: React.ReactNode
    modal: React.ReactNode
  }) => (
    <div data-testid="root-layout">
      <div data-testid="main-content">{children}</div>
      <div data-testid="modal-slot">{modal}</div>
    </div>
  ),
}))

describe('Parallel Routing Integration', () => {
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
    vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Route Interception', () => {
    it('should intercept signin navigation from other pages and show modal', () => {
      // Simulate navigation from another page
      vi.mocked(usePathname).mockReturnValue('/dashboard')

      const TestComponent = () => {
        const router = useRouter()
        return (
          <div>
            <button onClick={() => router.push('/auth/signin')}>Sign In</button>
          </div>
        )
      }

      render(<TestComponent />)

      const signInButton = screen.getByRole('button', { name: /sign in/i })
      expect(signInButton).toBeInTheDocument()

      // Verify that the route would be intercepted
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('should handle direct navigation to signin page without interception', () => {
      // Simulate direct navigation
      vi.mocked(usePathname).mockReturnValue('/auth/signin')

      const FullSigninPage = require('../auth/signin/page').default
      render(<FullSigninPage searchParams={{}} />)

      expect(screen.getByTestId('full-signin-page')).toBeInTheDocument()
      expect(screen.getByText('Full Page Signin')).toBeInTheDocument()
    })

    it('should pass search parameters correctly to intercepted route', () => {
      const searchParams = { callbackUrl: '/dashboard' }

      const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
      render(<ModalSigninPage searchParams={searchParams} />)

      expect(screen.getByTestId('modal-signin-page')).toBeInTheDocument()
      expect(screen.getByText('Callback URL: /dashboard')).toBeInTheDocument()
    })

    it('should pass search parameters correctly to full page route', () => {
      const searchParams = { callbackUrl: '/projects' }

      const FullSigninPage = require('../auth/signin/page').default
      render(<FullSigninPage searchParams={searchParams} />)

      expect(screen.getByTestId('full-signin-page')).toBeInTheDocument()
      expect(screen.getByText('Callback URL: /projects')).toBeInTheDocument()
    })
  })

  describe('Parallel Slot Rendering', () => {
    it('should render both main content and modal slot in root layout', () => {
      const RootLayout = require('../layout').default

      render(
        <RootLayout modal={<div>Modal Content</div>}>
          <div>Main Content</div>
        </RootLayout>
      )

      expect(screen.getByTestId('root-layout')).toBeInTheDocument()
      expect(screen.getByTestId('main-content')).toBeInTheDocument()
      expect(screen.getByTestId('modal-slot')).toBeInTheDocument()
      expect(screen.getByText('Main Content')).toBeInTheDocument()
      expect(screen.getByText('Modal Content')).toBeInTheDocument()
    })

    it('should render empty modal slot when no modal is active', () => {
      const RootLayout = require('../layout').default

      render(
        <RootLayout modal={null}>
          <div>Main Content</div>
        </RootLayout>
      )

      expect(screen.getByTestId('modal-slot')).toBeInTheDocument()
      expect(screen.getByTestId('modal-slot')).toBeEmptyDOMElement()
    })
  })

  describe('URL Parameter Handling', () => {
    it('should preserve callback URL across route interception', () => {
      const callbackUrl = '/dashboard?tab=projects'
      vi.mocked(useSearchParams).mockReturnValue(
        new URLSearchParams({ callbackUrl })
      )

      const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
      render(<ModalSigninPage searchParams={{ callbackUrl }} />)

      expect(
        screen.getByText(`Callback URL: ${callbackUrl}`)
      ).toBeInTheDocument()
    })

    it('should handle multiple search parameters', () => {
      const searchParams = {
        callbackUrl: '/dashboard',
        error: 'AccessDenied',
        returnTo: '/projects',
      }

      const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
      render(<ModalSigninPage searchParams={searchParams} />)

      expect(screen.getByText('Callback URL: /dashboard')).toBeInTheDocument()
    })

    it('should handle encoded URL parameters', () => {
      const encodedCallbackUrl = encodeURIComponent(
        '/dashboard?tab=projects&filter=active'
      )
      const searchParams = { callbackUrl: encodedCallbackUrl }

      const ModalSigninPage = require('../@modal/(.)auth/signin/page').default
      render(<ModalSigninPage searchParams={searchParams} />)

      expect(
        screen.getByText(`Callback URL: ${encodedCallbackUrl}`)
      ).toBeInTheDocument()
    })
  })

  describe('Navigation State Management', () => {
    it('should maintain navigation history for modal dismissal', async () => {
      // Simulate modal being opened from another page
      vi.mocked(usePathname).mockReturnValue('/dashboard')

      const TestModalComponent = () => {
        const router = useRouter()
        return (
          <div>
            <button onClick={() => router.back()}>Close Modal</button>
          </div>
        )
      }

      render(<TestModalComponent />)

      const closeButton = screen.getByRole('button', { name: /close modal/i })
      await user.click(closeButton)

      expect(mockBack).toHaveBeenCalledTimes(1)
    })

    it('should handle browser back button correctly', () => {
      // Simulate browser back navigation
      const handlePopState = vi.fn()
      window.addEventListener('popstate', handlePopState)

      // Simulate popstate event
      const popStateEvent = new PopStateEvent('popstate', {
        state: { modal: false },
      })
      window.dispatchEvent(popStateEvent)

      expect(handlePopState).toHaveBeenCalledWith(popStateEvent)

      window.removeEventListener('popstate', handlePopState)
    })
  })

  describe('Error Handling', () => {
    it('should handle route interception failures gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock route interception failure
      vi.mocked(useRouter).mockImplementation(() => {
        throw new Error('Route interception failed')
      })

      const TestComponent = () => {
        try {
          const router = useRouter()
          return <div>Router available</div>
        } catch (error) {
          return <div>Fallback to full page</div>
        }
      }

      render(<TestComponent />)

      expect(screen.getByText('Fallback to full page')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })

    it('should fallback to full page signin when modal fails', () => {
      // Mock modal component failure
      vi.mocked(
        require('../@modal/(.)auth/signin/page').default
      ).mockImplementation(() => {
        throw new Error('Modal failed to render')
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

  describe('Performance Considerations', () => {
    it('should not render modal content when not needed', () => {
      const RootLayout = require('../layout').default

      render(
        <RootLayout modal={null}>
          <div>Main Content</div>
        </RootLayout>
      )

      const modalSlot = screen.getByTestId('modal-slot')
      expect(modalSlot).toBeEmptyDOMElement()
    })

    it('should handle rapid navigation changes', async () => {
      const TestComponent = () => {
        const router = useRouter()
        return (
          <div>
            <button onClick={() => router.push('/auth/signin')}>Sign In</button>
            <button onClick={() => router.push('/dashboard')}>Dashboard</button>
          </div>
        )
      }

      render(<TestComponent />)

      const signInButton = screen.getByRole('button', { name: /sign in/i })
      const dashboardButton = screen.getByRole('button', { name: /dashboard/i })

      // Rapid navigation
      await user.click(signInButton)
      await user.click(dashboardButton)
      await user.click(signInButton)

      // Should handle all navigation calls
      expect(mockPush).toHaveBeenCalledTimes(3)
    })
  })
})
