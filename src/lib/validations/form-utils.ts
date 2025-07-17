import { z } from 'zod'
import type { FieldErrors, FieldValues } from 'react-hook-form'

// Form validation utilities
export const formatZodErrors = (
  error: z.ZodError
): Record<string, string[]> => {
  const formattedErrors: Record<string, string[]> = {}

  error.errors.forEach(err => {
    const path = err.path.join('.')
    if (!formattedErrors[path]) {
      formattedErrors[path] = []
    }
    formattedErrors[path].push(err.message)
  })

  return formattedErrors
}

export const formatRHFErrors = (
  errors: FieldErrors<FieldValues>
): Record<string, string[]> => {
  const formattedErrors: Record<string, string[]> = {}

  Object.entries(errors).forEach(([field, error]) => {
    if (error?.message) {
      formattedErrors[field] = [error.message]
    }
  })

  return formattedErrors
}

// Form field helpers
export const getFieldError = (
  errors: Record<string, string[]>,
  fieldName: string
): string | undefined => {
  return errors[fieldName]?.[0]
}

export const hasFieldError = (
  errors: Record<string, string[]>,
  fieldName: string
): boolean => {
  return !!errors[fieldName]?.length
}

// Form state helpers
export const isFormValid = (errors: Record<string, string[]>): boolean => {
  return Object.keys(errors).length === 0
}

export const getErrorCount = (errors: Record<string, string[]>): number => {
  return Object.values(errors).reduce(
    (count, fieldErrors) => count + fieldErrors.length,
    0
  )
}

// Form data transformers
export const transformFormData = <T extends Record<string, any>>(
  data: T,
  transformers: Partial<Record<keyof T, (value: any) => any>>
): T => {
  const transformed = { ...data }

  Object.entries(transformers).forEach(([key, transformer]) => {
    if (key in transformed && transformer) {
      transformed[key as keyof T] = transformer(transformed[key as keyof T])
    }
  })

  return transformed
}

// Common form transformers
export const formTransformers = {
  trim: (value: string) => value?.trim(),
  toLowerCase: (value: string) => value?.toLowerCase(),
  toUpperCase: (value: string) => value?.toUpperCase(),
  toNumber: (value: string) => (value ? Number(value) : undefined),
  toBoolean: (value: string | boolean) => {
    if (typeof value === 'boolean') return value
    return value === 'true' || value === '1'
  },
  sanitizeHtml: (value: string) => {
    // Basic HTML sanitization - in production, use a proper library like DOMPurify
    return value?.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ''
    )
  },
}

// Form validation helpers
export const createFormValidator = <T extends z.ZodTypeAny>(schema: T) => {
  return (data: unknown) => {
    try {
      const validData = schema.parse(data)
      return { success: true as const, data: validData, errors: {} }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false as const,
          data: null,
          errors: formatZodErrors(error),
        }
      }
      throw error
    }
  }
}

// Async form validation
export const createAsyncFormValidator = <T extends z.ZodTypeAny>(
  schema: T,
  asyncValidators?: Array<(data: z.infer<T>) => Promise<string | null>>
) => {
  return async (data: unknown) => {
    // First, validate with Zod schema
    const syncResult = createFormValidator(schema)(data)
    if (!syncResult.success) {
      return syncResult
    }

    // Then run async validators
    if (asyncValidators?.length) {
      const asyncErrors: Record<string, string[]> = {}

      for (const validator of asyncValidators) {
        try {
          const error = await validator(syncResult.data)
          if (error) {
            asyncErrors.general = asyncErrors.general || []
            asyncErrors.general.push(error)
          }
        } catch (err) {
          asyncErrors.general = asyncErrors.general || []
          asyncErrors.general.push('Validation failed')
        }
      }

      if (Object.keys(asyncErrors).length > 0) {
        return {
          success: false as const,
          data: null,
          errors: asyncErrors,
        }
      }
    }

    return syncResult
  }
}
