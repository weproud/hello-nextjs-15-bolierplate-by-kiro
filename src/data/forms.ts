/**
 * Form Configuration Data
 *
 * Static data and configurations for forms
 * used throughout the application.
 */

// Form field types
export const FORM_FIELD_TYPES = [
  'text',
  'email',
  'password',
  'number',
  'tel',
  'url',
  'textarea',
  'select',
  'checkbox',
  'radio',
  'file',
  'date',
  'datetime-local',
  'time',
] as const

export type FormFieldType = (typeof FORM_FIELD_TYPES)[number]

// Validation rules interface
export interface ValidationRules {
  required?: boolean
  pattern?: RegExp
  patternMessage?: string
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
}

// Common form options
export const FORM_OPTIONS = {
  // Priority levels
  priority: [
    { value: 'low', label: '낮음' },
    { value: 'medium', label: '보통' },
    { value: 'high', label: '높음' },
  ],

  // Project categories
  projectCategories: [
    { value: 'web', label: '웹 개발' },
    { value: 'mobile', label: '모바일 앱' },
    { value: 'desktop', label: '데스크톱 앱' },
    { value: 'api', label: 'API 개발' },
    { value: 'design', label: '디자인' },
    { value: 'marketing', label: '마케팅' },
    { value: 'other', label: '기타' },
  ],

  // Contact subjects
  contactSubjects: [
    { value: 'general', label: '일반 문의' },
    { value: 'technical', label: '기술 지원' },
    { value: 'billing', label: '결제 문의' },
    { value: 'feature', label: '기능 요청' },
    { value: 'bug', label: '버그 신고' },
    { value: 'partnership', label: '파트너십' },
  ],

  // Feedback types
  feedbackTypes: [
    { value: 'bug', label: '버그 신고' },
    { value: 'feature', label: '기능 요청' },
    { value: 'improvement', label: '개선 제안' },
    { value: 'other', label: '기타' },
  ],

  // User roles
  userRoles: [
    { value: 'admin', label: '관리자' },
    { value: 'member', label: '멤버' },
    { value: 'viewer', label: '뷰어' },
  ],

  // Newsletter preferences
  newsletterPreferences: [
    { value: 'tech', label: '기술' },
    { value: 'design', label: '디자인' },
    { value: 'business', label: '비즈니스' },
    { value: 'marketing', label: '마케팅' },
  ],

  // Newsletter frequency
  newsletterFrequency: [
    { value: 'daily', label: '매일' },
    { value: 'weekly', label: '매주' },
    { value: 'monthly', label: '매월' },
  ],

  // File categories
  fileCategories: [
    { value: 'avatar', label: '프로필 이미지' },
    { value: 'document', label: '문서' },
    { value: 'image', label: '일반 이미지' },
  ],

  // Sort options
  sortOptions: [
    { value: 'title', label: '제목' },
    { value: 'createdAt', label: '생성일' },
    { value: 'updatedAt', label: '수정일' },
  ],

  // Sort order
  sortOrder: [
    { value: 'asc', label: '오름차순' },
    { value: 'desc', label: '내림차순' },
  ],

  // Countries (sample)
  countries: [
    { value: 'KR', label: '대한민국' },
    { value: 'US', label: '미국' },
    { value: 'JP', label: '일본' },
    { value: 'CN', label: '중국' },
    { value: 'GB', label: '영국' },
    { value: 'DE', label: '독일' },
    { value: 'FR', label: '프랑스' },
  ],

  // Languages
  languages: [
    { value: 'ko', label: '한국어' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'zh', label: '中文' },
  ],

  // Time zones (sample)
  timeZones: [
    { value: 'Asia/Seoul', label: '서울 (KST)' },
    { value: 'America/New_York', label: '뉴욕 (EST)' },
    { value: 'Europe/London', label: '런던 (GMT)' },
    { value: 'Asia/Tokyo', label: '도쿄 (JST)' },
  ],
}

// Form validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/,
  url: /^https?:\/\/.+/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  creditCard: /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
  cvv: /^\d{3,4}$/,
  expiryDate: /^(0[1-9]|1[0-2])\/\d{2}$/,
}

// Form validation messages
export const VALIDATION_MESSAGES = {
  required: '필수 입력 항목입니다.',
  email: '올바른 이메일 주소를 입력해주세요.',
  phone: '올바른 전화번호를 입력해주세요.',
  url: '올바른 URL을 입력해주세요.',
  password: '비밀번호는 대문자, 소문자, 숫자를 포함하여 8자 이상이어야 합니다.',
  passwordMismatch: '비밀번호가 일치하지 않습니다.',
  minLength: (min: number) => `최소 ${min}자 이상 입력해주세요.`,
  maxLength: (max: number) => `최대 ${max}자까지 입력 가능합니다.`,
  min: (min: number) => `최소값은 ${min}입니다.`,
  max: (max: number) => `최대값은 ${max}입니다.`,
  fileSize: (size: string) => `파일 크기는 ${size} 이하여야 합니다.`,
  fileType: (types: string) => `지원되는 파일 형식: ${types}`,
}

