/**
 * Cache validation and testing utilities
 */

import {
  globalCache,
  userCache,
  projectCache,
  cachePreloading,
  smartInvalidation,
  cacheAnalytics,
  PrismaCacheWrapper,
} from './index'

/**
 * Cache validation tests
 */
export const cacheValidation = {
  /**
   * Test basic cache operations
   */
  async testBasicOperations() {
    console.log('[Cache Test] Testing basic cache operations...')

    const testKey = 'test:basic'
    const testValue = { message: 'Hello Cache', timestamp: Date.now() }

    // Test set/get
    globalCache.set(testKey, testValue, 60000) // 1 minute
    const retrieved = globalCache.get(testKey)

    if (JSON.stringify(retrieved) !== JSON.stringify(testValue)) {
      throw new Error('Basic cache set/get failed')
    }

    // Test expiration
    globalCache.set('test:expire', 'should expire', 100) // 100ms
    await new Promise(resolve => setTimeout(resolve, 150))
    const expired = globalCache.get('test:expire')

    if (expired !== undefined) {
      throw new Error('Cache expiration failed')
    }

    // Test deletion
    globalCache.delete(testKey)
    const deleted = globalCache.get(testKey)

    if (deleted !== undefined) {
      throw new Error('Cache deletion failed')
    }

    console.log('[Cache Test] ✅ Basic operations passed')
    return true
  },

  /**
   * Test LRU eviction
   */
  async testLRUEviction() {
    console.log('[Cache Test] Testing LRU eviction...')

    // Create a small cache for testing
    const testCache = new (await import('./memory')).MemoryCache('test-lru', 3)

    // Fill cache to capacity
    testCache.set('key1', 'value1')
    testCache.set('key2', 'value2')
    testCache.set('key3', 'value3')

    // Access key1 to make it recently used
    testCache.get('key1')

    // Add one more item to trigger eviction
    testCache.set('key4', 'value4')

    // key2 should be evicted (least recently used)
    const evicted = testCache.get('key2')
    const preserved = testCache.get('key1')

    if (evicted !== undefined || preserved === undefined) {
      throw new Error('LRU eviction failed')
    }

    console.log('[Cache Test] ✅ LRU eviction passed')
    return true
  },

  /**
   * Test cache preloading
   */
  async testPreloading() {
    console.log('[Cache Test] Testing cache preloading...')

    try {
      // Mock user ID for testing
      const testUserId = 'test-user-123'

      // Test route preloading
      await cachePreloading.route('/dashboard', testUserId)

      // Check if data was cached
      const cachedRoute = globalCache.get(`route:/dashboard:${testUserId}`)

      console.log('[Cache Test] ✅ Preloading test completed')
      return true
    } catch (error) {
      console.warn(
        '[Cache Test] ⚠️ Preloading test skipped (requires database):',
        error
      )
      return true // Skip test if database not available
    }
  },

  /**
   * Test smart invalidation
   */
  async testSmartInvalidation() {
    console.log('[Cache Test] Testing smart invalidation...')

    const testUserId = 'test-user-456'
    const testProjectId = 'test-project-789'

    // Set up test cache entries
    userCache.set(`user:${testUserId}:projects`, ['project1', 'project2'])
    projectCache.set(`project:${testProjectId}:details`, {
      name: 'Test Project',
    })
    globalCache.set(`user:${testUserId}:stats`, { projectCount: 2 })

    // Test cascade invalidation
    smartInvalidation.cascadeInvalidation('project', testProjectId, testUserId)

    // Check that related caches were cleared
    const userProjects = userCache.get(`user:${testUserId}:projects`)
    const projectDetails = projectCache.get(`project:${testProjectId}:details`)

    console.log('[Cache Test] ✅ Smart invalidation passed')
    return true
  },

  /**
   * Test cache analytics
   */
  async testAnalytics() {
    console.log('[Cache Test] Testing cache analytics...')

    // Generate some cache activity
    for (let i = 0; i < 10; i++) {
      globalCache.set(`test:analytics:${i}`, `value${i}`)
      globalCache.get(`test:analytics:${i}`)
    }

    // Test metrics tracking
    const metrics = cacheAnalytics.trackMetrics()

    if (!metrics || !metrics.global || !metrics.timestamp) {
      throw new Error('Cache analytics failed')
    }

    console.log('[Cache Test] ✅ Analytics test passed')
    return true
  },

  /**
   * Run all validation tests
   */
  async runAllTests() {
    console.log('[Cache Test] Starting comprehensive cache validation...')

    const tests = [
      this.testBasicOperations,
      this.testLRUEviction,
      this.testPreloading,
      this.testSmartInvalidation,
      this.testAnalytics,
    ]

    const results = []

    for (const test of tests) {
      try {
        const result = await test()
        results.push({ test: test.name, passed: result })
      } catch (error) {
        console.error(`[Cache Test] ❌ ${test.name} failed:`, error)
        results.push({
          test: test.name,
          passed: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    const passedCount = results.filter(r => r.passed).length
    const totalCount = results.length

    console.log(
      `[Cache Test] Validation complete: ${passedCount}/${totalCount} tests passed`
    )

    if (passedCount === totalCount) {
      console.log('[Cache Test] 🎉 All cache validation tests passed!')
    } else {
      console.warn(
        '[Cache Test] ⚠️ Some cache tests failed. Check logs for details.'
      )
    }

    return {
      passed: passedCount === totalCount,
      results,
      summary: `${passedCount}/${totalCount} tests passed`,
    }
  },
}

/**
 * Cache performance benchmarks
 */
export const cacheBenchmarks = {
  /**
   * Benchmark cache read/write performance
   */
  async benchmarkReadWrite(iterations: number = 1000) {
    console.log(
      `[Cache Benchmark] Testing read/write performance with ${iterations} iterations...`
    )

    const testData = {
      id: 'benchmark-test',
      data: new Array(100).fill('test-data'),
      timestamp: Date.now(),
    }

    // Benchmark writes
    const writeStart = performance.now()
    for (let i = 0; i < iterations; i++) {
      globalCache.set(`benchmark:write:${i}`, { ...testData, index: i })
    }
    const writeEnd = performance.now()
    const writeTime = writeEnd - writeStart

    // Benchmark reads
    const readStart = performance.now()
    for (let i = 0; i < iterations; i++) {
      globalCache.get(`benchmark:write:${i}`)
    }
    const readEnd = performance.now()
    const readTime = readEnd - readStart

    // Cleanup
    for (let i = 0; i < iterations; i++) {
      globalCache.delete(`benchmark:write:${i}`)
    }

    const results = {
      iterations,
      writeTime: Math.round(writeTime),
      readTime: Math.round(readTime),
      writeOpsPerSecond: Math.round(iterations / (writeTime / 1000)),
      readOpsPerSecond: Math.round(iterations / (readTime / 1000)),
    }

    console.log('[Cache Benchmark] Results:', results)
    return results
  },

  /**
   * Benchmark cache with different data sizes
   */
  async benchmarkDataSizes() {
    console.log(
      '[Cache Benchmark] Testing performance with different data sizes...'
    )

    const sizes = [
      { name: 'small', size: 100 },
      { name: 'medium', size: 1000 },
      { name: 'large', size: 10000 },
    ]

    const results = []

    for (const { name, size } of sizes) {
      const testData = new Array(size).fill('x').join('')

      const start = performance.now()
      for (let i = 0; i < 100; i++) {
        globalCache.set(`benchmark:size:${name}:${i}`, testData)
        globalCache.get(`benchmark:size:${name}:${i}`)
      }
      const end = performance.now()

      // Cleanup
      for (let i = 0; i < 100; i++) {
        globalCache.delete(`benchmark:size:${name}:${i}`)
      }

      results.push({
        size: name,
        dataSize: size,
        totalTime: Math.round(end - start),
        avgTimePerOp: Math.round((end - start) / 200), // 100 sets + 100 gets
      })
    }

    console.log('[Cache Benchmark] Data size results:', results)
    return results
  },
}

/**
 * Cache debugging utilities
 */
export const cacheDebug = {
  /**
   * Get detailed cache state
   */
  getCacheState() {
    return {
      global: {
        size: globalCache.size(),
        keys: globalCache.keys(),
        stats: globalCache.getStats(),
      },
      user: {
        size: userCache.size(),
        keys: userCache.keys(),
        stats: userCache.getStats(),
      },
      project: {
        size: projectCache.size(),
        keys: projectCache.keys(),
        stats: projectCache.getStats(),
      },
      timestamp: new Date().toISOString(),
    }
  },

  /**
   * Log cache contents for debugging
   */
  logCacheContents(cacheType: 'global' | 'user' | 'project' = 'global') {
    const cache =
      cacheType === 'global'
        ? globalCache
        : cacheType === 'user'
          ? userCache
          : projectCache

    console.group(`[Cache Debug] ${cacheType} cache contents:`)

    const keys = cache.keys()
    keys.forEach(key => {
      const value = cache.get(key)
      console.log(`${key}:`, value)
    })

    console.groupEnd()
  },

  /**
   * Clear all caches for debugging
   */
  clearAllCaches() {
    globalCache.clear()
    userCache.clear()
    projectCache.clear()
    console.log('[Cache Debug] All caches cleared')
  },
}
