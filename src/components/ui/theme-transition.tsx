/**
 * Theme Transition Component
 *
 * 테마 전환 시 부드러운 애니메이션을 제공하는 컴포넌트입니다.
 * 색상 대비 최적화와 접근성을 고려한 테마 전환 기능을 포함합니다.
 */

'use client'

import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import * as React from 'react'

interface ThemeTransitionProps {
  children: React.ReactNode
  className?: string
  /** 전환 애니메이션 지속 시간 (ms) */
  duration?: number
  /** 사용자가 애니메이션을 선호하지 않는 경우 비활성화 */
  respectReducedMotion?: boolean
}

export function ThemeTransition({
  children,
  className,
  duration = 300,
  respectReducedMotion = true,
}: ThemeTransitionProps) {
  const { resolvedTheme } = useTheme()
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const previousTheme = React.useRef<string | undefined>()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    // 테마가 변경되었을 때 전환 애니메이션 시작
    if (previousTheme.current && previousTheme.current !== resolvedTheme) {
      setIsTransitioning(true)

      const timer = setTimeout(() => {
        setIsTransitioning(false)
      }, duration)

      return () => clearTimeout(timer)
    }

    previousTheme.current = resolvedTheme
  }, [resolvedTheme, duration, mounted])

  // 사용자가 애니메이션을 선호하지 않는 경우 체크
  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const shouldAnimate = respectReducedMotion ? !prefersReducedMotion : true

  return (
    <div
      className={cn(
        'transition-colors ease-in-out',
        shouldAnimate && isTransitioning && 'duration-300',
        className
      )}
      style={{
        transitionDuration: shouldAnimate ? `${duration}ms` : '0ms',
      }}
    >
      {children}
    </div>
  )
}

/**
 * 테마 전환을 위한 전역 스타일 컴포넌트
 */
export function GlobalThemeTransition() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    // CSS 변수를 통한 전역 테마 전환 애니메이션
    const root = document.documentElement

    // 전환 애니메이션 클래스 추가
    root.classList.add('theme-transitioning')

    const timer = setTimeout(() => {
      root.classList.remove('theme-transitioning')
    }, 300)

    return () => {
      clearTimeout(timer)
      root.classList.remove('theme-transitioning')
    }
  }, [resolvedTheme, mounted])

  return null
}

/**
 * 색상 대비 검사를 위한 훅
 */
export function useColorContrast() {
  const { resolvedTheme } = useTheme()

  const getContrastRatio = React.useCallback(
    (foreground: string, background: string) => {
      // 간단한 대비 비율 계산 (실제 구현에서는 더 정확한 계산 필요)
      const getLuminance = (color: string) => {
        // RGB 값을 추출하고 상대 휘도 계산
        const rgb = color.match(/\d+/g)
        if (!rgb) return 0

        const [r, g, b] = rgb.map(val => {
          const c = parseInt(val) / 255
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
        })

        return 0.2126 * r + 0.7152 * g + 0.0722 * b
      }

      const lum1 = getLuminance(foreground)
      const lum2 = getLuminance(background)
      const brightest = Math.max(lum1, lum2)
      const darkest = Math.min(lum1, lum2)

      return (brightest + 0.05) / (darkest + 0.05)
    },
    []
  )

  const checkWCAGCompliance = React.useCallback(
    (
      foreground: string,
      background: string,
      level: 'AA' | 'AAA' = 'AA',
      isLargeText = false
    ) => {
      const ratio = getContrastRatio(foreground, background)
      const threshold =
        level === 'AAA' ? (isLargeText ? 4.5 : 7) : isLargeText ? 3 : 4.5

      return ratio >= threshold
    },
    [getContrastRatio]
  )

  return {
    resolvedTheme,
    getContrastRatio,
    checkWCAGCompliance,
  }
}

/**
 * 테마별 색상 값을 가져오는 훅
 */
export function useThemeColors() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const getThemeColor = React.useCallback(
    (cssVariable: string) => {
      if (!mounted) return ''

      const root = document.documentElement
      const computedStyle = getComputedStyle(root)
      return computedStyle.getPropertyValue(cssVariable).trim()
    },
    [mounted]
  )

  const colors = React.useMemo(() => {
    if (!mounted) return {}

    return {
      background: getThemeColor('--background'),
      foreground: getThemeColor('--foreground'),
      primary: getThemeColor('--primary'),
      secondary: getThemeColor('--secondary'),
      muted: getThemeColor('--muted'),
      accent: getThemeColor('--accent'),
      destructive: getThemeColor('--destructive'),
      border: getThemeColor('--border'),
      input: getThemeColor('--input'),
      ring: getThemeColor('--ring'),
    }
  }, [mounted, getThemeColor, resolvedTheme])

  return {
    colors,
    getThemeColor,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
  }
}
