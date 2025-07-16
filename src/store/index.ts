// Export store types and interfaces
export type { AppState, AppStore } from './app-store'

// Export the provider-based approach (recommended for SSR)
export { AppStoreProvider, useAppStore } from './provider'

// Export the store factory for advanced use cases
export { createAppStore } from './app-store'
