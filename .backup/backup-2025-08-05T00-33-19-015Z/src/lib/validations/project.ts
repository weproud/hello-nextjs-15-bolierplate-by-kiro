import { z } from 'zod'

/**
 * Project validation schemas
 */

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, 'Project title is required')
    .max(255, 'Project title must be less than 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
})

export const updateProjectSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
  title: z
    .string()
    .min(1, 'Project title is required')
    .max(255, 'Project title must be less than 255 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
})

export const deleteProjectSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
})

export const getProjectSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
})

export const getUserProjectsSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
})

// Type exports
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type DeleteProjectInput = z.infer<typeof deleteProjectSchema>
export type GetProjectInput = z.infer<typeof getProjectSchema>
export type GetUserProjectsInput = z.infer<typeof getUserProjectsSchema>
