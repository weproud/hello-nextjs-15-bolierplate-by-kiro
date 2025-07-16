import { Suspense } from 'react'
import { AuthError } from '@/components/auth/auth-error'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-destructive">
            인증 오류
          </CardTitle>
          <CardDescription>로그인 중 문제가 발생했습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>로딩 중...</div>}>
            <AuthError />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
