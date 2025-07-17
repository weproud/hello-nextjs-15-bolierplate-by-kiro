/**
 * Performance monitoring utilities for development environment
 */

export interface PerformanceMetrics {
  bundleSize: number
  loadTime: number
  renderTime: number
  memoryUsage: number
  cacheHitRate: number
  cacheSize: number
  timestamp: Date
}

export interface CacheMetrics {
  hits: number
  misses: number
  size: number
  hitRate: number
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics[] = []
  private cacheMetrics: Map<string, CacheMetrics> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Measure component render time
   */
  measureRenderTime(componentName: string, renderFn: () => void): number {
    const startTime = performance.now()
    renderFn()
    const endTime = performance.now()
    const renderTime = endTime - startTime

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Performance] ${componentName} render time: ${renderTime.toFixed(2)}ms`
      )
    }

    return renderTime
  }

  /**
   * Measure memory usage
   */
  measureMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      return memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
    }
    return 0
  }

  /**
   * Track cache hit/miss
   */
  trackCacheHit(cacheKey: string, hit: boolean): void {
    const existing = this.cacheMetrics.get(cacheKey) || {
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0,
    }

    if (hit) {
      existing.hits++
    } else {
      existing.misses++
    }

    existing.hitRate = existing.hits / (existing.hits + existing.misses)
    this.cacheMetrics.set(cacheKey, existing)
  }

  /**
   * Update cache size
   */
  updateCacheSize(cacheKey: string, size: number): void {
    const existing = this.cacheMetrics.get(cacheKey) || {
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0,
    }

    existing.size = size
    this.cacheMetrics.set(cacheKey, existing)
  }

  /**
   * Get cache metrics
   */
  getCacheMetrics(cacheKey?: string): CacheMetrics | Map<string, CacheMetrics> {
    if (cacheKey) {
      return (
        this.cacheMetrics.get(cacheKey) || {
          hits: 0,
          misses: 0,
          size: 0,
          hitRate: 0,
        }
      )
    }
    return new Map(this.cacheMetrics)
  }

  /**
   * Get overall cache statistics
   */
  getOverallCacheStats(): { hitRate: number; totalSize: number } {
    let totalHits = 0
    let totalMisses = 0
    let totalSize = 0

    for (const metrics of this.cacheMetrics.values()) {
      totalHits += metrics.hits
      totalMisses += metrics.misses
      totalSize += metrics.size
    }

    const hitRate =
      totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0

    return { hitRate, totalSize }
  }

  /**
   * Log performance metrics
   */
  logMetrics(metrics: Partial<PerformanceMetrics>): void {
    if (process.env.NODE_ENV === 'development') {
      const cacheStats = this.getOverallCacheStats()

      const fullMetrics: PerformanceMetrics = {
        bundleSize: metrics.bundleSize || 0,
        loadTime: metrics.loadTime || 0,
        renderTime: metrics.renderTime || 0,
        memoryUsage: this.measureMemoryUsage(),
        cacheHitRate: cacheStats.hitRate,
        cacheSize: cacheStats.totalSize,
        timestamp: new Date(),
        ...metrics,
      }

      this.metrics.push(fullMetrics)
      console.table([fullMetrics])
    }
  }

  /**
   * Get performance history
   */
  getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  /**
   * Clear metrics history
   */
  clearMetrics(): void {
    this.metrics = []
  }
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance()

  const measureRender = (componentName: string, renderFn: () => void) => {
    return monitor.measureRenderTime(componentName, renderFn)
  }

  const logMetrics = (metrics: Partial<PerformanceMetrics>) => {
    monitor.logMetrics(metrics)
  }

  return {
    measureRender,
    logMetrics,
    getHistory: () => monitor.getMetricsHistory(),
    clearMetrics: () => monitor.clearMetrics(),
  }
}

/**
 * Performance decorator for measuring function execution time
 */
export function measurePerformance(
  _target: any,
  propertyName: string,
  descriptor: PropertyDescriptor
) {
  const method = descriptor.value

  descriptor.value = function (...args: any[]) {
    const startTime = performance.now()
    const result = method.apply(this, args)
    const endTime = performance.now()

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Performance] ${propertyName} execution time: ${(endTime - startTime).toFixed(2)}ms`
      )
    }

    return result
  }

  return descriptor
}
