import { z } from 'zod'

// Common validation schemas
export const idSchema = z.string().cuid()
export const emailSchema = z.string().email('Invalid email address')
export const urlSchema = z.string().url('Invalid URL')
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')

// String validations
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
export const descriptionSchema = z
  .string()
  .max(500, 'Description too long')
  .optional()
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')

// Number validations
export const positiveIntSchema = z.number().int().positive()
export const pageSchema = z.number().int().min(1).default(1)
export const limitSchema = z.number().int().min(1).max(100).default(10)

// Date validations
export const dateSchema = z.date()
export const futureDateSchema = z.date().refine(date => date > new Date(), {
  message: 'Date must be in the future',
})

// Pagination schema
export const paginationSchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  filters: z.record(z.any()).optional(),
})

// File upload schema
export const fileSchema = z.object({
  name: z.string(),
  size: z.number().max(10 * 1024 * 1024, 'File too large (max 10MB)'),
  type: z.string(),
})

// Common response schemas
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
})

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.any().optional(),
})

export const apiResponseSchema = z.union([
  successResponseSchema,
  errorResponseSchema,
])

// Validation helpers
export const createArraySchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.array(itemSchema).min(1, 'At least one item is required')

export const createOptionalArraySchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) => z.array(itemSchema).optional()

export const createEnumSchema = <T extends readonly [string, ...string[]]>(
  values: T
) => z.enum(values)

// Custom validation functions
export const isValidCuid = (value: string): boolean => {
  return /^c[a-z0-9]{24}$/.test(value)
}

export const isValidSlug = (value: string): boolean => {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

export const sanitizeString = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ')
}