// Common form configurations
export const FORM_CONFIGS = {
  // Contact form
  contact: {
    fields: [
      {
        name: 'name',
        type: 'text' as const,
        label: '이름',
        required: true,
        placeholder: '이름을 입력하세요',
      },
      {
        name: 'email',
        type: 'email' as const,
        label: '이메일',
        required: true,
        placeholder: '이메일 주소를 입력하세요',
      },
      {
        name: 'subject',
        type: 'select' as const,
        label: '문의 유형',
        required: true,
        options: FORM_OPTIONS.contactSubjects,
      },
      {
        name: 'message',
        type: 'textarea' as const,
        label: '메시지',
        required: true,
        placeholder: '문의 내용을 입력하세요',
        rows: 5,
      },
    ],
  },

  // Project form
  project: {
    fields: [
      {
        name: 'title',
        type: 'text' as const,
        label: '프로젝트 제목',
        required: true,
        placeholder: '프로젝트 제목을 입력하세요',
        maxLength: 255,
      },
      {
        name: 'description',
        type: 'textarea' as const,
        label: '프로젝트 설명',
        required: false,
        placeholder: '프로젝트에 대한 설명을 입력하세요',
        rows: 4,
        maxLength: 1000,
      },
      {
        name: 'category',
        type: 'select' as const,
        label: '카테고리',
        required: false,
        options: FORM_OPTIONS.projectCategories,
      },
      {
        name: 'priority',
        type: 'select' as const,
        label: '우선순위',
        required: false,
        options: FORM_OPTIONS.priority,
        defaultValue: 'medium',
      },
    ],
  },

  // User profile form
  profile: {
    fields: [
      {
        name: 'name',
        type: 'text' as const,
        label: '이름',
        required: true,
        placeholder: '이름을 입력하세요',
        maxLength: 50,
      },
      {
        name: 'email',
        type: 'email' as const,
        label: '이메일',
        required: true,
        placeholder: '이메일 주소를 입력하세요',
      },
      {
        name: 'phone',
        type: 'tel' as const,
        label: '전화번호',
        required: false,
        placeholder: '010-1234-5678',
      },
      {
        name: 'bio',
        type: 'textarea' as const,
        label: '자기소개',
        required: false,
        placeholder: '간단한 자기소개를 입력하세요',
        rows: 3,
        maxLength: 500,
      },
      {
        name: 'website',
        type: 'url' as const,
        label: '웹사이트',
        required: false,
        placeholder: 'https://example.com',
      },
      {
        name: 'location',
        type: 'text' as const,
        label: '위치',
        required: false,
        placeholder: '서울, 대한민국',
        maxLength: 100,
      },
    ],
  },

  // Newsletter subscription form
  newsletter: {
    fields: [
      {
        name: 'email',
        type: 'email' as const,
        label: '이메일',
        required: true,
        placeholder: '이메일 주소를 입력하세요',
      },
      {
        name: 'preferences',
        type: 'checkbox' as const,
        label: '관심사',
        required: true,
        options: FORM_OPTIONS.newsletterPreferences,
      },
      {
        name: 'frequency',
        type: 'radio' as const,
        label: '수신 빈도',
        required: true,
        options: FORM_OPTIONS.newsletterFrequency,
        defaultValue: 'weekly',
      },
    ],
  },
}

// Form utilities
export const formUtils = {
  /**
   * Get form configuration by name
   */
  getConfig(name: keyof typeof FORM_CONFIGS) {
    return FORM_CONFIGS[name]
  },

  /**
   * Get validation message
   */
  getValidationMessage(
    type: keyof typeof VALIDATION_MESSAGES,
    ...args: (string | number)[]
  ) {
    const message = VALIDATION_MESSAGES[type]
    return typeof message === 'function' ? message(...args) : message
  },

  /**
   * Validate field value
   */
  validateField(value: unknown, rules: ValidationRules) {
    const errors: string[] = []

    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push(VALIDATION_MESSAGES.required)
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
      errors.push(rules.patternMessage || '올바른 형식이 아닙니다.')
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      errors.push(VALIDATION_MESSAGES.minLength(rules.minLength))
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors.push(VALIDATION_MESSAGES.maxLength(rules.maxLength))
    }

    return errors
  },

  /**
   * Generate form field ID
   */
  generateFieldId(formName: string, fieldName: string) {
    return `${formName}-${fieldName}`
  },

  /**
   * Format form data for submission
   */
  formatFormData(data: Record<string, any>) {
    const formatted: Record<string, any> = {}

    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        formatted[key] = value
      }
    })

    return formatted
  },
}
