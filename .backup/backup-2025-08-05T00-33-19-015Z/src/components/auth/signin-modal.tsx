'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModalErrorBoundary } from '@/components/auth/modal-error-boundary'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useModalPerformance } from '@/lib/performance-monitor'

// Lazy load the SignInForm component for better performance
const SignInForm = lazy(() =>
  import('@/components/auth/signin-form').then(module => ({
    default: module.SignInForm,
  }))
)

// Screen reader announcement component with enhanced accessibility
function ScreenReaderAnnouncement({
  message,
  priority = 'polite',
}: {
  message: string
  priority?: 'polite' | 'assertive'
}) {
  return (
    <div
      role='status'
      aria-live={priority}
      aria-atomic='true'
      className='sr-only'
      aria-relevant='additions text'
    >
      {message}
    </div>
  )
}

// Loading fallback for SignInForm
function FormLoadingFallback() {
  return (
    <div className='space-y-4'>
      <div className='animate-pulse'>
        <div className='h-12 bg-gray-200 rounded-md'></div>
      </div>
      <div className='text-center text-sm text-gray-500'>
        로그인 폼을 불러오는 중...
      </div>
    </div>
  )
}

// Enhanced focus management hook
function useFocusManagement(
  isOpen: boolean,
  modalRef: React.RefObject<HTMLDivElement | null>
) {
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null)
  const firstFocusableElementRef = useRef<HTMLElement | null>(null)
  const lastFocusableElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    // Store the previously focused element
    previouslyFocusedElementRef.current = document.activeElement as HTMLElement

    const modal = modalRef.current
    if (!modal) return

    // Get all focusable elements within the modal
    const focusableElements = modal.querySelectorAll(
      'button:not([disabled]):not([aria-hidden="true"]), [href]:not([disabled]):not([aria-hidden="true"]), input:not([disabled]):not([aria-hidden="true"]), select:not([disabled]):not([aria-hidden="true"]), textarea:not([disabled]):not([aria-hidden="true"]), [tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-hidden="true"]), [contenteditable="true"]:not([disabled]):not([aria-hidden="true"])'
    )

    if (focusableElements.length > 0) {
      firstFocusableElementRef.current =
        (focusableElements[0] as HTMLElement) || null
      lastFocusableElementRef.current =
        (focusableElements[focusableElements.length - 1] as HTMLElement) || null
    }

    return () => {
      // Restore focus when modal closes
      if (
        previouslyFocusedElementRef.current &&
        previouslyFocusedElementRef.current.focus
      ) {
        // Use setTimeout to ensure the modal is fully removed from DOM
        setTimeout(() => {
          previouslyFocusedElementRef.current?.focus()
        }, 0)
      }
    }
  }, [isOpen, modalRef])

  const trapFocus = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !isOpen) return

      const firstElement = firstFocusableElementRef.current
      const lastElement = lastFocusableElementRef.current

      if (!firstElement || !lastElement) {
        e.preventDefault()
        return
      }

      if (e.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    },
    [isOpen]
  )

  return { trapFocus, firstFocusableElement: firstFocusableElementRef.current }
}

interface SigninModalProps {
  callbackUrl?: string
  onClose?: () => void
}

