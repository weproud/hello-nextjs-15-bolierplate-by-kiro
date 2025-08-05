/**
 * Providers Index
 *
 * This file exports all provider components for easy importing
 * and composition in the application root.
 *
 * 최적화된 provider 구조:
 * - ClientProviders: 클라이언트 사이드 provider들을 통합
 * - ServerProviders: 서버 사이드 provider들을 통합 (향후 확장용)
 */

// 새로운 통합 provider들
export { ClientProviders } from '@/providers/client-providers'
export { ServerProviders } from '@/providers/server-providers'

// 개별 provider들 (필요시 직접 사용 가능)
export { AuthProvider } from '@/components/auth/auth-provider'
export { ThemeProvider } from '@/components/theme-provider'
export { LoadingProvider } from '@/contexts/loading-context'
export { SessionProvider } from '@/providers/session-provider'
export { AppStoreProvider } from '@/stores/provider'

// Re-export provider types
export type { ThemeProviderProps } from 'next-themes'
