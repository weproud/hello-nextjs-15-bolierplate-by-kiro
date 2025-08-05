/**
 * 표준화된 에러 타입 정의
 *
 * 애플리케이션 전반에서 사용되는 에러 타입들을 정의하고
 * 각 에러에 대한 사용자 친화적 메시지와 복구 옵션을 제공합니다.
 */

import { type ErrorSeverity, type ErrorType } from '@/lib/error-handler'

export interface ErrorTypeDefinition {
  type: ErrorType
  severity: ErrorSeverity
  retryable: boolean
  userMessage: string
  actionMessage: string
  icon: string
  color: string
  recoveryOptions: RecoveryOption[]
}

export interface RecoveryOption {
  id: string
  label: string
  action: 'retry' | 'reload' | 'redirect' | 'dismiss' | 'contact'
  primary?: boolean
  href?: string
  onClick?: () => void
}

/**
 * 표준화된 에러 타입 정의
 */
export const ERROR_TYPE_DEFINITIONS: Record<ErrorType, ErrorTypeDefinition> = {
  validation: {
    type: 'validation',
    severity: 'medium',
    retryable: false,
    userMessage: '입력하신 정보에 문제가 있습니다',
    actionMessage: '입력 내용을 확인하고 다시 시도해주세요',
    icon: 'AlertCircle',
    color: 'yellow',
    recoveryOptions: [
      {
        id: 'fix-input',
        label: '입력 수정',
        action: 'dismiss',
        primary: true,
      },
      {
        id: 'reset-form',
        label: '양식 초기화',
        action: 'reload',
      },
    ],
  },

  network: {
    type: 'network',
    severity: 'high',
    retryable: true,
    userMessage: '네트워크 연결에 문제가 있습니다',
    actionMessage: '인터넷 연결을 확인하고 다시 시도해주세요',
    icon: 'Wifi',
    color: 'red',
    recoveryOptions: [
      {
        id: 'retry-network',
        label: '다시 시도',
        action: 'retry',
        primary: true,
      },
      {
        id: 'check-connection',
        label: '연결 확인',
        action: 'dismiss',
      },
      {
        id: 'offline-mode',
        label: '오프라인 모드',
        action: 'dismiss',
      },
    ],
  },

  auth: {
    type: 'auth',
    severity: 'high',
    retryable: false,
    userMessage: '인증에 문제가 발생했습니다',
    actionMessage: '다시 로그인하거나 권한을 확인해주세요',
    icon: 'Lock',
    color: 'red',
    recoveryOptions: [
      {
        id: 'login',
        label: '로그인',
        action: 'redirect',
        href: '/auth/signin',
        primary: true,
      },
      {
        id: 'home',
        label: '홈으로',
        action: 'redirect',
        href: '/',
      },
    ],
  },

  database: {
    type: 'database',
    severity: 'critical',
    retryable: true,
    userMessage: '데이터 처리 중 문제가 발생했습니다',
    actionMessage: '잠시 후 다시 시도해주세요',
    icon: 'Database',
    color: 'red',
    recoveryOptions: [
      {
        id: 'retry-db',
        label: '다시 시도',
        action: 'retry',
        primary: true,
      },
      {
        id: 'reload-page',
        label: '페이지 새로고침',
        action: 'reload',
      },
      {
        id: 'contact-support',
        label: '고객지원 문의',
        action: 'contact',
      },
    ],
  },

  permission: {
    type: 'permission',
    severity: 'medium',
    retryable: false,
    userMessage: '이 작업을 수행할 권한이 없습니다',
    actionMessage: '관리자에게 문의하거나 다른 계정으로 로그인해주세요',
    icon: 'Shield',
    color: 'yellow',
    recoveryOptions: [
      {
        id: 'login-different',
        label: '다른 계정으로 로그인',
        action: 'redirect',
        href: '/auth/signin',
        primary: true,
      },
      {
        id: 'contact-admin',
        label: '관리자 문의',
        action: 'contact',
      },
      {
        id: 'go-back',
        label: '이전 페이지',
        action: 'dismiss',
      },
    ],
  },

  unknown: {
    type: 'unknown',
    severity: 'medium',
    retryable: true,
    userMessage: '예상치 못한 문제가 발생했습니다',
    actionMessage: '잠시 후 다시 시도하거나 고객지원에 문의해주세요',
    icon: 'AlertTriangle',
    color: 'gray',
    recoveryOptions: [
      {
        id: 'retry-unknown',
        label: '다시 시도',
        action: 'retry',
        primary: true,
      },
      {
        id: 'reload-unknown',
        label: '페이지 새로고침',
        action: 'reload',
      },
      {
        id: 'home-unknown',
        label: '홈으로',
        action: 'redirect',
        href: '/',
      },
      {
        id: 'contact-unknown',
        label: '고객지원 문의',
        action: 'contact',
      },
    ],
  },
}

/**
 * 컨텍스트별 에러 메시지 커스터마이징
 */
export interface ErrorContext {
  component?: string
  action?: string
  route?: string
  userRole?: string
}

export function getContextualErrorMessage(
  errorType: ErrorType,
  context?: ErrorContext
): { userMessage: string; actionMessage: string } {
  const baseDefinition = ERROR_TYPE_DEFINITIONS[errorType]

  // 컨텍스트에 따른 메시지 커스터마이징
  if (context?.component === 'form' && errorType === 'validation') {
    return {
      userMessage: '양식 입력에 오류가 있습니다',
      actionMessage: '빨간색으로 표시된 필드를 확인해주세요',
    }
  }

  if (context?.component === 'modal' && errorType === 'network') {
    return {
      userMessage: '모달을 불러올 수 없습니다',
      actionMessage: '네트워크 연결을 확인하고 다시 시도해주세요',
    }
  }

  if (context?.action === 'save' && errorType === 'database') {
    return {
      userMessage: '저장 중 문제가 발생했습니다',
      actionMessage:
        '변경사항이 저장되지 않았을 수 있습니다. 다시 시도해주세요',
    }
  }

  if (context?.action === 'delete' && errorType === 'permission') {
    return {
      userMessage: '삭제 권한이 없습니다',
      actionMessage:
        '이 항목을 삭제할 권한이 없습니다. 관리자에게 문의해주세요',
    }
  }

  return {
    userMessage: baseDefinition.userMessage,
    actionMessage: baseDefinition.actionMessage,
  }
}

