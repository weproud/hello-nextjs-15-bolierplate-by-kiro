import type { Mock } from 'vitest'
import { vi } from 'vitest'
import { createTestPost, createTestProject, createTestUser } from './fixtures'
import type { MockPrismaClient } from './types'

/**
 * Comprehensive mock utilities with proper typing
 */

// Prisma client mock
export const createMockPrismaClient = (): MockPrismaClient => ({
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  post: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  project: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $disconnect: vi.fn(),
  $connect: vi.fn(),
  $transaction: vi.fn(),
})

// Global mock instance
export const mockPrisma = createMockPrismaClient()

// Mock setup helpers
export const setupUserMocks = () => {
  const testUser = createTestUser()
  mockPrisma.user.findUnique.mockResolvedValue(testUser)
  mockPrisma.user.findMany.mockResolvedValue([testUser])
  mockPrisma.user.create.mockResolvedValue(testUser)
  mockPrisma.user.update.mockResolvedValue(testUser)
  mockPrisma.user.delete.mockResolvedValue(testUser)
  mockPrisma.user.count.mockResolvedValue(1)
  return testUser
}

export const setupPostMocks = () => {
  const testPost = createTestPost()
  mockPrisma.post.findUnique.mockResolvedValue(testPost)
  mockPrisma.post.findMany.mockResolvedValue([testPost])
  mockPrisma.post.create.mockResolvedValue(testPost)
  mockPrisma.post.update.mockResolvedValue(testPost)
  mockPrisma.post.delete.mockResolvedValue(testPost)
  mockPrisma.post.count.mockResolvedValue(1)
  return testPost
}

export const setupProjectMocks = () => {
  const testProject = createTestProject()
  mockPrisma.project.findUnique.mockResolvedValue(testProject)
  mockPrisma.project.findMany.mockResolvedValue([testProject])
  mockPrisma.project.create.mockResolvedValue(testProject)
  mockPrisma.project.update.mockResolvedValue(testProject)
  mockPrisma.project.delete.mockResolvedValue(testProject)
  mockPrisma.project.count.mockResolvedValue(1)
  return testProject
}

// Next.js mocks
export const mockNextRouter = {
  push: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
}

export const mockNextNavigation = {
  useRouter: vi.fn(() => mockNextRouter),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  redirect: vi.fn(),
  notFound: vi.fn(),
}

// NextAuth mocks
export const mockNextAuth = {
  useSession: vi.fn(() => ({
    data: null,
    status: 'unauthenticated',
    update: vi.fn(),
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}

// Server action mocks
export const createMockServerAction = <T, R>(
  implementation?: (data: T) => Promise<R> | R
): Mock<[T], Promise<R>> => {
  const mockAction = vi.fn()
  if (implementation) {
    mockAction.mockImplementation(implementation)
  }
  return mockAction
}

// Form mocks
export const mockReactHookForm = {
  useForm: vi.fn(() => ({
    register: vi.fn(),
    handleSubmit: vi.fn(fn => fn),
    formState: {
      errors: {},
      isSubmitting: false,
      isValid: true,
      isDirty: false,
      isSubmitted: false,
    },
    reset: vi.fn(),
    setValue: vi.fn(),
    getValues: vi.fn(),
    watch: vi.fn(),
    control: {},
  })),
  Controller: ({ render }: any) =>
    render({ field: {}, fieldState: {}, formState: {} }),
}

// Zustand store mocks
export const createMockStore = <T>(initialState: T) => {
  let state = initialState
  const listeners = new Set<() => void>()

  return {
    getState: () => state,
    setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => {
      const nextState = typeof partial === 'function' ? partial(state) : partial
      state = { ...state, ...nextState }
      listeners.forEach(listener => listener())
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    destroy: () => listeners.clear(),
  }
}

// Web API mocks
export const mockWebAPIs = () => {
  // Fetch mock
  global.fetch = vi.fn()

  // LocalStorage mock
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  })

  // SessionStorage mock
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  }
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  })

  // Location mock
  const locationMock = {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  }
  Object.defineProperty(window, 'location', {
    value: locationMock,
    writable: true,
  })

  return {
    fetch: global.fetch as Mock,
    localStorage: localStorageMock,
    sessionStorage: sessionStorageMock,
    location: locationMock,
  }
}

// Environment variable mocks
export const mockEnvironment = (env: Record<string, string>) => {
  const originalEnv = process.env
  process.env = { ...originalEnv, ...env }

  return () => {
    process.env = originalEnv
  }
}

// Timer mocks
export const mockTimers = () => {
  vi.useFakeTimers()
  return {
    advanceTimersByTime: vi.advanceTimersByTime,
    runAllTimers: vi.runAllTimers,
    runOnlyPendingTimers: vi.runOnlyPendingTimers,
    clearAllTimers: vi.clearAllTimers,
    restore: vi.useRealTimers,
  }
}

// Console mocks
export const mockConsole = () => {
  const originalConsole = console
  const mockMethods = {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }

  Object.assign(console, mockMethods)

  return {
    ...mockMethods,
    restore: () => {
      Object.assign(console, originalConsole)
    },
  }
}

// Reset all mocks helper
export const resetAllMocks = () => {
  vi.clearAllMocks()
  vi.resetAllMocks()
  vi.restoreAllMocks()
}

// Mock cleanup helper
export const cleanupMocks = () => {
  resetAllMocks()
  vi.useRealTimers()
}
