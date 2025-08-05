'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { User, Mail, Calendar, Activity } from 'lucide-react'
import Link from 'next/link'
export function DashboardClient() {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <div className='space-y-8'>
      {/* Welcome Section */}
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold'>
          안녕하세요, {user?.name || '사용자'}님! 👋
        </h1>
        <p className='text-muted-foreground'>
          오늘도 목표를 향해 한 걸음 더 나아가세요.
        </p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            프로필 정보
          </CardTitle>
          <CardDescription>현재 로그인된 계정 정보입니다.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
              <User className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm font-medium'>이름</p>
                <p className='text-sm text-muted-foreground'>
                  {user?.name || '이름 없음'}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
              <Mail className='h-4 w-4 text-muted-foreground' />
              <div>
                <p className='text-sm font-medium'>이메일</p>
                <p className='text-sm text-muted-foreground'>
                  {user?.email || '이메일 없음'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <Card className='hover:shadow-md transition-shadow'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='h-5 w-5 text-blue-500' />
              프로젝트 관리
            </CardTitle>
            <CardDescription>
              새로운 프로젝트를 시작하거나 기존 프로젝트를 관리하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href='/projects'>
              <Button className='w-full'>프로젝트 보기</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className='hover:shadow-md transition-shadow'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='h-5 w-5 text-green-500' />
              일정 관리
            </CardTitle>
            <CardDescription>
              오늘의 할 일과 예정된 미션을 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant='outline' className='w-full'>
              일정 보기
            </Button>
          </CardContent>
        </Card>

        <Card className='hover:shadow-md transition-shadow'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <User className='h-5 w-5 text-purple-500' />
              프로필 설정
            </CardTitle>
            <CardDescription>
              계정 설정과 개인 정보를 관리하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant='outline' className='w-full'>
              설정하기
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
