import { createStore } from 'zustand/vanilla'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Theme, DatabaseUser, Notification } from '@/types'

// Define the main app state interface
export interface AppState {
  // User State
  user: DatabaseUser | null

  // UI State
  sidebarOpen: boolean
  theme: Theme

  // Notification State
  notifications: Notification[]

  // User preferences
  preferences: {
    notifications: boolean
    autoSave: boolean
    language: string
    timezone: string
  }

  // Loading states
  isLoading: boolean

  // Error state
  error: string | null

  // Actions
  setUser: (user: DatabaseUser | null) => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: Theme) => void
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => void
  removeNotification: (id: string) => void
  markNotificationAsRead: (id: string) => void
  clearAllNotifications: () => void
  updatePreferences: (preferences: Partial<AppState['preferences']>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetState: () => void
}

// Initial state
const initialState = {
  user: null,
  sidebarOpen: false,
  theme: 'system' as Theme,
  notifications: [],
  preferences: {
    notifications: true,
    autoSave: true,
    language: 'ko',
    timezone: 'Asia/Seoul',
  },
  isLoading: false,
  error: null,
}

export type AppStore = ReturnType<typeof createAppStore>

// Create store factory
export const createAppStore = () => {
  return createStore<AppState>()(
    devtools(
      persist(
        immer(set => ({
          ...initialState,

          // User Actions
          setUser: (user: DatabaseUser | null) =>
            set(state => {
              state.user = user
              // 사용자가 로그아웃하면 알림도 초기화
              if (!user) {
                state.notifications = []
              }
            }),

          // UI Actions
          setSidebarOpen: (open: boolean) =>
            set(state => {
              state.sidebarOpen = open
            }),

          setTheme: (theme: Theme) =>
            set(state => {
              state.theme = theme
            }),

          // Notification Actions
          addNotification: (
            notification: Omit<Notification, 'id' | 'timestamp'>
          ) =>
            set(state => {
              const newNotification: Notification = {
                ...notification,
                id: crypto.randomUUID(),
                timestamp: new Date(),
                read: false,
              }
              state.notifications.unshift(newNotification)

              // 최대 50개의 알림만 유지
              if (state.notifications.length > 50) {
                state.notifications = state.notifications.slice(0, 50)
              }
            }),

          removeNotification: (id: string) =>
            set(state => {
              state.notifications = state.notifications.filter(n => n.id !== id)
            }),

          markNotificationAsRead: (id: string) =>
            set(state => {
              const notification = state.notifications.find(n => n.id === id)
              if (notification) {
                notification.read = true
              }
            }),

          clearAllNotifications: () =>
            set(state => {
              state.notifications = []
            }),

          // Preferences Actions
          updatePreferences: (
            newPreferences: Partial<AppState['preferences']>
          ) =>
            set(state => {
              state.preferences = { ...state.preferences, ...newPreferences }
            }),

          // Loading and Error Actions
          setLoading: (loading: boolean) =>
            set(state => {
              state.isLoading = loading
            }),

          setError: (error: string | null) =>
            set(state => {
              state.error = error
            }),

          // Reset Action
          resetState: () =>
            set(state => {
              Object.assign(state, initialState)
            }),
        })),
        {
          name: 'app-store',
          partialize: state => ({
            theme: state.theme,
            preferences: state.preferences,
            // 사용자 정보는 세션에서 관리하므로 persist하지 않음
          }),
        }
      ),
      {
        name: 'app-store',
      }
    )
  )
}
