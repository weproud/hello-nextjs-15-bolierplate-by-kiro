/**
 * Service Layer Interfaces
 *
 * 의존성 역전 원칙(DIP)을 적용하여 구체적인 구현체가 아닌
 * 추상화에 의존하도록 하는 인터페이스들을 정의합니다.
 */

// Authentication Service Interface
export interface IAuthService {
  getCurrentUser(): Promise<AuthUser | null>
  isAuthenticated(): Promise<boolean>
  requireAuth(): Promise<AuthUser>
  signInWithProvider(
    provider: string,
    redirectTo?: string
  ): Promise<SignInResult>
  signOutUser(redirectTo?: string): Promise<AuthResult>
  hasPermission(permission: string, user?: AuthUser): Promise<boolean>
  checkPermission?(
    permission: string,
    user?: AuthUser
  ): Promise<PermissionCheckResult>
  getUserPermissions(user?: AuthUser): Promise<string[]>
  validateSession(): Promise<boolean>
  validateSessionDetailed?(): Promise<SessionValidationResult>
  getUserStructuredPermissions?(user?: AuthUser): Promise<UserPermissions>
  hasStructuredPermission?(
    permissionKey: keyof UserPermissions,
    user?: AuthUser
  ): Promise<boolean>
  getAuthenticationState?(): Promise<AuthenticationState>
  refreshUserSession?(): Promise<AuthResult<ExtendedSession>>
}

export interface AuthResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface SignInResult extends AuthResult {
  redirectUrl?: string
}

export interface PermissionCheckResult extends AuthResult<boolean> {
  permissions?: string[]
}

// Import types from next-auth module
export interface UserPermissions {
  canCreateProject: boolean
  canEditProject: boolean
  canDeleteProject: boolean
  canManageUsers: boolean
  canAccessAdmin: boolean
}

export interface ExtendedSession {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: 'admin' | 'user' | 'guest'
    permissions?: UserPermissions
    lastLoginAt?: Date
  }
  expires: string
  sessionToken?: string
}

export interface SessionValidationResult {
  isValid: boolean
  session?: ExtendedSession
  error?: string
  needsRefresh?: boolean
}

export interface AuthenticationState {
  isAuthenticated: boolean
  isLoading: boolean
  user?: ExtendedSession['user']
  error?: string
}

export interface AuthUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

// Email Service Interface
export interface IEmailService {
  sendWelcomeEmail(to: string, name: string): Promise<void>
  sendProjectCreatedEmail(
    to: string,
    projectTitle: string,
    userName: string
  ): Promise<void>
  sendPasswordResetEmail(
    to: string,
    resetLink: string,
    userName: string
  ): Promise<void>
  sendContactFormEmail(to: string, data: ContactFormData): Promise<void>
  sendNewsletterConfirmation(to: string): Promise<void>
  sendCustomEmail(options: EmailOptions): Promise<void>
}

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
}

// Storage Service Interface
export interface IStorageService {
  upload(file: File, options?: UploadOptions): Promise<UploadResult>
  delete(key: string): Promise<void>
  getUrl(key: string): string
}

export interface UploadOptions {
  maxSize?: number
  allowedTypes?: string[]
  folder?: string
}

export interface UploadResult {
  url: string
  key: string
  size: number
  type: string
  filename: string
}

// Database Service Interface
export interface IDatabaseService {
  // User operations
  createUser(data: CreateUserData): Promise<User>
  getUserById(id: string): Promise<User | null>
  getUserByEmail(email: string): Promise<User | null>
  updateUser(id: string, data: UpdateUserData): Promise<User>
  deleteUser(id: string): Promise<void>

  // Project operations
  createProject(data: CreateProjectData): Promise<Project>
  getProjectById(id: string): Promise<Project | null>
  getUserProjects(userId: string): Promise<Project[]>
  updateProject(id: string, data: UpdateProjectData): Promise<Project>
  deleteProject(id: string): Promise<void>
  deleteProjects(
    ids: string[]
  ): Promise<{ success: string[]; failed: string[] }>
}

export interface CreateUserData {
  name: string
  email: string
}

export interface UpdateUserData {
  name?: string
  email?: string
}

export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateProjectData {
  title: string
  description?: string
  userId: string
}

export interface UpdateProjectData {
  title?: string
  description?: string
}

export interface Project {
  id: string
  title: string
  description?: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Logger Service Interface
export interface ILogger {
  debug(message: string, metadata?: LogMetadata): void
  info(message: string, metadata?: LogMetadata): void
  warn(message: string, metadata?: LogMetadata): void
  error(message: string, error?: Error, metadata?: LogMetadata): void
  child(context: string): ILogger
}

export interface LogMetadata {
  [key: string]:
    | string
    | number
    | boolean
    | Date
    | null
    | undefined
    | LogMetadata
    | LogMetadata[]
}

// Error Handler Service Interface
export interface IErrorHandler {
  handleError(error: Error | AppError, context?: ErrorContext): AppError
  reportError(error: AppError, context?: ErrorContext): Promise<void>
  createUserFriendlyMessage(error: AppError): string
  isRetryable(error: AppError): boolean
}

export interface AppError {
  id: string
  type: string
  message: string
  originalError?: Error
  stack?: string
  context?: string
  timestamp: Date
  severity: string
  metadata?: Record<string, any>
}

export interface ErrorContext {
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  component?: string
  action?: string
  additionalData?: Record<string, any>
}
