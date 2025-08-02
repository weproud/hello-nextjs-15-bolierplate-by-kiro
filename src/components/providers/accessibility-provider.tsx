/**
 * Accessibility Provider
 *
 * 접근성 설정을 관리하고 전역적으로 적용하는 Provider 컴포넌트입니다.
 */

'use client'

import { useTheme } from 'next-themes'
import * as React from 'react'

interface AccessibilitySettings {
  /** 고대비 모드 활성화 */
  highContrast: boolean
  /** 애니메이션 감소 */
  reduceMotion: boolean
  /** 포커스 표시 강화 */
  enhancedFocus: boolean
  /** 키보드 네비게이션 모드 */
  keyboardNavigation: boolean
  /** 텍스트 크기 조정 */
  textScale: number
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void
  resetSettings: () => void
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  reduceMotion: false,
  enhancedFocus: false,
  keyboardNavigation: false,
  textScale: 1,
}

const AccessibilityContext =
  React.createContext<AccessibilityContextType | null>(null)

export function useAccessibility() {
  const context = React.useContext(AccessibilityContext)
  if (!context) {
    throw new Error(
      'useAccessibility must be used within AccessibilityProvider'
    )
  }
  return context
}

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export function AccessibilityProvider({
  children,
}: AccessibilityProviderProps) {
  const { resolvedTheme } = useTheme()
  const [settings, setSettings] =
    React.useState<AccessibilitySettings>(defaultSettings)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)

    // 로컬 스토리지에서 설정 불러오기
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.warn('Failed to parse accessibility settings:', error)
      }
    }

    // 시스템 설정 감지
    const mediaQueries = {
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
    }

    const updateSystemSettings = () => {
      setSettings(prev => ({
        ...prev,
        highContrast: prev.highContrast || mediaQueries.highContrast.matches,
        reduceMotion: prev.reduceMotion || mediaQueries.reduceMotion.matches,
      }))
    }

    updateSystemSettings()

    // 미디어 쿼리 변경 감지
    mediaQueries.highContrast.addEventListener('change', updateSystemSettings)
    mediaQueries.reduceMotion.addEventListener('change', updateSystemSettings)

    return () => {
      mediaQueries.highContrast.removeEventListener(
        'change',
        updateSystemSettings
      )
      mediaQueries.reduceMotion.removeEventListener(
        'change',
        updateSystemSettings
      )
    }
  }, [])

  // 설정이 변경될 때마다 로컬 스토리지에 저장
  React.useEffect(() => {
    if (mounted) {
      localStorage.setItem('accessibility-settings', JSON.stringify(settings))
    }
  }, [settings, mounted])

  // DOM에 접근성 클래스 적용
  React.useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const body = document.body

    // 클래스 제거
    root.classList.remove('contrast-enhanced', 'focus-enhanced')
    body.classList.remove('keyboard-navigation')

    // 설정에 따라 클래스 추가
    if (settings.highContrast) {
      root.classList.add('contrast-enhanced')
    }

    if (settings.enhancedFocus) {
      root.classList.add('focus-enhanced')
    }

    if (settings.keyboardNavigation) {
      body.classList.add('keyboard-navigation')
    }

    // 텍스트 크기 조정
    if (settings.textScale !== 1) {
      root.style.fontSize = `${settings.textScale * 100}%`
    } else {
      root.style.fontSize = ''
    }

    // 애니메이션 감소 설정
    if (settings.reduceMotion) {
      root.style.setProperty('--animation-duration', '0.01ms')
      root.style.setProperty('--transition-duration', '0.01ms')
    } else {
      root.style.removeProperty('--animation-duration')
      root.style.removeProperty('--transition-duration')
    }
  }, [settings, mounted])

  // 키보드 이벤트 감지
  React.useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Tab 키 사용 시 키보드 네비게이션 모드 활성화
      if (event.key === 'Tab') {
        setSettings(prev => ({ ...prev, keyboardNavigation: true }))
      }
    }

    const handleMouseDown = () => {
      // 마우스 사용 시 키보드 네비게이션 모드 비활성화
      setSettings(prev => ({ ...prev, keyboardNavigation: false }))
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [mounted])

  const updateSetting = React.useCallback(
    <K extends keyof AccessibilitySettings>(
      key: K,
      value: AccessibilitySettings[K]
    ) => {
      setSettings(prev => ({ ...prev, [key]: value }))
    },
    []
  )

  const resetSettings = React.useCallback(() => {
    setSettings(defaultSettings)
  }, [])

  const contextValue = React.useMemo(
    () => ({
      settings,
      updateSetting,
      resetSettings,
    }),
    [settings, updateSetting, resetSettings]
  )

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  )
}

/**
 * 접근성 설정 패널 컴포넌트
 */
export function AccessibilityPanel() {
  const { settings, updateSetting, resetSettings } = useAccessibility()

  return (
    <div className='space-y-4 p-4 border rounded-lg'>
      <h3 className='text-lg font-semibold'>접근성 설정</h3>

      <div className='space-y-3'>
        <label className='flex items-center space-x-2'>
          <input
            type='checkbox'
            checked={settings.highContrast}
            onChange={e => updateSetting('highContrast', e.target.checked)}
            className='rounded border-border'
          />
          <span>고대비 모드</span>
        </label>

        <label className='flex items-center space-x-2'>
          <input
            type='checkbox'
            checked={settings.reduceMotion}
            onChange={e => updateSetting('reduceMotion', e.target.checked)}
            className='rounded border-border'
          />
          <span>애니메이션 감소</span>
        </label>

        <label className='flex items-center space-x-2'>
          <input
            type='checkbox'
            checked={settings.enhancedFocus}
            onChange={e => updateSetting('enhancedFocus', e.target.checked)}
            className='rounded border-border'
          />
          <span>포커스 표시 강화</span>
        </label>

        <div className='space-y-2'>
          <label className='block text-sm font-medium'>
            텍스트 크기: {Math.round(settings.textScale * 100)}%
          </label>
          <input
            type='range'
            min='0.8'
            max='1.5'
            step='0.1'
            value={settings.textScale}
            onChange={e =>
              updateSetting('textScale', parseFloat(e.target.value))
            }
            className='w-full'
            aria-label='텍스트 크기 조정'
          />
        </div>
      </div>

      <button
        onClick={resetSettings}
        className='px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors'
      >
        설정 초기화
      </button>
    </div>
  )
}