export function SigninModal({
  callbackUrl: propCallbackUrl,
  onClose,
}: SigninModalProps = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const [announcement, setAnnouncement] = useState('')
  const [announcementPriority, setAnnouncementPriority] = useState<
    'polite' | 'assertive'
  >('polite')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const callbackUrl = propCallbackUrl || searchParams.get('callbackUrl') || '/'

  // Performance monitoring
  const { startModalLoad, endModalLoad, logMetrics } = useModalPerformance()

  // Use enhanced focus management
  const { trapFocus, firstFocusableElement } = useFocusManagement(
    isModalOpen,
    modalRef
  )

  const handleClose = () => {
    setAnnouncement('로그인 모달이 닫혔습니다')
    setIsModalOpen(false)
    if (onClose) {
      onClose()
    } else {
      router.back()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setAnnouncement('배경을 클릭하여 모달을 닫습니다')
      handleClose()
    }
  }

  const handleAuthSuccess = () => {
    setAnnouncement('로그인이 성공했습니다. 모달을 닫습니다')
    // Close modal and let NextAuth handle the redirect
    handleClose()
  }

  const handleAuthError = (error: Error) => {
    console.error('Authentication error in modal:', error)
    setAnnouncement('로그인 중 오류가 발생했습니다')
    // Error is handled by the form component, no additional action needed
  }

  const handleFallbackToFullPage = () => {
    // Redirect to full page signin with current callback URL
    const fullPageUrl = `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
    window.location.href = fullPageUrl
  }

  const handleModalError = (error: Error, errorInfo: any) => {
    console.error('Modal component error:', error, errorInfo)

    // Auto-fallback to full page after a brief delay
    setTimeout(() => {
      handleFallbackToFullPage()
    }, 2000)
  }

  // Enhanced keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle ESC key for modal dismissal
      if (e.key === 'Escape') {
        setAnnouncement('ESC 키를 눌러 모달을 닫습니다')
        setAnnouncementPriority('assertive')
        handleClose()
        return
      }

      // Handle focus trapping
      trapFocus(e)
    }

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isModalOpen, trapFocus])

  // Modal initialization and accessibility setup
  useEffect(() => {
    // Start performance monitoring
    startModalLoad()

    setIsModalOpen(true)
    setAnnouncement(
      '로그인 모달이 열렸습니다. ESC 키를 누르거나 배경을 클릭하여 닫을 수 있습니다.'
    )
    setAnnouncementPriority('polite')

    // Set initial focus to the close button for better accessibility
    setTimeout(() => {
      const closeButton = closeButtonRef.current
      if (closeButton) {
        closeButton.focus()
        setAnnouncement('닫기 버튼에 포커스가 설정되었습니다')
      } else {
        // Find the first focusable element dynamically
        const modal = modalRef.current
        if (modal) {
          const focusableElements = modal.querySelectorAll(
            'button:not([disabled]):not([aria-hidden="true"]), [href]:not([disabled]):not([aria-hidden="true"]), input:not([disabled]):not([aria-hidden="true"]), select:not([disabled]):not([aria-hidden="true"]), textarea:not([disabled]):not([aria-hidden="true"]), [tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-hidden="true"]), [contenteditable="true"]:not([disabled]):not([aria-hidden="true"])'
          )
          const firstElement = focusableElements[0] as HTMLElement
          if (firstElement) {
            firstElement.focus()
            setAnnouncement('첫 번째 요소에 포커스가 설정되었습니다')
          }
        }
      }

      // End modal load performance monitoring
      endModalLoad()

      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => logMetrics(), 1000)
      }
    }, 100) // Small delay to ensure modal is fully rendered
  }, []) // Empty dependency array - only run once on mount

  return (
    <ModalErrorBoundary
      onFallbackToFullPage={handleFallbackToFullPage}
      onError={handleModalError}
    >
      {/* Screen reader announcements */}
      {announcement && (
        <ScreenReaderAnnouncement
          message={announcement}
          priority={announcementPriority}
        />
      )}

      <div
        className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4'
        onClick={handleBackdropClick}
        role='dialog'
        aria-modal='true'
        aria-labelledby='signin-modal-title'
        aria-describedby='signin-modal-description'
      >
        <div
          ref={modalRef}
          className='relative w-full max-w-md max-h-[90vh] overflow-y-auto'
          onClick={e => e.stopPropagation()}
          role='document'
        >
          <Card className='w-full'>
            <CardHeader className='text-center relative items-center justify-center'>
              <Button
                ref={closeButtonRef}
                variant='ghost'
                size='sm'
                className='absolute right-2 top-2 h-8 w-8 p-0 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                onClick={handleClose}
                aria-label='로그인 모달 닫기. ESC 키를 눌러도 닫을 수 있습니다'
                title='모달 닫기 (ESC)'
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleClose()
                  }
                }}
              >
                <X className='h-4 w-4' aria-hidden='true' />
              </Button>
              <CardTitle id='signin-modal-title' className='text-2xl font-bold'>
                로그인
              </CardTitle>
              <CardDescription id='signin-modal-description'>
                Google 계정으로 로그인하세요. 배경을 클릭하거나 ESC 키를 눌러
                모달을 닫을 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<FormLoadingFallback />}>
                <SignInForm
                  isModal={true}
                  onSuccess={handleAuthSuccess}
                  onError={handleAuthError}
                  callbackUrl={callbackUrl}
                />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModalErrorBoundary>
  )
}
