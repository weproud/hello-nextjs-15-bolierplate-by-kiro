import { useCallback, useEffect, useState } from 'react'
import { onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

// Core Web Vitals 메트릭 타입
export interface WebVitalsMetric {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  entries: readonly PerformanceEntry[]
}

/**
 * 캐시 성능 메트릭 인터페이스
 */
export interface CacheMetrics {
  name: string
  hitRate: number
  size: number
  hits: number
  misses: number
}

/**
 * 전체 캐시 통계 인터페이스
 */
export interface OverallCacheStats {
  totalSize: number
  hitRate: number
  caches: Record<string, CacheMetrics>
}

// 성능 메트릭 수집기
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, WebVitalsMetric> = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()
  private cacheMetrics: Map<string, CacheMetrics> = new Map()

  private constructor() {
    this.initializeWebVitals()
    this.initializeCustomMetrics()
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Core Web Vitals 초기화
  private initializeWebVitals() {
    if (typeof window === 'undefined') return

    // Interaction to Next Paint (FID 대체)
    onINP(this.handleMetric.bind(this))

    // First Contentful Paint
    onFCP(this.handleMetric.bind(this))

    // Largest Contentful Paint
    onLCP(this.handleMetric.bind(this))

    // Time to First Byte
    onTTFB(this.handleMetric.bind(this))
  }

  // 커스텀 메트릭 초기화
  private initializeCustomMetrics() {
    if (typeof window === 'undefined') return

    // Navigation Timing
    this.observeNavigationTiming()

    // Resource Timing
    this.observeResourceTiming()

    // Long Tasks
    this.observeLongTasks()

    // Memory Usage (Chrome only)
    this.observeMemoryUsage()
  }

  // 메트릭 처리
  private handleMetric(metric: WebVitalsMetric) {
    this.metrics.set(metric.name, metric)

    // 개발 환경에서 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
      })
    }

    // 프로덕션 환경에서 분석 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric)
    }
  }

  // Navigation Timing 관찰
  private observeNavigationTiming() {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming

          const metrics = {
            domContentLoaded:
              navEntry.domContentLoadedEventEnd -
              navEntry.domContentLoadedEventStart,
            domComplete: navEntry.domComplete - navEntry.fetchStart,
            loadComplete: navEntry.loadEventEnd - navEntry.fetchStart,
            firstByte: navEntry.responseStart - navEntry.requestStart,
          }

          this.handleCustomMetric('navigation-timing', metrics)
        }
      }
    })

    observer.observe({ entryTypes: ['navigation'] })
    this.observers.set('navigation', observer)
  }

  // Resource Timing 관찰
  private observeResourceTiming() {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming

          // 큰 리소스나 느린 리소스 추적
          if (
            resourceEntry.transferSize > 100000 ||
            resourceEntry.duration > 1000
          ) {
            this.handleCustomMetric('slow-resource', {
              name: resourceEntry.name,
              size: resourceEntry.transferSize,
              duration: resourceEntry.duration,
              type: this.getResourceType(resourceEntry.name),
            })
          }
        }
      }
    })

    observer.observe({ entryTypes: ['resource'] })
    this.observers.set('resource', observer)
  }

  // Long Tasks 관찰
  private observeLongTasks() {
    if (!('PerformanceObserver' in window)) return

    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'longtask') {
          this.handleCustomMetric('long-task', {
            duration: entry.duration,
            startTime: entry.startTime,
          })
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['longtask'] })
      this.observers.set('longtask', observer)
    } catch (e) {
      // Long Task API not supported
    }
  }

  // 메모리 사용량 관찰 (Chrome only)
  private observeMemoryUsage() {
    if (!('memory' in performance)) return

    const checkMemory = () => {
      const memory = (performance as any).memory
      if (memory) {
        this.handleCustomMetric('memory-usage', {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercentage:
            (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
        })
      }
    }

    // 주기적으로 메모리 사용량 체크
    setInterval(checkMemory, 30000) // 30초마다
  }

  // 커스텀 메트릭 처리
  private handleCustomMetric(name: string, data: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}:`, data)
    }

    if (process.env.NODE_ENV === 'production') {
      this.sendCustomMetricToAnalytics(name, data)
    }
  }

  // 리소스 타입 추출
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script'
    if (url.includes('.css')) return 'stylesheet'
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) return 'image'
    if (url.includes('.woff') || url.includes('.ttf')) return 'font'
    return 'other'
  }

  // 분석 서비스로 전송
  private sendToAnalytics(metric: WebVitalsMetric) {
    // Google Analytics 4 예제
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(
          metric.name === 'CLS' ? metric.value * 1000 : metric.value
        ),
        event_label: metric.id,
        non_interaction: true,
      })
    }

    // 커스텀 분석 엔드포인트로 전송
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
    }).catch(console.error)
  }

  // 커스텀 메트릭을 분석 서비스로 전송
  private sendCustomMetricToAnalytics(name: string, data: unknown): void {
    fetch('/api/analytics/custom-metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        data,
        url: window.location.href,
        timestamp: Date.now(),
      }),
    }).catch(console.error)
  }

  // 현재 메트릭 가져오기
  public getMetrics(): Map<string, WebVitalsMetric> {
    return new Map(this.metrics)
  }

  // 특정 메트릭 가져오기
  public getMetric(name: string): WebVitalsMetric | undefined {
    return this.metrics.get(name)
  }

  /**
   * 캐시 히트/미스 추적
   */
  public trackCacheHit(cacheName: string, hit: boolean): void {
    const existing = this.cacheMetrics.get(cacheName) || {
      name: cacheName,
      hitRate: 0,
      size: 0,
      hits: 0,
      misses: 0,
    }

    if (hit) {
      existing.hits++
    } else {
      existing.misses++
    }

    const total = existing.hits + existing.misses
    existing.hitRate = total > 0 ? existing.hits / total : 0

    this.cacheMetrics.set(cacheName, existing)
  }

  /**
   * 캐시 크기 업데이트
   */
  public updateCacheSize(cacheName: string, size: number): void {
    const existing = this.cacheMetrics.get(cacheName) || {
      name: cacheName,
      hitRate: 0,
      size: 0,
      hits: 0,
      misses: 0,
    }

    existing.size = size
    this.cacheMetrics.set(cacheName, existing)
  }

  /**
   * 전체 캐시 통계 가져오기
   */
  public getOverallCacheStats(): OverallCacheStats {
    const caches: Record<string, CacheMetrics> = {}
    let totalSize = 0
    let totalHits = 0
    let totalMisses = 0

    for (const [name, metrics] of this.cacheMetrics.entries()) {
      caches[name] = { ...metrics }
      totalSize += metrics.size
      totalHits += metrics.hits
      totalMisses += metrics.misses
    }

    const totalRequests = totalHits + totalMisses
    const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0

    return {
      totalSize,
      hitRate,
      caches,
    }
  }

  /**
   * 성능 메트릭 로깅
   */
  public logMetrics(customMetrics?: Record<string, number>): void {
    if (process.env.NODE_ENV === 'development') {
      console.group('📊 Performance Metrics')

      // Web Vitals
      for (const [name, metric] of this.metrics.entries()) {
        console.log(`${name}: ${metric.value.toFixed(2)} (${metric.rating})`)
      }

      // Cache metrics
      const cacheStats = this.getOverallCacheStats()
      console.log(`Cache Hit Rate: ${(cacheStats.hitRate * 100).toFixed(2)}%`)
      console.log(`Total Cache Size: ${cacheStats.totalSize}`)

      // Custom metrics
      if (customMetrics) {
        for (const [name, value] of Object.entries(customMetrics)) {
          console.log(`${name}: ${value}`)
        }
      }

      console.groupEnd()
    }
  }

  // 성능 리포트 생성
  public generateReport(): PerformanceReport {
    const metrics = Array.from(this.metrics.values())

    return {
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      metrics: metrics.map(metric => ({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
      })),
      summary: {
        good: metrics.filter(m => m.rating === 'good').length,
        needsImprovement: metrics.filter(m => m.rating === 'needs-improvement')
          .length,
        poor: metrics.filter(m => m.rating === 'poor').length,
      },
    }
  }

  // 정리
  public cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    this.metrics.clear()
  }
}

// 성능 리포트 타입
export interface PerformanceReport {
  timestamp: number
  url: string
  metrics: Array<{
    name: string
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
  }>
  summary: {
    good: number
    needsImprovement: number
    poor: number
  }
}

// 전역 성능 모니터 인스턴스
export const performanceMonitor = PerformanceMonitor.getInstance()

// 편의 함수들
export function getPerformanceMonitor(): PerformanceMonitor {
  return PerformanceMonitor.getInstance()
}

/**
 * Bundle information interface
 */
export interface BundleInfo {
  scripts: Array<{
    src: string
    async: boolean
    defer: boolean
  }>
  stylesheets: Array<{
    href: string
  }>
  totalScripts: number
  totalStylesheets: number
}

// 번들 크기 분석 함수
export function analyzeBundleSize(): BundleInfo | undefined {
  if (typeof window === 'undefined') return undefined

  const scripts = Array.from(document.querySelectorAll('script[src]'))
  const stylesheets = Array.from(
    document.querySelectorAll('link[rel="stylesheet"]')
  )

  const bundleInfo: BundleInfo = {
    scripts: scripts.map(script => ({
      src: (script as HTMLScriptElement).src,
      async: (script as HTMLScriptElement).async,
      defer: (script as HTMLScriptElement).defer,
    })),
    stylesheets: stylesheets.map(link => ({
      href: (link as HTMLLinkElement).href,
    })),
    totalScripts: scripts.length,
    totalStylesheets: stylesheets.length,
  }

  if (process.env.NODE_ENV === 'development') {
    console.group('📦 Bundle Analysis')
    console.log('Scripts:', bundleInfo.totalScripts)
    console.log('Stylesheets:', bundleInfo.totalStylesheets)
    console.log('Details:', bundleInfo)
    console.groupEnd()
  }

  return bundleInfo
}

/**
 * Performance monitor hook return type
 */
export interface UsePerformanceMonitorReturn {
  report: PerformanceReport | null
  isLoading: boolean
  refresh: () => void
}

// React Hook for performance monitoring
export function usePerformanceMonitor(): UsePerformanceMonitorReturn {
  const [report, setReport] = useState<PerformanceReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(() => {
    if (typeof window === 'undefined') return

    const monitor = PerformanceMonitor.getInstance()
    setReport(monitor.generateReport())
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 5초 후 초기 리포트 생성
    const timer = setTimeout(() => {
      refresh()
    }, 5000)

    // 30초마다 리포트 업데이트
    const interval = setInterval(() => {
      refresh()
    }, 30000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [refresh])

  return {
    report,
    isLoading,
    refresh,
  }
}

/**
 * Modal performance metrics interface
 */
export interface ModalPerformanceMetrics {
  startTime: number
  endTime: number
  loadDuration: number
  timestamp: number
}

/**
 * Modal performance hook return type
 */
export interface UseModalPerformanceReturn {
  startModalLoad: () => void
  endModalLoad: () => void
  logMetrics: () => void
  loadDuration: number | null
  isLoading: boolean
}

// React Hook for modal performance monitoring
export function useModalPerformance(): UseModalPerformanceReturn {
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [loadDuration, setLoadDuration] = useState<number | null>(null)

  const startModalLoad = useCallback((): void => {
    const now = performance.now()
    setStartTime(now)
    setEndTime(null)
    setLoadDuration(null)

    if (process.env.NODE_ENV === 'development') {
      console.log('[Modal Performance] 모달 로딩 시작:', now)
    }
  }, [])

  const endModalLoad = useCallback((): void => {
    const now = performance.now()
    setEndTime(now)

    if (startTime) {
      const duration = now - startTime
      setLoadDuration(duration)

      if (process.env.NODE_ENV === 'development') {
        console.log('[Modal Performance] 모달 로딩 완료:', now)
        console.log(
          '[Modal Performance] 로딩 시간:',
          `${duration.toFixed(2)}ms`
        )
      }
    }
  }, [startTime])

  const logMetrics = useCallback((): void => {
    if (startTime && endTime && loadDuration) {
      const metrics: ModalPerformanceMetrics = {
        startTime,
        endTime,
        loadDuration,
        timestamp: Date.now(),
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[Modal Performance] Metrics:', metrics)
      }

      // 프로덕션 환경에서는 분석 서비스로 전송
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/analytics/modal-performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...metrics,
            url: window.location.href,
            userAgent: navigator.userAgent,
          }),
        }).catch(console.error)
      }
    }
  }, [startTime, endTime, loadDuration])

  return {
    startModalLoad,
    endModalLoad,
    logMetrics,
    loadDuration,
    isLoading: startTime !== null && endTime === null,
  }
}

// 글로벌 선언
declare global {
  function gtag(...args: any[]): void
}
