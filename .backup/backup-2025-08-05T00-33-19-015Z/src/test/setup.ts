import '@testing-library/jest-dom'
import type { Session } from 'next-auth'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { Mock } from 'vitest'
import { vi } from 'vitest'

// Type-safe mock for Next.js router
const mockRouter: AppRouterInstance = {
  push: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
}

vi.mock('next/navigation', () => ({
  useRouter: (): AppRouterInstance => mockRouter,
  usePathname: (): string => '/',
  useSearchParams: (): URLSearchParams => new URLSearchParams(),
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

// Type-safe mock for Next Auth
interface MockSessionReturn {
  data: Session | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  update: Mock
}

const mockSession: MockSessionReturn = {
  data: null,
  status: 'unauthenticated',
  update: vi.fn(),
}

vi.mock('next-auth/react', () => ({
  useSession: (): MockSessionReturn => mockSession,
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  getSession: vi.fn(),
}))

// Type-safe mock for window.matchMedia
interface MockMediaQueryList extends MediaQueryList {
  matches: boolean
  media: string
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null
  addListener: Mock
  removeListener: Mock
  addEventListener: Mock
  removeEventListener: Mock
  dispatchEvent: Mock
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(
    (query: string): MockMediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })
  ),
})

// Type-safe mock for IntersectionObserver
interface MockIntersectionObserver {
  observe: Mock
  unobserve: Mock
  disconnect: Mock
  root: Element | null
  rootMargin: string
  thresholds: ReadonlyArray<number>
  takeRecords: Mock
}

global.IntersectionObserver = vi.fn().mockImplementation(
  (
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ): MockIntersectionObserver => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: options?.root || null,
    rootMargin: options?.rootMargin || '0px',
    thresholds: Array.isArray(options?.threshold)
      ? options.threshold
      : [options?.threshold || 0],
    takeRecords: vi.fn(() => []),
  })
)

// Type-safe mock for ResizeObserver
interface MockResizeObserver {
  observe: Mock
  unobserve: Mock
  disconnect: Mock
}

global.ResizeObserver = vi.fn().mockImplementation(
  (callback: ResizeObserverCallback): MockResizeObserver => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })
)

// Mock for next-safe-action
vi.mock('next-safe-action', () => ({
  createSafeActionClient: vi.fn(() => ({
    use: vi.fn(),
    schema: vi.fn(),
    action: vi.fn(),
  })),
  DEFAULT_SERVER_ERROR_MESSAGE: 'Something went wrong',
  createServerActionProcedure: vi.fn(),
}))

// Mock for Prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    post: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}))

// Mock for environment variables
vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    DATABASE_URL: 'test-db-url',
    NEXTAUTH_SECRET: 'test-secret',
    NEXTAUTH_URL: 'http://localhost:3000',
    GOOGLE_CLIENT_ID: 'test-google-client-id',
    GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
  },
}))

// Setup global test utilities
import { testEnvironment } from './fixtures'
import { mockConsole, mockWebAPIs } from './mocks'

// Setup web APIs
mockWebAPIs()

// Setup environment variables
Object.assign(process.env, testEnvironment)

// Suppress console errors in tests unless explicitly needed
const consoleMock = mockConsole()

// Global test cleanup
afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  consoleMock.restore()
})
