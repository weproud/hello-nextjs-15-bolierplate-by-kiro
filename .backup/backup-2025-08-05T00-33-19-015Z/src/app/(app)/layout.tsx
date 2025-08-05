import { SidebarLayoutServer } from '@/components/layout/sidebar-layout-server'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <SidebarLayoutServer>{children}</SidebarLayoutServer>
}
