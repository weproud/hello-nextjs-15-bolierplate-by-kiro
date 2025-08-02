import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { enhancedBadgeVariants } from './variants'

export interface BadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof enhancedBadgeVariants> {
  asChild?: boolean
  dismissible?: boolean
  onDismiss?: () => void
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      asChild = false,
      dismissible = false,
      onDismiss,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'span'

    return (
      <Comp
        ref={ref}
        data-slot='badge'
        className={cn(
          enhancedBadgeVariants({ variant, size, shape }),
          dismissible && 'pr-1',
          className
        )}
        {...props}
      >
        {leftIcon && (
          <span className='shrink-0 [&>svg]:size-3'>{leftIcon}</span>
        )}
        {children}
        {rightIcon && !dismissible && (
          <span className='shrink-0 [&>svg]:size-3'>{rightIcon}</span>
        )}
        {dismissible && (
          <button
            type='button'
            onClick={onDismiss}
            className='ml-1 shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
            aria-label='Remove badge'
          >
            <X className='h-3 w-3' />
          </button>
        )}
      </Comp>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge, enhancedBadgeVariants as badgeVariants }
