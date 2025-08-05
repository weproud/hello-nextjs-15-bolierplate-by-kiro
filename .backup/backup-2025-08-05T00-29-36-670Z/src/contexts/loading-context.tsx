'use client'

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react'

// 로딩 상태 타입 정의
export interface LoadingState {
  // 전역 로딩 상태
  global: boolean

  // 라우트별 로딩 상태
  routes: Map<string, boolean>

  // 컴포넌트별 로딩 상태
  components: Map<string, boolean>

  // 데이터별 로딩 상태
  data: Map<string, boolean>

  // 진행률 정보
  progress: Map<string, ProgressInfo>
}

// 진행률 정보 인터페이스
export interface ProgressInfo {
  current: number
  total: number
  message?: string
  stage?: string
}

// 로딩 액션 타입
export type LoadingAction =
  | { type: 'SET_GLOBAL_LOADING'; payload: boolean }
  | { type: 'SET_ROUTE_LOADING'; payload: { route: string; loading: boolean } }
  | { type: 'SET_COMPONENT_LOADING'; payload: { id: string; loading: boolean } }
  | { type: 'SET_DATA_LOADING'; payload: { key: string; loading: boolean } }
  | { type: 'SET_PROGRESS'; payload: { key: string; progress: ProgressInfo } }
  | { type: 'REMOVE_PROGRESS'; payload: string }
  | { type: 'CLEAR_ROUTE_LOADING'; payload: string }
  | { type: 'CLEAR_COMPONENT_LOADING'; payload: string }
  | { type: 'CLEAR_DATA_LOADING'; payload: string }
  | { type: 'RESET_ALL_LOADING' }

// 초기 상태
const initialState: LoadingState = {
  global: false,
  routes: new Map(),
  components: new Map(),
  data: new Map(),
  progress: new Map(),
}

// 로딩 리듀서
function loadingReducer(
  state: LoadingState,
  action: LoadingAction
): LoadingState {
  switch (action.type) {
    case 'SET_GLOBAL_LOADING':
      return { ...state, global: action.payload }

    case 'SET_ROUTE_LOADING': {
      const newRoutes = new Map(state.routes)
      if (action.payload.loading) {
        newRoutes.set(action.payload.route, true)
      } else {
        newRoutes.delete(action.payload.route)
      }
      return { ...state, routes: newRoutes }
    }

    case 'SET_COMPONENT_LOADING': {
      const newComponents = new Map(state.components)
      if (action.payload.loading) {
        newComponents.set(action.payload.id, true)
      } else {
        newComponents.delete(action.payload.id)
      }
      return { ...state, components: newComponents }
    }

    case 'SET_DATA_LOADING': {
      const newData = new Map(state.data)
      if (action.payload.loading) {
        newData.set(action.payload.key, true)
      } else {
        newData.delete(action.payload.key)
      }
      return { ...state, data: newData }
    }

    case 'SET_PROGRESS': {
      const newProgress = new Map(state.progress)
      newProgress.set(action.payload.key, action.payload.progress)
      return { ...state, progress: newProgress }
    }

    case 'REMOVE_PROGRESS': {
      const newProgress = new Map(state.progress)
      newProgress.delete(action.payload)
      return { ...state, progress: newProgress }
    }

    case 'CLEAR_ROUTE_LOADING': {
      const newRoutes = new Map(state.routes)
      newRoutes.delete(action.payload)
      return { ...state, routes: newRoutes }
    }

    case 'CLEAR_COMPONENT_LOADING': {
      const newComponents = new Map(state.components)
      newComponents.delete(action.payload)
      return { ...state, components: newComponents }
    }

    case 'CLEAR_DATA_LOADING': {
      const newData = new Map(state.data)
      newData.delete(action.payload)
      return { ...state, data: newData }
    }

    case 'RESET_ALL_LOADING':
      return initialState

    default:
      return state
  }
}

// 컨텍스트 인터페이스
interface LoadingContextType {
  state: LoadingState
  dispatch: React.Dispatch<LoadingAction>

