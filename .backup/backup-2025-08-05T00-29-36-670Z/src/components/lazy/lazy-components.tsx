'use client'

import dynamic from 'next/dynamic'
import { ComponentType, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// Loading fallback components
const EditorSkeleton = () => (
  <div className='border border-input rounded-md bg-background'>
    <div className='flex items-center gap-1 p-2 border-b border-border bg-muted/50 h-12'>
      <div className='flex items-center gap-1'>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className='h-8 w-8' />
        ))}
      </div>
    </div>
    <div className='p-4 space-y-2'>
      <Skeleton className='h-4 w-3/4' />
      <Skeleton className='h-4 w-1/2' />
      <Skeleton className='h-4 w-2/3' />
      <div className='space-y-2 mt-4'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-4/5' />
        <Skeleton className='h-4 w-3/5' />
      </div>
    </div>
  </div>
)

const ModalSkeleton = () => (
  <div className='fixed inset-0 z-50 bg-background/80 backdrop-blur-sm'>
    <div className='fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg'>
      <div className='flex flex-col space-y-1.5 text-center sm:text-left'>
        <Skeleton className='h-6 w-3/4' />
        <Skeleton className='h-4 w-full' />
      </div>
      <div className='space-y-4'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
        <div className='flex justify-end space-x-2'>
          <Skeleton className='h-10 w-20' />
          <Skeleton className='h-10 w-20' />
        </div>
      </div>
    </div>
  </div>
)

const FormSkeleton = () => (
  <div className='space-y-6'>
    <div className='space-y-2'>
      <Skeleton className='h-4 w-20' />
      <Skeleton className='h-10 w-full' />
    </div>
    <div className='space-y-2'>
      <Skeleton className='h-4 w-24' />
      <Skeleton className='h-24 w-full' />
    </div>
    <div className='flex justify-end space-x-2'>
      <Skeleton className='h-10 w-20' />
      <Skeleton className='h-10 w-20' />
    </div>
  </div>
)

const ChartSkeleton = () => (
  <div className='space-y-4'>
    <div className='flex items-center justify-between'>
      <Skeleton className='h-6 w-32' />
      <Skeleton className='h-8 w-24' />
    </div>
    <div className='h-[300px] w-full'>
      <div className='flex h-full items-end justify-between space-x-2'>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className='w-full'
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </div>
  </div>
)

const TableSkeleton = () => (
  <div className='space-y-4'>
    <div className='flex items-center justify-between'>
      <Skeleton className='h-8 w-48' />
      <Skeleton className='h-10 w-32' />
    </div>
    <div className='border rounded-md'>
      <div className='border-b p-4'>
        <div className='flex space-x-4'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-16' />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='border-b p-4 last:border-b-0'>
          <div className='flex space-x-4'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-4 w-16' />
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Dynamic import wrapper with better error handling
function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType,
  options?: {
    ssr?: boolean
    loading?: ComponentType
  }
) {
  return dynamic(importFn, {
    ssr: options?.ssr ?? true,
    loading:
      options?.loading ||
      fallback ||
      (() => <Skeleton className='h-32 w-full' />),
  })
}

// Lazy loaded components
export const LazyTiptapEditor = createLazyComponent(
  () =>
    import('@/components/editor/tiptap-editor').then(mod => ({
      default: mod.TiptapEditor,
    })),
  EditorSkeleton,
  { ssr: false }
)

export const LazyModal = createLazyComponent(
  () => import('@/components/ui/modal').then(mod => ({ default: mod.Modal })),
  ModalSkeleton
)

export const LazyDialog = createLazyComponent(
  () => import('@/components/ui/dialog').then(mod => ({ default: mod.Dialog })),
  ModalSkeleton
)

export const LazySheet = createLazyComponent(
  () => import('@/components/ui/sheet').then(mod => ({ default: mod.Sheet })),
  ModalSkeleton
)

export const LazyDataTable = createLazyComponent(
  () =>
    import('@/components/ui/data-table').then(mod => ({
      default: mod.DataTable,
    })),
  TableSkeleton
)

export const LazyChart = createLazyComponent(
  () =>
    import('@/components/charts/chart').then(mod => ({ default: mod.Chart })),
  ChartSkeleton,
  { ssr: false }
)

export const LazyProjectForm = createLazyComponent(
  () =>
    import('@/components/forms/project-form-enhanced').then(mod => ({
      default: mod.ProjectFormEnhanced,
    })),
  FormSkeleton
)

export const LazyPostForm = createLazyComponent(
  () =>
    import('@/components/forms/post-form').then(mod => ({
      default: mod.PostForm,
    })),
  FormSkeleton
)

// Higher-order component for lazy loading with Suspense
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: ComponentType,
  className?: string
) {
  const LazyComponent = createLazyComponent(
    () => Promise.resolve({ default: Component }),
    fallback
  )

  return function LazyWrapper(props: P) {
    return (
      <Suspense
        fallback={
          fallback ? (
            <fallback />
          ) : (
            <Skeleton className={cn('h-32 w-full', className)} />
          )
        }
      >
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Utility for creating route-level lazy components
export function createLazyPage<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType
) {
  return dynamic(importFn, {
    ssr: true,
    loading:
      fallback ||
      (() => (
        <div className='container mx-auto py-8'>
          <div className='space-y-6'>
            <Skeleton className='h-8 w-64' />
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
        </div>
      )),
  })
}

// Pre-configured lazy components for common use cases
export const LazyComponents = {
  Editor: LazyTiptapEditor,
  Modal: LazyModal,
  Dialog: LazyDialog,
  Sheet: LazySheet,
  DataTable: LazyDataTable,
  Chart: LazyChart,
  ProjectForm: LazyProjectForm,
  PostForm: LazyPostForm,
} as const

export type LazyComponentType = keyof typeof LazyComponents
