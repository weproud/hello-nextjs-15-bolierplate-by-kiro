// Enhanced in-memory cache implementation with LRU eviction
export class MemoryCache<T = any> {
  private cache = new Map<
    string,
    { value: T; expires?: number; lastAccessed: number }
  >()
  private timers = new Map<string, NodeJS.Timeout>()
  private name: string
  private maxSize: number
  private compressionThreshold: number

  constructor(
    name: string = 'default',
    maxSize: number = 1000,
    compressionThreshold: number = 10000 // bytes
  ) {
    this.name = name
    this.maxSize = maxSize
    this.compressionThreshold = compressionThreshold
  }

  set(key: string, value: T, ttlMs?: number): void {
    // Check if cache is at capacity and evict LRU item
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    // Clear existing timer if any
    const existingTimer = this.timers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const now = Date.now()
    const cacheItem: { value: T; expires?: number; lastAccessed: number } = {
      value,
      lastAccessed: now,
    }
    if (ttlMs) {
      cacheItem.expires = now + ttlMs
    }
    this.cache.set(key, cacheItem)

    // Set expiration timer
    if (ttlMs) {
      const timer = setTimeout(() => {
        this.delete(key)
      }, ttlMs)
      this.timers.set(key, timer)
    }
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key)

    if (!item) {
      this.trackCacheHit(false)
      return undefined
    }

    // Check if expired
    if (item.expires && Date.now() > item.expires) {
      this.delete(key)
      this.trackCacheHit(false)
      return undefined
    }

    // Update last accessed time for LRU
    item.lastAccessed = Date.now()
    this.trackCacheHit(true)
    return item.value
  }

  /**
   * Track cache hit/miss for performance monitoring
   */
  private trackCacheHit(hit: boolean): void {
    if (process.env.NODE_ENV === 'development') {
      // Import performance monitor dynamically to avoid circular dependencies
      import('../performance')
        .then(({ PerformanceMonitor }) => {
          const monitor = PerformanceMonitor.getInstance()
          monitor.trackCacheHit(this.name, hit)
          monitor.updateCacheSize(this.name, this.cache.size)
        })
        .catch(() => {
          // Silently fail if performance monitoring is not available
        })
    }
  }

  has(key: string): boolean {
    return this.get(key) !== undefined
  }

  delete(key: string): boolean {
    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
    return this.cache.delete(key)
  }

  clear(): void {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }
    this.timers.clear()
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Evict least recently used item when cache is full
   */
  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.delete(oldestKey)
      console.log(`[Cache:${this.name}] Evicted LRU item: ${oldestKey}`)
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now()
    let expiredCount = 0
    let totalSize = 0

    for (const [key, item] of this.cache.entries()) {
      if (item.expires && now > item.expires) {
        expiredCount++
      }
      // Rough size estimation
      totalSize += JSON.stringify(item.value).length
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expiredCount,
      totalSize,
      utilizationPercent: Math.round((this.cache.size / this.maxSize) * 100),
    }
  }

  /**
   * Clean up expired entries manually
   */
  cleanup(): number {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (item.expires && now > item.expires) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.delete(key))

    if (expiredKeys.length > 0) {
      console.log(
        `[Cache:${this.name}] Cleaned up ${expiredKeys.length} expired entries`
      )
    }

    return expiredKeys.length
  }

  /**
   * Compress large values if they exceed threshold
   */
  private shouldCompress(value: T): boolean {
    try {
      const size = JSON.stringify(value).length
      return size > this.compressionThreshold
    } catch {
      return false
    }
  }
}

// Global cache instances
export const globalCache = new MemoryCache('global')
export const userCache = new MemoryCache('user')
export const projectCache = new MemoryCache('project')

// Cache utilities
export const cacheUtils = {
  // Generate cache keys
  userKey: (id: string) => `user:${id}`,
  projectKey: (id: string) => `project:${id}`,
  userProjectsKey: (userId: string) => `user:${userId}:projects`,

  // Common TTL values (in milliseconds)
  TTL: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 2 * 60 * 60 * 1000, // 2 hours
  },
}
