import { type ReactNode } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AuthLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backUrl?: string
}

/**
 * 인증 관련 페이지들을 위한 공통 레이아웃 컴포넌트
 * 로그인, 회원가입, 오류 페이지 등에서 사용
 */
export function AuthLayout({
  children,
  title = 'Auth',
  subtitle,
  showBackButton = true,
  backUrl = '/',
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Link href={backUrl}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  돌아가기
                </Button>
              </Link>
            )}
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">{title}</span>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {subtitle && (
            <div className="text-center mb-8">
              <p className="text-lg text-muted-foreground">{subtitle}</p>
            </div>
          )}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="text-center text-sm text-muted-foreground md:text-left">
              © 2024 개인 성장을 위한 프로젝트 관리 플랫폼
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                이용약관
              </Link>
              <Link
                href="/support"
                className="hover:text-foreground transition-colors"
              >
                고객지원
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
