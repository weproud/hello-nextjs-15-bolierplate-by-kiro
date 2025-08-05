/**
 * Database Type Definitions
 *
 * 데이터베이스 엔티티 및 관련 타입들을 정의합니다.
 */

import type { User, Project, Account, Session } from '@prisma/client'
import type { BaseEntity } from './common'

// Base Database Types - Prisma 타입을 확장한 기본 타입들
export type DatabaseUser = User
export type DatabaseProject = Project
export type DatabaseAccount = Account
export type DatabaseSession = Session

// Extended Types with Relations - 관계를 포함한 확장 타입들
export type UserWithProjects = User & {
  projects: Project[]
}

export type UserWithAccounts = User & {
  accounts: Account[]
}

export type UserWithSessions = User & {
  sessions: Session[]
}

export type UserWithRelations = User & {
  projects: Project[]
  accounts: Account[]
  sessions: Session[]
}

export type ProjectWithUser = Project & {
  user: User
}

export type ProjectWithRelations = Project & {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

// Database Input Types - 데이터베이스 입력을 위한 타입들
export type CreateUserInput = Pick<User, 'email'> &
  Partial<Pick<User, 'name' | 'image' | 'emailVerified'>>

export type UpdateUserInput = Partial<
  Pick<User, 'name' | 'email' | 'image' | 'emailVerified'>
>

export type CreateProjectInput = Pick<Project, 'title' | 'userId'> &
  Partial<Pick<Project, 'description'>>

export type UpdateProjectInput = Partial<Pick<Project, 'title' | 'description'>>

export type CreateAccountInput = Pick<
  Account,
  'userId' | 'type' | 'provider' | 'providerAccountId'
> &
  Partial<
    Pick<
      Account,
      | 'refresh_token'
      | 'access_token'
      | 'expires_at'
      | 'token_type'
      | 'scope'
      | 'id_token'
      | 'session_state'
    >
  >

export type CreateSessionInput = Pick<
  Session,
  'sessionToken' | 'userId' | 'expires'
>

// Database Query Filter Types - 데이터베이스 쿼리 필터를 위한 타입들
export interface UserFilters {
  id?: string
  email?: string
  name?: string
  emailVerified?: boolean
  createdAfter?: Date
  createdBefore?: Date
}

export interface ProjectFilters {
  id?: string
  userId?: string
  title?: string
  hasDescription?: boolean
  createdAfter?: Date
  createdBefore?: Date
}

export interface AccountFilters {
  userId?: string
  provider?: string
  type?: string
}

export interface SessionFilters {
  userId?: string
  sessionToken?: string
  active?: boolean
}

// Database Query Options - 데이터베이스 쿼리 옵션을 위한 타입들
export interface QueryOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  include?: string[]
  select?: string[]
}

export interface UserQueryOptions extends QueryOptions {
  includeProjects?: boolean
  includeAccounts?: boolean
  includeSessions?: boolean
}

export interface ProjectQueryOptions extends QueryOptions {
  includeUser?: boolean
}

// Database Repository Interface Types - Repository 패턴을 위한 인터페이스 타입들
export interface BaseRepository<T, CreateInput, UpdateInput, Filters> {
  findMany(options?: {
    filters?: Filters
    pagination?: {
      page: number
      limit: number
    }
    sort?: {
      field: string
      order: 'asc' | 'desc'
    }
  }): Promise<T[]>

  findById(id: string): Promise<T | null>

  findUnique(where: Partial<T>): Promise<T | null>

  create(data: CreateInput): Promise<T>

  update(id: string, data: UpdateInput): Promise<T>

  delete(id: string): Promise<T>

  count(filters?: Filters): Promise<number>
}

export interface UserRepository
  extends BaseRepository<User, CreateUserInput, UpdateUserInput, UserFilters> {
  findByEmail(email: string): Promise<User | null>
  findWithProjects(id: string): Promise<UserWithProjects | null>
  findWithAccounts(id: string): Promise<UserWithAccounts | null>
  findWithSessions(id: string): Promise<UserWithSessions | null>
  findWithRelations(id: string): Promise<UserWithRelations | null>
}

export interface ProjectRepository
  extends BaseRepository<
    Project,
    CreateProjectInput,
    UpdateProjectInput,
    ProjectFilters
  > {
  findByUserId(userId: string, options?: QueryOptions): Promise<Project[]>
  findWithUser(id: string): Promise<ProjectWithUser | null>
  findByTitle(title: string): Promise<Project[]>
}

export interface AccountRepository
  extends BaseRepository<
    Account,
    CreateAccountInput,
    Partial<CreateAccountInput>,
    AccountFilters
  > {
  findByProvider(userId: string, provider: string): Promise<Account | null>
  findByUserId(userId: string): Promise<Account[]>
}

export interface SessionRepository
  extends BaseRepository<
    Session,
    CreateSessionInput,
    Partial<CreateSessionInput>,
    SessionFilters
  > {
  findByToken(sessionToken: string): Promise<Session | null>
  findByUserId(userId: string): Promise<Session[]>
  deleteExpired(): Promise<number>
}

// Database Transaction Types - 트랜잭션을 위한 타입들
export interface TransactionContext {
  user: UserRepository
  project: ProjectRepository
  account: AccountRepository
  session: SessionRepository
}

export type TransactionCallback<T> = (ctx: TransactionContext) => Promise<T>

// Database Error Types - 데이터베이스 에러를 위한 타입들
export interface DatabaseError extends Error {
  code: string
  meta?: {
    target?: string[]
    field_name?: string
    table?: string
    column?: string
  }
}

export interface UniqueConstraintError extends DatabaseError {
  code: 'P2002'
  meta: {
    target: string[]
  }
}

export interface ForeignKeyConstraintError extends DatabaseError {
  code: 'P2003'
  meta: {
    field_name: string
  }
}

export interface RecordNotFoundError extends DatabaseError {
  code: 'P2025'
}

// Database Statistics Types - 데이터베이스 통계를 위한 타입들
export interface DatabaseStats {
  users: {
    total: number
    verified: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  projects: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
    averagePerUser: number
  }
  sessions: {
    active: number
    expired: number
    total: number
  }
}

// Database Migration Types - 마이그레이션을 위한 타입들
export interface MigrationInfo {
  id: string
  checksum: string
  finished_at: Date | null
  migration_name: string
  logs: string | null
  rolled_back_at: Date | null
  started_at: Date
  applied_steps_count: number
}

export interface MigrationStatus {
  pending: MigrationInfo[]
  applied: MigrationInfo[]
  failed: MigrationInfo[]
}
