/**
 * Page Layout Components
 *
 * 페이지별 레이아웃을 위한 컴포넌트들
 */

'use client'

import {
  Container,
  Flex,
  ResponsiveText,
  Stack,
} from '@/components/layout/responsive-layout'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'

// Page Header Component
interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  backButton?: boolean | { href?: string; label?: string }
  className?: string
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, actions, backButton, className, ...props }, ref) => {
    const router = useRouter()

    const handleBack = () => {
      if (typeof backButton === 'object' && backButton.href) {
        router.push(backButton.href)
      } else {
        router.back()
      }
    }

    return (
      <div ref={ref} className={cn('space-y-4 pb-4', className)} {...props}>
        {backButton && (
          <Button
            variant='ghost'
            size='sm'
            onClick={handleBack}
            className='mb-2 -ml-2'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            {typeof backButton === 'object' && backButton.label
              ? backButton.label
              : 'Back'}
          </Button>
        )}

        <Flex justify='between' align='start' className='gap-4'>
          <Stack spacing='xs' className='flex-1 min-w-0'>
            <ResponsiveText
              size={{
                base: '2xl',
                sm: '3xl',
                lg: '4xl',
              }}
              weight='bold'
              className='tracking-tight'
            >
              {title}
            </ResponsiveText>
            {description && (
              <ResponsiveText
                size={{
                  base: 'sm',
                  sm: 'base',
                }}
                className='text-muted-foreground max-w-2xl'
              >
                {description}
              </ResponsiveText>
            )}
          </Stack>

          {actions && (
            <div className='flex items-center gap-2 shrink-0'>{actions}</div>
          )}
        </Flex>

        <Separator />
      </div>
    )
  }
)

PageHeader.displayName = 'PageHeader'

// Page Content Component
interface PageContentProps extends React.ComponentProps<'div'> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const PageContent = React.forwardRef<HTMLDivElement, PageContentProps>(
  ({ className, maxWidth = 'full', padding = 'none', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          {
            'max-w-sm mx-auto': maxWidth === 'sm',
            'max-w-md mx-auto': maxWidth === 'md',
            'max-w-lg mx-auto': maxWidth === 'lg',
            'max-w-xl mx-auto': maxWidth === 'xl',
            'max-w-2xl mx-auto': maxWidth === '2xl',
            'max-w-none': maxWidth === 'full',
          },
          {
            'p-0': padding === 'none',
            'p-2': padding === 'sm',
            'p-4': padding === 'md',
            'p-6': padding === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)

PageContent.displayName = 'PageContent'

// Page Layout Wrapper
interface PageLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  sidebar?: React.ReactNode
  footer?: React.ReactNode
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
}

export const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  (
    {
      children,
      header,
      sidebar,
      footer,
      containerSize = 'xl',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('min-h-screen flex flex-col', className)}
        {...props}
      >
        {header}

        <div className='flex-1 flex'>
          {sidebar && (
            <aside className='hidden lg:block w-64 border-r bg-muted/10'>
              {sidebar}
            </aside>
          )}

          <main className='flex-1'>
            <Container size={containerSize} className='py-6'>
              {children}
            </Container>
          </main>
        </div>

        {footer}
      </div>
    )
  }
)

PageLayout.displayName = 'PageLayout'

// Section Component for organizing page content
interface SectionProps extends React.ComponentProps<'section'> {
  title?: string
  description?: string
  actions?: React.ReactNode
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      title,
      description,
      actions,
      spacing = 'lg',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          {
            'space-y-0': spacing === 'none',
            'space-y-2': spacing === 'sm',
            'space-y-4': spacing === 'md',
            'space-y-6': spacing === 'lg',
            'space-y-8': spacing === 'xl',
          },
          className
        )}
        {...props}
      >
        {(title || description || actions) && (
          <div className='flex items-start justify-between gap-4'>
            <div className='space-y-1'>
              {title && (
                <h2 className='text-xl font-semibold tracking-tight'>
                  {title}
                </h2>
              )}
              {description && (
                <p className='text-sm text-muted-foreground'>{description}</p>
              )}
            </div>
            {actions && (
              <div className='flex items-center gap-2'>{actions}</div>
            )}
          </div>
        )}
        {children}
      </section>
    )
  }
)

Section.displayName = 'Section'

// Card Grid Component for displaying cards in a responsive grid
interface CardGridProps extends React.ComponentProps<'div'> {
  cols?: {
    default?: 1 | 2 | 3 | 4
    sm?: 1 | 2 | 3 | 4
    md?: 1 | 2 | 3 | 4
    lg?: 1 | 2 | 3 | 4
    xl?: 1 | 2 | 3 | 4
  }
  gap?: 'sm' | 'md' | 'lg'
}

export const CardGrid = React.forwardRef<HTMLDivElement, CardGridProps>(
  (
    { cols = { default: 1, sm: 2, lg: 3 }, gap = 'md', className, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          {
            'grid-cols-1': cols.default === 1,
            'grid-cols-2': cols.default === 2,
            'grid-cols-3': cols.default === 3,
            'grid-cols-4': cols.default === 4,
          },
          cols.sm && {
            'sm:grid-cols-1': cols.sm === 1,
            'sm:grid-cols-2': cols.sm === 2,
            'sm:grid-cols-3': cols.sm === 3,
            'sm:grid-cols-4': cols.sm === 4,
          },
          cols.md && {
            'md:grid-cols-1': cols.md === 1,
            'md:grid-cols-2': cols.md === 2,
            'md:grid-cols-3': cols.md === 3,
            'md:grid-cols-4': cols.md === 4,
          },
          cols.lg && {
            'lg:grid-cols-1': cols.lg === 1,
            'lg:grid-cols-2': cols.lg === 2,
            'lg:grid-cols-3': cols.lg === 3,
            'lg:grid-cols-4': cols.lg === 4,
          },
          cols.xl && {
            'xl:grid-cols-1': cols.xl === 1,
            'xl:grid-cols-2': cols.xl === 2,
            'xl:grid-cols-3': cols.xl === 3,
            'xl:grid-cols-4': cols.xl === 4,
          },
          {
            'gap-2': gap === 'sm',
            'gap-4': gap === 'md',
            'gap-6': gap === 'lg',
          },
          className
        )}
        {...props}
      />
    )
  }
)

CardGrid.displayName = 'CardGrid'

// Empty State Component
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center py-12',
          className
        )}
        {...props}
      >
        {icon && <div className='mb-4 text-muted-foreground'>{icon}</div>}
        <h3 className='text-lg font-semibold mb-2'>{title}</h3>
        {description && (
          <p className='text-sm text-muted-foreground mb-4 max-w-sm'>
            {description}
          </p>
        )}
        {action}
      </div>
    )
  }
)

EmptyState.displayName = 'EmptyState'
