import { z } from 'zod'

/**
 * Test schemas for validating next-safe-action configuration
 */

export const simpleTestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})

export const complexTestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().optional(),
  tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed'),
  isPublic: z.boolean().default(false),
  metadata: z
    .object({
      category: z.string().optional(),
      priority: z.number().min(1).max(10).default(5),
    })
    .optional(),
})

export const errorTestSchema = z.object({
  shouldError: z.boolean().default(false),
  errorType: z
    .enum(['validation', 'server', 'auth', 'custom'])
    .default('server'),
  errorMessage: z.string().optional(),
})

export const fileUploadTestSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().positive('File size must be positive'),
  fileType: z.enum(['image/jpeg', 'image/png', 'application/pdf']),
  description: z.string().optional(),
})

export type SimpleTestInput = z.infer<typeof simpleTestSchema>
export type ComplexTestInput = z.infer<typeof complexTestSchema>
export type ErrorTestInput = z.infer<typeof errorTestSchema>
export type FileUploadTestInput = z.infer<typeof fileUploadTestSchema>