  // 헬퍼 함수들
  setGlobalLoading: (loading: boolean) => void
  setRouteLoading: (route: string, loading: boolean) => void
  setComponentLoading: (id: string, loading: boolean) => void
  setDataLoading: (key: string, loading: boolean) => void
  setProgress: (key: string, progress: ProgressInfo) => void
  removeProgress: (key: string) => void

  // 상태 확인 함수들
  isGlobalLoading: () => boolean
  isRouteLoading: (route: string) => boolean
  isComponentLoading: (id: string) => boolean
  isDataLoading: (key: string) => boolean
  getProgress: (key: string) => ProgressInfo | undefined

  // 정리 함수들
  clearRouteLoading: (route: string) => void
  clearComponentLoading: (id: string) => void
  clearDataLoading: (key: string) => void
  resetAllLoading: () => void
}

// 컨텍스트 생성
const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

// 프로바이더 컴포넌트
interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [state, dispatch] = useReducer(loadingReducer, initialState)

  // 헬퍼 함수들
  const setGlobalLoading = useCallback(
    (loading: boolean) => {
      dispatch({ type: 'SET_GLOBAL_LOADING', payload: loading })
    },
    [dispatch]
  )

  const setRouteLoading = useCallback(
    (route: string, loading: boolean) => {
      dispatch({ type: 'SET_ROUTE_LOADING', payload: { route, loading } })
    },
    [dispatch]
  )

  const setComponentLoading = useCallback(
    (id: string, loading: boolean) => {
      dispatch({ type: 'SET_COMPONENT_LOADING', payload: { id, loading } })
    },
    [dispatch]
  )

  const setDataLoading = useCallback(
    (key: string, loading: boolean) => {
      dispatch({ type: 'SET_DATA_LOADING', payload: { key, loading } })
    },
    [dispatch]
  )

  const setProgress = useCallback(
    (key: string, progress: ProgressInfo) => {
      dispatch({ type: 'SET_PROGRESS', payload: { key, progress } })
    },
    [dispatch]
  )

  const removeProgress = useCallback(
    (key: string) => {
      dispatch({ type: 'REMOVE_PROGRESS', payload: key })
    },
    [dispatch]
  )

  // 상태 확인 함수들
  const isGlobalLoading = useCallback(() => state.global, [state.global])

  const isRouteLoading = useCallback(
    (route: string) => state.routes.has(route),
    [state.routes]
  )

  const isComponentLoading = useCallback(
    (id: string) => state.components.has(id),
    [state.components]
  )

  const isDataLoading = useCallback(
    (key: string) => state.data.has(key),
    [state.data]
  )

  const getProgress = useCallback(
    (key: string) => state.progress.get(key),
    [state.progress]
  )

  // 정리 함수들
  const clearRouteLoading = useCallback(
    (route: string) => {
      dispatch({ type: 'CLEAR_ROUTE_LOADING', payload: route })
    },
    [dispatch]
  )

  const clearComponentLoading = useCallback(
    (id: string) => {
      dispatch({ type: 'CLEAR_COMPONENT_LOADING', payload: id })
    },
    [dispatch]
  )

  const clearDataLoading = useCallback(
    (key: string) => {
      dispatch({ type: 'CLEAR_DATA_LOADING', payload: key })
    },
    [dispatch]
  )

  const resetAllLoading = useCallback(() => {
    dispatch({ type: 'RESET_ALL_LOADING' })
  }, [dispatch])

  const value: LoadingContextType = {
    state,
    dispatch,
    setGlobalLoading,
    setRouteLoading,
    setComponentLoading,
    setDataLoading,
    setProgress,
    removeProgress,
    isGlobalLoading,
    isRouteLoading,
    isComponentLoading,
    isDataLoading,
    getProgress,
    clearRouteLoading,
    clearComponentLoading,
    clearDataLoading,
    resetAllLoading,
  }

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  )
}

// 컨텍스트 사용 훅
export function useLoadingContext() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoadingContext must be used within a LoadingProvider')
  }
  return context
}
