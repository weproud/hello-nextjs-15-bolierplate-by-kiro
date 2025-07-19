'use client'

import { lazy, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// 동적 import를 사용하여 번들 크기 최적화
const ComprehensiveFormExample = lazy(() =>
  import('./comprehensive-form-example').then(module => ({
    default: module.ComprehensiveFormExample,
  }))
)

const MultiStepForm = lazy(() =>
  import('./multi-step-form').then(module => ({
    default: module.MultiStepForm,
  }))
)

const SurveyForm = lazy(() =>
  import('./survey-form').then(module => ({
    default: module.SurveyForm,
  }))
)

// 로딩 컴포넌트
const FormLoadingSkeleton = () => (
  <div className="max-w-2xl mx-auto p-6">
    <div className="text-center mb-8">
      <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
    </div>

    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4">
          <CardHeader>
            <CardTitle className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-4 pt-4">
        <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
      </div>
    </div>
  </div>
)

// 종합 폼 예제 (동적 로딩)
export function LazyComprehensiveFormExample() {
  return (
    <Suspense fallback={<FormLoadingSkeleton />}>
      <ComprehensiveFormExample />
    </Suspense>
  )
}

// 다단계 폼 (동적 로딩)
export function LazyMultiStepForm(props: any) {
  return (
    <Suspense fallback={<FormLoadingSkeleton />}>
      <MultiStepForm {...props} />
    </Suspense>
  )
}

// 설문 폼 (동적 로딩)
export function LazySurveyForm(props: any) {
  return (
    <Suspense fallback={<FormLoadingSkeleton />}>
      <SurveyForm {...props} />
    </Suspense>
  )
}
