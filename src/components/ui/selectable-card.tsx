'use client'

import { useState, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import React from 'react'

export interface SelectableCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  defaultSelected?: boolean
  onSelectionChange?: (selected: boolean) => void
  padding?: 'none' | 'sm' | 'default' | 'lg' | 'xl'
  size?: 'sm' | 'default' | 'lg' | 'xl'
  status?:
    | 'default'
    | 'completed'
    | 'in-progress'
    | 'disabled'
    | 'featured'
    | 'warning'
  variant?: 'default' | 'elevated' | 'flat' | 'outlined'
  glow?: boolean
  animation?: 'none' | 'subtle' | 'default' | 'enhanced'
  selectionVariant?: 'glow' | 'ring' | 'none'
}

const SelectableCard = forwardRef<HTMLDivElement, SelectableCardProps>(
  (
    {
      className,
      children,
      defaultSelected = false,
      onSelectionChange,
      padding = 'default',
      size = 'default',
      status = 'default',
      variant = 'default',
      glow = false,
      animation = 'default',
      selectionVariant = 'glow',
      ...props
    },
    ref
  ) => {
    const [isSelected, setIsSelected] = useState(defaultSelected)

    const handleClick = () => {
      const newSelected = !isSelected
      setIsSelected(newSelected)
      onSelectionChange?.(newSelected)
    }

    const paddingClasses = {
      none: '',
      sm: 'p-3',
      default: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    }

    const sizeClasses = {
      sm: 'min-h-[120px]',
      default: 'min-h-[160px]',
      lg: 'min-h-[200px]',
      xl: 'min-h-[240px]',
    }

    const statusClasses = {
      default: '',
      completed: 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20',
      'in-progress':
        'border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20',
      disabled: 'opacity-50 cursor-not-allowed',
      featured: 'border-purple-500/50 bg-purple-50/50 dark:bg-purple-950/20',
      warning: 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20',
    }

    const variantClasses = {
      default: [
        // 흰색 글래스모피즘 기본 스타일
        'backdrop-blur-xl border-0 m-2',
        // 더 어두운 투명 그라데이션
        'bg-gradient-to-br from-gray-800/20 via-gray-700/15 to-gray-600/10',
        // 세련된 그림자 효과 (inset 포함)
        'shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.15)]',
        // 노이즈 텍스처 효과를 위한 추가 배경
        'before:absolute before:inset-0 before:rounded-2xl before:pointer-events-none',
        'before:bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.05)_0%,transparent_50%)]',
      ],
      elevated: 'bg-white shadow-xl border border-gray-200',
      flat: 'bg-gray-50 border border-gray-200',
      outlined: 'bg-transparent border-2 border-gray-300',
    }

    const animationClasses = {
      none: '',
      subtle: 'transition-all duration-200 ease-out',
      default:
        'transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
      enhanced: 'transition-all duration-500 ease-out',
    }

    const selectionClasses = {
      none: '',
      ring: isSelected
        ? ['ring-4 ring-white/40', 'shadow-lg shadow-white/20']
        : [],
      glow: isSelected
        ? [
            // 선택된 상태 - 더 어두운 글래스모피즘 (transform 없이)
            '!bg-gradient-to-br !from-gray-700/30 !via-gray-600/20 !to-gray-500/15',
            // 흰색 ring glow 효과
            'ring-4 ring-white/60 shadow-white/30',
            'shadow-[0_0_40px_rgba(255,255,255,0.6),0_0_80px_rgba(255,255,255,0.3),inset_0_1px_0_rgba(255,255,255,0.5)]',
            // 선택된 상태 전용 애니메이션
            '!transition-all !duration-[400ms] !ease-[cubic-bezier(0.4,0,0.2,1)]',
            // 선택된 상태의 더 강한 노이즈 텍스처
            'before:!bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.15)_0%,transparent_50%),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1)_0%,transparent_50%)]',
          ]
        : [],
    }

    return (
      <div
        ref={ref}
        className={cn(
          // 기본 카드 스타일 - rounded-2xl로 변경
          'relative rounded-2xl cursor-pointer overflow-visible flex flex-col h-full',
          // 패딩, 사이즈, 상태, 변형, 애니메이션 클래스
          paddingClasses[padding],
          sizeClasses[size],
          statusClasses[status],
          variantClasses[variant],
          animationClasses[animation],
          // 호버 효과 - bg 변경 제거, 움직임과 그림자만
          variant === 'default' && [
            'hover:-translate-y-1 hover:scale-[1.01]',
            // 호버시 더 강한 글로우 (bg 변경 제거)
            'hover:shadow-[0_20px_60px_rgba(0,0,0,0.15),0_8px_24px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.25)]',
          ],
          variant !== 'default' && 'hover:scale-[1.02] hover:shadow-xl',
          // 선택 효과
          selectionClasses[selectionVariant],
          // Glow 효과
          glow && 'shadow-2xl',
          className
        )}
        onClick={status !== 'disabled' ? handleClick : undefined}
        {...props}
      >
        {/* Featured 상태 특별 효과 */}
        {status === 'featured' && variant === 'default' && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-pink-500/2 pointer-events-none shadow-[0_8px_32px_rgba(147,51,234,0.15),0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.15)]" />
        )}

        {/* 선택 표시 - 흰색 테마 */}
        {isSelected && (
          <div className="absolute top-3 right-3 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-lg shadow-white/50">
            <svg
              className="w-4 h-4 text-gray-800 drop-shadow-sm"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}

        {children}
      </div>
    )
  }
)

SelectableCard.displayName = 'SelectableCard'

// Card의 하위 컴포넌트들을 재사용할 수 있도록 export
const SelectableCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
))
SelectableCardHeader.displayName = 'SelectableCardHeader'

const SelectableCardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
))
SelectableCardTitle.displayName = 'SelectableCardTitle'

const SelectableCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
SelectableCardDescription.displayName = 'SelectableCardDescription'

const SelectableCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
SelectableCardContent.displayName = 'SelectableCardContent'

export {
  SelectableCard,
  SelectableCardHeader,
  SelectableCardTitle,
  SelectableCardDescription,
  SelectableCardContent,
}
