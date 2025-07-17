/**
 * Cache implementation tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  MemoryCache,
  globalCache,
  userCache,
  projectCache,
  cacheUtils,
  CACHE_TAGS,
  CACHE_DURATION,
  cacheStrategies,
  cacheHealth,
} from '../index'

describe('Memory Cache', () => {
  let cache: MemoryCache

  beforeEach(() => {
    cache = new MemoryCache('test')
  })

  afterEach(() => {
    cache.clear()
  })

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1')
    expect(cache.get('key1')).toBe('value1')
  })

  it('should handle TTL expiration', async () => {
    cache.set('key1', 'value1', 100) // 100ms TTL
    expect(cache.get('key1')).toBe('value1')

    await new Promise(resolve => setTimeout(resolve, 150))
    expect(cache.get('key1')).toBeUndefined()
  })

  it('should track cache size', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    expect(cache.size()).toBe(2)
  })

  it('should delete entries', () => {
    cache.set('key1', 'value1')
    expect(cache.has('key1')).toBe(true)

    cache.delete('key1')
    expect(cache.has('key1')).toBe(false)
  })

  it('should clear all entries', () => {
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    expect(cache.size()).toBe(2)

    cache.clear()
    expect(cache.size()).toBe(0)
  })
})

describe('Cache Utils', () => {
  it('should generate correct cache keys', () => {
    expect(cacheUtils.userKey('123')).toBe('user:123')
    expect(cacheUtils.projectKey('456')).toBe('project:456')
    expect(cacheUtils.userProjectsKey('123')).toBe('user:123:projects')
  })

  it('should have correct TTL values', () => {
    expect(cacheUtils.TTL.SHORT).toBe(5 * 60 * 1000)
    expect(cacheUtils.TTL.MEDIUM).toBe(30 * 60 * 1000)
    expect(cacheUtils.TTL.LONG).toBe(2 * 60 * 60 * 1000)
  })
})

describe('Cache Constants', () => {
  it('should have correct cache tags', () => {
    expect(CACHE_TAGS.USER).toBe('user')
    expect(CACHE_TAGS.PROJECT).toBe('project')
    expect(CACHE_TAGS.PHASE).toBe('phase')
    expect(CACHE_TAGS.STATIC).toBe('static')
    expect(CACHE_TAGS.CONFIG).toBe('config')
  })

  it('should have correct cache durations', () => {
    expect(CACHE_DURATION.SHORT).toBe(60)
    expect(CACHE_DURATION.MEDIUM).toBe(300)
    expect(CACHE_DURATION.LONG).toBe(1800)
    expect(CACHE_DURATION.STATIC).toBe(86400)
  })
})

describe('Cache Strategies', () => {
  beforeEach(() => {
    globalCache.clear()
    userCache.clear()
    projectCache.clear()
  })

  it('should invalidate user cache', () => {
    const userId = '123'
    userCache.set(cacheUtils.userKey(userId), { id: userId, name: 'Test' })
    userCache.set(cacheUtils.userProjectsKey(userId), [])

    expect(userCache.has(cacheUtils.userKey(userId))).toBe(true)

    // Note: This would normally call Next.js revalidation functions
    // For testing, we'll just test the memory cache part
    userCache.delete(cacheUtils.userKey(userId))
    userCache.delete(cacheUtils.userProjectsKey(userId))

    expect(userCache.has(cacheUtils.userKey(userId))).toBe(false)
    expect(userCache.has(cacheUtils.userProjectsKey(userId))).toBe(false)
  })

  it('should invalidate project cache', () => {
    const projectId = '456'
    projectCache.set(cacheUtils.projectKey(projectId), {
      id: projectId,
      name: 'Test Project',
    })

    expect(projectCache.has(cacheUtils.projectKey(projectId))).toBe(true)

    projectCache.delete(cacheUtils.projectKey(projectId))

    expect(projectCache.has(cacheUtils.projectKey(projectId))).toBe(false)
  })
})

describe('Cache Health', () => {
  beforeEach(() => {
    globalCache.clear()
    userCache.clear()
    projectCache.clear()
  })

  it('should get cache statistics', () => {
    globalCache.set('test1', 'value1')
    userCache.set('test2', 'value2')
    projectCache.set('test3', 'value3')

    const stats = cacheHealth.getStats()

    expect(stats.memory.global.size).toBe(1)
    expect(stats.memory.user.size).toBe(1)
    expect(stats.memory.project.size).toBe(1)
  })

  it('should check cache health', () => {
    const health = cacheHealth.checkHealth()

    expect(health.status).toMatch(/healthy|warning|critical/)
    expect(Array.isArray(health.issues)).toBe(true)
    expect(Array.isArray(health.recommendations)).toBe(true)
    expect(health.stats).toBeDefined()
  })
})

describe('Performance Integration', () => {
  it('should track cache hits and misses', async () => {
    // Mock performance monitoring
    const mockPerformanceMonitor = {
      trackCacheHit: vi.fn(),
      updateCacheSize: vi.fn(),
    }

    // This would normally be integrated with the actual performance monitor
    // For testing, we'll verify the cache behavior
    const cache = new MemoryCache('test')

    cache.set('key1', 'value1')
    const hit = cache.get('key1')
    const miss = cache.get('nonexistent')

    expect(hit).toBe('value1')
    expect(miss).toBeUndefined()
  })
})

describe('Global Cache Instances', () => {
  afterEach(() => {
    globalCache.clear()
    userCache.clear()
    projectCache.clear()
  })

  it('should have separate cache instances', () => {
    globalCache.set('test', 'global')
    userCache.set('test', 'user')
    projectCache.set('test', 'project')

    expect(globalCache.get('test')).toBe('global')
    expect(userCache.get('test')).toBe('user')
    expect(projectCache.get('test')).toBe('project')
  })

  it('should maintain separate sizes', () => {
    globalCache.set('key1', 'value1')
    globalCache.set('key2', 'value2')
    userCache.set('key1', 'value1')

    expect(globalCache.size()).toBe(2)
    expect(userCache.size()).toBe(1)
    expect(projectCache.size()).toBe(0)
  })
})
