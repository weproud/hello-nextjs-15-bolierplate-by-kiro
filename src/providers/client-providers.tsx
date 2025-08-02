'use client'

import { AuthProvider } from '@/components/auth/auth-provider'
import { GlobalErrorBoundary } from '@/components/error/hierarchical-error-boundary'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { LoadingProvider } from '@/contexts/loading-context'
import { SessionProvider } from '@/providers/session-provider'
import { AppStoreProvider } from '@/store/provider'
import { memo, type ReactNode } from 'react'

interface ClientProvidersProps {
  children: ReactNode
}

/**
 * Client Providers Component
 *
 * 클라이언트 사이드에서 실행되는 모든 provider들을 통합합니다.
 * Next.js 15의 최적화된 렌더링을 위해 'use client' 지시어를 사용합니다.
 *
 * Provider 순서:
 * 1. GlobalErrorBoundary - 전역 에러 처리
 * 2. SessionProvider - NextAuth 세션 관리
 * 3. AuthProvider - 인증 상태 관리
 * 4. LoadingProvider - 로딩 상태 관리
 * 5. AppStoreProvider - Zustand 애플리케이션 상태
 * 6. ThemeProvider - 테마 관리
 * 7. AccessibilityProvider - 접근성 설정 관리
 * 8. UI 컴포넌트들 (Toaster, StagewiseToolbar)
 */
export const ClientProviders = memo(function ClientProviders({
  children,
}: ClientProvidersProps) {
  return (
    <GlobalErrorBoundary>
      <SessionProvider>
        <AuthProvider>
          <LoadingProvider>
            <AppStoreProvider>
              <ThemeProvider
                attribute='class'
                defaultTheme='system'
                enableSystem
                disableTransitionOnChange={false}
              >
                <AccessibilityProvider>
                  <GlobalThemeTransition />
                  {children}
                  <Toaster
                    position='top-right'
                    expand={false}
                    richColors
                    closeButton
                    duration={4000}
                    toastOptions={{
                      // 접근성을 위한 토스트 설정
                      ariaProps: {
                        role: 'status',
                        'aria-live': 'polite',
                      },
                    }}
                  />
                  {/* <StagewiseToolbar config={{ plugins: [ReactPlugin] }} /> */}
                </AccessibilityProvider>
              </ThemeProvider>
            </AppStoreProvider>
          </LoadingProvider>
        </AuthProvider>
      </SessionProvider>
    </GlobalErrorBoundary>
  )
})
