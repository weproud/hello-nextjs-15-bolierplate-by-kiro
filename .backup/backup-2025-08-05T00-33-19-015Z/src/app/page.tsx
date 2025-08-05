import { NavigationHeader } from '@/components/auth/navigation-header'
import { AuthConditional } from '@/components/auth/client-protected-route'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FeaturesSection } from '@/components/features-section'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className='min-h-screen bg-background'>
      <NavigationHeader />

      <main className='container mx-auto px-4 py-16'>
        {/* Hero Section */}
        <div className='text-center space-y-6 mb-16'>
          <h1 className='text-4xl md:text-6xl font-bold tracking-tight'>
            Welcome to <span className='text-primary'>Nextjs 15</span>
          </h1>
          <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
            개인 성장과 목표 달성을 위한 체계적인 프로젝트 관리 플랫폼
          </p>

          <AuthConditional
            authenticated={
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Link href='/dashboard'>
                  <Button size='lg' className='w-full sm:w-auto'>
                    대시보드로 이동
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Button>
                </Link>
              </div>
            }
            unauthenticated={
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Link href='/auth/signin'>
                  <Button size='lg' className='w-full sm:w-auto'>
                    시작하기
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Button>
                </Link>
              </div>
            }
          />
        </div>

        {/* Features Section */}
        <FeaturesSection />

        {/* Authentication Status Section */}
        <AuthConditional
          authenticated={
            <Card className='max-w-2xl mx-auto'>
              <CardHeader className='text-center'>
                <CardTitle className='text-green-600'>✅ 로그인 완료</CardTitle>
                <CardDescription>
                  성공적으로 인증되었습니다. 이제 모든 기능을 사용할 수
                  있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className='text-center'>
                <Link href='/dashboard'>
                  <Button>
                    대시보드로 이동
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          }
          unauthenticated={
            <Card className='max-w-2xl mx-auto'>
              <CardHeader className='text-center'>
                <CardTitle>🔐 인증이 필요합니다</CardTitle>
                <CardDescription>
                  모든 기능을 사용하려면 Google 계정으로 로그인하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className='text-center'>
                <Link href='/auth/signin'>
                  <Button>
                    로그인하기
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          }
        />
      </main>
    </div>
  )
}
