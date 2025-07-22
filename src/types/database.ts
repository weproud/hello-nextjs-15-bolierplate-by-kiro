import type { User, Project } from '@prisma/client'

// Extended types with relations
export type UserWithProjects = User & {
  projects: Project[]
}

export type ProjectWithRelations = Project & {
  user: User
}

// API response types
export interface ApiResponse<T = any> {
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

export type CreateProjectInput = Pick<Project, 'title' | 'userId'> &
  Partial<Pick<Project, 'description'>>
export type UpdateProjectInput = Partial<Pick<Project, 'title' | 'description'>>

// Query filter types
export interface UserFilters {
  email?: string
  name?: string
}

export interface ProjectFilters {
  userId?: string
  name?: string
}

// Pagination types
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
