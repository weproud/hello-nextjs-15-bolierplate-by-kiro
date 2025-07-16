/**
 * Internationalization (i18n) Configuration
 *
 * Basic i18n setup for future multilingual support.
 * Currently supports Korean (ko) and English (en).
 */

// Supported locales
export const LOCALES = ['ko', 'en'] as const
export type Locale = (typeof LOCALES)[number]

// Default locale
export const DEFAULT_LOCALE: Locale = 'ko'

// Locale labels
export const LOCALE_LABELS: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
}

// Translation keys type (for type safety)
export interface TranslationKeys {
  common: {
    loading: string
    error: string
    success: string
    cancel: string
    confirm: string
    save: string
    delete: string
    edit: string
    create: string
    update: string
    search: string
    filter: string
    sort: string
    next: string
    previous: string
    page: string
    of: string
    total: string
    noData: string
    noResults: string
  }
  auth: {
    signIn: string
    signOut: string
    signUp: string
    email: string
    password: string
    name: string
    forgotPassword: string
    resetPassword: string
    confirmPassword: string
    rememberMe: string
    welcomeBack: string
    createAccount: string
  }
  navigation: {
    home: string
    dashboard: string
    projects: string
    profile: string
    settings: string
    help: string
    about: string
    contact: string
  }
  projects: {
    title: string
    description: string
    createProject: string
    editProject: string
    deleteProject: string
    duplicateProject: string
    projectCreated: string
    projectUpdated: string
    projectDeleted: string
    noProjects: string
    phases: string
    createdAt: string
    updatedAt: string
  }
  forms: {
    required: string
    invalid: string
    tooShort: string
    tooLong: string
    invalidEmail: string
    invalidPhone: string
    passwordMismatch: string
    fileTooLarge: string
    invalidFileType: string
    uploadSuccess: string
    uploadFailed: string
  }
  errors: {
    generic: string
    network: string
    unauthorized: string
    forbidden: string
    notFound: string
    validation: string
    server: string
  }
}

// Korean translations
const ko: TranslationKeys = {
  common: {
    loading: '로딩 중...',
    error: '오류',
    success: '성공',
    cancel: '취소',
    confirm: '확인',
    save: '저장',
    delete: '삭제',
    edit: '수정',
    create: '생성',
    update: '업데이트',
    search: '검색',
    filter: '필터',
    sort: '정렬',
    next: '다음',
    previous: '이전',
    page: '페이지',
    of: '/',
    total: '총',
    noData: '데이터가 없습니다',
    noResults: '검색 결과가 없습니다',
  },
  auth: {
    signIn: '로그인',
    signOut: '로그아웃',
    signUp: '회원가입',
    email: '이메일',
    password: '비밀번호',
    name: '이름',
    forgotPassword: '비밀번호 찾기',
    resetPassword: '비밀번호 재설정',
    confirmPassword: '비밀번호 확인',
    rememberMe: '로그인 상태 유지',
    welcomeBack: '다시 오신 것을 환영합니다',
    createAccount: '계정 만들기',
  },
  navigation: {
    home: '홈',
    dashboard: '대시보드',
    projects: '프로젝트',
    profile: '프로필',
    settings: '설정',
    help: '도움말',
    about: '소개',
    contact: '문의',
  },
  projects: {
    title: '제목',
    description: '설명',
    createProject: '프로젝트 생성',
    editProject: '프로젝트 수정',
    deleteProject: '프로젝트 삭제',
    duplicateProject: '프로젝트 복사',
    projectCreated: '프로젝트가 생성되었습니다',
    projectUpdated: '프로젝트가 수정되었습니다',
    projectDeleted: '프로젝트가 삭제되었습니다',
    noProjects: '프로젝트가 없습니다',
    phases: '단계',
    createdAt: '생성일',
    updatedAt: '수정일',
  },
  forms: {
    required: '필수 입력 항목입니다',
    invalid: '올바르지 않은 형식입니다',
    tooShort: '너무 짧습니다',
    tooLong: '너무 깁니다',
    invalidEmail: '올바른 이메일 주소를 입력해주세요',
    invalidPhone: '올바른 전화번호를 입력해주세요',
    passwordMismatch: '비밀번호가 일치하지 않습니다',
    fileTooLarge: '파일 크기가 너무 큽니다',
    invalidFileType: '지원하지 않는 파일 형식입니다',
    uploadSuccess: '파일이 업로드되었습니다',
    uploadFailed: '파일 업로드에 실패했습니다',
  },
  errors: {
    generic: '알 수 없는 오류가 발생했습니다',
    network: '네트워크 연결을 확인해주세요',
    unauthorized: '로그인이 필요합니다',
    forbidden: '권한이 없습니다',
    notFound: '요청한 리소스를 찾을 수 없습니다',
    validation: '입력값을 확인해주세요',
    server: '서버 오류가 발생했습니다',
  },
}

