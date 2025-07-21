import { SidebarLayout } from '@/components/layout/sidebar-layout'

export default function CommunityLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <SidebarLayout>{children}</SidebarLayout>
}
