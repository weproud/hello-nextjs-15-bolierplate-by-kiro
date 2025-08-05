/**
 * Components Index
 *
 * 모든 컴포넌트들을 중앙에서 관리하고 내보냅니다.
 * Tree shaking을 위해 개별 export를 사용합니다.
 */

// =============================================================================
// UI Components (shadcn/ui based)
// =============================================================================
export * from '@/components/ui'

// =============================================================================
// Layout Components
// =============================================================================
export {
  // Sidebar components
  AppSidebar,
  AppSidebarMenu,
  AppSidebarUser,
  // Responsive layout components
  AspectRatio,
  // Page layout components
  CardGrid,
  Container,
  EmptyState,
  Flex,
  Grid,
  Hide,
  PageContent,
  PageHeader,
  PageLayout,
  ProjectSwitcher,
  ResponsiveText,
  Section,
  Show,
  // Main layout components
  SidebarLayout,
  SidebarLayoutClient,
  SidebarLayoutServer,
  Stack,
} from '@/components/layout'

// =============================================================================
// Authentication Components
// =============================================================================
export {
  // Auth error handling
  AuthError,
  // Auth layout components
  AuthLayout,
  // Core auth components
  AuthProvider,
  ClientProtectedRoute,
  LoginRequired,
  ModalErrorBoundary,
  NavigationHeader,
  ProtectedRoute,
  ProtectedRouteClient,
  // Auth UI components
  SignInForm,
  SignInModal,
  SignInModalLite,
  SignOutDialog,
  UserProfile,
} from '@/components/auth'

// =============================================================================
// Dashboard Components
// =============================================================================
export { DashboardActivity, DashboardStats } from '@/components/dashboard'

// =============================================================================
// Editor Components
// =============================================================================
export { EditorToolbar, TiptapEditor } from '@/components/editor'

// =============================================================================
// Error Handling Components
// =============================================================================
export {
  // Core error boundary components
  ComponentErrorBoundary,
  ErrorBoundary,
  // Test and example components
  ErrorBoundaryExamples,
  // Error fallback components
  ErrorFallback,
  ErrorFallbackClient,
  ErrorFallbackOptimized,
  // Error recovery components
  ErrorRecovery,
  GlobalErrorBoundary,
  HierarchicalErrorBoundary,
  PageErrorBoundary,
  RouteErrorBoundary,
  UnifiedErrorBoundary,
} from '@/components/error'

// =============================================================================
// Form Components
// =============================================================================
export {
  // Basic UI form components
  CheckboxField,
  // Project form components
  CreateProjectForm,
  EditProjectForm,
  // Enhanced form components
  EnhancedForm,
  // Form error components
  FieldValidationIndicator,
  FormError,
  FormErrorList,
  FormErrorSummary,
  FormField,
  FormFieldError,
  FormProgress,
  FormTemplates,
  InputField,
  ProjectForm,
  ProjectFormEnhanced,
  SelectField,
  TextareaField,
} from '@/components/forms'

// =============================================================================
// Posts Components
// =============================================================================
export {
  // Core post components
  InfinitePostList,
  // Demo and test components
  InfinitePostListDemo,
  InfinitePostsDemo,
  PostCard,
  PostForm,
} from '@/components/posts'

// =============================================================================
// Projects Components
// =============================================================================
export {
  // Core project components
  CreateProjectModal,
  // CRUD and example components
  ProjectCrudExamples,
  ProjectCrudLazy,
  ProjectList,
  ProjectListClient,
  ProjectListServer,
} from '@/components/projects'

// =============================================================================
// Lazy Loading Components
// =============================================================================
export { LazyComponents } from '@/components/lazy'

// =============================================================================
// Loading Components
// =============================================================================
export { ServerClientCoordination } from '@/components/loading'

// =============================================================================
// Pattern Components
// =============================================================================
export {
  HybridExamples,
  HybridExamplesClient,
  ServerClientBoundary,
} from '@/components/patterns'

// =============================================================================
// Performance Components
// =============================================================================
export { PerformanceMonitor } from '@/components/performance'

// =============================================================================
// Provider Components
// =============================================================================
export {
  AccessibilityPanel,
  AccessibilityProvider,
  useAccessibility,
} from '@/components/providers'

// =============================================================================
// Global Components (Root Level)
// =============================================================================
export { ErrorHandlerProvider } from '@/components/error-handler-provider'
export { FeaturesSection } from '@/components/features-section'
export { Providers } from '@/components/providers'
export { ThemeProvider } from '@/components/theme-provider'
export { ThemeToggle } from '@/components/theme-toggle'

// =============================================================================
// Example and Demo Components (Root Level)
// =============================================================================
export { ErrorBoundaryExamples } from '@/components/error-boundary-examples'
export { PerformanceOptimizedExamples } from '@/components/performance-optimized-examples'
export { StoreExample } from '@/components/store-example'
