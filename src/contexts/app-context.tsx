'use client'

import { createContext, useContext, useReducer, type ReactNode } from 'react'

// App state interface
export interface AppState {
  isLoading: boolean
  error: string | null
  notifications: Notification[]
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
}

// Notification interface
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  timestamp: Date
}

// App actions
export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | {
      type: 'ADD_NOTIFICATION'
      payload: Omit<Notification, 'id' | 'timestamp'>
    }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }

// Initial state
const initialState: AppState = {
  isLoading: false,
  error: null,
  notifications: [],
  sidebarOpen: false,
  theme: 'system',
}

// App reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    case 'ADD_NOTIFICATION':
      const notification: Notification = {
        ...action.payload,
        id: Math.random().toString(36).substring(2, 15),
        timestamp: new Date(),
      }
      return {
        ...state,
        notifications: [...state.notifications, notification],
      }

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      }

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] }

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen }

    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload }

    case 'SET_THEME':
      return { ...state, theme: action.payload }

    default:
      return state
  }
}

// Context interface
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  // Helper functions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  toggleSidebar: () => void
  setSidebar: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined)

// Provider component
interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Helper functions
  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }

  const addNotification = (
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification })
  }

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
  }

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' })
  }

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' })
  }

  const setSidebar = (open: boolean) => {
    dispatch({ type: 'SET_SIDEBAR', payload: open })
  }

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: theme })
  }

  const value: AppContextType = {
    state,
    dispatch,
    setLoading,
    setError,
    addNotification,
    removeNotification,
    clearNotifications,
    toggleSidebar,
    setSidebar,
    setTheme,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Hook to use app context
export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// Convenience hooks
export function useLoading() {
  const { state, setLoading } = useApp()
  return [state.isLoading, setLoading] as const
}

export function useError() {
  const { state, setError } = useApp()
  return [state.error, setError] as const
}

export function useNotifications() {
  const { state, addNotification, removeNotification, clearNotifications } =
    useApp()
  return {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  }
}

export function useSidebar() {
  const { state, toggleSidebar, setSidebar } = useApp()
  return {
    isOpen: state.sidebarOpen,
    toggle: toggleSidebar,
    setOpen: setSidebar,
  }
}

export function useTheme() {
  const { state, setTheme } = useApp()
  return [state.theme, setTheme] as const
}
