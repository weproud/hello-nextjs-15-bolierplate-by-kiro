import { AuthError } from 'next-auth'
import {
  AuthenticationError,
  AuthorizationError,
  ActionError,
  ActionLogger,
  type AppError,
} from './error-handling'

/**
 * NextAuth 에러 타입
 */
export type NextAuthErrorType =
  | 'Configuration'
  | 'AccessDenied'
  | 'Verification'
  | 'OAuthSignin'
  | 'OAuthCallback'
  | 'OAuthCreateAccount'
  | 'EmailCreateAccount'
  | 'Callback'
  | 'OAuthAccountNotLinked'
  | 'EmailSignin'
  | 'CredentialsSignin'
  | 'SessionRequired'

/**
 * 인증 에러 컨텍스트
 */
export interface AuthErrorContext {
  provider?: string
  method?: string
  url?: string
  userAgent?: string
  timestamp: Date
  requestId?: string
}

/**
 * NextAuth 에러를 앱 에러로 변환
 */
export function transformAuthError(
  error: AuthError | Error | unknown,
  context?: Partial<AuthErrorContext>
): AppError {
  const fullContext: AuthErrorContext = {
    timestamp: new Date(),
    requestId: crypto.randomUUID(),
    ...context,
  }

  // NextAuth 에러 처리
  if (error instanceof AuthError) {
    return handleNextAuthError(error, fullContext)
  }

  // 일반 에러 처리
  if (error instanceof Error) {
    return handleGenericAuthError(error, fullContext)
  }

  // 알 수 없는 에러
  return new AuthenticationError('알 수 없는 인증 오류가 발생했습니다.')
}

/**
 * NextAuth 에러 처리
 */
function handleNextAuthError(
  error: AuthError,
  context: AuthErrorContext
): AppError {
  const errorType = error.type as NextAuthErrorType

  switch (errorType) {
    case 'Configuration':
      ActionLogger.error(
        'auth',
        'Authentication configuration error',
        error,
        context
      )
      return new ActionError(
        '인증 시스템 설정에 문제가 있습니다. 관리자에게 문의하세요.',
        { type: 'configuration', originalError: error.message }
      )

    case 'AccessDenied':
      ActionLogger.warn('auth', 'Access denied', error, context)
      return new AuthorizationError('접근이 거부되었습니다.')

    case 'Verification':
      ActionLogger.warn('auth', 'Verification failed', error, context)
      return new AuthenticationError(
        '이메일 인증에 실패했습니다. 인증 링크를 확인해 주세요.'
      )

    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'OAuthCreateAccount':
      ActionLogger.error('auth', `OAuth error: ${errorType}`, error, {
        ...context,
        provider: context.provider,
      })
      return new AuthenticationError(
        `${getProviderDisplayName(context.provider)} 로그인 중 오류가 발생했습니다. 다시 시도해 주세요.`
      )

    case 'OAuthAccountNotLinked':
      ActionLogger.warn('auth', 'OAuth account not linked', error, context)
      return new AuthenticationError(
        '이미 다른 방법으로 가입된 계정입니다. 기존 로그인 방법을 사용해 주세요.'
      )

    case 'EmailCreateAccount':
    case 'EmailSignin':
      ActionLogger.error(
        'auth',
        `Email auth error: ${errorType}`,
        error,
        context
      )
      return new AuthenticationError(
        '이메일 인증 중 오류가 발생했습니다. 이메일 주소를 확인해 주세요.'
      )

    case 'CredentialsSignin':
      ActionLogger.warn('auth', 'Credentials signin failed', error, context)
      return new AuthenticationError(
        '로그인 정보가 올바르지 않습니다. 다시 확인해 주세요.'
      )

    case 'SessionRequired':
      ActionLogger.warn('auth', 'Session required', error, context)
      return new AuthenticationError('로그인이 필요합니다.')

    case 'Callback':
      ActionLogger.error('auth', 'Callback error', error, context)
      return new AuthenticationError(
        '인증 콜백 처리 중 오류가 발생했습니다. 다시 시도해 주세요.'
      )

    default:
      ActionLogger.error('auth', 'Unknown NextAuth error', error, context)
      return new AuthenticationError(
        '인증 중 알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.'
      )
  }
}

/**
 * 일반 인증 에러 처리
 */
