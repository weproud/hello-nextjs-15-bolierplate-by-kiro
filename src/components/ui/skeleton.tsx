import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { skeletonVariants } from './variants'

export interface SkeletonProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, size, shape, ...props }, ref) => (
    <div
      ref={ref}
      data-slot='skeleton'
      className={cn(skeletonVariants({ variant, size, shape }), className)}
      {...props}
    />
  )
)

Skeleton.displayName = 'Skeleton'

// Predefined skeleton components for common use cases
const SkeletonText = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'shape'>
>(({ className, ...props }, ref) => (
  <Skeleton
    ref={ref}
    shape='default'
    className={cn('w-full', className)}
    {...props}
  />
))

SkeletonText.displayName = 'SkeletonText'

const SkeletonAvatar = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'shape'>
>(({ className, size = 'default', ...props }, ref) => (
  <Skeleton
    ref={ref}
    shape='circle'
    size={size}
    className={cn(
      {
        'h-8 w-8': size === 'sm',
        'h-10 w-10': size === 'default',
        'h-12 w-12': size === 'lg',
        'h-16 w-16': size === 'xl',
      },
      className
    )}
    {...props}
  />
))

SkeletonAvatar.displayName = 'SkeletonAvatar'

const SkeletonButton = React.forwardRef<
  HTMLDivElement,
  Omit<SkeletonProps, 'shape'>
>(({ className, size = 'default', ...props }, ref) => (
  <Skeleton
    ref={ref}
    shape='default'
    className={cn(
      {
        'h-8 w-20': size === 'sm',
        'h-9 w-24': size === 'default',
        'h-10 w-28': size === 'lg',
        'h-12 w-32': size === 'xl',
      },
      className
    )}
    {...props}
  />
))

SkeletonButton.displayName = 'SkeletonButton'

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  skeletonVariants,
}
