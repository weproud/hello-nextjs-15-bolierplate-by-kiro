import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SessionProvider } from '@/components/auth/session-provider'
import { AuthProvider } from '@/components/auth/auth-provider'
import { GlobalErrorBoundary } from '@/components/global-error-boundary'
import { StagewiseToolbar } from '@stagewise/toolbar-next'
import ReactPlugin from '@stagewise-plugins/react'
import { SidebarLayout } from '@/components/layout/sidebar-layout'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  )
}
