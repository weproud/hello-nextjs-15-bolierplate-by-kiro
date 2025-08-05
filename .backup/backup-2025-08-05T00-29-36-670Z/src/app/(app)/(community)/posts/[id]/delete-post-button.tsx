'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
// toast 라이브러리 대신 간단한 알림 사용

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deletePostAction } from '@/lib/actions/post-actions'

interface DeletePostButtonProps {
  postId: string
}

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      const result = await deletePostAction({ id: postId })

      if (result?.data?.success) {
        // 성공 시 포스트 목록으로 이동
        router.push('/posts')
        router.refresh()
      } else if (result?.serverError) {
        throw new Error(result.serverError)
      }
    } catch (error) {
      console.error('포스트 삭제 중 오류 발생:', error)
      alert(
        error instanceof Error
          ? error.message
          : '포스트 삭제 중 오류가 발생했습니다.'
      )
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='text-destructive hover:text-destructive'
        >
          <Trash2 className='h-4 w-4 sm:mr-2' />
          <span className='hidden sm:inline'>삭제</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>포스트 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            이 포스트를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며,
            포스트의 모든 내용이 영구적으로 삭제됩니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isDeleting ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 className='h-4 w-4 mr-2' />
                삭제
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
