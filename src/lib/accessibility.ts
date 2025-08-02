/**
 * 접근성 관련 유틸리티 함수들
 *
 * ARIA 속성, 키보드 네비게이션, 스크린 리더 지원 등을 위한 헬퍼 함수들을 제공합니다.
 */

import { useId } from 'react'

/**
 * 고유한 ID를 생성하는 훅
 */
export function useAccessibleId(prefix?: string): string {
  const id = useId()
  return prefix ? `${prefix}-${id}` : id
}

/**
 * ARIA 속성을 생성하는 헬퍼 함수들
 */
export const aria = {
  /**
   * 요소가 확장되었는지 여부를 나타내는 속성
   */
  expanded: (isExpanded: boolean) => ({
    'aria-expanded': isExpanded.toString(),
  }),

  /**
   * 요소가 선택되었는지 여부를 나타내는 속성
   */
  selected: (isSelected: boolean) => ({
    'aria-selected': isSelected.toString(),
  }),

  /**
   * 요소가 체크되었는지 여부를 나타내는 속성
   */
  checked: (isChecked: boolean | 'mixed') => ({
    'aria-checked': isChecked.toString(),
  }),

  /**
   * 요소가 비활성화되었는지 여부를 나타내는 속성
   */
  disabled: (isDisabled: boolean) => ({
    'aria-disabled': isDisabled.toString(),
  }),

  /**
   * 요소가 숨겨졌는지 여부를 나타내는 속성
   */
  hidden: (isHidden: boolean) => ({
    'aria-hidden': isHidden.toString(),
  }),

  /**
   * 요소의 현재 값을 나타내는 속성
   */
  current: (
    current: 'page' | 'step' | 'location' | 'date' | 'time' | boolean
  ) => ({
    'aria-current': current.toString(),
  }),

  /**
   * 요소가 필수인지 여부를 나타내는 속성
   */
  required: (isRequired: boolean) => ({
    'aria-required': isRequired.toString(),
  }),

  /**
   * 요소가 유효하지 않은지 여부를 나타내는 속성
   */
  invalid: (isInvalid: boolean) => ({
    'aria-invalid': isInvalid.toString(),
  }),

  /**
   * 요소의 라벨을 참조하는 속성
   */
  labelledBy: (id: string) => ({
    'aria-labelledby': id,
  }),

  /**
   * 요소의 설명을 참조하는 속성
   */
  describedBy: (id: string) => ({
    'aria-describedby': id,
  }),

  /**
   * 요소의 라벨을 직접 지정하는 속성
   */
  label: (label: string) => ({
    'aria-label': label,
  }),

  /**
   * 요소의 역할을 지정하는 속성
   */
  role: (role: string) => ({
    role,
  }),

  /**
   * 라이브 영역의 정중함 수준을 지정하는 속성
   */
  live: (politeness: 'off' | 'polite' | 'assertive') => ({
    'aria-live': politeness,
  }),

  /**
   * 요소의 레벨을 지정하는 속성 (헤딩 등)
   */
  level: (level: number) => ({
    'aria-level': level.toString(),
  }),

  /**
   * 요소의 위치를 지정하는 속성
   */
  posInSet: (position: number) => ({
    'aria-posinset': position.toString(),
  }),

  /**
   * 세트의 크기를 지정하는 속성
   */
  setSize: (size: number) => ({
    'aria-setsize': size.toString(),
  }),
}

/**
 * 키보드 이벤트 헬퍼 함수들
 */
export const keyboard = {
  /**
   * Enter 또는 Space 키인지 확인
   */
  isActivationKey: (event: KeyboardEvent): boolean => {
    return event.key === 'Enter' || event.key === ' '
  },

  /**
   * Escape 키인지 확인
   */
  isEscapeKey: (event: KeyboardEvent): boolean => {
    return event.key === 'Escape'
  },

  /**
   * 화살표 키인지 확인
   */
  isArrowKey: (event: KeyboardEvent): boolean => {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
      event.key
    )
  },

  /**
   * Tab 키인지 확인
   */
  isTabKey: (event: KeyboardEvent): boolean => {
    return event.key === 'Tab'
  },

  /**
   * 키보드 이벤트 핸들러 생성
   */
  createHandler: (handlers: Record<string, (event: KeyboardEvent) => void>) => {
    return (event: KeyboardEvent) => {
      const handler = handlers[event.key]
      if (handler) {
        handler(event)
      }
    }
  },
}

/**
 * 포커스 관리 헬퍼 함수들
 */
