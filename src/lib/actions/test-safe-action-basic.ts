'use server'

import { z } from 'zod'
import { createAuthAction, createPublicAction } from '@/lib/safe-action'

// Test schema for input validation
const testInputSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})

/**
 * Basic test authenticated action
 */
export const basicTestAuthAction = createAuthAction('basicTestAuth')
  .inputSchema(testInputSchema)
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
 * Basic test public action
 */
export const basicTestPublicAction = createPublicAction('basicTestPublic')
  .inputSchema(testInputSchema)
  .action(async ({ parsedInput, ctx }) => {
    return {
      success: true,
      message: `Public message received: ${parsedInput.message}`,
      priority: parsedInput.priority,
      actionType: ctx.actionType,
      timestamp: new Date().toISOString(),
    }
  })
