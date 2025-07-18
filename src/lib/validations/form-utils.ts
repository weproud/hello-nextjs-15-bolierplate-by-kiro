import { z } from 'zod'
import type { FieldErrors, FieldValues, FieldError } from 'react-hook-form'

// Type definitions
export interface ValidationResult {
  success: boolean
  data?: any
  errors?: Record<string, string[]>
  message?: string
}

// Form validation utilities
export const formatZodErrors = (
  error: z.ZodError
): Record<string, string[]> => {
  const formattedErrors: Record<string, string[]> = {}

  error.issues.forEach((err: z.ZodIssue) => {
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
    if (error?.message && typeof error.message === 'string') {
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

// Helper to validate with schema
export function validateWithSchema<T extends z.ZodType>(
  schema: T,
  data: unknown
): ValidationResult {
  try {
    const result = schema.safeParse(data)
    if (result.success) {
      return {
        success: true,
        data: result.data,
      }
    } else {
      return {
        success: false,
        errors: formatZodErrors(result.error),
      }
    }
  } catch (error) {
    return {
      success: false,
      message: '유효성 검사 중 오류가 발생했습니다.',
    }
  }
}

// Helper to validate a single field
export function validateField<T extends z.ZodType>(
  schema: T,
  fieldName: string,
  value: unknown
): ValidationResult {
  try {
    // Create a partial object with just the field we want to validate
    const partialData = { [fieldName]: value }

    // For partial validation, we need to handle this differently
    const result = schema.safeParse(partialData)

    if (result.success) {
      return {
        success: true,
        data: result.data,
      }
    } else {
      return {
        success: false,
        errors: formatZodErrors(result.error),
      }
    }
  } catch (error) {
    return {
      success: false,
      message: '필드 유효성 검사 중 오류가 발생했습니다.',
    }
  }
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
    try {
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
              asyncErrors['general'] = asyncErrors['general'] || []
              asyncErrors['general'].push(error)
            }
          } catch (err) {
            asyncErrors['general'] = asyncErrors['general'] || []
            asyncErrors['general'].push('Validation failed')
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

      return {
        success: true as const,
        data: syncResult.data,
        errors: {},
      }
    } catch (error) {
      return {
        success: false as const,
        data: null,
        message: '필드 유효성 검사 중 오류가 발생했습니다.',
      }
    }
  }
}

// Helper to convert FormData to object with proper type handling
export function formDataToObject(formData: FormData): Record<string, any> {
  const obj: Record<string, any> = {}

  for (const [key, value] of formData.entries()) {
    if (obj[key]) {
      // Handle multiple values (arrays)
      if (Array.isArray(obj[key])) {
        obj[key].push(value)
      } else {
        obj[key] = [obj[key], value]
      }
    } else {
      obj[key] = value
    }
  }

  // Handle special form data types
  Object.keys(obj).forEach(key => {
    const value = obj[key]

    // Handle checkboxes
    if (value === 'on') {
      obj[key] = true
    } else if (value === 'off' || value === '') {
      // This might be a boolean field that wasn't checked
      obj[key] = false
    }

    // Handle numbers
    if (typeof value === 'string' && !isNaN(Number(value)) && value !== '') {
      // Only convert if it looks like a number
      const numValue = Number(value)
      if (!isNaN(numValue)) {
        obj[key] = numValue
      }
    }

    // Handle dates
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      obj[key] = new Date(value)
    }

    // Handle arrays from comma-separated strings
    if (typeof value === 'string' && value.includes(',')) {
      // Only split if it looks like a comma-separated list
      const parts = value
        .split(',')
        .map(part => part.trim())
        .filter(Boolean)
      if (parts.length > 1) {
        obj[key] = parts
      }
    }
  })

  return obj
}

// Helper to create consistent validation between client and server
export function createValidationHelper<T extends z.ZodType>(schema: T) {
  return {
    // Validate form data (for server actions)
    validateFormData: (formData: FormData): ValidationResult => {
      const data = formDataToObject(formData)
      return validateWithSchema(schema, data)
    },

    // Validate object data (for client-side)
    validateData: (data: unknown): ValidationResult => {
      return validateWithSchema(schema, data)
    },

    // Validate single field
    validateField: (fieldName: string, value: unknown): ValidationResult => {
      return validateField(schema, fieldName, value)
    },

    // Get field error message
    getFieldError: (
      errors: Record<string, string[]> | undefined,
      fieldName: string
    ): string | undefined => {
      return errors?.[fieldName]?.[0]
    },

    // Check if validation has errors
    hasErrors: (errors: Record<string, string[]> | undefined): boolean => {
      return Boolean(errors && Object.keys(errors).length > 0)
    },

    // Get all error messages as a flat array
    getAllErrors: (errors: Record<string, string[]> | undefined): string[] => {
      if (!errors) return []
      return Object.values(errors).flat()
    },

    // Schema reference for type inference
    schema,
  }
}

// Enhanced validation helper with real-time validation
export function createEnhancedValidationHelper<T extends z.ZodType>(schema: T) {
  const baseHelper = createValidationHelper(schema)

  return {
    ...baseHelper,

    // Async field validation with debouncing
    validateFieldAsync: async (
      fieldName: string,
      value: unknown,
      debounceMs = 300
    ): Promise<ValidationResult> => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(baseHelper.validateField(fieldName, value))
        }, debounceMs)
      })
    },

    // Validate multiple fields at once
    validateFields: (
      fields: Record<string, unknown>
    ): Record<string, ValidationResult> => {
      const results: Record<string, ValidationResult> = {}

      Object.entries(fields).forEach(([fieldName, value]) => {
        results[fieldName] = baseHelper.validateField(fieldName, value)
      })

      return results
    },

    // Get validation summary
    getValidationSummary: (data: unknown) => {
      const result = validateWithSchema(schema, data)
      const errorCount = result.errors ? Object.keys(result.errors).length : 0
      const totalFields = 10 // This would need to be calculated based on schema
      const validFields = totalFields - errorCount

      return {
        isValid: result.success,
        totalFields,
        validFields,
        errorCount,
        completionPercentage:
          totalFields > 0 ? (validFields / totalFields) * 100 : 0,
        errors: result.errors,
        firstError: result.errors ? Object.values(result.errors)[0]?.[0] : null,
      }
    },
  }
}

// Pre-built validation helpers for common schemas
export const createFormValidation = createValidationHelper

// Helper to merge validation errors
export function mergeValidationErrors(
  ...errorObjects: Array<Record<string, string[]> | undefined>
): Record<string, string[]> {
  const merged: Record<string, string[]> = {}

  errorObjects.forEach(errors => {
    if (errors) {
      Object.entries(errors).forEach(([field, messages]) => {
        if (!merged[field]) {
          merged[field] = []
        }
        merged[field].push(...messages)
      })
    }
  })

  return merged
}

// Helper to format validation errors for display
export function formatValidationErrors(
  errors: Record<string, string[]> | undefined
): string {
  if (!errors) return ''

  const allErrors = Object.values(errors).flat()
  return allErrors.join(', ')
}

// Helper to check if a field has a specific error type
export function hasFieldError(
  errors: Record<string, string[]> | undefined,
  fieldName: string,
  errorMessage?: string
): boolean {
  const fieldErrors = errors?.[fieldName]
  if (!fieldErrors) return false

  if (errorMessage) {
    return fieldErrors.some(error => error.includes(errorMessage))
  }

  return fieldErrors.length > 0
}
