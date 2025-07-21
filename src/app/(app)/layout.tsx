import './globals.css'
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
