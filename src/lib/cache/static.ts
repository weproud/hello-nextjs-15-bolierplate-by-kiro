/**
 * Static data caching for configuration and constants
 */

import { MemoryCache } from './memory'
import { CACHE_TAGS, CACHE_DURATION, createCachedFunction } from './nextjs'

// Static cache instance with longer TTL
const staticCache = new MemoryCache()

/**
 * Application configuration cache
 */
export const configCache = {
  // Cache keys
  keys: {
    appConfig: 'config:app',
    themeConfig: 'config:theme',
    authConfig: 'config:auth',
    dbConfig: 'config:database',
    featureFlags: 'config:features',
  },

  // Get configuration with caching
  get: (key: string, defaultValue?: any): any => {
    const cached = staticCache.get(key)
    return cached !== undefined ? cached : defaultValue
  },

  // Set configuration with long TTL
  set: (key: string, value: any, ttlMs: number = 3600000) => {
    staticCache.set(key, value, ttlMs) // 1 hour default
  },

  // Application configuration
  app: createCachedFunction(
    async () => ({
      name: 'LagomPath',
      version: process.env['npm_package_version'] || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      baseUrl: process.env['NEXTAUTH_URL'] || 'http://localhost:3000',
      features: {
        analytics: process.env['ENABLE_ANALYTICS'] === 'true',
        monitoring: process.env['ENABLE_MONITORING'] === 'true',
        debugging: process.env.NODE_ENV === 'development',
      },
    }),
    ['config', 'app'],
    {
      tags: [CACHE_TAGS.CONFIG],
      revalidate: CACHE_DURATION.STATIC,
    }
  ),

  // Theme configuration
  theme: createCachedFunction(
    async () => ({
      defaultTheme: 'system',
      themes: ['light', 'dark', 'system'],
      colors: {
        primary: 'zinc',
        secondary: 'slate',
        accent: 'blue',
      },
      fonts: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    }),
    ['config', 'theme'],
    {
      tags: [CACHE_TAGS.CONFIG],
      revalidate: CACHE_DURATION.STATIC,
    }
  ),

  // Authentication configuration
  auth: createCachedFunction(
    async () => ({
      providers: ['google'],
      sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
      updateAge: 24 * 60 * 60, // 24 hours
      pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
      },
    }),
    ['config', 'auth'],
    {
      tags: [CACHE_TAGS.CONFIG],
      revalidate: CACHE_DURATION.STATIC,
    }
  ),
}

/**
 * Static data constants cache
 */
