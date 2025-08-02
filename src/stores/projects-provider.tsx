'use client'

import { createContext, useContext, useRef, type ReactNode } from 'react'
import { useStore } from 'zustand'
import {
  createProjectsStore,
  type ProjectsStore,
  type ProjectsState,
} from './projects-store'

const ProjectsStoreContext = createContext<ProjectsStore | null>(null)

export interface ProjectsStoreProviderProps {
  children: ReactNode
  initialState?: Partial<ProjectsState>
}

export const ProjectsStoreProvider = ({
  children,
  initialState,
}: ProjectsStoreProviderProps) => {
  const storeRef = useRef<ProjectsStore | undefined>(undefined)

  if (!storeRef.current) {
    storeRef.current = createProjectsStore()

    // 초기 상태가 제공된 경우 설정
    if (initialState) {
      const state = storeRef.current.getState()
      storeRef.current.setState({ ...state, ...initialState })
    }
  }

  return (
    <ProjectsStoreContext.Provider value={storeRef.current}>
      {children}
    </ProjectsStoreContext.Provider>
  )
}

// 기본 useProjectsStore 훅
export const useProjectsStore = <T,>(
  selector: (state: ProjectsState) => T
): T => {
  const projectsStoreContext = useContext(ProjectsStoreContext)

  if (!projectsStoreContext) {
    throw new Error(
      'useProjectsStore must be used within ProjectsStoreProvider'
    )
  }

  return useStore(projectsStoreContext, selector)
}

// 편의를 위한 특화된 훅들
export const useProjects = () => useProjectsStore(state => state.projects)
export const useCurrentProject = () =>
  useProjectsStore(state => state.currentProject)
export const useProjectsLoading = () =>
  useProjectsStore(state => ({
    isLoading: state.isLoading,
    isCreating: state.isCreating,
    isUpdating: state.isUpdating,
    isDeleting: state.isDeleting,
    isDuplicating: state.isDuplicating,
  }))
export const useProjectsError = () => useProjectsStore(state => state.error)
export const useProjectsPagination = () =>
  useProjectsStore(state => state.pagination)
export const useProjectsFilters = () => useProjectsStore(state => state.filters)
export const useProjectsSort = () => useProjectsStore(state => state.sort)

// 액션 훅들
export const useProjectsActions = () =>
  useProjectsStore(state => ({
    setProjects: state.setProjects,
    addProject: state.addProject,
    updateProject: state.updateProject,
    removeProject: state.removeProject,
    duplicateProject: state.duplicateProject,
    setCurrentProject: state.setCurrentProject,
    setLoading: state.setLoading,
    setCreating: state.setCreating,
    setUpdating: state.setUpdating,
    setDeleting: state.setDeleting,
    setDuplicating: state.setDuplicating,
    setError: state.setError,
    setPagination: state.setPagination,
    setPage: state.setPage,
    setFilters: state.setFilters,
    setSearch: state.setSearch,
    clearFilters: state.clearFilters,
    setSort: state.setSort,
    resetState: state.resetState,
  }))

// 데이터 관련 액션들
export const useProjectsDataActions = () =>
  useProjectsStore(state => ({
    setProjects: state.setProjects,
    addProject: state.addProject,
    updateProject: state.updateProject,
    removeProject: state.removeProject,
    duplicateProject: state.duplicateProject,
    setCurrentProject: state.setCurrentProject,
  }))

// 로딩 관련 액션들
export const useProjectsLoadingActions = () =>
  useProjectsStore(state => ({
    setLoading: state.setLoading,
    setCreating: state.setCreating,
    setUpdating: state.setUpdating,
    setDeleting: state.setDeleting,
    setDuplicating: state.setDuplicating,
  }))

// 필터 관련 액션들
export const useProjectsFilterActions = () =>
  useProjectsStore(state => ({
    setFilters: state.setFilters,
    setSearch: state.setSearch,
    clearFilters: state.clearFilters,
    setSort: state.setSort,
  }))

// 페이지네이션 관련 액션들
export const useProjectsPaginationActions = () =>
  useProjectsStore(state => ({
    setPagination: state.setPagination,
    setPage: state.setPage,
  }))
