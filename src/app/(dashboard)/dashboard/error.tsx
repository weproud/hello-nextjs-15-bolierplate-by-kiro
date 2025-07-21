'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface DashboardErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">대시보드 로딩 오류</CardTitle>
          <p className="text-muted-foreground">
            대시보드를 불러오는 중 문제가 발생했습니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error details */}
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <h4 className="font-medium text-destructive mb-2">오류 세부사항</h4>
            <p className="text-sm text-muted-foreground">
              {error.message || '알 수 없는 오류가 발생했습니다.'}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                오류 ID: {error.digest}
              </p>
            )}
          </div>

          {/* Possible causes */}
          <div className="space-y-2">
            <h4 className="font-medium">가능한 원인:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• 네트워크 연결 문제</li>
              <li>• 서버 일시적 오류</li>
              <li>• 데이터베이스 연결 문제</li>
              <li>• 권한 관련 문제</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              다시 시도
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/')}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              홈으로 이동
            </Button>
          </div>

          {/* Help text */}
          <div className="text-center text-sm text-muted-foreground">
            <p>문제가 계속 발생하면 관리자에게 문의하세요.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