export const focus = {
  /**
   * 포커스 가능한 요소들의 선택자
   */
  FOCUSABLE_SELECTOR: [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([aria-disabled="true"])',
    '[role="menuitem"]:not([aria-disabled="true"])',
    '[role="option"]:not([aria-disabled="true"])',
  ].join(', '),

  /**
   * 컨테이너 내의 포커스 가능한 요소들을 찾기
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const elements = Array.from(
      container.querySelectorAll(focus.FOCUSABLE_SELECTOR)
    ) as HTMLElement[]

    return elements.filter(element => {
      const style = window.getComputedStyle(element)
      return style.display !== 'none' && style.visibility !== 'hidden'
    })
  },

  /**
   * 첫 번째 포커스 가능한 요소에 포커스
   */
  focusFirst: (container: HTMLElement): void => {
    const elements = focus.getFocusableElements(container)
    elements[0]?.focus()
  },

  /**
   * 마지막 포커스 가능한 요소에 포커스
   */
  focusLast: (container: HTMLElement): void => {
    const elements = focus.getFocusableElements(container)
    elements[elements.length - 1]?.focus()
  },

  /**
   * 포커스 트랩 생성
   */
  createTrap: (container: HTMLElement) => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const elements = focus.getFocusableElements(container)
      if (elements.length === 0) return

      const firstElement = elements[0]
      const lastElement = elements[elements.length - 1]

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  },
}

/**
 * 스크린 리더 지원 헬퍼 함수들
 */
export const screenReader = {
  /**
   * 스크린 리더 전용 텍스트를 위한 클래스
   */
  ONLY_CLASS: 'sr-only',

  /**
   * 라이브 영역에 메시지 알림
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = screenReader.ONLY_CLASS
    announcement.textContent = message

    document.body.appendChild(announcement)

    // 메시지 전달 후 제거
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  },
}

/**
 * 색상 대비 검사 헬퍼 함수들
 */
export const contrast = {
  /**
   * 색상을 RGB로 변환
   */
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  },

  /**
   * 상대 휘도 계산
   */
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  },

  /**
   * 색상 대비 비율 계산
   */
  getContrastRatio: (color1: string, color2: string): number => {
    const rgb1 = contrast.hexToRgb(color1)
    const rgb2 = contrast.hexToRgb(color2)

    if (!rgb1 || !rgb2) return 0

    const lum1 = contrast.getLuminance(rgb1.r, rgb1.g, rgb1.b)
    const lum2 = contrast.getLuminance(rgb2.r, rgb2.g, rgb2.b)

    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)

    return (brightest + 0.05) / (darkest + 0.05)
  },

  /**
   * WCAG AA 기준 충족 여부 확인
   */
  meetsWCAG_AA: (
    color1: string,
    color2: string,
    isLargeText = false
  ): boolean => {
    const ratio = contrast.getContrastRatio(color1, color2)
    return isLargeText ? ratio >= 3 : ratio >= 4.5
  },

  /**
   * WCAG AAA 기준 충족 여부 확인
   */
  meetsWCAG_AAA: (
    color1: string,
    color2: string,
    isLargeText = false
  ): boolean => {
    const ratio = contrast.getContrastRatio(color1, color2)
    return isLargeText ? ratio >= 4.5 : ratio >= 7
  },
}

/**
 * 접근성 테스트 헬퍼 함수들
 */
export const a11yTest = {
  /**
   * 요소에 적절한 라벨이 있는지 확인
   */
  hasAccessibleName: (element: HTMLElement): boolean => {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim() ||
      (element as HTMLInputElement).labels?.length
    )
  },

  /**
   * 요소가 키보드로 접근 가능한지 확인
   */
  isKeyboardAccessible: (element: HTMLElement): boolean => {
    const tabIndex = element.getAttribute('tabindex')
    return (
      element.tagName === 'BUTTON' ||
      element.tagName === 'A' ||
      element.tagName === 'INPUT' ||
      element.tagName === 'SELECT' ||
      element.tagName === 'TEXTAREA' ||
      (tabIndex !== null && tabIndex !== '-1') ||
      element.getAttribute('role') === 'button'
    )
  },

  /**
   * 폼 필드에 적절한 라벨이 연결되어 있는지 확인
   */
  hasFormLabel: (input: HTMLInputElement): boolean => {
    return !!(
      input.labels?.length ||
      input.getAttribute('aria-label') ||
      input.getAttribute('aria-labelledby')
    )
  },
}
