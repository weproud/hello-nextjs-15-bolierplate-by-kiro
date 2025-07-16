import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from 'next-safe-action'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

// Base action client without authentication
export const action = createSafeActionClient({
  // Define error handling
  handleServerError(e) {
    // Log the error for debugging
    console.error('Server action error:', e)

    // Return a generic error message to the client
    if (e instanceof Error) {
      return e.message
    }

    return DEFAULT_SERVER_ERROR_MESSAGE
  },

  // Define metadata for logging
  defineMetadataSchema() {
    return {
      actionName: '',
      userId: '',
    }
  },
})

// Authenticated action client that requires user to be signed in
export const authAction = createSafeActionClient({
  // Define error handling
  handleServerError(e) {
    // Log the error with more context for authenticated actions
    console.error('Authenticated server action error:', e)

    if (e instanceof Error) {
      return e.message
    }

    return DEFAULT_SERVER_ERROR_MESSAGE
  },

  // Define metadata for logging
  defineMetadataSchema() {
    return {
      actionName: '',
      userId: '',
    }
  },
}).use(async ({ next, metadata }) => {
  // Get the current session
  const session = await auth()

  // If no session, redirect to sign in
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Add user context to metadata for logging
  const updatedMetadata = {
    ...metadata,
    userId: session.user.id || '',
  }

  // Continue with the action, passing user context
  return next({
    ctx: {
      user: session.user,
      userId: session.user.id || '',
    },
    metadata: updatedMetadata,
  })
})
