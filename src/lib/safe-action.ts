import { createSafeActionClient } from 'next-safe-action'
import { auth } from '@/auth'
import {
  ActionError,
  AuthenticationError,
  ActionLogger,
  handleActionError,
} from '@/lib/error-handling'

/**
 * Base safe action client with comprehensive error handling and logging
 */
export const actionClient = createSafeActionClient({
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
  try {
    // Get current session
    const session = await auth()

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
        user: session.user,
        session,
      },
    })
  } catch (error) {
    // Handle and re-throw errors with proper logging
    handleActionError(error, 'auth-action')
  }
})

/**
 * Public action client for actions that don't require authentication
 */
export const publicActionClient = actionClient.use(async ({ next }) => {
  try {
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
  } catch (error) {
    // Handle and re-throw errors with proper logging
    handleActionError(error, 'public-action')
  }
})

/**
 * Helper function to create authenticated actions
 */
export function createAuthAction(_actionName: string) {
  return authActionClient
}

/**
 * Helper function to create public actions
 */
export function createPublicAction(_actionName: string) {
  return publicActionClient
}

/**
 * Convenience function to create a standard CRUD authenticated action
 */
export function createCrudAction(actionName: string) {
  return createAuthAction(actionName)
}

/**
 * Convenience function to create a contact/form submission action
 */
export function createFormAction(
  _actionName: string,
  options?: {
    requiresAuth?: boolean
  }
) {
  return options?.requiresAuth ? authActionClient : publicActionClient
}

/**
 * Type-safe action wrapper that ensures proper error handling
 */
export function withActionErrorHandling<T extends (...args: any[]) => any>(
  actionFn: T,
  actionName: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await actionFn(...args)
    } catch (error) {
      handleActionError(error, actionName)
    }
  }) as T
}
