import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react'

import { cn } from '@/lib/utils'
import { enhancedAlertVariants } from './variants'

const alertIcons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
}

export interface AlertProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof enhancedAlertVariants> {
  dismissible?: boolean
  onDismiss?: () => void
  icon?: React.ReactNode | boolean
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'default',
      size,
      dismissible = false,
      onDismiss,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const IconComponent = alertIcons[variant || 'default']
    const showIcon = icon !== false
    const iconElement =
      icon === true || icon === undefined ? <IconComponent /> : icon

    return (
      <div
        ref={ref}
        data-slot="alert"
        role="alert"
        className={cn(
          enhancedAlertVariants({ variant, size }),
          dismissible && 'pr-10',
          className
        )}
        {...props}
      >
        {showIcon && iconElement}
        <div className="flex-1">{children}</div>
        {dismissible && (
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)

Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="alert-title"
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
))

AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="alert-description"
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
))

AlertDescription.displayName = 'AlertDescription'

export {
  Alert,
  AlertTitle,
  AlertDescription,
  enhancedAlertVariants as alertVariants,
}
