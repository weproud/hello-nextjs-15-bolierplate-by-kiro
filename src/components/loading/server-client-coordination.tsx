'use client'

import { useEffect, useRef } from 'react'
import {
  useRouteLoading,
  useComponentLoading,
  useDataLoading,
} from '@/hooks/use-loading-state'

// Server Component에서 Client Component로 loading state를 전달하기 위한 인터페이스
export interface ServerLoadingState {
  isLoading: boolean
  loadingType: 'route' | 'component' | 'data'
  loadingKey: string
  message?: string
}

// Server Component loading state를 Client Component에 동기화
interface LoadingStateSyncProps {
  serverState: ServerLoadingState
  children?: React.ReactNode
}

export function LoadingStateSync({
  serverState,
  children,
}: LoadingStateSyncProps) {
  const routeLoading = useRouteLoading(serverState.loadingKey)
  const componentLoading = useComponentLoading(serverState.loadingKey)
  const dataLoading = useDataLoading(serverState.loadingKey)

  const prevStateRef = useRef<ServerLoadingState>()

  useEffect(() => {
    // Server state가 변경되었을 때만 Client state 업데이트
    if (JSON.stringify(prevStateRef.current) !== JSON.stringify(serverState)) {
      switch (serverState.loadingType) {
        case 'route':
          routeLoading.setLoading(serverState.isLoading)
          break
        case 'component':
          componentLoading.setLoading(serverState.isLoading)
          break
        case 'data':
          dataLoading.setLoading(serverState.isLoading)
          break
      }
      prevStateRef.current = serverState
    }
  }, [serverState, routeLoading, componentLoading, dataLoading])

  // 컴포넌트 언마운트 시 loading state 정리
  useEffect(() => {
    return () => {
      switch (serverState.loadingType) {
        case 'route':
          routeLoading.clearLoading()
          break
        case 'component':
          componentLoading.clearLoading()
          break
        case 'data':
          dataLoading.clearLoading()
          break
      }
    }
  }, [serverState.loadingType, routeLoading, componentLoading, dataLoading])

  return <>{children}</>
}

// Server Component에서 사용할 loading wrapper
interface ServerLoadingWrapperProps {
  loadingKey: string
  loadingType: 'route' | 'component' | 'data'
  isLoading: boolean
  message?: string
  children: React.ReactNode
}

export function ServerLoadingWrapper({
  loadingKey,
  loadingType,
  isLoading,
  message,
  children,
}: ServerLoadingWrapperProps) {
  const serverState: ServerLoadingState = {
    isLoading,
    loadingType,
    loadingKey,
    message,
  }

  return (
    <LoadingStateSync serverState={serverState}>{children}</LoadingStateSync>
  )
}

// Hydration 경계에서 loading state 동기화
interface HydrationLoadingSyncProps {
  serverLoadingStates: ServerLoadingState[]
  children: React.ReactNode
}

export function HydrationLoadingSync({
  serverLoadingStates,
  children,
}: HydrationLoadingSyncProps) {
  return (
    <>
      {serverLoadingStates.map((state, index) => (
        <LoadingStateSync
          key={`${state.loadingType}-${state.loadingKey}-${index}`}
          serverState={state}
        />
      ))}
      {children}
    </>
  )
}

// Server Action과 Client Component 간의 loading state 동기화
interface ServerActionLoadingSyncProps {
  actionKey: string
  children: React.ReactNode
}

export function ServerActionLoadingSync({
  actionKey,
  children,
}: ServerActionLoadingSyncProps) {
  const dataLoading = useDataLoading(`server-action-${actionKey}`)

  // Server Action 실행 시 loading state 설정
  const handleServerAction = async (action: () => Promise<any>) => {
    try {
      dataLoading.setLoading(true)
      await action()
    } finally {
      dataLoading.setLoading(false)
    }
  }

  return <div data-server-action-sync={actionKey}>{children}</div>
}

// Route transition loading 동기화
interface RouteTransitionSyncProps {
  routePath: string
  children: React.ReactNode
}

export function RouteTransitionSync({
  routePath,
  children,
}: RouteTransitionSyncProps) {
  const routeLoading = useRouteLoading(routePath)

  useEffect(() => {
    // 라우트 변경 시작 시 loading 설정
    const handleRouteChangeStart = () => {
      routeLoading.setLoading(true)
    }

    // 라우트 변경 완료 시 loading 해제
    const handleRouteChangeComplete = () => {
      routeLoading.setLoading(false)
    }

    // Next.js router events 리스닝 (App Router에서는 다른 방식 필요)
    // 여기서는 기본적인 패턴만 제공

    return () => {
      routeLoading.clearLoading()
    }
  }, [routePath, routeLoading])

  return <>{children}</>
}

// Streaming과 Suspense를 위한 loading coordination
interface StreamingLoadingCoordinatorProps {
  streamKey: string
  fallback: React.ReactNode
  children: React.ReactNode
}

export function StreamingLoadingCoordinator({
  streamKey,
  fallback,
  children,
}: StreamingLoadingCoordinatorProps) {
  const componentLoading = useComponentLoading(`streaming-${streamKey}`)

  useEffect(() => {
    // Streaming 시작
    componentLoading.setLoading(true)

    // Streaming 완료 감지 (실제로는 Suspense boundary에서 처리)
    const timer = setTimeout(() => {
      componentLoading.setLoading(false)
    }, 100)

    return () => {
      clearTimeout(timer)
      componentLoading.clearLoading()
    }
  }, [streamKey, componentLoading])

  return (
    <div data-streaming-key={streamKey}>
      {componentLoading.isLoading ? fallback : children}
    </div>
  )
}

// 여러 Server Component의 loading state를 조합
interface CombinedServerLoadingProps {
  loadingStates: Array<{
    key: string
    type: 'route' | 'component' | 'data'
    isLoading: boolean
  }>
  children: React.ReactNode
  strategy?: 'any' | 'all' // any: 하나라도 로딩 중이면 로딩, all: 모두 로딩 중일 때만 로딩
}

export function CombinedServerLoading({
  loadingStates,
  children,
  strategy = 'any',
}: CombinedServerLoadingProps) {
  const isLoading =
    strategy === 'any'
      ? loadingStates.some(state => state.isLoading)
      : loadingStates.every(state => state.isLoading)

  return (
    <>
      {loadingStates.map((state, index) => (
        <LoadingStateSync
          key={`${state.type}-${state.key}-${index}`}
          serverState={{
            isLoading: state.isLoading,
            loadingType: state.type,
            loadingKey: state.key,
          }}
        />
      ))}
      <div data-combined-loading={isLoading.toString()}>{children}</div>
    </>
  )
}
