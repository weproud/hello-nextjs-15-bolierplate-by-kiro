import { z } from 'zod'

// Type for validation result
export interface ValidationResult {
  success: boolean
  data?: any
  errors?: Record<string, string[]>
  message?: string
}

// Helper to validate data against a Zod schema
export function validateWithSchema<T extends z.ZodType>(
  schema: T,
  data: unknown
): ValidationResult {
  try {
    const validatedData = schema.parse(data)
    return {
      success: true,
      data: validatedData,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {}

      error.errors.forEach(err => {
        const path = err.path.join('.')
        if (!fieldErrors[path]) {
          fieldErrors[path] = []
        }
        fieldErrors[path].push(err.message)
      })

      return {
        success: false,
        errors: fieldErrors,
        message: '입력 데이터가 올바르지 않습니다.',
      }
    }

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
    const partialSchema = schema.partial()

    const validatedData = partialSchema.parse(partialData)

    return {
      success: true,
      data: validatedData,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.errors.find(
        err => err.path.length > 0 && err.path[0] === fieldName
      )

      if (fieldError) {
        return {
          success: false,
          errors: { [fieldName]: [fieldError.message] },
          message: fieldError.message,
        }
      }
    }

    return {
      success: false,
      message: '필드 유효성 검사 중 오류가 발생했습니다.',
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

// Pre-built validation helpers for common schemas
export const createFormValidation = createValidationHelper

// Helper to merge validation errors
export function mergeValidationErrors(
  ...errorObjects: (Record<string, string[]> | undefined)[]
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
