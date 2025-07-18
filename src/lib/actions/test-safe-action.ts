'use server'

import { z } from 'zod'
import { authActionClient, publicActionClient } from '@/lib/safe-action'

// Test schema for input validation
const testInputSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})

/**
 * Test authenticated action to verify safe-action configuration
 */
export const testAuthenticatedAction = authActionClient
  .schema(testInputSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx

    return {
      success: true,
      message: `Hello ${user.name || 'User'}, you said: ${parsedInput.message}`,
      priority: parsedInput.priority,
      userId: user.id,
      timestamp: new Date().toISOString(),
    }
  })

/**
 * Test public action to verify safe-action configuration
 */
export const testPublicAction = publicActionClient
  .schema(testInputSchema)
  .action(async ({ parsedInput, ctx }) => {
    return {
      success: true,
      message: `Public message received: ${parsedInput.message}`,
      priority: parsedInput.priority,
      actionType: ctx.actionType,
      timestamp: new Date().toISOString(),
    }
  })

/**
 * Test action with error handling
 */
export const testErrorAction = publicActionClient
  .schema(
    z.object({
      shouldError: z.boolean().default(false),
      errorType: z.enum(['validation', 'server', 'custom']).default('server'),
    })
  )
  .action(async ({ parsedInput }) => {
    if (parsedInput.shouldError) {
      switch (parsedInput.errorType) {
        case 'validation':
          throw new Error('Validation error occurred')
        case 'server':
          throw new Error('Server error occurred')
        case 'custom':
          throw new Error('Custom error occurred')
      }
    }

    return {
      success: true,
      message: 'No error occurred',
      timestamp: new Date().toISOString(),
    }
  })
