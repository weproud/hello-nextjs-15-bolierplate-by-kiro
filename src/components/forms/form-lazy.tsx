'use client'

import { lazy, Suspense, ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Lazy loaded form components for better performance
 * 성능 향상을 위한 지연 로딩 폼 컴포넌트들
 */

// Lazy load heavy form components
const ContactFormLazy = lazy(() =>
  import('./contact-form').then(module => ({ default: module.ContactForm }))
)

const SimpleFormExampleLazy = lazy(() =>
  import('./simple-form-example').then(module => ({
    default: module.SimpleFormExample,
  }))
)

const ComprehensiveFormExampleLazy = lazy(() =>
  import('./comprehensive-form-example').then(module => ({
    default: module.ComprehensiveFormExample,
  }))
)

const SurveyFormLazy = lazy(() =>
  import('./survey-form').then(module => ({ default: module.SurveyForm }))
)

/**
 * Form loading skeleton
 * 폼 로딩 스켈레톤
 */
function FormSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-24 w-full" />
        </div>

        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

/**
 * Lazy form wrapper with suspense
 * Suspense를 사용한 지연 로딩 폼 래퍼
 */
function LazyFormWrapper({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return <Suspense fallback={fallback || <FormSkeleton />}>{children}</Suspense>
}

/**
 * Lazy loaded contact form
 * 지연 로딩 연락처 폼
 */
export function ContactFormLazyWrapper() {
  return (
    <LazyFormWrapper>
      <ContactFormLazy />
    </LazyFormWrapper>
  )
}

/**
 * Lazy loaded simple form example
 * 지연 로딩 간단한 폼 예제
 */
export function SimpleFormExampleLazyWrapper() {
  return (
    <LazyFormWrapper>
      <SimpleFormExampleLazy />
    </LazyFormWrapper>
  )
}

/**
 * Lazy loaded comprehensive form example
 * 지연 로딩 종합 폼 예제
 */
export function ComprehensiveFormExampleLazyWrapper() {
  return (
    <LazyFormWrapper>
      <ComprehensiveFormExampleLazy />
    </LazyFormWrapper>
  )
}

/**
 * Lazy loaded survey form
 * 지연 로딩 설문 폼
 */
export function SurveyFormLazyWrapper() {
  return (
    <LazyFormWrapper>
      <SurveyFormLazy />
    </LazyFormWrapper>
  )
}

/**
 * Conditional form loader based on form type
 * 폼 타입에 따른 조건부 폼 로더
 */
export function ConditionalFormLoader({
  formType,
  fallback,
}: {
  formType: 'contact' | 'simple' | 'comprehensive' | 'survey'
  fallback?: ReactNode
}) {
  const FormComponent = {
    contact: ContactFormLazyWrapper,
    simple: SimpleFormExampleLazyWrapper,
    comprehensive: ComprehensiveFormExampleLazyWrapper,
    survey: SurveyFormLazyWrapper,
  }[formType]

  return <FormComponent />
}
