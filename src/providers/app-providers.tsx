'use client'

import { type ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { AppStoreProvider } from '@/store/provider'
import { SessionProvider } from '@/components/auth/session-provider'
import { LoadingProvider } from '@/contexts/loading-context'
import { Toaster } from '@/components/ui/sonner'

interface AppProvidersProps {
  children: ReactNode
}

/**
 * App Providers Component
 *
 * Combines all application providers into a single component
 * for easy composition in the root layout.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider>
      <LoadingProvider>
        <AppStoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AppStoreProvider>
      </LoadingProvider>
    </SessionProvider>
  )
}
