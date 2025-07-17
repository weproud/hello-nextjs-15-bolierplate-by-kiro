import { Suspense } from 'react'
import { AuthError } from '@/components/auth/auth-error'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function AuthErrorPage() {
  return (
    <AuthLayout
      subtitle="인증 과정에서 문제가 발생했습니다"
      showBackButton={true}
      backUrl="/"
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-4">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">
              로딩 중...
            </span>
          </div>
        }
      >
        <AuthError />
      </Suspense>
    </AuthLayout>
  )
}
