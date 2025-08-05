'use client'

import { useCallback, useEffect } from 'react'
import {
  useLoadingContext,
  type ProgressInfo,
} from '@/contexts/loading-context'

// 전역 로딩 상태 훅
export function useGlobalLoading() {
  const { isGlobalLoading, setGlobalLoading } = useLoadingContext()

  return {
    isLoading: isGlobalLoading(),
    setLoading: setGlobalLoading,
  }
}

// 라우트별 로딩 상태 훅
export function useRouteLoading(route: string) {
  const { isRouteLoading, setRouteLoading, clearRouteLoading } =
    useLoadingContext()

  const setLoading = useCallback(
    (loading: boolean) => {
      setRouteLoading(route, loading)
    },
    [route, setRouteLoading]
  )

  const clearLoading = useCallback(() => {
    clearRouteLoading(route)
  }, [route, clearRouteLoading])

  // 컴포넌트 언마운트 시 로딩 상태 정리
  useEffect(() => {
    return () => {
      clearRouteLoading(route)
    }
  }, [route, clearRouteLoading])

  return {
    isLoading: isRouteLoading(route),
    setLoading,
    clearLoading,
  }
}

// 컴포넌트별 로딩 상태 훅
export function useComponentLoading(componentId: string) {
  const { isComponentLoading, setComponentLoading, clearComponentLoading } =
    useLoadingContext()

  const setLoading = useCallback(
    (loading: boolean) => {
      setComponentLoading(componentId, loading)
    },
    [componentId, setComponentLoading]
  )

  const clearLoading = useCallback(() => {
    clearComponentLoading(componentId)
  }, [componentId, clearComponentLoading])

  // 컴포넌트 언마운트 시 로딩 상태 정리
  useEffect(() => {
    return () => {
      clearComponentLoading(componentId)
    }
  }, [componentId, clearComponentLoading])

  return {
    isLoading: isComponentLoading(componentId),
    setLoading,
    clearLoading,
  }
}

// 데이터별 로딩 상태 훅
export function useDataLoading(dataKey: string) {
  const { isDataLoading, setDataLoading, clearDataLoading } =
    useLoadingContext()

  const setLoading = useCallback(
    (loading: boolean) => {
      setDataLoading(dataKey, loading)
    },
    [dataKey, setDataLoading]
  )

  const clearLoading = useCallback(() => {
    clearDataLoading(dataKey)
  }, [dataKey, clearDataLoading])

  // 컴포넌트 언마운트 시 로딩 상태 정리
  useEffect(() => {
    return () => {
      clearDataLoading(dataKey)
    }
  }, [dataKey, clearDataLoading])

  return {
    isLoading: isDataLoading(dataKey),
    setLoading,
    clearLoading,
  }
}

// 진행률 관리 훅
export function useProgress(progressKey: string) {
  const { getProgress, setProgress, removeProgress } = useLoadingContext()

  const updateProgress = useCallback(
    (progress: ProgressInfo) => {
      setProgress(progressKey, progress)
    },
    [progressKey, setProgress]
  )

  const clearProgress = useCallback(() => {
    removeProgress(progressKey)
  }, [progressKey, removeProgress])

  // 컴포넌트 언마운트 시 진행률 정리
  useEffect(() => {
    return () => {
      removeProgress(progressKey)
    }
  }, [progressKey, removeProgress])

  return {
    progress: getProgress(progressKey),
    updateProgress,
    clearProgress,
  }
}

// 복합 로딩 상태 훅 (여러 로딩 상태를 한번에 관리)
export function useMultipleLoading(keys: {
  route?: string
  component?: string
  data?: string[]
}) {
  const {
    isRouteLoading,
    isComponentLoading,
    isDataLoading,
    setRouteLoading,
    setComponentLoading,
    setDataLoading,
  } = useLoadingContext()

  // 전체 로딩 상태 확인
  const isLoading = useCallback(() => {
    if (keys.route && isRouteLoading(keys.route)) return true
    if (keys.component && isComponentLoading(keys.component)) return true
    if (keys.data && keys.data.some(key => isDataLoading(key))) return true
    return false
  }, [keys, isRouteLoading, isComponentLoading, isDataLoading])

  // 모든 로딩 상태 설정
  const setAllLoading = useCallback(
    (loading: boolean) => {
      if (keys.route) setRouteLoading(keys.route, loading)
      if (keys.component) setComponentLoading(keys.component, loading)
      if (keys.data) {
        keys.data.forEach(key => setDataLoading(key, loading))
      }
    },
    [keys, setRouteLoading, setComponentLoading, setDataLoading]
  )

  return {
    isLoading: isLoading(),
    setAllLoading,
    individual: {
      route: keys.route ? isRouteLoading(keys.route) : false,
      component: keys.component ? isComponentLoading(keys.component) : false,
      data: keys.data
        ? keys.data.map(key => ({ key, loading: isDataLoading(key) }))
        : [],
    },
  }
}

// 자동 로딩 상태 관리 훅 (Promise 기반)
export function useAsyncLoading<T>(
  asyncFn: () => Promise<T>,
  dependencies: React.DependencyList = [],
  options?: {
    loadingKey?: string
    progressKey?: string
    autoStart?: boolean
  }
) {
  const { setDataLoading } = useLoadingContext()
  const { updateProgress, clearProgress } = useProgress(
    options?.progressKey || 'async-operation'
  )

  const execute = useCallback(async (): Promise<T | null> => {
    const loadingKey = options?.loadingKey || 'async-operation'

    try {
      setDataLoading(loadingKey, true)

      if (options?.progressKey) {
        updateProgress({ current: 0, total: 100, message: '시작 중...' })
      }

      const result = await asyncFn()

      if (options?.progressKey) {
        updateProgress({ current: 100, total: 100, message: '완료' })
        setTimeout(() => clearProgress(), 500)
      }

      return result
    } catch (error) {
      if (options?.progressKey) {
        clearProgress()
      }
      throw error
    } finally {
      setDataLoading(loadingKey, false)
    }
  }, [
    asyncFn,
    setDataLoading,
    updateProgress,
    clearProgress,
    options,
    ...dependencies,
  ])

  return { execute }
}
