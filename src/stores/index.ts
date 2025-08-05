// Export store types and interfaces
export type { AppState, AppStore } from '@/stores/app-store'
export type {
  PostWithAuthor,
  PostsState,
  PostsStore,
} from '@/stores/posts-store'
export type {
  ProjectWithUser,
  ProjectsState,
  ProjectsStore,
} from '@/stores/projects-store'

// Export the provider-based approach (recommended for SSR)
export {
  AppStoreProvider,
  // Action hooks
  useAppActions,
  useAppError,
  useAppLoading,
  useAppStore,
  useNotificationActions,
  useNotifications,
  usePreferences,
  useSidebar,
  useTheme,
  useUIActions,
  // Specialized hooks
  useUser,
  useUserActions,
} from '@/stores/provider'

// Export posts store
export {
  PostsStoreProvider,
  useCurrentPost,
  usePosts,
  usePostsActions,
  usePostsDataActions,
  usePostsError,
  usePostsFilterActions,
  usePostsFilters,
  usePostsLoading,
  usePostsLoadingActions,
  usePostsPagination,
  usePostsPaginationActions,
  usePostsStore,
} from '@/stores/posts-provider'

// Export projects store
export {
  ProjectsStoreProvider,
  useCurrentProject,
  useProjects,
  useProjectsActions,
  useProjectsDataActions,
  useProjectsError,
  useProjectsFilterActions,
  useProjectsFilters,
  useProjectsLoading,
  useProjectsLoadingActions,
  useProjectsPagination,
  useProjectsPaginationActions,
  useProjectsSort,
  useProjectsStore,
} from '@/stores/projects-provider'

// Export the store factories for advanced use cases
export { createAppStore } from '@/stores/app-store'
export { createPostsStore } from '@/stores/posts-store'
export { createProjectsStore } from '@/stores/projects-store'
