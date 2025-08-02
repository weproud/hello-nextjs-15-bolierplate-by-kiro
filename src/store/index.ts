// Export store types and interfaces
export type { AppState, AppStore } from './app-store'

// Export the provider-based approach (recommended for SSR)
export {
  AppStoreProvider,
  useAppStore,
  // Specialized hooks
  useUser,
  useTheme,
  useSidebar,
  useNotifications,
  usePreferences,
  useAppLoading,
  useAppError,
  // Action hooks
  useAppActions,
  useUserActions,
  useUIActions,
  useNotificationActions,
} from './provider'

// Export the store factory for advanced use cases
export { createAppStore } from './app-store'
