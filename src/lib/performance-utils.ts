import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * 디바운스된 콜백을 생성하는 훅
 * 성능 최적화를 위해 빈번한 함수 호출을 제한합니다.
 */
export function useDebounce<T extends (...args: readonly unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    }) as T,
    [callback, delay]
  )
}

/**
 * 스로틀된 콜백을 생성하는 훅
 * 지정된 시간 간격으로만 함수가 실행되도록 제한합니다.
 */
export function useThrottle<T extends (...args: readonly unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef<number>(0)

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now
        callback(...args)
      }
    }) as T,
    [callback, delay]
  )
}

/**
 * 메모이제이션된 계산 결과를 반환하는 훅
 * 복잡한 계산의 결과를 캐시하여 성능을 향상시킵니다.
 */
export function useMemoizedCalculation<T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(calculation, dependencies)
}

/**
 * 안정적인 콜백 참조를 생성하는 훅
 * 의존성이 변경되지 않는 한 동일한 함수 참조를 유지합니다.
 */
export function useStableCallback<
  T extends (...args: readonly unknown[]) => unknown,
>(callback: T, dependencies: React.DependencyList): T {
  return useCallback(callback, dependencies)
}

/**
 * 객체의 얕은 비교를 수행하는 함수
 * React.memo의 비교 함수로 사용할 수 있습니다.
 */
export function shallowEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) {
    return true
  }

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false
  }

  const record1 = obj1 as Record<string, unknown>
  const record2 = obj2 as Record<string, unknown>

  const keys1 = Object.keys(record1)
  const keys2 = Object.keys(record2)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || record1[key] !== record2[key]) {
      return false
    }
  }

  return true
}

/**
 * 배열의 얕은 비교를 수행하는 함수
 */
export function shallowEqualArray(
  arr1: readonly unknown[],
  arr2: readonly unknown[]
): boolean {
  if (arr1 === arr2) {
    return true
  }

  if (arr1.length !== arr2.length) {
    return false
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false
    }
  }

  return true
}

/**
 * 성능 측정을 위한 유틸리티 함수
 */
export class PerformanceTracker {
  private static measurements: Map<string, number> = new Map()

  static start(label: string): void {
    this.measurements.set(label, performance.now())
  }

  static end(label: string): number {
    const startTime = this.measurements.get(label)
    if (startTime === undefined) {
      console.warn(`Performance measurement '${label}' was not started`)
      return 0
    }

    const duration = performance.now() - startTime
    this.measurements.delete(label)

    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  static measure<T>(label: string, fn: () => T): T {
    this.start(label)
    const result = fn()
    this.end(label)
    return result
  }

  static async measureAsync<T>(
    label: string,
    fn: () => Promise<T>
  ): Promise<T> {
    this.start(label)
    const result = await fn()
    this.end(label)
    return result
  }
}

/**
 * 컴포넌트 렌더링 횟수를 추적하는 훅 (개발 환경에서만)
 */
export function useRenderCount(componentName: string): void {
  const renderCount = useRef(0)

  if (process.env.NODE_ENV === 'development') {
    renderCount.current += 1
    console.log(`🔄 ${componentName} rendered ${renderCount.current} times`)
  }
}

/**
 * 메모리 사용량을 모니터링하는 함수 (개발 환경에서만)
 */
export function logMemoryUsage(label?: string): void {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memory = (performance as any).memory
    const used = Math.round((memory.usedJSHeapSize / 1024 / 1024) * 100) / 100
    const total = Math.round((memory.totalJSHeapSize / 1024 / 1024) * 100) / 100
    const limit = Math.round((memory.jsHeapSizeLimit / 1024 / 1024) * 100) / 100

    console.log(
      `🧠 Memory Usage${label ? ` (${label})` : ''}: ${used}MB / ${total}MB (limit: ${limit}MB)`
    )
  }
}

/**
 * Lazy component wrapper type
 */
export type LazyComponentWrapper<T extends React.ComponentType<unknown>> = (
  props: React.ComponentProps<T>
) => React.ReactElement

/**
 * 번들 크기 최적화를 위한 동적 import 헬퍼
 */
export function createLazyComponent<T extends React.ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
): LazyComponentWrapper<T> {
  const LazyComponent = React.lazy(importFn)

  return function LazyWrapper(
    props: React.ComponentProps<T>
  ): React.ReactElement {
    return React.createElement(
      React.Suspense,
      {
        fallback: fallback ? React.createElement(fallback) : null,
      },
      React.createElement(LazyComponent, props)
    )
  }
}

/**
 * Lazy loading hook return type
 */
export interface UseLazyLoadingReturn {
  ref: React.RefObject<HTMLElement>
  isVisible: boolean
}

/**
 * 이미지 지연 로딩을 위한 Intersection Observer 훅
 */
export function useLazyLoading(threshold = 0.1): UseLazyLoadingReturn {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      observer.disconnect()
    }
  }, [threshold])

  return { ref, isVisible }
}
