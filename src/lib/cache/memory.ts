// Simple in-memory cache implementation
export class MemoryCache<T = any> {
  private cache = new Map<string, { value: T; expires?: number }>()
  private timers = new Map<string, NodeJS.Timeout>()

  set(key: string, value: T, ttlMs?: number): void {
    // Clear existing timer if any
    const existingTimer = this.timers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const expires = ttlMs ? Date.now() + ttlMs : undefined
    this.cache.set(key, { value, expires })

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

    if (!item) return undefined

    // Check if expired
    if (item.expires && Date.now() > item.expires) {
      this.delete(key)
      return undefined
    }

    return item.value
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
}

// Global cache instances
export const globalCache = new MemoryCache()
export const userCache = new MemoryCache()
export const projectCache = new MemoryCache()

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
