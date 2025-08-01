import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { enhancedButtonVariants, spinnerVariants } from './variants'

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    const isDisabled = disabled || loading

    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(
          enhancedButtonVariants({
            variant,
            size,
            loading,
            className,
          })
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2
            className={cn(
              spinnerVariants({
                size: size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default',
              })
            )}
          />
        )}
        {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, enhancedButtonVariants as buttonVariants }
