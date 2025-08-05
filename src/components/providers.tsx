'use client'

import { AuthProvider } from '@/components/auth/auth-provider'
import { ErrorHandlerProvider } from '@/components/error-handler-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { AppStoreProvider } from '@/stores/provider'
import { SessionProvider } from 'next-auth/react'
import { memo } from 'react'
import { Toaster } from 'sonner'

import type { ProvidersProps } from '@/types'

export const Providers = memo(function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute='class'
        defaultTheme='system'
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <AppStoreProvider>
            <ErrorHandlerProvider />
            {children}
            <Toaster
              position='top-right'
              expand={false}
              richColors
              closeButton
              duration={4000}
            />
          </AppStoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  )
})
