'use client'

import { useUser } from '@/contexts/user-context'
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'

// Project interfaces
export interface Project {
  id: string
  title: string
  description?: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Project context state
export interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  error: string | null
  filters: {
    search: string
    sortBy: 'title' | 'createdAt' | 'updatedAt'
    sortOrder: 'asc' | 'desc'
  }
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

// Project actions
export type ProjectAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'REMOVE_PROJECT'; payload: string }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project | null }
  | { type: 'SET_FILTERS'; payload: Partial<ProjectState['filters']> }
  | { type: 'SET_PAGINATION'; payload: Partial<ProjectState['pagination']> }
  | { type: 'RESET_STATE' }

// Initial state
const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 0,
  },
}

// Project reducer
function projectReducer(
  state: ProjectState,
  action: ProjectAction
): ProjectState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    case 'SET_PROJECTS':
      return { ...state, projects: action.payload }

    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [action.payload, ...state.projects],
        pagination: {
          ...state.pagination,
          totalCount: state.pagination.totalCount + 1,
        },
      }

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
        currentProject:
          state.currentProject?.id === action.payload.id
            ? action.payload
            : state.currentProject,
      }

    case 'REMOVE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        currentProject:
          state.currentProject?.id === action.payload
            ? null
            : state.currentProject,
        pagination: {
          ...state.pagination,
          totalCount: Math.max(0, state.pagination.totalCount - 1),
        },
      }

    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload }

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }, // Reset to first page when filtering
      }

    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      }

    case 'RESET_STATE':
      return initialState

    default:
      return state
  }
}

// Context interface
interface ProjectContextType {
  state: ProjectState
  dispatch: React.Dispatch<ProjectAction>
  // Helper functions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (project: Project) => void
  removeProject: (projectId: string) => void
  setCurrentProject: (project: Project | null) => void
  setFilters: (filters: Partial<ProjectState['filters']>) => void
  setPagination: (pagination: Partial<ProjectState['pagination']>) => void
  resetState: () => void
  // Computed values
  filteredProjects: Project[]
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Create context
const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

// Provider component
interface ProjectProviderProps {
  children: ReactNode
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [state, dispatch] = useReducer(projectReducer, initialState)
  const { user } = useUser()

  // Reset state when user changes
  useEffect(() => {
    if (!user) {
      dispatch({ type: 'RESET_STATE' })
    }
  }, [user])

  // Helper functions
  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }

  const setProjects = (projects: Project[]) => {
    dispatch({ type: 'SET_PROJECTS', payload: projects })
  }

  const addProject = (project: Project) => {
    dispatch({ type: 'ADD_PROJECT', payload: project })
  }

  const updateProject = (project: Project) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: project })
  }

  const removeProject = (projectId: string) => {
    dispatch({ type: 'REMOVE_PROJECT', payload: projectId })
  }

  const setCurrentProject = (project: Project | null) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: project })
  }

  const setFilters = (filters: Partial<ProjectState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters })
  }

  const setPagination = (pagination: Partial<ProjectState['pagination']>) => {
    dispatch({ type: 'SET_PAGINATION', payload: pagination })
  }

  const resetState = () => {
    dispatch({ type: 'RESET_STATE' })
  }

  // Computed values
  const filteredProjects = state.projects
    .filter(project => {
      if (!state.filters.search) return true

      const searchLower = state.filters.search.toLowerCase()
      return (
        project.title.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      const { sortBy, sortOrder } = state.filters
      let comparison = 0

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'updatedAt':
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

  const hasNextPage = state.pagination.page < state.pagination.totalPages
  const hasPreviousPage = state.pagination.page > 1

  const value: ProjectContextType = {
    state,
    dispatch,
    setLoading,
    setError,
    setProjects,
    addProject,
    updateProject,
    removeProject,
    setCurrentProject,
    setFilters,
    setPagination,
    resetState,
    filteredProjects,
    hasNextPage,
    hasPreviousPage,
  }

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  )
}

// Hook to use project context
export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}

// Convenience hooks
export function useProjects() {
  const {
    state,
    filteredProjects,
    setFilters,
    setPagination,
    hasNextPage,
    hasPreviousPage,
  } = useProject()

  return {
    projects: filteredProjects,
    isLoading: state.isLoading,
    error: state.error,
    filters: state.filters,
    pagination: state.pagination,
    setFilters,
    setPagination,
    hasNextPage,
    hasPreviousPage,
  }
}

export function useCurrentProject() {
  const { state, setCurrentProject } = useProject()
  return [state.currentProject, setCurrentProject] as const
}
