'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

const ERROR_MESSAGES = {
  Configuration: '인증 설정에 문제가 있습니다. 관리자에게 문의하세요.',
  AccessDenied: '접근이 거부되었습니다. 권한이 없습니다.',
  Verification: '이메일 인증에 실패했습니다. 다시 시도해주세요.',
  Default: '인증 중 오류가 발생했습니다. 다시 시도해주세요.',
  OAuthSignin: 'OAuth 로그인 중 오류가 발생했습니다.',
  OAuthCallback: 'OAuth 콜백 처리 중 오류가 발생했습니다.',
  OAuthCreateAccount: '계정 생성 중 오류가 발생했습니다.',
  EmailCreateAccount: '이메일 계정 생성 중 오류가 발생했습니다.',
  Callback: '콜백 처리 중 오류가 발생했습니다.',
  OAuthAccountNotLinked: '이미 다른 방법으로 가입된 이메일입니다.',
  EmailSignin: '이메일 로그인 중 오류가 발생했습니다.',
  CredentialsSignin: '로그인 정보가 올바르지 않습니다.',
  SessionRequired: '세션이 필요합니다. 다시 로그인해주세요.',
} as const

type ErrorType = keyof typeof ERROR_MESSAGES

export function AuthError() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<ErrorType>('Default')

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(errorParam)
      setErrorType(errorParam as ErrorType)
    }
  }, [searchParams])

  const getErrorMessage = (errorType: ErrorType): string => {
    return ERROR_MESSAGES[errorType] || ERROR_MESSAGES.Default
  }

  const getErrorTitle = (errorType: ErrorType): string => {
    switch (errorType) {
      case 'AccessDenied':
        return '접근 거부'
      case 'Configuration':
        return '설정 오류'
      case 'Verification':
        return '인증 실패'
      case 'OAuthAccountNotLinked':
        return '계정 연결 오류'
      case 'CredentialsSignin':
        return '로그인 실패'
      case 'SessionRequired':
        return '세션 만료'
      default:
        return '인증 오류'
    }
  }

  const canRetry = !['Configuration', 'AccessDenied'].includes(errorType)

  if (!error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">오류 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            {getErrorTitle(errorType)}
          </CardTitle>
          <CardDescription className="text-center">
            {getErrorMessage(errorType)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {canRetry && (
            <Link href="/auth/signin" className="block">
              <Button className="w-full" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                다시 시도
              </Button>
            </Link>
          )}
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Button>
          </Link>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground font-mono">
                Debug: {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
