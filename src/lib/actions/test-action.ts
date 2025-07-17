'use server'

import { z } from 'zod'
import { createAuthAction, createPublicAction } from '@/lib/safe-action'

// Test schema for input validation
const testSchema = z.object({
  message: z.string().min(1, 'Message is required'),
})

/**
 * Test authenticated action to verify safe-action configuration
 */
export const testAuthAction = createAuthAction('testAuthAction')
  .schema(testSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx

    return {
      success: true,
      message: `Hello ${user?.name || 'User'}, you said: ${parsedInput.message}`,
      timestamp: new Date().toISOString(),
    }
  })

/**
 * Test public action to verify safe-action configuration
 */
export const testPublicAction = createPublicAction('testPublicAction')
  .schema(testSchema)
  .action(async ({ parsedInput, ctx }) => {
    return {
      success: true,
      message: `Public message received: ${parsedInput.message}`,
      timestamp: new Date().toISOString(),
      actionType: ctx.metadata.actionType,
    }
  })
