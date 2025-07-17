import type { User, Project, Phase } from '@prisma/client'

// Extended types with relations
export type UserWithProjects = User & {
  projects: Project[]
}

export type ProjectWithRelations = Project & {
  user: User
  phases: Phase[]
}

export type PhaseWithProject = Phase & {
  project: Project
}

// API response types
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T> = ApiResponse<{
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}>

// Database operation types
export type CreateUserInput = Pick<User, 'email'> &
  Partial<Pick<User, 'name' | 'image'>>
export type UpdateUserInput = Partial<Pick<User, 'name' | 'email' | 'image'>>

export type CreateProjectInput = Pick<Project, 'name' | 'userId'> &
  Partial<Pick<Project, 'description'>>
export type UpdateProjectInput = Partial<Pick<Project, 'name' | 'description'>>

export type CreatePhaseInput = Pick<Phase, 'name' | 'projectId'> &
  Partial<Pick<Phase, 'description'>>
export type UpdatePhaseInput = Partial<Pick<Phase, 'name' | 'description'>>

// Query filter types
export type UserFilters = {
  email?: string
  name?: string
}

export type ProjectFilters = {
  userId?: string
  name?: string
}

export type PhaseFilters = {
  projectId?: string
  name?: string
}

// Pagination types
export type PaginationParams = {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
