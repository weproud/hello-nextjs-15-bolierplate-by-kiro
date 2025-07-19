'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SignInForm } from '@/components/auth/signin-form'

/**
 * Lightweight version of SigninModal for better performance on slower devices
 * Removes advanced accessibility features and performance monitoring for minimal overhead
 */
export function SigninModalLite() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const modalRef = useRef<HTMLDivElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleClose = () => {
    setIsModalOpen(false)
    router.back()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleAuthSuccess = () => {
    handleClose()
  }

  const handleAuthError = (error: Error) => {
    console.error('Authentication error in modal:', error)
  }

  // Basic keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isModalOpen])

  // Simple modal initialization
  useEffect(() => {
    setIsModalOpen(true)
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="로그인"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white rounded-lg shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">로그인</h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleClose}
              aria-label="모달 닫기"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Google 계정으로 로그인하세요.
          </p>
          <SignInForm
            isModal={true}
            onSuccess={handleAuthSuccess}
            onError={handleAuthError}
            callbackUrl={callbackUrl}
          />
        </div>
      </div>
    </div>
  )
}