/**
 * 에러 심각도별 UI 스타일
 */
export const ERROR_SEVERITY_STYLES = {
  low: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600',
  },
  medium: {
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600',
  },
  high: {
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    iconColor: 'text-orange-600',
  },
  critical: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-600',
  },
}

/**
 * 에러 타입별 아이콘 매핑
 */
export const ERROR_TYPE_ICONS = {
  validation: 'AlertCircle',
  network: 'WifiOff',
  auth: 'Lock',
  database: 'Database',
  permission: 'Shield',
  unknown: 'AlertTriangle',
} as const

/**
 * 사용자 친화적 에러 메시지 생성 함수
 */
export function createUserFriendlyErrorMessage(
  errorType: ErrorType,
  originalMessage?: string,
  context?: ErrorContext
): {
  title: string
  message: string
  actionMessage: string
  severity: ErrorSeverity
  recoveryOptions: RecoveryOption[]
} {
  const definition = ERROR_TYPE_DEFINITIONS[errorType]
  const contextualMessages = getContextualErrorMessage(errorType, context)

  return {
    title: contextualMessages.userMessage,
    message: originalMessage || definition.userMessage,
    actionMessage: contextualMessages.actionMessage,
    severity: definition.severity,
    recoveryOptions: definition.recoveryOptions,
  }
}

/**
 * 에러 분류 개선 함수
 */
export function classifyErrorAdvanced(
  error: Error,
  context?: ErrorContext
): ErrorType {
  const message = error.message.toLowerCase()
  const name = error.name.toLowerCase()
  const stack = error.stack?.toLowerCase() || ''

  // 네트워크 에러 (더 정확한 분류)
  if (
    message.includes('network error') ||
    message.includes('failed to fetch') ||
    message.includes('connection refused') ||
    message.includes('timeout') ||
    message.includes('cors') ||
    name.includes('networkerror') ||
    (name.includes('typeerror') && message.includes('fetch'))
  ) {
    return 'network'
  }

  // 인증 에러 (JWT, OAuth 등 포함)
  if (
    message.includes('unauthorized') ||
    message.includes('authentication') ||
    message.includes('jwt') ||
    message.includes('token') ||
    message.includes('oauth') ||
    message.includes('session expired') ||
    name.includes('autherror') ||
    stack.includes('auth')
  ) {
    return 'auth'
  }

  // 권한 에러
  if (
    message.includes('forbidden') ||
    message.includes('permission denied') ||
    message.includes('access denied') ||
    message.includes('not authorized') ||
    message.includes('insufficient privileges')
  ) {
    return 'permission'
  }

  // 유효성 검사 에러 (Zod, Joi 등 포함)
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required') ||
    message.includes('must be') ||
    message.includes('expected') ||
    name.includes('validationerror') ||
    name.includes('zodError') ||
    stack.includes('zod') ||
    stack.includes('joi')
  ) {
    return 'validation'
  }

  // 데이터베이스 에러 (Prisma, MongoDB 등 포함)
  if (
    message.includes('database') ||
    message.includes('connection') ||
    message.includes('query') ||
    message.includes('transaction') ||
    message.includes('constraint') ||
    message.includes('duplicate key') ||
    name.includes('prismaerror') ||
    name.includes('databaseerror') ||
    name.includes('mongoerror') ||
    stack.includes('prisma') ||
    stack.includes('mongodb')
  ) {
    return 'database'
  }

  return 'unknown'
}

/**
 * 에러 심각도 결정 개선 함수
 */
export function determineErrorSeverityAdvanced(
  error: Error,
  errorType: ErrorType,
  context?: ErrorContext
): ErrorSeverity {
  const message = error.message.toLowerCase()

  // 컨텍스트 기반 심각도 조정
  if (context?.component === 'payment' || context?.action === 'payment') {
    return 'critical'
  }

  if (context?.component === 'auth' || context?.route?.includes('auth')) {
    return 'high'
  }

  // 에러 타입별 기본 심각도
  const baseDefinition = ERROR_TYPE_DEFINITIONS[errorType]
  let severity = baseDefinition.severity

  // 메시지 내용에 따른 심각도 조정
  if (message.includes('critical') || message.includes('fatal')) {
    severity = 'critical'
  } else if (message.includes('warning') || message.includes('deprecated')) {
    severity = 'low'
  }

  return severity
}

/**
 * 에러 복구 가능성 판단 함수
 */
export function isErrorRecoverable(
  errorType: ErrorType,
  error: Error,
  context?: ErrorContext
): boolean {
  const definition = ERROR_TYPE_DEFINITIONS[errorType]

  // 기본적으로 정의된 재시도 가능성
  if (!definition.retryable) {
    return false
  }

  // 특정 에러 메시지는 복구 불가능
  const message = error.message.toLowerCase()
  const unrecoverableMessages = [
    'not found',
    'does not exist',
    'permanently deleted',
    'quota exceeded',
    'rate limit exceeded',
  ]

  if (unrecoverableMessages.some(msg => message.includes(msg))) {
    return false
  }

  return true
}
