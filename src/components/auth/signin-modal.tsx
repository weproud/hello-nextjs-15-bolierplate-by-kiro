'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SignInForm } from '@/components/auth/signin-form'
import { ModalErrorBoundary } from '@/components/auth/modal-error-boundary'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// Screen reader announcement component
function ScreenReaderAnnouncement({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

export function SigninModal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [hasModalError, setHasModalError] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleClose = () => {
    setAnnouncement('로그인 모달이 닫혔습니다')
    setIsModalOpen(false)
    router.back()
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
    setHasModalError(true)

    // Auto-fallback to full page after a brief delay
    setTimeout(() => {
      handleFallbackToFullPage()
    }, 2000)
  }

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Modal initialization and accessibility setup
  useEffect(() => {
    setIsModalOpen(true)
    setAnnouncement(
      '로그인 모달이 열렸습니다. ESC 키를 누르거나 배경을 클릭하여 닫을 수 있습니다.'
    )

    // Store the previously focused element to restore focus later
    const previouslyFocusedElement = document.activeElement as HTMLElement

    return () => {
      // Restore focus to previously focused element when modal closes
      if (previouslyFocusedElement && previouslyFocusedElement.focus) {
        previouslyFocusedElement.focus()
      }
    }
  }, [])

  // Enhanced focus trap with better accessibility
  useEffect(() => {
    const modal = modalRef.current
    if (!modal || !isModalOpen) return

    const focusableElements = modal.querySelectorAll(
      'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), [contenteditable="true"]:not([disabled])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      // If no focusable elements, prevent tabbing
      if (focusableElements.length === 0) {
        e.preventDefault()
        return
      }

      // If only one focusable element, keep focus on it
      if (focusableElements.length === 1) {
        e.preventDefault()
        firstElement?.focus()
        return
      }

      if (e.shiftKey) {
        // Shift + Tab: moving backwards
        if (
          document.activeElement === firstElement ||
          !modal.contains(document.activeElement)
        ) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        // Tab: moving forwards
        if (
          document.activeElement === lastElement ||
          !modal.contains(document.activeElement)
        ) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    // Set initial focus to the close button for better UX
    const closeButton = closeButtonRef.current
    if (closeButton) {
      closeButton.focus()
    } else if (firstElement) {
      firstElement.focus()
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [isModalOpen])

  return (
    <ModalErrorBoundary
      onFallbackToFullPage={handleFallbackToFullPage}
      onError={handleModalError}
    >
      {/* Screen reader announcements */}
      {announcement && <ScreenReaderAnnouncement message={announcement} />}

      <div
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-modal-title"
        aria-describedby="signin-modal-description"
      >
        <div
          ref={modalRef}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
          role="document"
        >
          <Card className="w-full">
            <CardHeader className="text-center relative">
              <Button
                ref={closeButtonRef}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-0"
                onClick={handleClose}
                aria-label="로그인 모달 닫기. ESC 키를 눌러도 닫을 수 있습니다"
                title="모달 닫기 (ESC)"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
              <CardTitle id="signin-modal-title" className="text-2xl font-bold">
                로그인
              </CardTitle>
              <CardDescription id="signin-modal-description">
                Google 계정으로 LagomPath에 로그인하세요. 배경을 클릭하거나 ESC
                키를 눌러 모달을 닫을 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignInForm
                isModal={true}
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
                callbackUrl={callbackUrl}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </ModalErrorBoundary>
  )
}
