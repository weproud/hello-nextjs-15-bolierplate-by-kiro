/**
 * 키보드 네비게이션을 위한 커스텀 훅
 *
 * 접근성을 위한 키보드 네비게이션 기능을 제공합니다.
 * - 화살표 키를 통한 포커스 이동
 * - Enter/Space 키를 통한 활성화
 * - Escape 키를 통한 닫기
 */

import { useCallback, useEffect, useRef } from 'react'

interface UseKeyboardNavigationOptions {
  /** 포커스 가능한 요소들의 선택자 */
  focusableSelector?: string
  /** 순환 네비게이션 여부 */
  loop?: boolean
  /** 방향 (horizontal | vertical | both) */
  direction?: 'horizontal' | 'vertical' | 'both'
  /** Escape 키 핸들러 */
  onEscape?: () => void
  /** Enter 키 핸들러 */
  onEnter?: (element: HTMLElement) => void
  /** 활성화 여부 */
  enabled?: boolean
}

const DEFAULT_FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]:not([aria-disabled="true"])',
  '[role="menuitem"]:not([aria-disabled="true"])',
  '[role="option"]:not([aria-disabled="true"])',
].join(', ')

export function useKeyboardNavigation(
  options: UseKeyboardNavigationOptions = {}
) {
  const {
    focusableSelector = DEFAULT_FOCUSABLE_SELECTOR,
    loop = true,
    direction = 'both',
    onEscape,
    onEnter,
    enabled = true,
  } = options

  const containerRef = useRef<HTMLElement>(null)

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []

    const elements = Array.from(
      containerRef.current.querySelectorAll(focusableSelector)
    ) as HTMLElement[]

    return elements.filter(element => {
      // 숨겨진 요소 제외
      const style = window.getComputedStyle(element)
      return style.display !== 'none' && style.visibility !== 'hidden'
    })
  }, [focusableSelector])

  const moveFocus = useCallback(
    (direction: 'next' | 'prev') => {
      const elements = getFocusableElements()
      if (elements.length === 0) return

      const currentIndex = elements.findIndex(
        el => el === document.activeElement
      )
      let nextIndex: number

      if (direction === 'next') {
        nextIndex = currentIndex + 1
        if (nextIndex >= elements.length) {
          nextIndex = loop ? 0 : elements.length - 1
        }
      } else {
        nextIndex = currentIndex - 1
        if (nextIndex < 0) {
          nextIndex = loop ? elements.length - 1 : 0
        }
      }

      elements[nextIndex]?.focus()
    },
    [getFocusableElements, loop]
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || !containerRef.current?.contains(event.target as Node)) {
        return
      }

      switch (event.key) {
        case 'ArrowDown':
          if (direction === 'vertical' || direction === 'both') {
            event.preventDefault()
            moveFocus('next')
          }
          break
        case 'ArrowUp':
          if (direction === 'vertical' || direction === 'both') {
            event.preventDefault()
            moveFocus('prev')
          }
          break
        case 'ArrowRight':
          if (direction === 'horizontal' || direction === 'both') {
            event.preventDefault()
            moveFocus('next')
          }
          break
        case 'ArrowLeft':
          if (direction === 'horizontal' || direction === 'both') {
            event.preventDefault()
            moveFocus('prev')
          }
          break
        case 'Home':
          event.preventDefault()
          getFocusableElements()[0]?.focus()
          break
        case 'End':
          event.preventDefault()
          const elements = getFocusableElements()
          elements[elements.length - 1]?.focus()
          break
        case 'Escape':
          if (onEscape) {
            event.preventDefault()
            onEscape()
          }
          break
        case 'Enter':
        case ' ':
          if (onEnter && event.target instanceof HTMLElement) {
            // 기본 버튼이나 링크가 아닌 경우에만 커스텀 핸들러 실행
            if (!['BUTTON', 'A', 'INPUT'].includes(event.target.tagName)) {
              event.preventDefault()
              onEnter(event.target)
            }
          }
          break
      }
    },
    [enabled, direction, moveFocus, getFocusableElements, onEscape, onEnter]
  )

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, enabled])

  const focusFirst = useCallback(() => {
    const elements = getFocusableElements()
    elements[0]?.focus()
  }, [getFocusableElements])

  const focusLast = useCallback(() => {
    const elements = getFocusableElements()
    elements[elements.length - 1]?.focus()
  }, [getFocusableElements])

  return {
    containerRef,
    focusFirst,
    focusLast,
    moveFocus,
    getFocusableElements,
  }
}
