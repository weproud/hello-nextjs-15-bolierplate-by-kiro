'use client'

import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Lazy load heavy form components
const MultiStepForm = lazy(() =>
  import('./multi-step-form').then(module => ({
    default: module.MultiStepForm,
  }))
)

const ComprehensiveFormExample = lazy(() =>
  import('./comprehensive-form-example').then(module => ({
    default: module.ComprehensiveFormExample,
  }))
)

const AdvancedForm = lazy(() =>
  import('./advanced-form').then(module => ({
    default: module.AdvancedForm,
  }))
)

// Loading fallbacks for different form types
function MultiStepFormSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      {/* Step Indicator Skeleton */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="ml-3">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
              {i < 2 && <Skeleton className="flex-1 h-0.5 mx-4" />}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex justify-between pt-6">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ComprehensiveFormSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      <div className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4 p-4 border rounded-lg">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-32 mt-1" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-48 mt-1" />
            </div>
          </div>
        </div>

        {/* Role Selection Section */}
        <div className="space-y-4 p-4 border rounded-lg">
          <Skeleton className="h-6 w-20 mb-4" />
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Advanced Options Section */}
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  )
}

function AdvancedFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-32 mt-1" />
          </div>
        ))}
      </div>
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  )
}

// Progressive loading wrapper for forms
interface ProgressiveFormLoaderProps {
  type: 'multi-step' | 'comprehensive' | 'advanced'
  fallbackType?: 'skeleton' | 'spinner' | 'minimal'
  children?: React.ReactNode
}

export function ProgressiveFormLoader({
  type,
  fallbackType = 'skeleton',
  children,
}: ProgressiveFormLoaderProps) {
  const getFallback = () => {
    if (fallbackType === 'spinner') {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-3">폼을 불러오는 중...</span>
        </div>
      )
    }

    if (fallbackType === 'minimal') {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <div className="text-lg font-medium mb-2">폼 로딩 중</div>
          <p className="text-sm">잠시만 기다려주세요...</p>
        </div>
      )
    }

    // Default skeleton fallback
    switch (type) {
      case 'multi-step':
        return <MultiStepFormSkeleton />
      case 'comprehensive':
        return <ComprehensiveFormSkeleton />
      case 'advanced':
        return <AdvancedFormSkeleton />
      default:
        return <AdvancedFormSkeleton />
    }
  }

  const getComponent = () => {
    switch (type) {
      case 'multi-step':
        return <MultiStepForm />
      case 'comprehensive':
        return <ComprehensiveFormExample />
      case 'advanced':
        return children || <div>Advanced form component</div>
      default:
        return children || <div>Form component</div>
    }
  }

  return <Suspense fallback={getFallback()}>{getComponent()}</Suspense>
}

// Size-based splitting strategy for component bundles
interface SmartFormLoaderProps {
  formType: 'simple' | 'complex' | 'enterprise'
  userConnection?: 'slow' | 'fast' | 'unknown'
  deviceMemory?: number
  children: React.ReactNode
}

export function SmartFormLoader({
  formType,
  userConnection = 'unknown',
  deviceMemory,
  children,
}: SmartFormLoaderProps) {
  // Determine loading strategy based on device capabilities
  const shouldUseLiteVersion = () => {
    if (deviceMemory && deviceMemory < 4) return true
    if (userConnection === 'slow') return true
    if (formType === 'enterprise' && userConnection !== 'fast') return true
    return false
  }

  const getFallbackType = (): 'skeleton' | 'spinner' | 'minimal' => {
    if (shouldUseLiteVersion()) return 'minimal'
    if (formType === 'simple') return 'spinner'
    return 'skeleton'
  }

  return (
    <Suspense fallback={getFallback(getFallbackType())}>{children}</Suspense>
  )
}

function getFallback(type: 'skeleton' | 'spinner' | 'minimal') {
  switch (type) {
    case 'spinner':
      return (
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-sm">로딩 중...</span>
        </div>
      )
    case 'minimal':
      return (
        <div className="p-4 text-center text-muted-foreground">
          <div className="text-sm">폼 준비 중...</div>
        </div>
      )
    case 'skeleton':
    default:
      return <AdvancedFormSkeleton />
  }
}

// Export lazy-loaded components for direct use
export const LazyMultiStepForm = MultiStepForm
export const LazyComprehensiveForm = ComprehensiveFormExample
export const LazyAdvancedForm = AdvancedForm
