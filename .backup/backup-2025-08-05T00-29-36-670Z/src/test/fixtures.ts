import type { TestPost, TestProject, TestSession, TestUser } from './types'

/**
 * Test fixtures with proper typing
 */

// Base user fixtures
export const createTestUser = (
  overrides: Partial<TestUser> = {}
): TestUser => ({
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  emailVerified: null,
  image: 'https://example.com/avatar.jpg',
  role: 'USER',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
})

export const createAdminUser = (overrides: Partial<TestUser> = {}): TestUser =>
  createTestUser({
    id: 'admin-user-id',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN',
    ...overrides,
  })

// Session fixtures
export const createTestSession = (
  overrides: Partial<TestSession> = {}
): TestSession => ({
  user: createTestUser(overrides.user),
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  ...overrides,
})

export const createAdminSession = (
  overrides: Partial<TestSession> = {}
): TestSession =>
  createTestSession({
    user: createAdminUser(overrides.user),
    ...overrides,
  })

// Post fixtures
export const createTestPost = (overrides: Partial<TestPost> = {}): TestPost => {
  const author = overrides.author || createTestUser()
  return {
    id: 'test-post-id',
    title: 'Test Post Title',
    content: 'This is test post content',
    published: true,
    authorId: author.id,
    author,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

export const createDraftPost = (overrides: Partial<TestPost> = {}): TestPost =>
  createTestPost({
    id: 'draft-post-id',
    title: 'Draft Post Title',
    published: false,
    ...overrides,
  })

// Project fixtures
export const createTestProject = (
  overrides: Partial<TestProject> = {}
): TestProject => {
  const user = overrides.user || createTestUser()
  return {
    id: 'test-project-id',
    title: 'Test Project',
    description: 'This is a test project description',
    status: 'ACTIVE',
    userId: user.id,
    user,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

export const createInactiveProject = (
  overrides: Partial<TestProject> = {}
): TestProject =>
  createTestProject({
    id: 'inactive-project-id',
    title: 'Inactive Project',
    status: 'INACTIVE',
    ...overrides,
  })

// Collection fixtures
export const createTestUsers = (count: number = 3): TestUser[] =>
  Array.from({ length: count }, (_, index) =>
    createTestUser({
      id: `test-user-${index + 1}`,
      name: `Test User ${index + 1}`,
      email: `test${index + 1}@example.com`,
    })
  )

export const createTestPosts = (
  count: number = 3,
  author?: TestUser
): TestPost[] => {
  const postAuthor = author || createTestUser()
  return Array.from({ length: count }, (_, index) =>
    createTestPost({
      id: `test-post-${index + 1}`,
      title: `Test Post ${index + 1}`,
      content: `This is test post content ${index + 1}`,
      author: postAuthor,
      authorId: postAuthor.id,
    })
  )
}

export const createTestProjects = (
  count: number = 3,
  user?: TestUser
): TestProject[] => {
  const projectUser = user || createTestUser()
  return Array.from({ length: count }, (_, index) =>
    createTestProject({
      id: `test-project-${index + 1}`,
      title: `Test Project ${index + 1}`,
      description: `This is test project description ${index + 1}`,
      user: projectUser,
      userId: projectUser.id,
    })
  )
}

// Form data fixtures
export const createTestFormData = (
  data: Record<string, string | File>
): FormData => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

export const createTestFile = (
  name: string = 'test.txt',
  content: string = 'test content',
  type: string = 'text/plain'
): File => {
  return new File([content], name, { type })
}

// API response fixtures
export const createSuccessResponse = <T>(data: T) => ({
  data,
  status: 200,
})

export const createErrorResponse = (error: string, status: number = 400) => ({
  error,
  status,
})

// Server action result fixtures
export const createSuccessActionResult = <T>(data: T) => ({
  data,
})

export const createErrorActionResult = (serverError: string) => ({
  serverError,
})

export const createValidationErrorActionResult = (
  validationErrors: Record<string, string[]>
) => ({
  validationErrors,
})

// Mock data for specific scenarios
export const mockAuthenticatedScenario = {
  user: createTestUser(),
  session: createTestSession(),
  posts: createTestPosts(5),
  projects: createTestProjects(3),
}

export const mockUnauthenticatedScenario = {
  user: null,
  session: null,
  posts: [],
  projects: [],
}

export const mockAdminScenario = {
  user: createAdminUser(),
  session: createAdminSession(),
  posts: createTestPosts(10),
  projects: createTestProjects(5),
}

// Environment fixtures
export const testEnvironment = {
  NODE_ENV: 'test' as const,
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  NEXTAUTH_SECRET: 'test-secret',
  NEXTAUTH_URL: 'http://localhost:3000',
  GOOGLE_CLIENT_ID: 'test-google-client-id',
  GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
}

// Date fixtures
export const testDates = {
  past: new Date('2023-01-01T00:00:00.000Z'),
  present: new Date('2024-01-01T00:00:00.000Z'),
  future: new Date('2025-01-01T00:00:00.000Z'),
}

// Pagination fixtures
export const createPaginationFixture = (
  page: number = 1,
  limit: number = 10,
  total: number = 100
) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNext: page < Math.ceil(total / limit),
  hasPrev: page > 1,
})

// Error fixtures
export const testErrors = {
  validation: {
    email: ['Invalid email format'],
    password: ['Password must be at least 8 characters'],
    title: ['Title is required'],
  },
  server: 'Internal server error',
  network: 'Network error',
  unauthorized: 'Unauthorized access',
  notFound: 'Resource not found',
}
