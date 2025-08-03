'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  // 타입 안전성을 위한 테마 검증
  const validTheme = (['light', 'dark', 'system'] as const).includes(
    theme as any
  )
    ? (theme as ToasterProps['theme'])
    : 'system'

  return (
    <Sonner
      theme={validTheme}
      className='toaster group'
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
