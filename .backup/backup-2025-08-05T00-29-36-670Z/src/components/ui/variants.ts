/**
 * UI Component Variants
 *
 * shadcn/ui 컴포넌트들의 일관된 variant 시스템을 위한 공통 유틸리티
 */

import { cva } from 'class-variance-authority'

// Common variant configurations
export const commonVariants = {
  // Size variants used across multiple components
  size: {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  },

  // Color variants for different states
  variant: {
    default: 'bg-background text-foreground',
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-input bg-background',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    muted: 'bg-muted text-muted-foreground',
  },

  // Spacing variants
  spacing: {
    none: 'p-0',
    sm: 'p-2',
    default: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },

  // Border radius variants
  radius: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    default: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  },

  // Shadow variants
  shadow: {
    none: 'shadow-none',
    sm: 'shadow-sm',
    default: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
}

// Enhanced button variants with more options
export const enhancedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
        success:
          'bg-green-600 text-white shadow-xs hover:bg-green-700 focus-visible:ring-green-600/20',
        warning:
          'bg-yellow-600 text-white shadow-xs hover:bg-yellow-700 focus-visible:ring-yellow-600/20',
        info: 'bg-blue-600 text-white shadow-xs hover:bg-blue-700 focus-visible:ring-blue-600/20',
      },
      size: {
        xs: 'h-7 rounded px-2 text-xs has-[>svg]:px-1.5',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        xl: 'h-12 rounded-lg px-8 text-base has-[>svg]:px-6',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
        'icon-xl': 'size-12',
      },
      loading: {
        true: 'cursor-not-allowed opacity-70',
        false: '',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      loading: false,
      fullWidth: false,
    },
  }
)

// Enhanced card variants
export const enhancedCardVariants = cva(
  'bg-card text-card-foreground flex flex-col border shadow-sm',
  {
    variants: {
      variant: {
        default: 'bg-card border-border',
        elevated: 'bg-card border-border shadow-md',
        outlined: 'bg-transparent border-2 border-border',
        filled: 'bg-muted border-transparent',
        ghost: 'bg-transparent border-transparent shadow-none',
      },
      size: {
        sm: 'gap-3 p-3 rounded-lg',
        default: 'gap-6 py-6 rounded-xl',
        lg: 'gap-8 p-8 rounded-2xl',
      },
      interactive: {
        true: 'cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      interactive: false,
    },
  }
)

// Enhanced input variants
export const enhancedInputVariants = cva(
  'flex w-full border border-input bg-background text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    variants: {
      variant: {
        default: 'border-input',
        filled: 'bg-muted border-transparent',
        flushed:
          'border-0 border-b-2 border-input rounded-none bg-transparent px-0',
        outline: 'border-2 border-input',
      },
      size: {
        sm: 'h-8 px-2 py-1 text-sm rounded-md',
        default: 'h-9 px-3 py-1 rounded-md',
        lg: 'h-10 px-4 py-2 rounded-lg',
        xl: 'h-12 px-6 py-3 text-base rounded-lg',
      },
      state: {
        default: '',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-green-500 focus-visible:ring-green-500',
        warning: 'border-yellow-500 focus-visible:ring-yellow-500',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      state: 'default',
    },
  }
)

// Badge variants
export const enhancedBadgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
        warning:
          'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
        info: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      },
      size: {
        sm: 'px-1.5 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
      shape: {
        default: 'rounded-md',
        pill: 'rounded-full',
        square: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'default',
    },
  }
)

// Alert variants
export const enhancedAlertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        success:
          'border-green-500/50 text-green-700 dark:border-green-500 dark:text-green-400 [&>svg]:text-green-600 dark:[&>svg]:text-green-400',
        warning:
          'border-yellow-500/50 text-yellow-700 dark:border-yellow-500 dark:text-yellow-400 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400',
        info: 'border-blue-500/50 text-blue-700 dark:border-blue-500 dark:text-blue-400 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400',
      },
      size: {
        sm: 'px-3 py-2 text-xs',
        default: 'px-4 py-3 text-sm',
        lg: 'px-6 py-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// Loading spinner variants
export const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        default: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8',
      },
      variant: {
        default: 'text-primary',
        secondary: 'text-secondary',
        muted: 'text-muted-foreground',
        white: 'text-white',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
)

// Skeleton variants
export const skeletonVariants = cva('animate-pulse rounded-md bg-muted', {
  variants: {
    variant: {
      default: 'bg-muted',
      shimmer:
        'bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_2s_infinite]',
      pulse: 'bg-muted animate-pulse',
    },
    size: {
      sm: 'h-3',
      default: 'h-4',
      lg: 'h-6',
      xl: 'h-8',
    },
    shape: {
      default: 'rounded-md',
      circle: 'rounded-full',
      square: 'rounded-none',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    shape: 'default',
  },
})

// Export all variants for easy access
export const variants = {
  button: enhancedButtonVariants,
  card: enhancedCardVariants,
  input: enhancedInputVariants,
  badge: enhancedBadgeVariants,
  alert: enhancedAlertVariants,
  spinner: spinnerVariants,
  skeleton: skeletonVariants,
  common: commonVariants,
}
