import { createStore } from 'zustand/vanilla'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Define the main app state interface
export interface AppState {
  // UI State
  sidebarOpen: boolean
  theme: import('@/types').Theme

  // User preferences
  preferences: {
    notifications: boolean
    autoSave: boolean
  }

  // Actions
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: import('@/types').Theme) => void
  updatePreferences: (preferences: Partial<AppState['preferences']>) => void
  resetState: () => void
}

// Initial state
const initialState = {
  sidebarOpen: false,
  theme: 'system' as const,
  preferences: {
    notifications: true,
    autoSave: true,
  },
}

export type AppStore = ReturnType<typeof createAppStore>

// Create store factory
export const createAppStore = () => {
  return createStore<AppState>()(
    devtools(
      persist(
        immer(set => ({
          ...initialState,

          // Actions
          setSidebarOpen: (open: boolean) =>
            set(state => {
              state.sidebarOpen = open
            }),

          setTheme: (theme: import('@/types').Theme) =>
            set(state => {
              state.theme = theme
            }),

          updatePreferences: (
            newPreferences: Partial<AppState['preferences']>
          ) =>
            set(state => {
              state.preferences = { ...state.preferences, ...newPreferences }
            }),

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
          }),
        }
      ),
      {
        name: 'app-store',
      }
    )
  )
}
