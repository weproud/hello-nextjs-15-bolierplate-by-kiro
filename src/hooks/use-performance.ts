'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getBundleAnalyzer } from '@/lib/performance/bundle-analyzer'

// Performance metrics interface
interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift

  // Other metrics
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte

  // Custom metrics
  componentLoadTime?: number
  bundleSize?: number
  memoryUsage?: number
}

// Performance thresholds (Google's recommendations)
const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
} as const

// Performance monitoring hook
export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})
  const [isSupported, setIsSupported] = useState(false)
  const observerRef = useRef<PerformanceObserver | null>(null)

  useEffect(() => {
    // Check if Performance API is supported
    const supported =
      typeof window !== 'undefined' &&
      'performance' in window &&
      'PerformanceObserver' in window

    setIsSupported(supported)

    if (!supported) return

    // Initialize performance observer
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries()

      entries.forEach(entry => {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }))
            break
          case 'first-input':
            setMetrics(prev => ({
              ...prev,
              fid: (entry as any).processingStart - entry.startTime,
            }))
            break
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              setMetrics(prev => ({
                ...prev,
                cls: (prev.cls || 0) + (entry as any).value,
              }))
            }
            break
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              setMetrics(prev => ({ ...prev, fcp: entry.startTime }))
            }
            break
          case 'navigation':
            const navEntry = entry as PerformanceNavigationTiming
            setMetrics(prev => ({
              ...prev,
              ttfb: navEntry.responseStart - navEntry.requestStart,
            }))
            break
        }
      })
    })

    // Observe different entry types
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      observer.observe({ entryTypes: ['first-input'] })
      observer.observe({ entryTypes: ['layout-shift'] })
      observer.observe({ entryTypes: ['paint'] })
      observer.observe({ entryTypes: ['navigation'] })
    } catch (error) {
      console.warn('Some performance metrics are not supported:', error)
    }

    observerRef.current = observer

    return () => {
      observer.disconnect()
    }
  }, [])

  // Get performance score based on thresholds
  const getPerformanceScore = useCallback(
    (metric: keyof typeof PERFORMANCE_THRESHOLDS, value: number) => {
      const threshold = PERFORMANCE_THRESHOLDS[metric]
      if (value <= threshold.good) return 'good'
      if (value <= threshold.poor) return 'needs-improvement'
      return 'poor'
    },
    []
  )

  // Get overall performance grade
  const getOverallGrade = useCallback(() => {
    const scores = []

    if (metrics.lcp) scores.push(getPerformanceScore('LCP', metrics.lcp))
    if (metrics.fid) scores.push(getPerformanceScore('FID', metrics.fid))
    if (metrics.cls) scores.push(getPerformanceScore('CLS', metrics.cls))
    if (metrics.fcp) scores.push(getPerformanceScore('FCP', metrics.fcp))
    if (metrics.ttfb) scores.push(getPerformanceScore('TTFB', metrics.ttfb))

    if (scores.length === 0) return 'unknown'

    const goodCount = scores.filter(s => s === 'good').length
    const poorCount = scores.filter(s => s === 'poor').length

    if (goodCount >= scores.length * 0.8) return 'good'
    if (poorCount >= scores.length * 0.5) return 'poor'
    return 'needs-improvement'
  }, [metrics, getPerformanceScore])

  // Report performance metrics
  const reportMetrics = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🚀 Performance Metrics')
      console.log('LCP:', metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'N/A')
      console.log('FID:', metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A')
      console.log('CLS:', metrics.cls ? metrics.cls.toFixed(3) : 'N/A')
      console.log('FCP:', metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : 'N/A')
      console.log(
        'TTFB:',
        metrics.ttfb ? `${metrics.ttfb.toFixed(2)}ms` : 'N/A'
      )
      console.log('Overall Grade:', getOverallGrade())
      console.groupEnd()
    }

    // Send to analytics in production
    if (
      process.env.NODE_ENV === 'production' &&
      Object.keys(metrics).length > 0
    ) {
      // analytics.track('performance_metrics', metrics)
    }
  }, [metrics, getOverallGrade])

  return {
    metrics,
    isSupported,
    getPerformanceScore,
    getOverallGrade,
    reportMetrics,
  }
}

