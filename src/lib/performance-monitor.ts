import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'
import { useState, useEffect } from 'react'

// Core Web Vitals 메트릭 타입
export interface WebVitalsMetric {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  entries: PerformanceEntry[]
}

// 성능 메트릭 수집기
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, WebVitalsMetric> = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()

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

    // Cumulative Layout Shift
    getCLS(this.handleMetric.bind(this))

    // First Input Delay
    getFID(this.handleMetric.bind(this))

    // First Contentful Paint
    getFCP(this.handleMetric.bind(this))

    // Largest Contentful Paint
    getLCP(this.handleMetric.bind(this))

    // Time to First Byte
    getTTFB(this.handleMetric.bind(this))
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
            domComplete: navEntry.domComplete - navEntry.navigationStart,
            loadComplete: navEntry.loadEventEnd - navEntry.navigationStart,
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
  private handleCustomMetric(name: string, data: any) {
    if (process.env.NODE_ENV === 'development') {
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
  private sendCustomMetricToAnalytics(name: string, data: any) {
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

// React Hook for performance monitoring
export function usePerformanceMonitor() {
  const [report, setReport] = useState<PerformanceReport | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const monitor = PerformanceMonitor.getInstance()

    // 5초 후 초기 리포트 생성
    const timer = setTimeout(() => {
      setReport(monitor.generateReport())
    }, 5000)

    // 30초마다 리포트 업데이트
    const interval = setInterval(() => {
      setReport(monitor.generateReport())
    }, 30000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  return report
}

// 글로벌 선언
declare global {
  function gtag(...args: any[]): void
}
