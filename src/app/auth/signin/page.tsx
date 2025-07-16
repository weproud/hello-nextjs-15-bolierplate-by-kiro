import { Suspense } from 'react'
import { SignInForm } from '@/components/auth/signin-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">로그인</CardTitle>
          <CardDescription>
            Google 계정으로 LagomPath에 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>로딩 중...</div>}>
            <SignInForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
