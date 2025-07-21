'use client'

import { Suspense, lazy } from 'react'
import { useRouter } from 'next/navigation'
import { ModalErrorBoundary } from '@/components/auth/modal-error-boundary'

// Lazy load the project detail modal component
const ProjectDetailModal = lazy(() =>
  import('@/components/projects/project-detail-modal').then(module => ({
    default: module.ProjectDetailModal,
  }))
)

// Loading fallback component for the modal
function ModalLoadingFallback() {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-background rounded-lg p-6 shadow-lg border max-w-md w-full mx-4">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-foreground">
            프로젝트 정보를 불러오는 중...
          </span>
        </div>
      </div>
    </div>
  )
}

interface InterceptedProjectDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function InterceptedProjectDetailPage({
  params: paramsPromise,
}: InterceptedProjectDetailPageProps) {
  const router = useRouter()

  const handleFallbackToFullPage = async () => {
    const params = await paramsPromise
    router.push(`/projects/${params.id}`)
  }

  const handleClose = () => {
    // Use router.back() to return to previous page
    router.back()
  }

  const handlePageError = (error: Error, errorInfo: any) => {
    console.error('Intercepted project detail page error:', error, errorInfo)

    // Auto-redirect to full page after error
    setTimeout(async () => {
      const params = await paramsPromise
      router.push(`/projects/${params.id}`)
    }, 1000)
  }

  return (
    <ModalErrorBoundary
      onFallbackToFullPage={handleFallbackToFullPage}
      onError={handlePageError}
    >
      <Suspense fallback={<ModalLoadingFallback />}>
        <ProjectDetailModal
          params={paramsPromise}
          onClose={handleClose}
          onFallbackToFullPage={handleFallbackToFullPage}
        />
      </Suspense>
    </ModalErrorBoundary>
  )
}