// English translations
const en: TranslationKeys = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    next: 'Next',
    previous: 'Previous',
    page: 'Page',
    of: 'of',
    total: 'Total',
    noData: 'No data available',
    noResults: 'No results found',
  },
  auth: {
    signIn: 'Sign In',
    signOut: 'Sign Out',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    forgotPassword: 'Forgot Password',
    resetPassword: 'Reset Password',
    confirmPassword: 'Confirm Password',
    rememberMe: 'Remember Me',
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Account',
  },
  navigation: {
    home: 'Home',
    dashboard: 'Dashboard',
    projects: 'Projects',
    profile: 'Profile',
    settings: 'Settings',
    help: 'Help',
    about: 'About',
    contact: 'Contact',
  },
  projects: {
    title: 'Title',
    description: 'Description',
    createProject: 'Create Project',
    editProject: 'Edit Project',
    deleteProject: 'Delete Project',
    duplicateProject: 'Duplicate Project',
    projectCreated: 'Project created successfully',
    projectUpdated: 'Project updated successfully',
    projectDeleted: 'Project deleted successfully',
    noProjects: 'No projects found',
    phases: 'Phases',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
  },
  forms: {
    required: 'This field is required',
    invalid: 'Invalid format',
    tooShort: 'Too short',
    tooLong: 'Too long',
    invalidEmail: 'Please enter a valid email address',
    invalidPhone: 'Please enter a valid phone number',
    passwordMismatch: 'Passwords do not match',
    fileTooLarge: 'File size is too large',
    invalidFileType: 'File type is not supported',
    uploadSuccess: 'File uploaded successfully',
    uploadFailed: 'File upload failed',
  },
  errors: {
    generic: 'An unknown error occurred',
    network: 'Please check your network connection',
    unauthorized: 'Authentication required',
    forbidden: 'Access denied',
    notFound: 'Requested resource not found',
    validation: 'Please check your input',
    server: 'Server error occurred',
  },
}

// Translations object
export const translations: Record<Locale, TranslationKeys> = {
  ko,
  en,
}

// Translation utility functions
export const i18nUtils = {
  /**
   * Get translation for a key
   */
  t(key: string, locale: Locale = DEFAULT_LOCALE): string {
    const keys = key.split('.')
    let value: any = translations[locale]

    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }

    return value || key
  },

  /**
   * Get translation with interpolation
   */
  tWithParams(
    key: string,
    params: Record<string, string | number>,
    locale: Locale = DEFAULT_LOCALE
  ): string {
    let translation = this.t(key, locale)

    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(`{{${param}}}`, String(value))
    })

    return translation
  },

  /**
   * Check if locale is supported
   */
  isValidLocale(locale: string): locale is Locale {
    return LOCALES.includes(locale as Locale)
  },

  /**
   * Get browser locale
   */
  getBrowserLocale(): Locale {
    if (typeof window === 'undefined') return DEFAULT_LOCALE

    const browserLocale = navigator.language.split('-')[0]
    return this.isValidLocale(browserLocale) ? browserLocale : DEFAULT_LOCALE
  },

  /**
   * Format number according to locale
   */
  formatNumber(number: number, locale: Locale = DEFAULT_LOCALE): string {
    return new Intl.NumberFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(
      number
    )
  },

  /**
   * Format date according to locale
   */
  formatDate(date: Date, locale: Locale = DEFAULT_LOCALE): string {
    return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US').format(
      date
    )
  },

  /**
   * Format relative time according to locale
   */
  formatRelativeTime(date: Date, locale: Locale = DEFAULT_LOCALE): string {
    const rtf = new Intl.RelativeTimeFormat(
      locale === 'ko' ? 'ko-KR' : 'en-US',
      {
        numeric: 'auto',
      }
    )

    const now = new Date()
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000)

    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(diffInSeconds, 'second')
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (Math.abs(diffInMinutes) < 60) {
      return rtf.format(diffInMinutes, 'minute')
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (Math.abs(diffInHours) < 24) {
      return rtf.format(diffInHours, 'hour')
    }

    const diffInDays = Math.floor(diffInHours / 24)
    return rtf.format(diffInDays, 'day')
  },
}

// Export default translation function
export const t = i18nUtils.t
