import {
  ActionError,
  ActionLogger,
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
  handleError,
  NotFoundError,
  ValidationError,
} from '@/lib/error-handling'
import { getCurrentSession } from '@/services/auth'
import { createSafeActionClient } from 'next-safe-action'
import { z } from 'zod'

/**
 * 에러 심각도 정의
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

/**
 * 액션 컨텍스트 타입
 */
export interface ActionContext {
  userId?: string
  user?: any
  session?: any
  actionType: 'public' | 'authenticated' | 'admin'
  requestId: string
  timestamp: Date
}

/**
 * 에러 분류 및 심각도 결정
 */
function categorizeError(error: unknown): {
  severity: ErrorSeverity
  category: string
  shouldReport: boolean
} {
  if (error instanceof AuthenticationError) {
    return { severity: 'medium', category: 'auth', shouldReport: false }
  }

  if (error instanceof AuthorizationError) {
    return { severity: 'medium', category: 'auth', shouldReport: true }
  }

  if (error instanceof ValidationError) {
    return { severity: 'low', category: 'validation', shouldReport: false }
  }

  if (error instanceof NotFoundError) {
    return { severity: 'low', category: 'not_found', shouldReport: false }
  }

  if (error instanceof DatabaseError) {
    return { severity: 'high', category: 'database', shouldReport: true }
  }

  if (error instanceof ActionError) {
    return { severity: 'medium', category: 'action', shouldReport: true }
  }

  // 알 수 없는 에러는 심각도 높음으로 처리
  return { severity: 'critical', category: 'unknown', shouldReport: true }
}

/**
 * 사용자 친화적 에러 메시지 생성
 */
function getUserFriendlyMessage(error: unknown, category: string): string {
  if (error instanceof AuthenticationError) {
    return '로그인이 필요합니다. 다시 로그인해 주세요.'
  }

  if (error instanceof AuthorizationError) {
    return '이 작업을 수행할 권한이 없습니다.'
  }

  if (error instanceof ValidationError) {
    return '입력한 정보를 확인해 주세요.'
  }

  if (error instanceof NotFoundError) {
    return '요청한 정보를 찾을 수 없습니다.'
  }

  if (error instanceof DatabaseError) {
    return '데이터 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  }

  if (error instanceof ActionError) {
    return error.message
  }

  // 기본 메시지
  if (process.env.NODE_ENV === 'production') {
    return '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  }

  return error instanceof Error
    ? error.message
    : '알 수 없는 오류가 발생했습니다.'
}

/**
 * 에러 리포팅
 */
async function reportError(
  error: unknown,
  context: ActionContext,
  category: string,
  severity: ErrorSeverity
) {
  try {
    // 에러 정보 구성
    const errorInfo = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      category,
      severity,
      context: {
        userId: context.userId,
        actionType: context.actionType,
        requestId: context.requestId,
        timestamp: context.timestamp.toISOString(),
        userAgent:
          typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url:
          typeof window !== 'undefined'
            ? window.location.href
            : 'server-action',
      },
    }

    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('Server Action Error:', errorInfo)
    }

    // 프로덕션 환경에서는 외부 서비스로 전송
    // TODO: 실제 에러 리포팅 서비스 연동 (Sentry, LogRocket 등)
    if (process.env.NODE_ENV === 'production' && severity === 'critical') {
      // await sendToErrorReportingService(errorInfo)
    }
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError)
  }
}

/**
 * 기본 safe action 클라이언트
 */
export const actionClient = createSafeActionClient({
  defaultValidationErrorsShape: 'flattened',

  handleServerError(error, utils) {
    const { clientInput } = utils
    const requestId = crypto.randomUUID()

    const context: ActionContext = {
      actionType: 'public',
      requestId,
      timestamp: new Date(),
    }

    // 에러 분류
    const { severity, category, shouldReport } = categorizeError(error)

    // 에러 로깅
    ActionLogger.error('base-action', 'Server action failed', error, {
      requestId,
      category,
      severity,
      clientInput:
        process.env.NODE_ENV === 'development' ? clientInput : '[REDACTED]',
    })

    // 에러 리포팅
    if (shouldReport) {
      reportError(error, context, category, severity).catch(console.error)
    }

    // 사용자 친화적 메시지 반환
    return getUserFriendlyMessage(error, category)
  },
})

/**
 * 인증이 필요한 액션 클라이언트
 */