export const constantsCache = {
  // Project templates
  projectTemplates: createCachedFunction(
    async () => [
      {
        id: 'personal-development',
        name: '개인 성장',
        description: '개인적인 목표와 성장을 위한 프로젝트',
        phases: [
          { name: '현재 상태 분석', order: 1 },
          { name: '목표 설정', order: 2 },
          { name: '실행 계획', order: 3 },
          { name: '실행 및 모니터링', order: 4 },
          { name: '평가 및 개선', order: 5 },
        ],
      },
      {
        id: 'career-change',
        name: '커리어 전환',
        description: '새로운 직업이나 분야로의 전환 프로젝트',
        phases: [
          { name: '현재 역량 분석', order: 1 },
          { name: '목표 분야 연구', order: 2 },
          { name: '스킬 개발 계획', order: 3 },
          { name: '네트워킹 및 준비', order: 4 },
          { name: '전환 실행', order: 5 },
        ],
      },
      {
        id: 'business-startup',
        name: '사업 시작',
        description: '새로운 사업이나 창업을 위한 프로젝트',
        phases: [
          { name: '아이디어 검증', order: 1 },
          { name: '시장 조사', order: 2 },
          { name: '사업 계획 수립', order: 3 },
          { name: '자금 조달', order: 4 },
          { name: '사업 런칭', order: 5 },
        ],
      },
    ],
    ['constants', 'projectTemplates'],
    {
      tags: [CACHE_TAGS.STATIC],
      revalidate: CACHE_DURATION.STATIC,
    }
  ),

  // Mission categories
  missionCategories: createCachedFunction(
    async () => [
      { id: 'learning', name: '학습', icon: '📚', color: 'blue' },
      { id: 'networking', name: '네트워킹', icon: '🤝', color: 'green' },
      { id: 'planning', name: '계획', icon: '📋', color: 'purple' },
      { id: 'execution', name: '실행', icon: '🚀', color: 'orange' },
      { id: 'evaluation', name: '평가', icon: '📊', color: 'red' },
      { id: 'research', name: '조사', icon: '🔍', color: 'yellow' },
    ],
    ['constants', 'missionCategories'],
    {
      tags: [CACHE_TAGS.STATIC],
      revalidate: CACHE_DURATION.STATIC,
    }
  ),

  // Status options
  statusOptions: createCachedFunction(
    async () => ({
      project: [
        { value: 'planning', label: '계획 중', color: 'gray' },
        { value: 'active', label: '진행 중', color: 'blue' },
        { value: 'paused', label: '일시 중단', color: 'yellow' },
        { value: 'completed', label: '완료', color: 'green' },
        { value: 'cancelled', label: '취소', color: 'red' },
      ],
      phase: [
        { value: 'not_started', label: '시작 전', color: 'gray' },
        { value: 'in_progress', label: '진행 중', color: 'blue' },
        { value: 'completed', label: '완료', color: 'green' },
        { value: 'skipped', label: '건너뜀', color: 'yellow' },
      ],
      mission: [
        { value: 'todo', label: '할 일', color: 'gray' },
        { value: 'in_progress', label: '진행 중', color: 'blue' },
        { value: 'completed', label: '완료', color: 'green' },
        { value: 'cancelled', label: '취소', color: 'red' },
      ],
    }),
    ['constants', 'statusOptions'],
    {
      tags: [CACHE_TAGS.STATIC],
      revalidate: CACHE_DURATION.STATIC,
    }
  ),
}

/**
 * Feature flags cache
 */
export const featureFlagsCache = {
  // Get feature flag with caching
  get: createCachedFunction(
    async (flagName: string) => {
      // In a real app, this might fetch from a feature flag service
      const flags: Record<string, boolean> = {
        enableAnalytics: process.env['ENABLE_ANALYTICS'] === 'true',
        enableMonitoring: process.env['ENABLE_MONITORING'] === 'true',
        enableExperimentalFeatures: process.env.NODE_ENV === 'development',
        enableAdvancedSearch: true,
        enableCollaboration: false,
        enableNotifications: true,
      }

      return flags[flagName] ?? false
    },
    ['featureFlags'],
    {
      tags: [CACHE_TAGS.CONFIG],
      revalidate: CACHE_DURATION.MEDIUM,
    }
  ),

  // Get all feature flags
  getAll: createCachedFunction(
    async () => ({
      enableAnalytics: process.env['ENABLE_ANALYTICS'] === 'true',
      enableMonitoring: process.env['ENABLE_MONITORING'] === 'true',
      enableExperimentalFeatures: process.env.NODE_ENV === 'development',
      enableAdvancedSearch: true,
      enableCollaboration: false,
      enableNotifications: true,
    }),
    ['featureFlags', 'all'],
    {
      tags: [CACHE_TAGS.CONFIG],
      revalidate: CACHE_DURATION.MEDIUM,
    }
  ),
}

/**
 * Static cache utilities
 */
export const staticCacheUtils = {
  // Clear all static cache
  clear: () => {
    staticCache.clear()
  },

  // Get cache statistics
  stats: () => ({
    size: staticCache.size(),
    keys: staticCache.keys(),
  }),

  // Warm up cache with commonly used data
  warmUp: async () => {
    try {
      await Promise.all([
        configCache.app(),
        configCache.theme(),
        configCache.auth(),
        constantsCache.projectTemplates(),
        constantsCache.missionCategories(),
        constantsCache.statusOptions(),
        featureFlagsCache.getAll(),
      ])

      console.log('[Cache] Static cache warmed up successfully')
    } catch (error) {
      console.error('[Cache] Failed to warm up static cache:', error)
    }
  },
}
