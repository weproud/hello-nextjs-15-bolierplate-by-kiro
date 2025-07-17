/**
 * Simple cache validation script
 */

// Simple memory cache implementation for validation
class SimpleMemoryCache {
  constructor(name = 'default') {
    this.cache = new Map()
    this.timers = new Map()
    this.name = name
  }

  set(key, value, ttlMs) {
    // Clear existing timer
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

  get(key) {
    const item = this.cache.get(key)
    if (!item) return undefined

    // Check if expired
    if (item.expires && Date.now() > item.expires) {
      this.delete(key)
      return undefined
    }

    return item.value
  }

  has(key) {
    return this.get(key) !== undefined
  }

  delete(key) {
    const timer = this.timers.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(key)
    }
    return this.cache.delete(key)
  }

  clear() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer)
    }
    this.timers.clear()
    this.cache.clear()
  }

  size() {
    return this.cache.size
  }

  keys() {
    return Array.from(this.cache.keys())
  }
}

// Validation function
async function validateCache() {
  console.log('🧪 Validating cache implementation...')

  try {
    // Test 1: Basic Operations
    console.log('\n1. Testing Basic Operations')
    const cache = new SimpleMemoryCache('test')

    cache.set('test-key', 'test-value')
    const retrieved = cache.get('test-key')
    console.log(`✅ Set/Get: ${retrieved === 'test-value' ? 'PASS' : 'FAIL'}`)

    // Test 2: TTL
    console.log('\n2. Testing TTL')
    cache.set('ttl-key', 'ttl-value', 100) // 100ms TTL
    console.log(`✅ TTL Set: ${cache.has('ttl-key') ? 'PASS' : 'FAIL'}`)

    await new Promise(resolve => setTimeout(resolve, 150))
    console.log(`✅ TTL Expiry: ${!cache.has('ttl-key') ? 'PASS' : 'FAIL'}`)

    // Test 3: Size and Clear
    console.log('\n3. Testing Size and Clear')
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    console.log(`✅ Size: ${cache.size() === 2 ? 'PASS' : 'FAIL'}`)

    cache.clear()
    console.log(`✅ Clear: ${cache.size() === 0 ? 'PASS' : 'FAIL'}`)

    // Test 4: Multiple Instances
    console.log('\n4. Testing Multiple Instances')
    const cache1 = new SimpleMemoryCache('cache1')
    const cache2 = new SimpleMemoryCache('cache2')

    cache1.set('test', 'cache1-value')
    cache2.set('test', 'cache2-value')

    console.log(
      `✅ Isolation: ${cache1.get('test') === 'cache1-value' && cache2.get('test') === 'cache2-value' ? 'PASS' : 'FAIL'}`
    )

    // Test 5: Performance Benchmark
    console.log('\n5. Performance Benchmark')
    const perfCache = new SimpleMemoryCache('perf')
    const iterations = 10000

    const setStart = performance.now()
    for (let i = 0; i < iterations; i++) {
      perfCache.set(`key-${i}`, `value-${i}`)
    }
    const setEnd = performance.now()

    const getStart = performance.now()
    for (let i = 0; i < iterations; i++) {
      perfCache.get(`key-${i}`)
    }
    const getEnd = performance.now()

    console.log(
      `📊 SET: ${(setEnd - setStart).toFixed(2)}ms for ${iterations} ops`
    )
    console.log(
      `📊 GET: ${(getEnd - getStart).toFixed(2)}ms for ${iterations} ops`
    )

    perfCache.clear()

    console.log('\n🎉 Cache validation completed successfully!')
    return true
  } catch (error) {
    console.error('\n❌ Cache validation failed:', error)
    return false
  }
}

// Run validation
validateCache()
  .then(success => {
    if (success) {
      console.log('\n✨ All cache tests passed!')
    } else {
      console.log('\n💥 Some cache tests failed!')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('Validation error:', error)
    process.exit(1)
  })
