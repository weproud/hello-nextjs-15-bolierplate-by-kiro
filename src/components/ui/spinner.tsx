import { type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { spinnerVariants } from '@/components/ui/variants'
import { cn } from '@/lib/utils'

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
      role='status'
      aria-label={label || 'Loading'}
      {...props}
    >
      <span className='sr-only'>{label || 'Loading...'}</span>
    </div>
  )
)

Spinner.displayName = 'Spinner'

export { Spinner, spinnerVariants }
