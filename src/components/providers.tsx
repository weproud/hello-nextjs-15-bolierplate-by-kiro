'use client'

import { memo } from 'react'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'
import { ThemeProvider } from './theme-provider'
import { AuthProvider } from './auth/auth-provider'
import { AppStoreProvider } from '../store/provider'
import { ErrorHandlerProvider } from './error-handler-provider'
import type { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export const Providers = memo(function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <AppStoreProvider>
            <ErrorHandlerProvider />
            {children}
            <Toaster
              position="top-right"
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
