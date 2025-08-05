/**
 * Skip Link Component
 *
 * 키보드 사용자가 주요 콘텐츠로 바로 이동할 수 있도록 하는 접근성 컴포넌트입니다.
 */

import { cn } from '@/lib/utils'
import * as React from 'react'

interface SkipLinkProps extends React.ComponentProps<'a'> {
  href: string
  children: React.ReactNode
}

const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(
  ({ className, href, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          // 기본적으로 숨김
          'sr-only',
          // 포커스 시 표시
          'focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50',
          'focus:bg-background focus:text-foreground focus:px-4 focus:py-2',
          'focus:rounded-md focus:border focus:border-border focus:shadow-lg',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'transition-all duration-200',
          className
        )}
        {...props}
      >
        {children}
      </a>
    )
  }
)

SkipLink.displayName = 'SkipLink'

export { SkipLink }
