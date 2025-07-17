/**
 * Performance testing utilities for modal components
 */

import {
  getPerformanceMonitor,
  analyzeBundleSize,
} from '@/lib/performance-monitor'

interface PerformanceThresholds {
  modalLoadTime: number // ms
  formLoadTime: number // ms
  firstContentfulPaint: number // ms
  largestContentfulPaint: number // ms
  cumulativeLayoutShift: number
  firstInputDelay: number // ms
}

// Performance thresholds based on Core Web Vitals and best practices
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  modalLoadTime: 200, // Modal should load within 200ms
  formLoadTime: 100, // Form should load within 100ms
  firstContentfulPaint: 1800, // FCP should be under 1.8s
  largestContentfulPaint: 2500, // LCP should be under 2.5s (good)
  cumulativeLayoutShift: 0.1, // CLS should be under 0.1 (good)
  firstInputDelay: 100, // FID should be under 100ms (good)
}

export class ModalPerformanceTester {
  private thresholds: PerformanceThresholds

  constructor(customThresholds?: Partial<PerformanceThresholds>) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...customThresholds }
  }

  async testModalPerformance(): Promise<{
    passed: boolean
    results: Array<{
      metric: string
      value: number
      threshold: number
      passed: boolean
    }>
    summary: string
  }> {
    const monitor = getPerformanceMonitor()
    const metrics = monitor.getMetrics()

    const results = [
      {
        metric: 'Modal Load Time',
        value: metrics.modalLoadTime || 0,
        threshold: this.thresholds.modalLoadTime,
        passed: (metrics.modalLoadTime || 0) <= this.thresholds.modalLoadTime,
      },
      {
        metric: 'Form Load Time',
        value: metrics.formLoadTime || 0,
        threshold: this.thresholds.formLoadTime,
        passed: (metrics.formLoadTime || 0) <= this.thresholds.formLoadTime,
      },
      {
        metric: 'First Contentful Paint',
        value: metrics.firstContentfulPaint || 0,
        threshold: this.thresholds.firstContentfulPaint,
        passed:
          (metrics.firstContentfulPaint || 0) <=
          this.thresholds.firstContentfulPaint,
      },
      {
        metric: 'Largest Contentful Paint',
        value: metrics.largestContentfulPaint || 0,
        threshold: this.thresholds.largestContentfulPaint,
        passed:
          (metrics.largestContentfulPaint || 0) <=
          this.thresholds.largestContentfulPaint,
      },
      {
        metric: 'Cumulative Layout Shift',
        value: metrics.cumulativeLayoutShift || 0,
        threshold: this.thresholds.cumulativeLayoutShift,
        passed:
          (metrics.cumulativeLayoutShift || 0) <=
          this.thresholds.cumulativeLayoutShift,
      },
      {
        metric: 'First Input Delay',
        value: metrics.firstInputDelay || 0,
        threshold: this.thresholds.firstInputDelay,
        passed:
          (metrics.firstInputDelay || 0) <= this.thresholds.firstInputDelay,
      },
    ]

    const passedCount = results.filter(r => r.passed).length
    const totalCount = results.length
    const passed = passedCount === totalCount

    const summary = `Performance Test: ${passedCount}/${totalCount} metrics passed`

    return { passed, results, summary }
  }

  logPerformanceReport() {
    this.testModalPerformance().then(({ passed, results, summary }) => {
      console.group('🎯 Modal Performance Test Report')
      console.log(summary)
      console.log(passed ? '✅ All tests passed!' : '❌ Some tests failed')

      results.forEach(result => {
        const status = result.passed ? '✅' : '❌'
        console.log(
          `${status} ${result.metric}: ${result.value.toFixed(2)}ms (threshold: ${result.threshold}ms)`
        )
      })

      console.groupEnd()
    })
  }

  // Test bundle size optimization
  testBundleOptimization() {
    if (typeof window !== 'undefined') {
      analyzeBundleSize()

      // Check for lazy loading implementation
      const hasLazyLoading =
        document.querySelector('script[src*="auth-modal"]') !== null
      console.log(
        '🔄 Lazy Loading:',
        hasLazyLoading ? '✅ Enabled' : '❌ Not detected'
      )

      // Check for code splitting
      const modalChunks = Array.from(
        document.querySelectorAll('script[src]')
      ).filter(script => (script as HTMLScriptElement).src.includes('modal'))
      console.log('📦 Modal Chunks:', modalChunks.length, 'detected')
    }
  }
}

// Utility function for easy testing
export function runModalPerformanceTest(
  customThresholds?: Partial<PerformanceThresholds>
) {
  const tester = new ModalPerformanceTester(customThresholds)

  // Run tests after a delay to ensure metrics are collected
  setTimeout(() => {
    tester.logPerformanceReport()
    tester.testBundleOptimization()
  }, 2000)
}

// Device-specific performance testing
export function testModalPerformanceOnDevice() {
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection
  const deviceMemory = (navigator as any).deviceMemory

  let customThresholds: Partial<PerformanceThresholds> = {}

  // Adjust thresholds based on device capabilities
  if (connection) {
    const effectiveType = connection.effectiveType
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      customThresholds = {
        modalLoadTime: 500,
        formLoadTime: 300,
        firstContentfulPaint: 3000,
        largestContentfulPaint: 4000,
      }
    } else if (effectiveType === '3g') {
      customThresholds = {
        modalLoadTime: 300,
        formLoadTime: 200,
        firstContentfulPaint: 2500,
        largestContentfulPaint: 3000,
      }
    }
  }

  // Adjust for low-memory devices
  if (deviceMemory && deviceMemory < 4) {
    customThresholds.modalLoadTime =
      (customThresholds.modalLoadTime || 200) * 1.5
    customThresholds.formLoadTime = (customThresholds.formLoadTime || 100) * 1.5
  }

  console.log('📱 Device-specific performance test starting...')
  console.log('Connection:', connection?.effectiveType || 'unknown')
  console.log('Device Memory:', deviceMemory || 'unknown', 'GB')

  runModalPerformanceTest(customThresholds)
}
