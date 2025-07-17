'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { StoreProvider } from '@/store/provider'
import { SessionProvider } from '@/components/auth/session-provider'
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
      <StoreProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </StoreProvider>
    </SessionProvider>
  )
}
