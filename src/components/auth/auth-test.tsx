'use client'

import { useAuth } from './auth-provider'
import { useSession } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, User, Mail, Image } from 'lucide-react'

/**
 * 개발 환경에서 인증 상태를 테스트하고 디버깅하기 위한 컴포넌트
 * 프로덕션에서는 사용하지 않음
 */
export function AuthTest() {
  const { session, isLoading, isAuthenticated, user } = useAuth()
  const { data: sessionData, status } = useSession()

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            인증 상태 테스트
          </CardTitle>
          <CardDescription>
            현재 인증 상태와 세션 정보를 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 인증 상태 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">인증 상태:</span>
            <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
              {isAuthenticated ? (
                <CheckCircle className="mr-1 h-3 w-3" />
              ) : (
                <XCircle className="mr-1 h-3 w-3" />
              )}
              {isAuthenticated ? '인증됨' : '인증되지 않음'}
            </Badge>
          </div>

          {/* 로딩 상태 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">로딩 상태:</span>
            <Badge variant={isLoading ? 'outline' : 'secondary'}>
              {isLoading ? (
                <Clock className="mr-1 h-3 w-3" />
              ) : (
                <CheckCircle className="mr-1 h-3 w-3" />
              )}
              {isLoading ? '로딩 중' : '완료'}
            </Badge>
          </div>

          {/* NextAuth 세션 상태 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">NextAuth 상태:</span>
            <Badge
              variant={
                status === 'authenticated'
                  ? 'default'
                  : status === 'loading'
                    ? 'outline'
                    : 'secondary'
              }
            >
              {status === 'authenticated' && (
                <CheckCircle className="mr-1 h-3 w-3" />
              )}
              {status === 'loading' && <Clock className="mr-1 h-3 w-3" />}
              {status === 'unauthenticated' && (
                <XCircle className="mr-1 h-3 w-3" />
              )}
              {status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 사용자 정보 */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              사용자 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">이름</p>
                  <p className="text-sm text-muted-foreground">
                    {user.name || '이름 없음'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">이메일</p>
                  <p className="text-sm text-muted-foreground">
                    {user.email || '이메일 없음'}
                  </p>
                </div>
              </div>

              {user.image && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">프로필 이미지</p>
                    <p className="text-sm text-muted-foreground break-all">
                      {user.image}
                    </p>
                  </div>
                </div>
              )}

              {user.id && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">사용자 ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {user.id}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 세션 데이터 (개발 모드) */}
      {sessionData && process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle>세션 데이터 (개발 모드)</CardTitle>
            <CardDescription>
              디버깅을 위한 전체 세션 데이터입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-64">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
