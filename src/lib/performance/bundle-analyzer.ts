/**
 * Bundle Analysis Utilities
 *
 * 번들 크기 분석 및 성능 모니터링을 위한 유틸리티들
 */

// Bundle size tracking
interface BundleMetrics {
  name: string
  size: number
  gzipSize?: number
  loadTime?: number
  timestamp: number
}

class BundleAnalyzer {
  private metrics: BundleMetrics[] = []
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  private initializeObservers() {
    // Resource timing observer
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource' && entry.name.includes('.js')) {
            this.trackResource(entry as PerformanceResourceTiming)
          }
        }
      })

      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)
    }
  }

  private trackResource(entry: PerformanceResourceTiming) {
    const metric: BundleMetrics = {
      name: this.extractBundleName(entry.name),
      size: entry.transferSize || 0,
      loadTime: entry.responseEnd - entry.responseStart,
      timestamp: Date.now(),
    }

    this.metrics.push(metric)
    this.reportMetric(metric)
  }

  private extractBundleName(url: string): string {
    const parts = url.split('/')
    const filename = parts[parts.length - 1]
    return filename.split('?')[0] // Remove query parameters
  }

  private reportMetric(metric: BundleMetrics) {
    // Development mode logging
    if (process.env.NODE_ENV === 'development') {
      console.log('📦 Bundle loaded:', {
        name: metric.name,
        size: `${(metric.size / 1024).toFixed(2)}KB`,
        loadTime: `${metric.loadTime?.toFixed(2)}ms`,
      })
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric)
    }
  }

  private sendToAnalytics(metric: BundleMetrics) {
    // Example: Send to your analytics service
    // analytics.track('bundle_loaded', metric)
  }

  // Public methods
  getMetrics(): BundleMetrics[] {
    return [...this.metrics]
  }

  getTotalBundleSize(): number {
    return this.metrics.reduce((total, metric) => total + metric.size, 0)
  }

  getLargestBundles(count = 5): BundleMetrics[] {
    return [...this.metrics].sort((a, b) => b.size - a.size).slice(0, count)
  }

  getSlowestBundles(count = 5): BundleMetrics[] {
    return [...this.metrics]
      .filter(m => m.loadTime)
      .sort((a, b) => (b.loadTime || 0) - (a.loadTime || 0))
      .slice(0, count)
  }

  generateReport(): string {
    const totalSize = this.getTotalBundleSize()
    const largest = this.getLargestBundles(3)
    const slowest = this.getSlowestBundles(3)

    return `
Bundle Analysis Report
=====================
Total Bundle Size: ${(totalSize / 1024).toFixed(2)}KB
Total Bundles: ${this.metrics.length}

Largest Bundles:
${largest.map(m => `  ${m.name}: ${(m.size / 1024).toFixed(2)}KB`).join('\n')}

Slowest Loading Bundles:
${slowest.map(m => `  ${m.name}: ${m.loadTime?.toFixed(2)}ms`).join('\n')}
    `.trim()
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics = []
  }
}

// Singleton instance
let bundleAnalyzer: BundleAnalyzer | null = null

export function getBundleAnalyzer(): BundleAnalyzer {
  if (!bundleAnalyzer) {
    bundleAnalyzer = new BundleAnalyzer()
  }
  return bundleAnalyzer
}

// Bundle size warning thresholds (in KB)
export const BUNDLE_SIZE_THRESHOLDS = {
  WARNING: 250, // 250KB
  ERROR: 500, // 500KB
  CRITICAL: 1000, // 1MB
} as const

// Check bundle size and warn if necessary
export function checkBundleSize(name: string, size: number) {
  const sizeKB = size / 1024

  if (sizeKB > BUNDLE_SIZE_THRESHOLDS.CRITICAL) {
    console.error(
      `🚨 Critical: Bundle ${name} is ${sizeKB.toFixed(2)}KB (>${BUNDLE_SIZE_THRESHOLDS.CRITICAL}KB)`
    )
  } else if (sizeKB > BUNDLE_SIZE_THRESHOLDS.ERROR) {
    console.error(
      `❌ Error: Bundle ${name} is ${sizeKB.toFixed(2)}KB (>${BUNDLE_SIZE_THRESHOLDS.ERROR}KB)`
    )
  } else if (sizeKB > BUNDLE_SIZE_THRESHOLDS.WARNING) {
    console.warn(
      `⚠️ Warning: Bundle ${name} is ${sizeKB.toFixed(2)}KB (>${BUNDLE_SIZE_THRESHOLDS.WARNING}KB)`
    )
  }
}

// Dynamic import with size tracking
export async function importWithTracking<T>(
  importFn: () => Promise<T>,
  bundleName: string
): Promise<T> {
  const startTime = performance.now()

  try {
    const module = await importFn()
    const endTime = performance.now()
    const loadTime = endTime - startTime

    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Loaded ${bundleName} in ${loadTime.toFixed(2)}ms`)
    }

    return module
  } catch (error) {
    console.error(`❌ Failed to load ${bundleName}:`, error)
    throw error
  }
}

// Code splitting recommendations
export const CODE_SPLITTING_RECOMMENDATIONS = {
  // Heavy libraries that should be lazy loaded
  HEAVY_LIBRARIES: [
    'chart.js',
    'monaco-editor',
    'pdf-lib',
    'three.js',
    'fabric.js',
  ],

  // Components that should be lazy loaded
  LAZY_COMPONENTS: ['Editor', 'Chart', 'Modal', 'DataTable', 'FileUploader'],

  // Routes that should be code split
  LAZY_ROUTES: ['admin', 'settings', 'analytics', 'reports'],
} as const

// Webpack bundle analyzer integration
export function generateWebpackBundleAnalyzer() {
  if (process.env.NODE_ENV === 'development') {
    return {
      webpack: (config: any, { isServer }: { isServer: boolean }) => {
        if (!isServer && process.env.ANALYZE === 'true') {
          const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

          config.plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              openAnalyzer: false,
              reportFilename: 'bundle-report.html',
              generateStatsFile: true,
              statsFilename: 'bundle-stats.json',
            })
          )
        }
        return config
      },
    }
  }
  return {}
}

// Performance budget checker
interface PerformanceBudget {
  maxBundleSize: number // in KB
  maxChunkSize: number // in KB
  maxAssetSize: number // in KB
}

export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  maxBundleSize: 1000, // 1MB
  maxChunkSize: 250, // 250KB
  maxAssetSize: 500, // 500KB
}

export function checkPerformanceBudget(
  metrics: BundleMetrics[],
  budget: PerformanceBudget = DEFAULT_PERFORMANCE_BUDGET
): {
  passed: boolean
  violations: string[]
} {
  const violations: string[] = []

  const totalSize = metrics.reduce((sum, m) => sum + m.size, 0) / 1024
  if (totalSize > budget.maxBundleSize) {
    violations.push(
      `Total bundle size ${totalSize.toFixed(2)}KB exceeds budget ${budget.maxBundleSize}KB`
    )
  }

  metrics.forEach(metric => {
    const sizeKB = metric.size / 1024
    if (sizeKB > budget.maxChunkSize) {
      violations.push(
        `Chunk ${metric.name} size ${sizeKB.toFixed(2)}KB exceeds budget ${budget.maxChunkSize}KB`
      )
    }
  })

  return {
    passed: violations.length === 0,
    violations,
  }
}
