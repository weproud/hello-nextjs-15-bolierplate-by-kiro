'use client'

import { useEffect } from 'react'
import { setupGlobalErrorHandling } from '@/lib/global-error-handler'

export function ErrorHandlerProvider() {
  useEffect(() => {
    setupGlobalErrorHandling()
  }, [])

  return null
}