// Component performance tracking hook
export function useComponentPerformance(componentName: string) {
  const startTimeRef = useRef<number>(0)
  const [loadTime, setLoadTime] = useState<number | null>(null)

  useEffect(() => {
    startTimeRef.current = performance.now()

    return () => {
      const endTime = performance.now()
      const duration = endTime - startTimeRef.current
      setLoadTime(duration)

      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${componentName} render time: ${duration.toFixed(2)}ms`)
      }
    }
  }, [componentName])

  const markStart = useCallback(
    (label: string) => {
      performance.mark(`${componentName}-${label}-start`)
    },
    [componentName]
  )

  const markEnd = useCallback(
    (label: string) => {
      const endMark = `${componentName}-${label}-end`
      const measureName = `${componentName}-${label}`

      performance.mark(endMark)
      performance.measure(
        measureName,
        `${componentName}-${label}-start`,
        endMark
      )

      const measure = performance.getEntriesByName(measureName)[0]
      if (measure && process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${measureName}: ${measure.duration.toFixed(2)}ms`)
      }
    },
    [componentName]
  )

  return {
    loadTime,
    markStart,
    markEnd,
  }
}

// Memory usage monitoring hook
export function useMemoryUsage() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize?: number
    totalJSHeapSize?: number
    jsHeapSizeLimit?: number
  }>({})

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        })
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const getMemoryUsagePercentage = useCallback(() => {
    if (memoryInfo.usedJSHeapSize && memoryInfo.jsHeapSizeLimit) {
      return (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100
    }
    return 0
  }, [memoryInfo])

  const formatBytes = useCallback((bytes?: number) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }, [])

  return {
    memoryInfo,
    getMemoryUsagePercentage,
    formatBytes,
    isSupported: 'memory' in performance,
  }
}

// Bundle size monitoring hook
export function useBundleAnalyzer() {
  const [bundleMetrics, setBundleMetrics] = useState<any[]>([])
  const analyzer = getBundleAnalyzer()

  useEffect(() => {
    const updateMetrics = () => {
      setBundleMetrics(analyzer.getMetrics())
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [analyzer])

  const getTotalBundleSize = useCallback(() => {
    return analyzer.getTotalBundleSize()
  }, [analyzer])

  const getLargestBundles = useCallback(
    (count = 5) => {
      return analyzer.getLargestBundles(count)
    },
    [analyzer]
  )

  const generateReport = useCallback(() => {
    return analyzer.generateReport()
  }, [analyzer])

  return {
    bundleMetrics,
    getTotalBundleSize,
    getLargestBundles,
    generateReport,
  }
}

// Performance debugging hook
export function usePerformanceDebugger() {
  const performance = usePerformance()
  const memory = useMemoryUsage()
  const bundle = useBundleAnalyzer()

  const generateFullReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      performance: {
        metrics: performance.metrics,
        grade: performance.getOverallGrade(),
      },
      memory: {
        usage: memory.memoryInfo,
        percentage: memory.getMemoryUsagePercentage(),
      },
      bundle: {
        totalSize: bundle.getTotalBundleSize(),
        largestBundles: bundle.getLargestBundles(3),
      },
    }

    if (process.env.NODE_ENV === 'development') {
      console.group('📊 Full Performance Report')
      console.table(report.performance.metrics)
      console.log(
        'Memory Usage:',
        memory.formatBytes(memory.memoryInfo.usedJSHeapSize)
      )
      console.log(
        'Bundle Size:',
        (bundle.getTotalBundleSize() / 1024).toFixed(2) + 'KB'
      )
      console.groupEnd()
    }

    return report
  }, [performance, memory, bundle])

  return {
    performance,
    memory,
    bundle,
    generateFullReport,
  }
}
