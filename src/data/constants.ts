/**
 * Application Constants
 *
 * Centralized constants used throughout the application
 * for consistency and easy maintenance.
 */

// App metadata
export const APP_NAME = 'LagomPath'
export const APP_DESCRIPTION =
  'Modern Next.js development environment with TypeScript, Prisma, and NextAuth'
export const APP_VERSION = '1.0.0'
export const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    signin: '/api/auth/signin',
    signout: '/api/auth/signout',
    session: '/api/auth/session',
  },
  projects: {
    list: '/api/projects',
    create: '/api/projects',
    get: (id: string) => `/api/projects/${id}`,
    update: (id: string) => `/api/projects/${id}`,
    delete: (id: string) => `/api/projects/${id}`,
  },
  users: {
    profile: '/api/users/profile',
    preferences: '/api/users/preferences',
  },
  upload: '/api/upload',
} as const

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    documents: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    all: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
  },
} as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
  LIMITS: [6, 12, 24, 48] as const,
} as const

// Form validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  TITLE_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 1000,
  MESSAGE_MAX_LENGTH: 2000,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/,
} as const

// Theme configuration
export const THEME = {
  DEFAULT: 'system' as const,
  OPTIONS: ['light', 'dark', 'system'] as const,
} as const

// Language configuration
export const LANGUAGE = {
  DEFAULT: 'ko' as const,
  OPTIONS: ['ko', 'en'] as const,
  LABELS: {
    ko: '한국어',
    en: 'English',
  },
} as const

// Date formats
export const DATE_FORMATS = {
  SHORT: 'YYYY-MM-DD',
  LONG: 'YYYY년 MM월 DD일',
  WITH_TIME: 'YYYY-MM-DD HH:mm',
  RELATIVE: 'relative', // for libraries like date-fns
} as const

// Status constants
export const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  IDLE: 'idle',
} as const

// Project status
export const PROJECT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const

// User roles (for future use)
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const

// Cache keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user-profile',
  USER_PREFERENCES: (userId: string) => `user-preferences-${userId}`,
  PROJECTS: 'projects',
  PROJECT: (id: string) => `project-${id}`,
  PROJECT_STATS: 'project-stats',
} as const

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_STATE: 'sidebar-state',
  USER_PREFERENCES: (userId: string) => `user-preferences-${userId}`,
  FORM_DRAFTS: (formId: string) => `form-draft-${formId}`,
} as const

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: '알 수 없는 오류가 발생했습니다.',
  NETWORK: '네트워크 연결을 확인해주세요.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  VALIDATION: '입력값을 확인해주세요.',
  SERVER: '서버 오류가 발생했습니다.',
  FILE_TOO_LARGE: '파일 크기가 너무 큽니다.',
  INVALID_FILE_TYPE: '지원하지 않는 파일 형식입니다.',
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  CREATED: '성공적으로 생성되었습니다.',
  UPDATED: '성공적으로 수정되었습니다.',
  DELETED: '성공적으로 삭제되었습니다.',
  SAVED: '성공적으로 저장되었습니다.',
  UPLOADED: '파일이 성공적으로 업로드되었습니다.',
  SENT: '성공적으로 전송되었습니다.',
} as const

// Animation durations (in milliseconds)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  TOAST_DURATION: 4000,
  NOTIFICATION_DURATION: 5000,
} as const

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const
