/**
 * Cache utilities and strategies index
 */

// Memory cache
export * from './memory'

// Next.js caching
export * from './nextjs'

// Prisma query caching
export * from './prisma'

// Static data caching
export * from './static'

// Cache strategies and management
export * from './strategies'

// Advanced cache strategies
export * from './advanced-strategies'

// Cache initialization
export * from './init'

// Cache examples and patterns
export * from './examples'

// Cache validation and testing
export * from './validate'

// Re-export commonly used utilities
export {
  MemoryCache,
  globalCache,
  userCache,
  projectCache,
  cacheUtils,
} from './memory'

export {
  CACHE_TAGS,
  CACHE_DURATION,
  createCachedFunction,
  cacheInvalidation,
  routeConfig,
  pageCache,
  apiCache,
} from './nextjs'

export {
  PrismaCacheWrapper,
  prismaMemoryCache,
  withPrismaCache,
} from './prisma'

export {
  configCache,
  constantsCache,
  featureFlagsCache,
  staticCacheUtils,
} from './static'

export {
  cacheConfig,
  setupCache,
  routeCacheConfig,
  cacheKeys,
  invalidationPatterns,
} from './config'

export { cacheStrategies, cacheWarming, cacheHealth } from './strategies'

export {
  cachePreloading,
  smartInvalidation,
  cacheCompression,
  cacheAnalytics,
  distributedCachePrep,
  cacheWarmingScheduler,
} from './advanced-strategies'

export {
  initializeCache,
  withCache,
  cached,
  cacheUtils as initCacheUtils,
} from './init'
