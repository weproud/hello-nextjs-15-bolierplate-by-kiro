'use client'

import dynamic from 'next/dynamic'
import { ComponentType, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Route loading fallbacks
const PageSkeleton = ({ title }: { title?: string }) => (
  <div className='container mx-auto py-8 space-y-6'>
    {title && <Skeleton className='h-8 w-64' />}
    <div className='space-y-4'>
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-3/4' />
      <Skeleton className='h-4 w-1/2' />
    </div>
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className='space-y-3'>
          <Skeleton className='h-48 w-full' />
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
        </div>
      ))}
    </div>
  </div>
)

const DashboardSkeleton = () => (
  <div className='container mx-auto py-8 space-y-6'>
    <div className='flex items-center justify-between'>
      <Skeleton className='h-8 w-48' />
      <Skeleton className='h-10 w-32' />
    </div>

    {/* Stats cards */}
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className='p-6 border rounded-lg space-y-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-8 w-16' />
          <Skeleton className='h-3 w-20' />
        </div>
      ))}
    </div>

    {/* Chart area */}
    <div className='grid gap-4 md:grid-cols-2'>
      <div className='p-6 border rounded-lg space-y-4'>
        <Skeleton className='h-6 w-32' />
        <Skeleton className='h-64 w-full' />
      </div>
      <div className='p-6 border rounded-lg space-y-4'>
        <Skeleton className='h-6 w-32' />
        <Skeleton className='h-64 w-full' />
      </div>
    </div>
  </div>
)

const ListSkeleton = () => (
  <div className='container mx-auto py-8 space-y-6'>
    <div className='flex items-center justify-between'>
      <Skeleton className='h-8 w-48' />
      <div className='flex gap-2'>
        <Skeleton className='h-10 w-32' />
        <Skeleton className='h-10 w-24' />
      </div>
    </div>

    {/* Filters */}
    <div className='flex gap-4'>
      <Skeleton className='h-10 w-64' />
      <Skeleton className='h-10 w-32' />
      <Skeleton className='h-10 w-32' />
    </div>

    {/* List items */}
    <div className='space-y-4'>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className='p-4 border rounded-lg flex items-center justify-between'
        >
          <div className='flex items-center gap-4'>
            <Skeleton className='h-12 w-12 rounded' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-48' />
              <Skeleton className='h-3 w-32' />
            </div>
          </div>
          <div className='flex gap-2'>
            <Skeleton className='h-8 w-8' />
            <Skeleton className='h-8 w-8' />
          </div>
        </div>
      ))}
    </div>
  </div>
)

const FormSkeleton = () => (
  <div className='container mx-auto py-8 max-w-2xl'>
    <div className='space-y-6'>
      <Skeleton className='h-8 w-48' />

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-10 w-full' />
        </div>

        <div className='space-y-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-24 w-full' />
        </div>

        <div className='space-y-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-10 w-full' />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
      </div>

      <div className='flex justify-end gap-2'>
        <Skeleton className='h-10 w-20' />
        <Skeleton className='h-10 w-20' />
      </div>
    </div>
  </div>
)

const DetailSkeleton = () => (
  <div className='container mx-auto py-8 space-y-6'>
    <div className='flex items-center justify-between'>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-4 w-48' />
      </div>
      <div className='flex gap-2'>
        <Skeleton className='h-10 w-20' />
        <Skeleton className='h-10 w-20' />
      </div>
    </div>

    <div className='grid gap-6 md:grid-cols-3'>
      <div className='md:col-span-2 space-y-6'>
        <div className='space-y-4'>
          <Skeleton className='h-6 w-32' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-3/4' />
          </div>
        </div>

        <div className='space-y-4'>
          <Skeleton className='h-6 w-24' />
          <Skeleton className='h-64 w-full' />
        </div>
      </div>

      <div className='space-y-6'>
        <div className='p-4 border rounded-lg space-y-4'>
          <Skeleton className='h-5 w-20' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
          </div>
        </div>

        <div className='p-4 border rounded-lg space-y-4'>
          <Skeleton className='h-5 w-24' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-2/3' />
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Loading spinner component
const LoadingSpinner = ({
  size = 'default',
  className,
}: {
  size?: 'sm' | 'default' | 'lg'
  className?: string
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
    </div>
  )
}

// Route loader configuration
interface RouteLoaderConfig {
  fallback?: ComponentType
  errorBoundary?: boolean
  preload?: boolean
  ssr?: boolean
}

// Create lazy route component
export function createLazyRoute<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  config: RouteLoaderConfig = {}
) {
  const {
    fallback = () => <PageSkeleton />,
    errorBoundary = true,
    preload = false,
    ssr = true,
  } = config

  const LazyComponent = dynamic(importFn, {
    ssr,
    loading: fallback,
  })

  // Preload the component if requested
  if (preload && typeof window !== 'undefined') {
    importFn()
  }

  return LazyComponent
}

// Pre-configured route loaders
export const RouteLoaders = {
  // Dashboard routes
  Dashboard: (importFn: () => Promise<{ default: ComponentType<any> }>) =>
    createLazyRoute(importFn, {
      fallback: DashboardSkeleton,
      preload: true,
    }),

  // List/index routes
  List: (importFn: () => Promise<{ default: ComponentType<any> }>) =>
    createLazyRoute(importFn, {
      fallback: ListSkeleton,
    }),

  // Form routes
  Form: (importFn: () => Promise<{ default: ComponentType<any> }>) =>
    createLazyRoute(importFn, {
      fallback: FormSkeleton,
    }),

  // Detail/show routes
  Detail: (importFn: () => Promise<{ default: ComponentType<any> }>) =>
    createLazyRoute(importFn, {
      fallback: DetailSkeleton,
    }),

  // Generic page
  Page: (importFn: () => Promise<{ default: ComponentType<any> }>) =>
    createLazyRoute(importFn, {
      fallback: () => <PageSkeleton />,
    }),
}

// Route preloader utility
export class RoutePreloader {
  private static preloadedRoutes = new Set<string>()

  static preload(routePath: string, importFn: () => Promise<any>) {
    if (this.preloadedRoutes.has(routePath)) {
      return
    }

    this.preloadedRoutes.add(routePath)

    // Preload on idle or after a delay
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => importFn())
    } else {
      setTimeout(() => importFn(), 100)
    }
  }

  static preloadOnHover(
    element: HTMLElement,
    routePath: string,
    importFn: () => Promise<any>
  ) {
    const handleMouseEnter = () => {
      this.preload(routePath, importFn)
      element.removeEventListener('mouseenter', handleMouseEnter)
    }

    element.addEventListener('mouseenter', handleMouseEnter)
  }
}

// Hook for route preloading
export function useRoutePreloader() {
  return {
    preload: RoutePreloader.preload,
    preloadOnHover: RoutePreloader.preloadOnHover,
  }
}

export {
  PageSkeleton,
  DashboardSkeleton,
  ListSkeleton,
  FormSkeleton,
  DetailSkeleton,
  LoadingSpinner,
}