function handleGenericAuthError(
  error: Error,
  context: AuthErrorContext
): AppError {
  ActionLogger.error('auth', 'Generic auth error', error, context)

  // 특정 에러 메시지 패턴 확인
  const message = error.message.toLowerCase()

  if (message.includes('unauthorized') || message.includes('401')) {
    return new AuthenticationError('인증이 필요합니다.')
  }

  if (message.includes('forbidden') || message.includes('403')) {
    return new AuthorizationError('권한이 없습니다.')
  }

  if (message.includes('token') && message.includes('expired')) {
    return new AuthenticationError(
      '인증 토큰이 만료되었습니다. 다시 로그인해 주세요.'
    )
  }

  if (message.includes('invalid') && message.includes('token')) {
    return new AuthenticationError(
      '유효하지 않은 인증 토큰입니다. 다시 로그인해 주세요.'
    )
  }

  // 기본 인증 에러
  return new AuthenticationError(
    process.env.NODE_ENV === 'development'
      ? error.message
      : '인증 중 오류가 발생했습니다. 다시 시도해 주세요.'
  )
}

/**
 * 프로바이더 표시 이름 반환
 */
function getProviderDisplayName(provider?: string): string {
  switch (provider?.toLowerCase()) {
    case 'google':
      return 'Google'
    case 'github':
      return 'GitHub'
    case 'facebook':
      return 'Facebook'
    case 'twitter':
      return 'Twitter'
    case 'discord':
      return 'Discord'
    default:
      return '소셜'
  }
}

/**
 * 인증 에러 리포팅
 */
export async function reportAuthError(
  error: AppError,
  context: AuthErrorContext
): Promise<void> {
  try {
    const errorReport = {
      type: 'authentication_error',
      message: error.message,
      code: error.code,
      context: {
        provider: context.provider,
        method: context.method,
        url: context.url,
        userAgent: context.userAgent,
        timestamp: context.timestamp.toISOString(),
        requestId: context.requestId,
      },
      severity: determineAuthErrorSeverity(error),
    }

    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth Error Report:', errorReport)
    }

    // 프로덕션 환경에서는 외부 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // TODO: 실제 에러 리포팅 서비스 연동
      // await sendToErrorReportingService(errorReport)
    }
  } catch (reportingError) {
    console.error('Failed to report auth error:', reportingError)
  }
}

/**
 * 인증 에러 심각도 결정
 */
function determineAuthErrorSeverity(
  error: AppError
): 'low' | 'medium' | 'high' | 'critical' {
  if (error instanceof AuthenticationError) {
    // 일반적인 인증 실패는 낮은 심각도
    if (
      error.message.includes('로그인이 필요') ||
      error.message.includes('인증이 필요')
    ) {
      return 'low'
    }
    // 토큰 관련 문제는 중간 심각도
    if (error.message.includes('토큰')) {
      return 'medium'
    }
    return 'medium'
  }

  if (error instanceof AuthorizationError) {
    return 'medium'
  }

  if (error instanceof ActionError) {
    // 설정 오류는 높은 심각도
    if (error.message.includes('설정')) {
      return 'high'
    }
    return 'medium'
  }

  return 'high'
}

/**
 * 인증 상태 확인 유틸리티
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError
}

/**
 * 인증 재시도 가능 여부 확인
 */
export function isRetryableAuthError(error: AppError): boolean {
  // 설정 오류나 권한 오류는 재시도 불가
  if (error instanceof AuthorizationError) {
    return false
  }

  if (error instanceof ActionError && error.message.includes('설정')) {
    return false
  }

  // 네트워크 관련 오류는 재시도 가능
  if (error.message.includes('네트워크') || error.message.includes('연결')) {
    return true
  }

  // 일시적인 서비스 오류는 재시도 가능
  if (error.message.includes('일시적') || error.message.includes('다시 시도')) {
    return true
  }

  return false
}

/**
 * 인증 에러 복구 제안
 */
export function getAuthErrorRecoveryActions(error: AppError): Array<{
  id: string
  label: string
  action: string
  primary?: boolean
}> {
  const actions: Array<{
    id: string
    label: string
    action: string
    primary?: boolean
  }> = []

  if (error instanceof AuthenticationError) {
    if (
      error.message.includes('로그인이 필요') ||
      error.message.includes('인증이 필요')
    ) {
      actions.push({
        id: 'signin',
        label: '로그인하기',
        action: 'redirect:/auth/signin',
        primary: true,
      })
    } else if (error.message.includes('토큰')) {
      actions.push({
        id: 'refresh',
        label: '새로고침',
        action: 'refresh',
        primary: true,
      })
      actions.push({
        id: 'signin',
        label: '다시 로그인',
        action: 'redirect:/auth/signin',
      })
    } else {
      actions.push({
        id: 'retry',
        label: '다시 시도',
        action: 'retry',
        primary: true,
      })
    }
  }

  if (error instanceof AuthorizationError) {
    actions.push({
      id: 'home',
      label: '홈으로 이동',
      action: 'redirect:/',
      primary: true,
    })
  }

  // 기본 액션
  if (actions.length === 0) {
    actions.push({
      id: 'retry',
      label: '다시 시도',
      action: 'retry',
      primary: true,
    })
  }

  return actions
}
