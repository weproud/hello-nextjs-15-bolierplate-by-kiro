/**
 * Auth Components
 *
 * 인증 관련 컴포넌트들을 중앙에서 관리하고 내보냅니다.
 */

// Core auth components
export { AuthProvider } from '@/components/auth/auth-provider'
export { ClientProtectedRoute } from '@/components/auth/client-protected-route'
export { ProtectedRoute } from '@/components/auth/protected-route'
export { ProtectedRouteClient } from '@/components/auth/protected-route-client'

// Auth UI components
export { SignInForm } from '@/components/auth/signin-form'
export { SignInModal } from '@/components/auth/signin-modal'
export { SignInModalLite } from '@/components/auth/signin-modal-lite'
export { SignOutDialog } from '@/components/auth/signout-dialog'
export { UserProfile } from '@/components/auth/user-profile'

// Auth layout components
export { AuthLayout } from '@/components/auth/auth-layout'
export { LoginRequired } from '@/components/auth/login-required'
export { NavigationHeader } from '@/components/auth/navigation-header'

// Auth error handling
export { AuthError } from '@/components/auth/auth-error'
export { ModalErrorBoundary } from '@/components/auth/modal-error-boundary'

// Auth utilities and test components
export { AuthTest } from '@/components/auth/auth-test'

// Types (if any are exported from individual components)
export type { AuthProviderProps } from '@/components/auth/auth-provider'
