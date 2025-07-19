'use client'

import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Custom 404 Not Found Page
 *
 * This page is automatically shown when a route is not found.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <div className="text-6xl font-bold text-primary mb-2">404</div>
            <CardTitle className="text-2xl">
              페이지를 찾을 수 없습니다
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            </p>
            <p className="text-sm text-muted-foreground">
              URL을 다시 확인하시거나 아래 버튼을 통해 다른 페이지로
              이동해보세요.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                홈으로 가기
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/projects">
                <Search className="w-4 h-4 mr-2" />
                프로젝트 보기
              </Link>
            </Button>
          </div>

          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전 페이지로
          </Button>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              문제가 지속되면{' '}
              <Link href="/contact" className="text-primary hover:underline">
                문의하기
              </Link>
              를 통해 알려주세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
