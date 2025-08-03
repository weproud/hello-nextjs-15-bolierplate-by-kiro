'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const ThemeToggle = React.memo(function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const getThemeLabel = (currentTheme: string | undefined): string => {
    switch (currentTheme) {
      case 'light':
        return '라이트 모드'
      case 'dark':
        return '다크 모드'
      case 'system':
        return '시스템 설정'
      default:
        return '테마 설정'
    }
  }

  const getCurrentIcon = (): React.ReactElement => {
    if (!mounted)
      return <Sun className='h-[1.2rem] w-[1.2rem]' aria-hidden='true' />

    if (theme === 'system') {
      return <Monitor className='h-[1.2rem] w-[1.2rem]' aria-hidden='true' />
    }

    return resolvedTheme === 'dark' ? (
      <Moon className='h-[1.2rem] w-[1.2rem]' aria-hidden='true' />
    ) : (
      <Sun className='h-[1.2rem] w-[1.2rem]' aria-hidden='true' />
    )
  }

  if (!mounted) {
    return (
      <Button
        variant='outline'
        size='icon'
        aria-label='테마 설정 로딩 중'
        disabled
      >
        <Sun className='h-[1.2rem] w-[1.2rem]' aria-hidden='true' />
        <span className='sr-only'>테마 설정 로딩 중</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          aria-label={`현재 테마: ${getThemeLabel(theme)}. 테마 변경하기`}
          className='transition-all duration-200 hover:scale-105'
        >
          {getCurrentIcon()}
          <span className='sr-only'>테마 설정 메뉴 열기</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='min-w-[140px]'>
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className='cursor-pointer'
          aria-label='라이트 모드로 변경'
        >
          <Sun className='mr-2 h-4 w-4' aria-hidden='true' />
          <span>라이트</span>
          {theme === 'light' && (
            <span className='ml-auto text-xs text-muted-foreground'>✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className='cursor-pointer'
          aria-label='다크 모드로 변경'
        >
          <Moon className='mr-2 h-4 w-4' aria-hidden='true' />
          <span>다크</span>
          {theme === 'dark' && (
            <span className='ml-auto text-xs text-muted-foreground'>✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className='cursor-pointer'
          aria-label='시스템 설정에 따라 테마 변경'
        >
          <Monitor className='mr-2 h-4 w-4' aria-hidden='true' />
          <span>시스템</span>
          {theme === 'system' && (
            <span className='ml-auto text-xs text-muted-foreground'>✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
