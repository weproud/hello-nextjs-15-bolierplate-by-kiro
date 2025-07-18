/**
 * Performance monitoring utilities for modal components
 */

import { createLogger } from './logger'

const logger = createLogger('performance-monitor')

interface PerformanceMetrics {
  modalLoadTime: number
  formLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
}

class ModalPerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {}
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  private initializeObservers() {
    // Observe paint metrics
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.firstContentfulPaint = entry.startTime
            }
          }
        })
        paintObserver.observe({ entryTypes: ['paint'] })
        this.observers.push(paintObserver)

        // Observe LCP
        const lcpObserver = new PerformanceObserver(list => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          if (lastEntry) {
            this.metrics.largestContentfulPaint = lastEntry.startTime
          }
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)

        // Observe CLS
        const clsObserver = new PerformanceObserver(list => {
          let clsValue = 0
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          this.metrics.cumulativeLayoutShift = clsValue
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)

        // Observe FID
        const fidObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            this.metrics.firstInputDelay =
              (entry as any).processingStart - entry.startTime
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)
      } catch (error) {
        logger.warn('Performance monitoring not supported', {
          error: error as Error,
        })
      }
    }
  }

  startModalLoad() {
    if (typeof window !== 'undefined') {
      performance.mark('modal-load-start')
    }
  }

  endModalLoad() {
    if (typeof window !== 'undefined') {
      performance.mark('modal-load-end')
      performance.measure(
        'modal-load-time',
        'modal-load-start',
        'modal-load-end'
      )

      const measure = performance.getEntriesByName('modal-load-time')[0]
      if (measure) {
        this.metrics.modalLoadTime = measure.duration
      }
    }
  }

  startFormLoad() {
    if (typeof window !== 'undefined') {
      performance.mark('form-load-start')
    }
  }

  endFormLoad() {
    if (typeof window !== 'undefined') {
      performance.mark('form-load-end')
      performance.measure('form-load-time', 'form-load-start', 'form-load-end')

      const measure = performance.getEntriesByName('form-load-time')[0]
      if (measure) {
        this.metrics.formLoadTime = measure.duration
      }
    }
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics }
  }

  logMetrics() {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Modal Performance Metrics', {
        modalLoadTime: this.metrics.modalLoadTime?.toFixed(2),
        formLoadTime: this.metrics.formLoadTime?.toFixed(2),
        firstContentfulPaint: this.metrics.firstContentfulPaint?.toFixed(2),
        largestContentfulPaint: this.metrics.largestContentfulPaint?.toFixed(2),
        cumulativeLayoutShift: this.metrics.cumulativeLayoutShift?.toFixed(4),
        firstInputDelay: this.metrics.firstInputDelay?.toFixed(2),
      })
    }
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Singleton instance
let performanceMonitor: ModalPerformanceMonitor | null = null

export function getPerformanceMonitor(): ModalPerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new ModalPerformanceMonitor()
  }
  return performanceMonitor
}

// Hook for React components
export function useModalPerformance() {
  const monitor = getPerformanceMonitor()

  return {
    startModalLoad: () => monitor.startModalLoad(),
    endModalLoad: () => monitor.endModalLoad(),
    startFormLoad: () => monitor.startFormLoad(),
    endFormLoad: () => monitor.endFormLoad(),
    getMetrics: () => monitor.getMetrics(),
    logMetrics: () => monitor.logMetrics(),
  }
}

// Bundle size analyzer utility
export function analyzeBundleSize() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.querySelectorAll('script[src]'))
    const modalScripts = scripts.filter(
      script =>
        (script as HTMLScriptElement).src.includes('auth-modal') ||
        (script as HTMLScriptElement).src.includes('modal-ui') ||
        (script as HTMLScriptElement).src.includes('@modal')
    )

    const scriptUrls = modalScripts.map(
      (script, index) => `${index + 1}. ${(script as HTMLScriptElement).src}`
    )

    logger.debug('Modal Bundle Analysis', {
      totalScripts: scripts.length,
      modalScripts: modalScripts.length,
      scriptUrls,
    })
  }
}
