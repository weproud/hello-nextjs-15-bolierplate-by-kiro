/**
 * Bundle Analysis Utilities
 *
 * 번들 크기 분석 및 성능 모니터링을 위한 유틸리티들
 */

// Bundle size tracking
export interface BundleMetrics {
  name: string
  size: number
  gzipSize?: number
  loadTime?: number
  timestamp: number
}

/**
 * Bundle analysis report interface
 */
export interface BundleAnalysisReport {
  totalSize: number
  totalBundles: number
  largestBundles: BundleMetrics[]
  slowestBundles: BundleMetrics[]
  timestamp: number
}

export class BundleAnalyzer {
  private metrics: BundleMetrics[] = []
  private observers: PerformanceObserver[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  private initializeObservers(): void {
    // Resource timing observer
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource' && entry.name.includes('.js')) {
            this.trackResource(entry as PerformanceResourceTiming)
          }
        }
      })

      try {
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)
      } catch (error) {
        console.warn('Failed to initialize resource observer:', error)
      }
    }
  }

  private trackResource(entry: PerformanceResourceTiming): void {
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
    return filename ? filename.split('?')[0] : 'unknown' // Remove query parameters
  }

  private reportMetric(metric: BundleMetrics): void {
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

  private sendToAnalytics(metric: BundleMetrics): void {
    // Send to analytics service
    fetch('/api/analytics/bundle-metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    }).catch(error => {
      console.warn('Failed to send bundle metrics to analytics:', error)
    })
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

  generateReport(): BundleAnalysisReport {
    const totalSize = this.getTotalBundleSize()
    const largest = this.getLargestBundles(3)
    const slowest = this.getSlowestBundles(3)

    return {
      totalSize,
      totalBundles: this.metrics.length,
      largestBundles: largest,
      slowestBundles: slowest,
      timestamp: Date.now(),
    }
  }

  generateTextReport(): string {
    const report = this.generateReport()

    return `
Bundle Analysis Report
=====================
Total Bundle Size: ${(report.totalSize / 1024).toFixed(2)}KB
Total Bundles: ${report.totalBundles}

Largest Bundles:
${report.largestBundles.map(m => `  ${m.name}: ${(m.size / 1024).toFixed(2)}KB`).join('\n')}

Slowest Loading Bundles:
${report.slowestBundles.map(m => `  ${m.name}: ${m.loadTime?.toFixed(2)}ms`).join('\n')}
    `.trim()
  }

  cleanup(): void {
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
export function checkBundleSize(name: string, size: number): void {
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

/**
 * Webpack configuration with bundle analyzer
 */
export interface WebpackBundleAnalyzerConfig {
  webpack?: (config: unknown, context: { isServer: boolean }) => unknown
}

// Webpack bundle analyzer integration
export function generateWebpackBundleAnalyzer(): WebpackBundleAnalyzerConfig {
  if (process.env.NODE_ENV === 'development') {
    return {
      webpack: (config: unknown, { isServer }: { isServer: boolean }) => {
        if (!isServer && process.env['ANALYZE'] === 'true') {
          // Dynamic import to avoid bundling in production
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

            const webpackConfig = config as { plugins: unknown[] }
            webpackConfig.plugins.push(
              new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                openAnalyzer: false,
                reportFilename: 'bundle-report.html',
                generateStatsFile: true,
                statsFilename: 'bundle-stats.json',
              })
            )
          } catch (error) {
            console.warn('webpack-bundle-analyzer not available:', error)
          }
        }
        return config
      },
    }
  }
  return {}
}

// Performance budget checker
export interface PerformanceBudget {
  maxBundleSize: number // in KB
  maxChunkSize: number // in KB
  maxAssetSize: number // in KB
}

/**
 * Performance budget check result
 */
export interface PerformanceBudgetResult {
  passed: boolean
  violations: readonly string[]
  totalSize: number
  budgetUtilization: number
}

export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  maxBundleSize: 1000, // 1MB
  maxChunkSize: 250, // 250KB
  maxAssetSize: 500, // 500KB
} as const

export function checkPerformanceBudget(
  metrics: readonly BundleMetrics[],
  budget: PerformanceBudget = DEFAULT_PERFORMANCE_BUDGET
): PerformanceBudgetResult {
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

  const budgetUtilization = (totalSize / budget.maxBundleSize) * 100

  return {
    passed: violations.length === 0,
    violations,
    totalSize,
    budgetUtilization,
  }
}
