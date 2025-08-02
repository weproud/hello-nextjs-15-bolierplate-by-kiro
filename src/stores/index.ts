// Export store types and interfaces
export type { AppState, AppStore } from './app-store'
export type { PostsState, PostsStore, PostWithAuthor } from './posts-store'
export type {
  ProjectsState,
  ProjectsStore,
  ProjectWithUser,
} from './projects-store'

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

// Export posts store
export {
  PostsStoreProvider,
  usePostsStore,
  usePosts,
  useCurrentPost,
  usePostsLoading,
  usePostsError,
  usePostsPagination,
  usePostsFilters,
  usePostsActions,
  usePostsDataActions,
  usePostsLoadingActions,
  usePostsFilterActions,
  usePostsPaginationActions,
} from './posts-provider'

// Export projects store
export {
  ProjectsStoreProvider,
  useProjectsStore,
  useProjects,
  useCurrentProject,
  useProjectsLoading,
  useProjectsError,
  useProjectsPagination,
  useProjectsFilters,
  useProjectsSort,
  useProjectsActions,
  useProjectsDataActions,
  useProjectsLoadingActions,
  useProjectsFilterActions,
  useProjectsPaginationActions,
} from './projects-provider'

// Export the store factories for advanced use cases
export { createAppStore } from './app-store'
export { createPostsStore } from './posts-store'
export { createProjectsStore } from './projects-store'
