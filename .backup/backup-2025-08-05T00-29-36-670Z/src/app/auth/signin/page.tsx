import { Suspense } from 'react'
import { SignInForm } from '@/components/auth/signin-form'
import { AuthLayout } from '@/components/auth/auth-layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface SignInPageProps {
  searchParams: Promise<{
    callbackUrl?: string
    error?: string
  }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = await searchParams
  const callbackUrl = resolvedSearchParams?.callbackUrl || '/'

  return (
    <AuthLayout subtitle='안전하고 간편한 Google 로그인으로 시작하세요'>
      <div className='flex items-center justify-center min-h-[60vh]'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <CardTitle className='text-2xl font-bold'>로그인</CardTitle>
            <CardDescription>Google 계정으로 로그인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className='flex items-center justify-center p-4'>
                  <div className='w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin' />
                  <span className='ml-2 text-sm text-muted-foreground'>
                    로딩 중...
                  </span>
                </div>
              }
            >
              <SignInForm callbackUrl={callbackUrl} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}
