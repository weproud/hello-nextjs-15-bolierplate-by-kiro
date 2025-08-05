import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import type { Session } from 'next-auth'

// Test utilities with proper typing

/**
 * Custom render function with providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: Session | null
  theme?: string
}

interface AllTheProvidersProps {
  children: ReactNode
  session?: Session | null
  theme?: string
}

function AllTheProviders({ children, session = null, theme = 'light' }: AllTheProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme={theme} enableSystem={false}>
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  { session, theme, ...renderOptions }: CustomRenderOptions = {}
) {
  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} session={session} theme={theme} />,
    ...renderOptions,
  })
}

/**
 * Mock data factories with proper typing
 */
export const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  image: 'https://example.com/avatar.jpg',
  role: 'USER' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const mockSession: Session = {
  user: mockUser,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
}

export const mockPost = {
  id: 'test-post-id',
  title: 'Test Post',
  content: 'Test content',
  published: true,
  authorId: mockUser.id,
  author: mockUser,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

export const mockProject = {
  id: 'test-project-id',
  title: 'Test Project',
  description: 'Test description',
  status: 'ACTIVE' as const,
  userId: mockUser.id,
  user: mockUser,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

/**
 * Test helpers for form validation
 */
export function createMockFormData(data: Record<string, string | File>): FormData {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

/**
 * Test helpers for async operations
 */
export function waitForNextTick(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

/**
 * Mock server action result
 */
export function createMockActionResult<T>(
  data?: T,
  error?: string
): { data?: T; serverError?: string; validationErrors?: Record<string, string[]> } {
  if (error) {
    return { serverError: error }
  }
  return { data }
}

/**
 * Type-safe event creators
 */
export function createMockEvent<T extends Event>(
  type: string,
  properties: Partial<T> = {}
): T {
  const event = new Event(type) as T
  Object.assign(event, properties)
  return event
}

export function createMockMouseEvent(
  type: 'click' | 'mousedown' | 'mouseup' | 'mouseover' | 'mouseout',
  properties: Partial<MouseEvent> = {}
): MouseEvent {
  return createMockEvent<MouseEvent>(type, {
    bubbles: true,
    cancelable: true,
    ...properties,
  })
}

export function createMockKeyboardEvent(
  type: 'keydown' | 'keyup' | 'keypress',
  key: string,
  properties: Partial<KeyboardEvent> = {}
): KeyboardEvent {
  return createMockEvent<KeyboardEvent>(type, {
    key,
    bubbles: true,
    cancelable: true,
    ...properties,
  })
}

/**
 * Test matchers for better assertions
 */
export const testMatchers = {
  toBeInTheDocument: expect.any(Function),
  toHaveClass: expect.any(Function),
  toHaveAttribute: expect.any(Function),
  toHaveValue: expect.any(Function),
  toBeDisabled: expect.any(Function),
  toBeEnabled: expect.any(Function),
  toBeVisible: expect.any(Function),
  toBeChecked: expect.any(Function),
}

// Re-export testing library utilities with proper types
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
