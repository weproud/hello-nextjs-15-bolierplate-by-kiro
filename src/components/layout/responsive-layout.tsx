/**
 * Responsive Layout Components
 *
 * 반응형 디자인을 위한 레이아웃 컴포넌트들
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-mobile'

// Container component with responsive max-widths
interface ContainerProps extends React.ComponentProps<'div'> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  centered?: boolean
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'xl', centered = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full px-4 sm:px-6 lg:px-8',
          {
            'max-w-sm': size === 'sm',
            'max-w-md': size === 'md',
            'max-w-lg': size === 'lg',
            'max-w-xl': size === 'xl',
            'max-w-2xl': size === '2xl',
            'max-w-none': size === 'full',
          },
          centered && 'mx-auto',
          className
        )}
        {...props}
      />
    )
  }
)

Container.displayName = 'Container'

// Grid system components
interface GridProps extends React.ComponentProps<'div'> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  }
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = 'md', responsive, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          {
            'grid-cols-1': cols === 1,
            'grid-cols-2': cols === 2,
            'grid-cols-3': cols === 3,
            'grid-cols-4': cols === 4,
            'grid-cols-5': cols === 5,
            'grid-cols-6': cols === 6,
            'grid-cols-12': cols === 12,
          },
          {
            'gap-0': gap === 'none',
            'gap-2': gap === 'sm',
            'gap-4': gap === 'md',
            'gap-6': gap === 'lg',
            'gap-8': gap === 'xl',
          },
          responsive && {
            [`sm:grid-cols-${responsive.sm}`]: responsive.sm,
            [`md:grid-cols-${responsive.md}`]: responsive.md,
            [`lg:grid-cols-${responsive.lg}`]: responsive.lg,
            [`xl:grid-cols-${responsive.xl}`]: responsive.xl,
          },
          className
        )}
        {...props}
      />
    )
  }
)

Grid.displayName = 'Grid'

// Flex layout components
interface FlexProps extends React.ComponentProps<'div'> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      className,
      direction = 'row',
      align = 'start',
      justify = 'start',
      wrap = false,
      gap = 'none',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          {
            'flex-row': direction === 'row',
            'flex-col': direction === 'col',
            'flex-row-reverse': direction === 'row-reverse',
            'flex-col-reverse': direction === 'col-reverse',
          },
          {
            'items-start': align === 'start',
            'items-center': align === 'center',
            'items-end': align === 'end',
            'items-stretch': align === 'stretch',
            'items-baseline': align === 'baseline',
          },
          {
            'justify-start': justify === 'start',
            'justify-center': justify === 'center',
            'justify-end': justify === 'end',
            'justify-between': justify === 'between',
            'justify-around': justify === 'around',
            'justify-evenly': justify === 'evenly',
          },
          wrap && 'flex-wrap',
          {
            'gap-0': gap === 'none',
            'gap-2': gap === 'sm',
            'gap-4': gap === 'md',
            'gap-6': gap === 'lg',
            'gap-8': gap === 'xl',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Flex.displayName = 'Flex'

// Stack component for vertical layouts
interface StackProps extends React.ComponentProps<'div'> {
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, spacing = 'md', align = 'stretch', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col',
          {
            'space-y-0': spacing === 'none',
            'space-y-1': spacing === 'xs',
            'space-y-2': spacing === 'sm',
            'space-y-4': spacing === 'md',
            'space-y-6': spacing === 'lg',
            'space-y-8': spacing === 'xl',
            'space-y-12': spacing === '2xl',
          },
          {
            'items-start': align === 'start',
            'items-center': align === 'center',
            'items-end': align === 'end',
            'items-stretch': align === 'stretch',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Stack.displayName = 'Stack'

// Responsive visibility components
interface ShowProps {
  above?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  below?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  only?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  children: React.ReactNode
}

export const Show: React.FC<ShowProps> = ({ above, below, only, children }) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
  const isDesktop = useMediaQuery('(min-width: 1025px)')

  let shouldShow = true

  if (only) {
    switch (only) {
      case 'sm':
        shouldShow = isMobile
        break
      case 'md':
        shouldShow = isTablet
        break
      case 'lg':
      case 'xl':
      case '2xl':
        shouldShow = isDesktop
        break
    }
  } else {
    if (above) {
      switch (above) {
        case 'sm':
          shouldShow = !isMobile
          break
        case 'md':
          shouldShow = isDesktop
          break
      }
    }

    if (below) {
      switch (below) {
        case 'md':
          shouldShow = isMobile
          break
        case 'lg':
          shouldShow = !isDesktop
          break
      }
    }
  }

  return shouldShow ? <>{children}</> : null
}

// Hide component (opposite of Show)
export const Hide: React.FC<ShowProps> = ({ above, below, only, children }) => {
  const showProps = { above, below, only }

  return (
    <Show {...showProps}>
      <div className="hidden">{children}</div>
    </Show>
  )
}

// Aspect ratio container
interface AspectRatioProps extends React.ComponentProps<'div'> {
  ratio?: '1:1' | '4:3' | '16:9' | '21:9' | '3:2'
}

export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ className, ratio = '16:9', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full',
          {
            'aspect-square': ratio === '1:1',
            'aspect-[4/3]': ratio === '4:3',
            'aspect-video': ratio === '16:9',
            'aspect-[21/9]': ratio === '21:9',
            'aspect-[3/2]': ratio === '3:2',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

AspectRatio.displayName = 'AspectRatio'

// Responsive text component
interface ResponsiveTextProps extends React.ComponentProps<'div'> {
  size?: {
    base?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
    sm?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
    md?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
    lg?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  }
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  align?: 'left' | 'center' | 'right' | 'justify'
}

export const ResponsiveText = React.forwardRef<
  HTMLDivElement,
  ResponsiveTextProps
>(({ className, size, weight = 'normal', align = 'left', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        // Base size
        size?.base && {
          'text-xs': size.base === 'xs',
          'text-sm': size.base === 'sm',
          'text-base': size.base === 'base',
          'text-lg': size.base === 'lg',
          'text-xl': size.base === 'xl',
          'text-2xl': size.base === '2xl',
          'text-3xl': size.base === '3xl',
          'text-4xl': size.base === '4xl',
        },
        // Responsive sizes
        size?.sm && {
          'sm:text-xs': size.sm === 'xs',
          'sm:text-sm': size.sm === 'sm',
          'sm:text-base': size.sm === 'base',
          'sm:text-lg': size.sm === 'lg',
          'sm:text-xl': size.sm === 'xl',
          'sm:text-2xl': size.sm === '2xl',
          'sm:text-3xl': size.sm === '3xl',
          'sm:text-4xl': size.sm === '4xl',
        },
        size?.md && {
          'md:text-xs': size.md === 'xs',
          'md:text-sm': size.md === 'sm',
          'md:text-base': size.md === 'base',
          'md:text-lg': size.md === 'lg',
          'md:text-xl': size.md === 'xl',
          'md:text-2xl': size.md === '2xl',
          'md:text-3xl': size.md === '3xl',
          'md:text-4xl': size.md === '4xl',
        },
        size?.lg && {
          'lg:text-xs': size.lg === 'xs',
          'lg:text-sm': size.lg === 'sm',
          'lg:text-base': size.lg === 'base',
          'lg:text-lg': size.lg === 'lg',
          'lg:text-xl': size.lg === 'xl',
          'lg:text-2xl': size.lg === '2xl',
          'lg:text-3xl': size.lg === '3xl',
          'lg:text-4xl': size.lg === '4xl',
        },
        // Weight
        {
          'font-normal': weight === 'normal',
          'font-medium': weight === 'medium',
          'font-semibold': weight === 'semibold',
          'font-bold': weight === 'bold',
        },
        // Alignment
        {
          'text-left': align === 'left',
          'text-center': align === 'center',
          'text-right': align === 'right',
          'text-justify': align === 'justify',
        },
        className
      )}
      {...props}
    />
  )
})

ResponsiveText.displayName = 'ResponsiveText'
