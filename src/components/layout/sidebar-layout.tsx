'use client'

import * as React from 'react'
import { AppSidebar } from '@/components/layout/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Container, Flex, Show } from './responsive-layout'
import { useMediaQuery } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface SidebarLayoutProps {
  children: React.ReactNode
  breadcrumbs?: {
    label: string
    href?: string
  }[]
  projects?: Array<{
    id: string
    title: string
    description?: string | null
  }>
  headerActions?: React.ReactNode
  fullWidth?: boolean
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export function SidebarLayout({
  children,
  breadcrumbs,
  projects = [],
  headerActions,
  fullWidth = false,
  containerSize = 'xl',
}: SidebarLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <SidebarProvider>
      <AppSidebar projects={projects} />
      <SidebarInset>
        {/* Enhanced Header with responsive design */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Container size={fullWidth ? 'full' : containerSize} centered={false}>
            <Flex
              align="center"
              justify="between"
              className="h-16 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
            >
              <Flex align="center" gap="sm">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />

                {/* Breadcrumbs - hidden on mobile if too long */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <Show above="sm">
                    <Breadcrumb>
                      <BreadcrumbList>
                        {breadcrumbs.map((breadcrumb, index) => (
                          <React.Fragment key={index}>
                            <BreadcrumbItem>
                              {breadcrumb.href ? (
                                <BreadcrumbLink href={breadcrumb.href}>
                                  {breadcrumb.label}
                                </BreadcrumbLink>
                              ) : (
                                <BreadcrumbPage>
                                  {breadcrumb.label}
                                </BreadcrumbPage>
                              )}
                            </BreadcrumbItem>
                            {index < breadcrumbs.length - 1 && (
                              <BreadcrumbSeparator />
                            )}
                          </React.Fragment>
                        ))}
                      </BreadcrumbList>
                    </Breadcrumb>
                  </Show>
                )}

                {/* Mobile breadcrumb - show only current page */}
                {breadcrumbs && breadcrumbs.length > 0 && isMobile && (
                  <div className="text-sm font-medium text-foreground">
                    {breadcrumbs[breadcrumbs.length - 1]?.label}
                  </div>
                )}
              </Flex>

              {/* Header actions */}
              {headerActions && (
                <div className="flex items-center gap-2">{headerActions}</div>
              )}
            </Flex>
          </Container>
        </header>

        {/* Main content area with responsive container */}
        <main className="flex-1">
          <Container
            size={fullWidth ? 'full' : containerSize}
            className={cn('py-4', !fullWidth && 'px-4 sm:px-6 lg:px-8')}
          >
            {children}
          </Container>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
