'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const errorMessages = {
  Configuration: '서버 설정에 문제가 있습니다.',
  AccessDenied: '접근이 거부되었습니다.',
  Verification: '인증 토큰이 만료되었거나 이미 사용되었습니다.',
  Default: '알 수 없는 오류가 발생했습니다.',
}

export function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') as keyof typeof errorMessages

  const errorMessage = errorMessages[error] || errorMessages.Default

  return (
    <div className="space-y-4 text-center">
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p className="text-destructive font-medium">{errorMessage}</p>
        {error === 'AccessDenied' && (
          <p className="text-sm text-muted-foreground mt-2">
            계정에 접근 권한이 없습니다. 관리자에게 문의하세요.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Button asChild className="w-full">
          <Link href="/auth/signin">다시 로그인</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">홈으로 돌아가기</Link>
        </Button>
      </div>
    </div>
  )
}