export const authActionClient = actionClient.use(async ({ next }) => {
  const requestId = crypto.randomUUID()
  const timestamp = new Date()

  try {
    // 세션 확인
    const session = await getCurrentSession()

    if (!session?.user) {
      ActionLogger.warn(
        'auth-action',
        'Authentication required but no session found',
        {
          requestId,
          timestamp: timestamp.toISOString(),
        }
      )
      throw new AuthenticationError('로그인이 필요합니다.')
    }

    // 액션 실행 로깅
    ActionLogger.info('auth-action', 'Executing authenticated action', {
      userId: session.user.id,
      userEmail:
        process.env.NODE_ENV === 'development'
          ? session.user.email
          : '[REDACTED]',
      requestId,
      timestamp: timestamp.toISOString(),
    })

    // 컨텍스트 전달
    return next({
      ctx: {
        userId: session.user.id,
        user: session.user,
        session,
        actionType: 'authenticated' as const,
        requestId,
        timestamp,
      },
    })
  } catch (error) {
    // 인증 에러 처리
    const { severity, category, shouldReport } = categorizeError(error)

    ActionLogger.error('auth-action', 'Authentication failed', error, {
      requestId,
      category,
      severity,
    })

    if (shouldReport) {
      const context: ActionContext = {
        actionType: 'authenticated',
        requestId,
        timestamp,
      }
      reportError(error, context, category, severity).catch(console.error)
    }

    throw error
  }
})

/**
 * 관리자 권한이 필요한 액션 클라이언트
 */
export const adminActionClient = authActionClient.use(async ({ next, ctx }) => {
  try {
    // 관리자 권한 확인
    const userRole = (ctx.user as any)?.role
    if (!userRole || userRole !== 'admin') {
      ActionLogger.warn('admin-action', 'Admin access denied', {
        userId: ctx.userId,
        userRole,
        requestId: ctx.requestId,
      })
      throw new AuthorizationError('관리자 권한이 필요합니다.')
    }

    ActionLogger.info('admin-action', 'Executing admin action', {
      userId: ctx.userId,
      requestId: ctx.requestId,
    })

    return next({
      ctx: {
        ...ctx,
        actionType: 'admin' as const,
      },
    })
  } catch (error) {
    const { severity, category, shouldReport } = categorizeError(error)

    ActionLogger.error('admin-action', 'Admin action failed', error, {
      userId: ctx.userId,
      requestId: ctx.requestId,
      category,
      severity,
    })

    if (shouldReport) {
      reportError(error, ctx, category, severity).catch(console.error)
    }

    throw error
  }
})

/**
 * 공개 액션 클라이언트 (명시적)
 */
export const publicActionClient = actionClient.use(async ({ next }) => {
  const requestId = crypto.randomUUID()
  const timestamp = new Date()

  ActionLogger.info('public-action', 'Executing public action', {
    requestId,
    timestamp: timestamp.toISOString(),
  })

  return next({
    ctx: {
      actionType: 'public' as const,
      requestId,
      timestamp,
    },
  })
})

/**
 * 액션 래퍼 유틸리티
 */
export function createAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (input: TInput, ctx: ActionContext) => Promise<TOutput>,
  options: {
    requireAuth?: boolean
    requireAdmin?: boolean
    rateLimit?: { requests: number; windowMs: number }
  } = {}
) {
  const client = options.requireAdmin
    ? adminActionClient
    : options.requireAuth
      ? authActionClient
      : publicActionClient

  return (client as any)
    .schema(schema)
    .action(async ({ parsedInput, ctx }: any) => {
      try {
        // Rate limiting (간단한 구현)
        if (options.rateLimit) {
          // TODO: 실제 rate limiting 구현
        }

        return await handler(parsedInput, ctx)
      } catch (error) {
        // 추가 에러 처리 로직
        const appError = handleError(error)
        throw appError
      }
    })
}

/**
 * 트랜잭션 액션 래퍼
 */
export function createTransactionAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (input: TInput, ctx: ActionContext) => Promise<TOutput>,
  options: {
    requireAuth?: boolean
    requireAdmin?: boolean
  } = {}
) {
  return createAction(
    schema,
    async (input, ctx) => {
      // TODO: 데이터베이스 트랜잭션 래핑
      return await handler(input, ctx)
    },
    options
  )
}

/**
 * 에러 복구 액션 래퍼
 */
export function createRetryableAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (input: TInput, ctx: ActionContext) => Promise<TOutput>,
  options: {
    requireAuth?: boolean
    requireAdmin?: boolean
    maxRetries?: number
    retryDelay?: number
  } = {}
) {
  const { maxRetries = 3, retryDelay = 1000 } = options

  return createAction(
    schema,
    async (input, ctx) => {
      let lastError: unknown

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await handler(input, ctx)
        } catch (error) {
          lastError = error

          // 재시도 불가능한 에러는 즉시 throw
          if (
            error instanceof AuthenticationError ||
            error instanceof AuthorizationError ||
            error instanceof ValidationError
          ) {
            throw error
          }

          // 마지막 시도가 아니면 대기 후 재시도
          if (attempt < maxRetries) {
            ActionLogger.warn(
              'retryable-action',
              `Attempt ${attempt} failed, retrying...`,
              {
                requestId: ctx.requestId,
                error: error instanceof Error ? error.message : String(error),
              }
            )

            await new Promise(resolve =>
              setTimeout(resolve, retryDelay * attempt)
            )
          }
        }
      }

      throw lastError
    },
    options
  )
}
