import type { Post, Project, User } from '@prisma/client'
import type { Session } from 'next-auth'
import type { Mock } from 'vitest'

/**
 * Test-specific type definitions
 */

// Mock function types
export type MockFunction<T extends (...args: any[]) => any> = Mock<
  Parameters<T>,
  ReturnType<T>
>

// Database model types for testing
export type TestUser = User
export type TestPost = Post & { author: User }
export type TestProject = Project & { user: User }

// Session types for testing
export type TestSession = Session & {
  user: TestUser
}

// Form data types for testing
export interface TestFormData {
  [key: string]: string | File | string[] | File[]
}

// API response types for testing
export interface TestApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

// Server action result types for testing
export interface TestActionResult<T = any> {
  data?: T
  serverError?: string
  validationErrors?: Record<string, string[]>
}

// Component props types for testing
export interface TestComponentProps {
  [key: string]: any
}

// Mock provider props
export interface TestProviderProps {
  children: React.ReactNode
  session?: Session | null
  theme?: string
}

// Test context types
export interface TestContext {
  user?: TestUser
  session?: TestSession
  mockFunctions: Record<string, Mock>
}

// Vitest custom matchers
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeInTheDocument(): T
    toHaveClass(className: string): T
    toHaveAttribute(attr: string, value?: string): T
    toHaveValue(value: string | number): T
    toBeDisabled(): T
    toBeEnabled(): T
    toBeVisible(): T
    toBeChecked(): T
    toHaveTextContent(text: string | RegExp): T
    toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): T
    toBeEmptyDOMElement(): T
    toBeInvalid(): T
    toBeValid(): T
    toBeRequired(): T
    toHaveDescription(text?: string | RegExp): T
    toHaveErrorMessage(text?: string | RegExp): T
  }

  interface AsymmetricMatchersContaining {
    toBeInTheDocument(): any
    toHaveClass(className: string): any
    toHaveAttribute(attr: string, value?: string): any
    toHaveValue(value: string | number): any
    toBeDisabled(): any
    toBeEnabled(): any
    toBeVisible(): any
    toBeChecked(): any
    toHaveTextContent(text: string | RegExp): any
    toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): any
    toBeEmptyDOMElement(): any
    toBeInvalid(): any
    toBeValid(): any
    toBeRequired(): any
    toHaveDescription(text?: string | RegExp): any
    toHaveErrorMessage(text?: string | RegExp): any
  }
}

// Test utility function types
export type RenderWithProvidersOptions = {
  session?: Session | null
  theme?: string
}

export type MockDataFactory<T> = (overrides?: Partial<T>) => T

// Test configuration types
export interface TestConfig {
  timeout: number
  retries: number
  setupTimeout: number
}

// Mock service types
export interface MockPrismaClient {
  user: {
    findUnique: Mock
    findMany: Mock
    create: Mock
    update: Mock
    delete: Mock
    count: Mock
  }
  post: {
    findUnique: Mock
    findMany: Mock
    create: Mock
    update: Mock
    delete: Mock
    count: Mock
  }
  project: {
    findUnique: Mock
    findMany: Mock
    create: Mock
    update: Mock
    delete: Mock
    count: Mock
  }
  $disconnect: Mock
  $connect: Mock
  $transaction: Mock
}

// Test environment types
export interface TestEnvironment {
  NODE_ENV: 'test'
  DATABASE_URL: string
  NEXTAUTH_SECRET: string
  NEXTAUTH_URL: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
}

// Test assertion helpers
export type AssertionHelper<T> = (
  actual: T,
  expected: T
) => void | Promise<void>

// Test fixture types
export interface TestFixture<T = any> {
  name: string
  data: T
  setup?: () => Promise<void> | void
  teardown?: () => Promise<void> | void
}

// Test suite configuration
export interface TestSuiteConfig {
  name: string
  timeout?: number
  retries?: number
  parallel?: boolean
  fixtures?: TestFixture[]
}
