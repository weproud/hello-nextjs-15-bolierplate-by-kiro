import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { spinnerVariants } from './variants'

export interface SpinnerProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof spinnerVariants> {
  label?: string
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, label, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(spinnerVariants({ size, variant }), className)}
      role="status"
      aria-label={label || 'Loading'}
      {...props}
    >
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  )
)

Spinner.displayName = 'Spinner'

export { Spinner, spinnerVariants }
