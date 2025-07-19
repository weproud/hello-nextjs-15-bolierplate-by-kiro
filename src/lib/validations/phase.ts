import { z } from 'zod'

/**
 * Phase validation schemas
 */

export const createPhaseSchema = z.object({
  title: z
    .string()
    .min(1, 'Phase title is required')
    .max(255, 'Phase title must be less than 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  order: z.number().int().min(0).default(0),
  projectId: z.uuid('Invalid project ID'),
})

export const updatePhaseSchema = z.object({
  id: z.uuid('Invalid phase ID'),
  title: z
    .string()
    .min(1, 'Phase title is required')
    .max(255, 'Phase title must be less than 255 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  order: z.number().int().min(0).optional(),
})

export const deletePhaseSchema = z.object({
  id: z.uuid('Invalid phase ID'),
})

export const getPhaseSchema = z.object({
  id: z.uuid('Invalid phase ID'),
})

export const getProjectPhasesSchema = z.object({
  projectId: z.uuid('Invalid project ID'),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

export const reorderPhasesSchema = z.object({
  projectId: z.uuid('Invalid project ID'),
  phaseOrders: z.array(
    z.object({
      id: z.uuid('Invalid phase ID'),
      order: z.number().int().min(0),
    })
  ),
})

// Type exports
export type CreatePhaseInput = z.infer<typeof createPhaseSchema>
export type UpdatePhaseInput = z.infer<typeof updatePhaseSchema>
export type DeletePhaseInput = z.infer<typeof deletePhaseSchema>
export type GetPhaseInput = z.infer<typeof getPhaseSchema>
export type GetProjectPhasesInput = z.infer<typeof getProjectPhasesSchema>
export type ReorderPhasesInput = z.infer<typeof reorderPhasesSchema>
