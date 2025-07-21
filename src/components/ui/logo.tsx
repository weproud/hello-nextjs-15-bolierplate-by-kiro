'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ 
  className, 
  size = 'md', 
  showText = true, 
  ...props 
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  }

  return (
    <div 
      className={cn(
        'flex items-center gap-2',
        className
      )} 
      {...props}
    >
      {/* Logo Icon */}
      <div 
        className={cn(
          'rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold',
          sizeClasses[size]
        )}
      >
        <span className={cn(
          'font-bold',
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'
        )}>
          K
        </span>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span 
          className={cn(
            'font-semibold text-foreground',
            textSizeClasses[size]
          )}
        >
          Kiro
        </span>
      )}
    </div>
  )
}
