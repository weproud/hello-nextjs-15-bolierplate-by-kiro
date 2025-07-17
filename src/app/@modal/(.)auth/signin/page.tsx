import { Suspense, lazy } from 'react'
import { ModalErrorBoundary } from '@/components/auth/modal-error-boundary'

// Smart modal loading based on device capabilities
const SigninModal = lazy(() => {
  // Check device capabilities for performance optimization
  const connection =
    (navigator as any)?.connection ||
    (navigator as any)?.mozConnection ||
    (navigator as any)?.webkitConnection
  const deviceMemory = (navigator as any)?.deviceMemory
  const isSlowDevice = deviceMemory && deviceMemory < 4
  const isSlowConnection =
    connection &&
    (connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g')

  // Use lite version for slower devices/connections
  if (isSlowDevice || isSlowConnection) {
    return import('@/components/auth/signin-modal-lite').then(module => ({
      default: module.SigninModalLite,
    }))
  }

  // Use full version for capable devices
  return import('@/components/auth/signin-modal').then(module => ({
    default: module.SigninModal,
  }))
})

// Loading fallback component for the modal
function ModalLoadingFallback() {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-700">로그인 페이지를 불러오는 중...</span>
        </div>
      </div>
    </div>
  )
}

// Error fallback for suspense boundary
function SuspenseErrorFallback() {
  const handleFallbackToFullPage = () => {
    const currentUrl = new URL(window.location.href)
    const callbackUrl =
      currentUrl.searchParams.get('callbackUrl') || currentUrl.pathname
    window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full text-center">
        <div className="text-red-600 mb-4">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          모달 로딩 중 문제가 발생했습니다
        </h3>
        <p className="text-gray-600 mb-4 text-sm">
          전체 페이지에서 로그인을 시도해 주세요.
        </p>
        <button
          onClick={handleFallbackToFullPage}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          전체 페이지에서 로그인
        </button>
      </div>
    </div>
  )
}

interface InterceptedSigninPageProps {
  searchParams: Promise<{
    callbackUrl?: string
    error?: string
  }>
}

export default async function InterceptedSigninPage({
  searchParams,
}: InterceptedSigninPageProps) {
  const resolvedSearchParams = await searchParams
  const callbackUrl = resolvedSearchParams?.callbackUrl || '/'

  const handlePageError = (error: Error, errorInfo: any) => {
    console.error('Intercepted signin page error:', error, errorInfo)

    // Auto-redirect to full page signin after error
    setTimeout(() => {
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
    }, 1000)
  }

  const handleFallbackToFullPage = () => {
    window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
  }

  const handleClose = () => {
    // Use router.back() to return to previous page
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  return (
    <ModalErrorBoundary
      onFallbackToFullPage={handleFallbackToFullPage}
      onError={handlePageError}
    >
      <Suspense fallback={<ModalLoadingFallback />}>
        <SigninModal callbackUrl={callbackUrl} onClose={handleClose} />
      </Suspense>
    </ModalErrorBoundary>
  )
}
