import { createStore } from 'zustand/vanilla'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Project } from '@prisma/client'
import type { PaginationMeta } from '@/types'

// Project with user information
export interface ProjectWithUser extends Project {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

// Projects state interface
export interface ProjectsState {
  // Data
  projects: ProjectWithUser[]
  currentProject: ProjectWithUser | null

  // Loading states
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isDuplicating: boolean

  // Error states
  error: string | null

  // Pagination
  pagination: PaginationMeta

  // Filters
  filters: {
    search: string
    userId?: string
    category?: string
    status?: string
  }

  // Sorting
  sort: {
    field: 'title' | 'createdAt' | 'updatedAt'
    order: 'asc' | 'desc'
  }

  // Actions
  setProjects: (projects: ProjectWithUser[]) => void
  addProject: (project: ProjectWithUser) => void
  updateProject: (id: string, updates: Partial<ProjectWithUser>) => void
  removeProject: (id: string) => void
  duplicateProject: (project: ProjectWithUser) => void
  setCurrentProject: (project: ProjectWithUser | null) => void

  // Loading actions
  setLoading: (loading: boolean) => void
  setCreating: (creating: boolean) => void
  setUpdating: (updating: boolean) => void
  setDeleting: (deleting: boolean) => void
  setDuplicating: (duplicating: boolean) => void

  // Error actions
  setError: (error: string | null) => void

  // Pagination actions
  setPagination: (pagination: PaginationMeta) => void
  setPage: (page: number) => void

  // Filter actions
  setFilters: (filters: Partial<ProjectsState['filters']>) => void
  setSearch: (search: string) => void
  clearFilters: () => void

  // Sort actions
  setSort: (sort: ProjectsState['sort']) => void

  // Reset action
  resetState: () => void
}

// Initial state
const initialState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isDuplicating: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    userId: undefined,
    category: undefined,
    status: undefined,
  },
  sort: {
    field: 'updatedAt' as const,
    order: 'desc' as const,
  },
}

export type ProjectsStore = ReturnType<typeof createProjectsStore>

// Create projects store factory
export const createProjectsStore = () => {
  return createStore<ProjectsState>()(
    devtools(
      immer(set => ({
        ...initialState,

        // Data actions
        setProjects: (projects: ProjectWithUser[]) =>
          set(state => {
            state.projects = projects
          }),

        addProject: (project: ProjectWithUser) =>
          set(state => {
            state.projects.unshift(project)
            state.pagination.total += 1
          }),

        updateProject: (id: string, updates: Partial<ProjectWithUser>) =>
          set(state => {
            const index = state.projects.findIndex(p => p.id === id)
            if (index !== -1) {
              state.projects[index] = { ...state.projects[index], ...updates }
            }

            // 현재 프로젝트도 업데이트
            if (state.currentProject?.id === id) {
              state.currentProject = { ...state.currentProject, ...updates }
            }
          }),

        removeProject: (id: string) =>
          set(state => {
            state.projects = state.projects.filter(p => p.id !== id)
            state.pagination.total = Math.max(0, state.pagination.total - 1)

            // 현재 프로젝트가 삭제된 프로젝트라면 초기화
            if (state.currentProject?.id === id) {
              state.currentProject = null
            }
          }),

        duplicateProject: (project: ProjectWithUser) =>
          set(state => {
            const duplicatedProject: ProjectWithUser = {
              ...project,
              id: crypto.randomUUID(),
              title: `${project.title} (복사본)`,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            state.projects.unshift(duplicatedProject)
            state.pagination.total += 1
          }),

        setCurrentProject: (project: ProjectWithUser | null) =>
          set(state => {
            state.currentProject = project
          }),

        // Loading actions
        setLoading: (loading: boolean) =>
          set(state => {
            state.isLoading = loading
          }),

        setCreating: (creating: boolean) =>
          set(state => {
            state.isCreating = creating
          }),

        setUpdating: (updating: boolean) =>
          set(state => {
            state.isUpdating = updating
          }),

        setDeleting: (deleting: boolean) =>
          set(state => {
            state.isDeleting = deleting
          }),

        setDuplicating: (duplicating: boolean) =>
          set(state => {
            state.isDuplicating = duplicating
          }),

        // Error actions
        setError: (error: string | null) =>
          set(state => {
            state.error = error
          }),

        // Pagination actions
        setPagination: (pagination: PaginationMeta) =>
          set(state => {
            state.pagination = pagination
          }),

        setPage: (page: number) =>
          set(state => {
            state.pagination.page = page
          }),

        // Filter actions
        setFilters: (filters: Partial<ProjectsState['filters']>) =>
          set(state => {
            state.filters = { ...state.filters, ...filters }
          }),

        setSearch: (search: string) =>
          set(state => {
            state.filters.search = search
          }),

        clearFilters: () =>
          set(state => {
            state.filters = {
              search: '',
              userId: undefined,
              category: undefined,
              status: undefined,
            }
          }),

        // Sort actions
        setSort: (sort: ProjectsState['sort']) =>
          set(state => {
            state.sort = sort
          }),

        // Reset action
        resetState: () =>
          set(state => {
            Object.assign(state, initialState)
          }),
      })),
      {
        name: 'projects-store',
      }
    )
  )
}
