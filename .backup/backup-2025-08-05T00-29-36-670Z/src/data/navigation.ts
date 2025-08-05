/**
 * Navigation Configuration
 *
 * Centralized navigation structure and menu items
 * for consistent navigation throughout the application.
 */

import {
  Home,
  FolderOpen,
  Settings,
  User,
  FileText,
  BarChart3,
  HelpCircle,
  Mail,
  Shield,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: LucideIcon
  description?: string
  badge?: string | number
  children?: NavigationItem[]
  requireAuth?: boolean
  roles?: string[]
  external?: boolean
}

// Main navigation items
export const mainNavigation: NavigationItem[] = [
  {
    id: 'home',
    label: '홈',
    href: '/',
    icon: Home,
    description: '메인 페이지',
  },
  {
    id: 'dashboard',
    label: '대시보드',
    href: '/dashboard',
    icon: BarChart3,
    description: '프로젝트 현황 및 통계',
    requireAuth: true,
  },
  {
    id: 'projects',
    label: '프로젝트',
    href: '/projects',
    icon: FolderOpen,
    description: '프로젝트 관리',
    requireAuth: true,
  },
  {
    id: 'forms',
    label: '폼 예제',
    href: '/forms',
    icon: FileText,
    description: '다양한 폼 컴포넌트 예제',
  },
]

// User menu navigation
export const userNavigation: NavigationItem[] = [
  {
    id: 'profile',
    label: '프로필',
    href: '/profile',
    icon: User,
    description: '사용자 프로필 관리',
    requireAuth: true,
  },
  {
    id: 'settings',
    label: '설정',
    href: '/settings',
    icon: Settings,
    description: '계정 및 앱 설정',
    requireAuth: true,
  },
]

// Footer navigation
export const footerNavigation: NavigationItem[] = [
  {
    id: 'about',
    label: '소개',
    href: '/about',
    description: '서비스 소개',
  },
  {
    id: 'contact',
    label: '문의',
    href: '/contact',
    icon: Mail,
    description: '문의하기',
  },
  {
    id: 'privacy',
    label: '개인정보처리방침',
    href: '/privacy',
    icon: Shield,
    description: '개인정보 보호 정책',
  },
  {
    id: 'terms',
    label: '이용약관',
    href: '/terms',
    description: '서비스 이용약관',
  },
  {
    id: 'help',
    label: '도움말',
    href: '/help',
    icon: HelpCircle,
    description: '사용법 및 FAQ',
  },
]

// Admin navigation (for future use)
export const adminNavigation: NavigationItem[] = [
  {
    id: 'admin-dashboard',
    label: '관리자 대시보드',
    href: '/admin',
    icon: BarChart3,
    description: '관리자 전용 대시보드',
    requireAuth: true,
    roles: ['admin'],
  },
  {
    id: 'admin-users',
    label: '사용자 관리',
    href: '/admin/users',
    icon: User,
    description: '사용자 계정 관리',
    requireAuth: true,
    roles: ['admin'],
  },
  {
    id: 'admin-settings',
    label: '시스템 설정',
    href: '/admin/settings',
    icon: Settings,
    description: '시스템 전체 설정',
    requireAuth: true,
    roles: ['admin'],
  },
]

// Sidebar navigation (combines main and user navigation)
export const sidebarNavigation: NavigationItem[] = [
  ...mainNavigation,
  {
    id: 'divider-1',
    label: '',
    href: '',
  },
  ...userNavigation,
]

// Mobile navigation (simplified for mobile screens)
export const mobileNavigation: NavigationItem[] = [
  {
    id: 'home',
    label: '홈',
    href: '/',
    icon: Home,
  },
  {
    id: 'projects',
    label: '프로젝트',
    href: '/projects',
    icon: FolderOpen,
    requireAuth: true,
  },
  {
    id: 'dashboard',
    label: '대시보드',
    href: '/dashboard',
    icon: BarChart3,
    requireAuth: true,
  },
  {
    id: 'profile',
    label: '프로필',
    href: '/profile',
    icon: User,
    requireAuth: true,
  },
]

// Breadcrumb configuration
export const breadcrumbConfig: Record<string, NavigationItem[]> = {
  '/': [{ id: 'home', label: '홈', href: '/' }],
  '/dashboard': [
    { id: 'home', label: '홈', href: '/' },
    { id: 'dashboard', label: '대시보드', href: '/dashboard' },
  ],
  '/projects': [
    { id: 'home', label: '홈', href: '/' },
    { id: 'projects', label: '프로젝트', href: '/projects' },
  ],
  '/projects/[id]': [
    { id: 'home', label: '홈', href: '/' },
    { id: 'projects', label: '프로젝트', href: '/projects' },
    { id: 'project-detail', label: '프로젝트 상세', href: '' },
  ],
  '/forms': [
    { id: 'home', label: '홈', href: '/' },
    { id: 'forms', label: '폼 예제', href: '/forms' },
  ],
  '/profile': [
    { id: 'home', label: '홈', href: '/' },
    { id: 'profile', label: '프로필', href: '/profile' },
  ],
  '/settings': [
    { id: 'home', label: '홈', href: '/' },
    { id: 'settings', label: '설정', href: '/settings' },
  ],
}

// Quick actions (for dashboard or floating action buttons)
export const quickActions: NavigationItem[] = [
  {
    id: 'new-project',
    label: '새 프로젝트',
    href: '/projects/new',
    icon: FolderOpen,
    description: '새 프로젝트 생성',
    requireAuth: true,
  },
  {
    id: 'quick-form',
    label: '빠른 폼',
    href: '/forms/quick',
    icon: Zap,
    description: '빠른 폼 작성',
  },
]

// External links
export const externalLinks: NavigationItem[] = [
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com',
    description: 'GitHub 저장소',
    external: true,
  },
  {
    id: 'docs',
    label: '문서',
    href: 'https://docs.example.com',
    description: '개발자 문서',
    external: true,
  },
]

// Navigation utilities
export const navigationUtils = {
  /**
   * Find navigation item by ID
   */
  findById(
    id: string,
    items: NavigationItem[] = mainNavigation
  ): NavigationItem | null {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const found = this.findById(id, item.children)
        if (found) return found
      }
    }
    return null
  },

  /**
   * Find navigation item by href
   */
  findByHref(
    href: string,
    items: NavigationItem[] = mainNavigation
  ): NavigationItem | null {
    for (const item of items) {
      if (item.href === href) return item
      if (item.children) {
        const found = this.findByHref(href, item.children)
        if (found) return found
      }
    }
    return null
  },

  /**
   * Check if user has access to navigation item
   */
  hasAccess(
    item: NavigationItem,
    user: { id: string; roles?: string[] } | null
  ): boolean {
    if (!item.requireAuth) return true
    if (!user) return false
    if (!item.roles || item.roles.length === 0) return true
    return item.roles.some(role => user.roles?.includes(role))
  },

  /**
   * Filter navigation items by user access
   */
  filterByAccess(
    items: NavigationItem[],
    user: { id: string; roles?: string[] } | null
  ): NavigationItem[] {
    return items.filter(item => this.hasAccess(item, user))
  },

  /**
   * Get breadcrumbs for current path
   */
  getBreadcrumbs(pathname: string): NavigationItem[] {
    return (
      breadcrumbConfig[pathname] || [{ id: 'home', label: '홈', href: '/' }]
    )
  },

  /**
   * Check if path is active
   */
  isActive(itemHref: string, currentPath: string): boolean {
    if (itemHref === '/') return currentPath === '/'
    return currentPath.startsWith(itemHref)
  },
}
