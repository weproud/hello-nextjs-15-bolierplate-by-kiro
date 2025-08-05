'use client'

import {
  createAppStore,
  type AppState,
  type AppStore,
} from '@/stores/app-store'
import { createContext, useContext, useRef, type ReactNode } from 'react'
import { useStore } from 'zustand'

const AppStoreContext = createContext<AppStore | null>(null)

export interface AppStoreProviderProps {
  children: ReactNode
  initialState?: Partial<AppState>
}

export const AppStoreProvider = ({
  children,
  initialState,
}: AppStoreProviderProps) => {
  const storeRef = useRef<AppStore | undefined>(undefined)

  if (!storeRef.current) {
    storeRef.current = createAppStore()

    // 초기 상태가 제공된 경우 설정
    if (initialState) {
      const state = storeRef.current.getState()
      storeRef.current.setState({ ...state, ...initialState })
    }
  }

  return (
    <AppStoreContext.Provider value={storeRef.current}>
      {children}
    </AppStoreContext.Provider>
  )
}

// 기본 useAppStore 훅
export const useAppStore = <T,>(selector: (state: AppState) => T): T => {
  const appStoreContext = useContext(AppStoreContext)

  if (!appStoreContext) {
    throw new Error('useAppStore must be used within AppStoreProvider')
  }

  return useStore(appStoreContext, selector)
}

// 편의를 위한 특화된 훅들
export const useUser = () => useAppStore(state => state.user)
export const useTheme = () => useAppStore(state => state.theme)
export const useSidebar = () => useAppStore(state => state.sidebarOpen)
export const useNotifications = () => useAppStore(state => state.notifications)
export const usePreferences = () => useAppStore(state => state.preferences)
export const useAppLoading = () => useAppStore(state => state.isLoading)
export const useAppError = () => useAppStore(state => state.error)

// 액션 훅들
export const useAppActions = () =>
  useAppStore(state => ({
    setUser: state.setUser,
    setSidebarOpen: state.setSidebarOpen,
    setTheme: state.setTheme,
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    markNotificationAsRead: state.markNotificationAsRead,
    clearAllNotifications: state.clearAllNotifications,
    updatePreferences: state.updatePreferences,
    setLoading: state.setLoading,
    setError: state.setError,
    resetState: state.resetState,
  }))

// 사용자 관련 액션들
export const useUserActions = () =>
  useAppStore(state => ({
    setUser: state.setUser,
  }))

// UI 관련 액션들
export const useUIActions = () =>
  useAppStore(state => ({
    setSidebarOpen: state.setSidebarOpen,
    setTheme: state.setTheme,
  }))

// 알림 관련 액션들
export const useNotificationActions = () =>
  useAppStore(state => ({
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    markNotificationAsRead: state.markNotificationAsRead,
    clearAllNotifications: state.clearAllNotifications,
  }))
