'use client'

import { lazy, Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'

// 동적 import를 사용하여 번들 크기 최적화
const ProjectCrudExamples = lazy(() =>
  import('./project-crud-examples').then(module => ({
    default: module.ProjectCrudExamples,
  }))
)

const ProjectList = lazy(() =>
  import('./project-list').then(module => ({
    default: module.ProjectList,
  }))
)

// 로딩 컴포넌트
const ProjectLoadingSkeleton = () => (
  <div className='container mx-auto py-8'>
    <div className='mb-8'>
      <div className='h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse'></div>
      <div className='h-4 bg-gray-200 rounded w-2/3 animate-pulse'></div>
    </div>

    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className='p-6'>
            <div className='animate-pulse'>
              <div className='h-8 bg-gray-200 rounded mb-2'></div>
              <div className='h-6 bg-gray-200 rounded'></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardContent className='p-6'>
            <div className='animate-pulse'>
              <div className='h-6 bg-gray-200 rounded w-3/4 mb-2'></div>
              <div className='h-4 bg-gray-200 rounded w-full mb-4'></div>
              <div className='h-4 bg-gray-200 rounded w-1/2'></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

// 프로젝트 CRUD 컴포넌트 (동적 로딩)
export function LazyProjectCrudExamples() {
  return (
    <Suspense fallback={<ProjectLoadingSkeleton />}>
      <ProjectCrudExamples />
    </Suspense>
  )
}

// 프로젝트 리스트 컴포넌트 (동적 로딩)
export function LazyProjectList(props: any) {
  return (
    <Suspense
      fallback={
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className='p-6'>
                <div className='animate-pulse'>
                  <div className='h-6 bg-gray-200 rounded w-3/4 mb-2'></div>
                  <div className='h-4 bg-gray-200 rounded w-full mb-4'></div>
                  <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    >
      <ProjectList {...props} />
    </Suspense>
  )
}
