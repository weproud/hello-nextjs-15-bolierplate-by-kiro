# Cache

This directory contains comprehensive caching utilities and strategies for the application.

## Structure

- **In-memory caching utilities** - Fast local caching with TTL support
- **Next.js cache integration** - Server-side caching with revalidation
- **Prisma query caching** - Database query result caching
- **Static data caching** - Configuration and constants caching
- **Cache invalidation strategies** - Organized cache management

## Files

- `memory.ts` - In-memory cache implementation with TTL and cleanup
- `nextjs.ts` - Next.js unstable_cache integration and route configurations
- `prisma.ts` - Prisma query result caching with invalidation strategies
- `static.ts` - Static data, configuration, and feature flags caching
- `index.ts` - Unified exports for all caching utilities

## Usage Examples

### Memory Cache

```typescript
import { globalCache, cacheUtils } from '@/lib/cache'

// Cache with TTL
globalCache.set('user:123', userData, cacheUtils.TTL.MEDIUM)
const user = globalCache.get('user:123')
```

### Next.js Cache

```typescript
import { createCachedFunction, CACHE_TAGS } from '@/lib/cache'

const getCachedUser = createCachedFunction(
  async (id: string) => fetchUser(id),
  ['user'],
  { tags: [CACHE_TAGS.USER], revalidate: 300 }
)
```

### Prisma Cache

```typescript
import { PrismaCacheWrapper } from '@/lib/cache'

const cachedPrisma = new PrismaCacheWrapper(prisma)
const user = await cachedPrisma.user.findUnique(userId)
```

### Static Cache

```typescript
import { configCache, constantsCache } from '@/lib/cache'

const appConfig = await configCache.app()
const templates = await constantsCache.projectTemplates()
```
