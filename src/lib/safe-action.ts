import { createSafeActionClient } from 'next-safe-action'
import { getCurrentSession } from '../services/auth'
import {
  ActionError,
  AuthenticationError,
  ActionLogger,
  handleActionError,
} from './error-handling'

/**
 * Base safe action client with comprehensive error handling and logging
 */
export const actionClient = createSafeActionClient({
  defaultValidationErrorsShape: 'flattened',
  // Handle server errors with detailed logging and user-friendly messages
  handleServerError(e, utils) {
    const { clientInput } = utils
    const actionName = 'server-action'

    ActionLogger.error(actionName, 'Server action failed', e, {
      clientInput:
        process.env.NODE_ENV === 'development' ? clientInput : '[REDACTED]',
      timestamp: new Date().toISOString(),
    })

    // Handle different error types
    if (e instanceof ActionError) {
      return e.message
    }

    if (e instanceof Error) {
      // Don't expose internal error details in production
      if (process.env.NODE_ENV === 'production') {
        return '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      }
      return e.message
    }

    return '알 수 없는 오류가 발생했습니다.'
  },
})

/**
 * Authenticated action client that requires user authentication
 */
export const authActionClient = actionClient.use(async ({ next }) => {
  // Get current session
  const session = await getCurrentSession()

  // Check if authentication is required (always required for auth client)
  if (!session?.user) {
    ActionLogger.warn(
      'auth-action',
      'Authentication required but no user session found'
    )
    throw new AuthenticationError('로그인이 필요합니다.')
  }

  // Log action execution
  ActionLogger.info('auth-action', 'Executing authenticated action', {
    userId: session.user.id,
    userEmail:
      process.env.NODE_ENV === 'development'
        ? session.user.email
        : '[REDACTED]',
    timestamp: new Date().toISOString(),
  })

  // Pass enhanced user context to the action
  return next({
    ctx: {
      userId: session.user.id,
      user: session.user,
      session,
    },
  })
})

/**
 * Public action client for actions that don't require authentication
 */
export const publicActionClient = actionClient.use(async ({ next }) => {
  // Log action execution
  ActionLogger.info('public-action', 'Executing public action', {
    actionType: 'public',
    timestamp: new Date().toISOString(),
  })

  // Pass context to the action
  return next({
    ctx: {
      actionType: 'public' as const,
    },
  })
})
