'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LogIn, Shield } from 'lucide-react'

interface LoginRequiredProps {
  title?: string
  description?: string
}

export function LoginRequired({
  title = '로그인이 필요합니다',
  description = '이 페이지에 접근하려면 먼저 로그인해주세요.',
}: LoginRequiredProps) {
  return (
    <div className='flex items-center justify-center min-h-[60vh]'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
            <Shield className='h-6 w-6' />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Button onClick={() => signIn('google')} className='w-full' size='lg'>
            <LogIn className='mr-2 h-4 w-4' />
            Google로 로그인
          </Button>
          <p className='text-center text-sm text-muted-foreground'>
            Google 계정으로 안전하게 로그인하세요
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
