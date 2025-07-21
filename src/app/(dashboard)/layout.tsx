import { SidebarLayout } from '@/components/layout/sidebar-layout'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <SidebarLayout>{children}</SidebarLayout>
}
