'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface SignOutDialogProps {
  children: React.ReactNode
  callbackUrl?: string
}

export function SignOutDialog({
  children,
  callbackUrl = '/',
}: SignOutDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await signOut({ callbackUrl, redirect: true })
    } catch (error) {
      console.error('로그아웃 오류:', error)
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            로그아웃 확인
          </DialogTitle>
          <DialogDescription>
            정말로 로그아웃하시겠습니까? 현재 세션이 종료되고 홈페이지로
            이동합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button
            onClick={handleSignOut}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                로그아웃 중...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                로그아웃
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
