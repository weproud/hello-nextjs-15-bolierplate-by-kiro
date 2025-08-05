/**
 * Central Type Definitions
 *
 * 애플리케이션 전체에서 사용되는 모든 타입을 중앙 집중식으로 내보냅니다.
 * 이 파일을 통해 타입 정의의 일관성을 유지하고 중복을 방지합니다.
 */

// Common Types - 공통 타입들
export * from '@/types/common'

// API Types - API 관련 타입들
export * from '@/types/api'

// Database Types - 데이터베이스 관련 타입들
export * from '@/types/database'

// Editor Types - 에디터 관련 타입들
export * from '@/types/editor'

// Post Types - 포스트 관련 타입들
export * from '@/types/post'

// NextAuth Types - NextAuth 관련 타입들
export * from '@/types/next-auth'

// Note: Commonly used types are already exported via export * above
// No need for explicit re-exports to avoid duplication

// Application-specific aggregate types
export interface AppState {
  user: import('./database').DatabaseUser | null
  theme: import('./common').Theme
  notifications: import('./common').Notification[]
  isLoading: boolean
  error: string | null
}

export interface ProjectState {
  projects: import('./database').ProjectWithUser[]
  currentProject: import('./database').ProjectWithUser | null
  isLoading: boolean
  error: string | null
  filters: {
    search: string
    category?: string
    status?: string
  }
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

// Configuration Types - 설정 관련 타입들
export interface AppConfig {
  name: string
  version: string
  description: string
  url: string
  api: {
    baseUrl: string
    timeout: number
  }
  features: {
    auth: boolean
    notifications: boolean
    analytics: boolean
  }
  limits: {
    fileUpload: {
      maxSize: number
      allowedTypes: string[]
    }
    pagination: {
      defaultLimit: number
      maxLimit: number
    }
  }
}

// Environment Types - 환경 변수 타입들
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test'
  DATABASE_URL: string
  NEXTAUTH_URL: string
  NEXTAUTH_SECRET: string
  AUTH_GOOGLE_ID?: string
  AUTH_GOOGLE_SECRET?: string
}

// Metadata Types - 메타데이터 타입들
export interface PageMetadata {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
}

export interface SEOData {
  title: string
  description: string
  canonical?: string
  openGraph?: {
    title: string
    description: string
    image: string
    url: string
  }
  twitter?: {
    card: 'summary' | 'summary_large_image'
    title: string
    description: string
    image: string
  }
}

// Event Types - 이벤트 관련 타입들
export interface AppEvent {
  type: string
  payload?: any
  timestamp: Date
  userId?: string
}

export interface ProjectEvent extends AppEvent {
  projectId: string
  type:
    | 'project.created'
    | 'project.updated'
    | 'project.deleted'
    | 'project.duplicated'
}

// Statistics Types - 통계 관련 타입들
export interface ProjectStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  archivedProjects: number
  projectsThisMonth: number
  projectsLastMonth: number
  monthlyGrowth: number
}

export interface ActivityData {
  day: string
  projects: number
}

export interface CategoryDistribution {
  category: string
  count: number
  percentage: number
}
