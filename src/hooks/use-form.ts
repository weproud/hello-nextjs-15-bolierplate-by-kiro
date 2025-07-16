import { zodResolver } from '@hookform/resolvers/zod'
import { useForm as useReactHookForm, type UseFormProps } from 'react-hook-form'
import { type z } from 'zod'

export function useForm<T extends z.ZodType<any, any, any>>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<T>>, 'resolver'>
) {
  return useReactHookForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onBlur', // Validate on blur for better UX
    reValidateMode: 'onChange', // Re-validate on change after first validation
    ...options,
  })
}

// Enhanced form hook with additional utilities
export function useFormWithValidation<T extends z.ZodType<any, any, any>>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<T>>, 'resolver'>
) {
  const form = useReactHookForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    ...options,
  })

  // Helper to validate a single field
  const validateField = async (fieldName: keyof z.infer<T>, value: any) => {
    try {
      // Create a partial schema with just the field we want to validate
      const partialData = { [fieldName]: value } as Partial<z.infer<T>>
      await schema.partial().parseAsync(partialData)
      form.clearErrors(fieldName as any)
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(
          err => err.path.length > 0 && err.path[0] === fieldName
        )
        if (fieldError) {
          form.setError(fieldName as any, {
            type: 'validation',
            message: fieldError.message,
          })
        }
      }
      return false
    }
  }

  // Helper to get field error message
  const getFieldError = (fieldName: keyof z.infer<T>) => {
    const fieldState = form.getFieldState(fieldName as any)
    return fieldState.error?.message
  }

  // Helper to check if field is valid
  const isFieldValid = (fieldName: keyof z.infer<T>) => {
    const fieldState = form.getFieldState(fieldName as any)
    return !fieldState.error && fieldState.isTouched
  }

  // Helper to reset specific fields
  const resetFields = (fieldNames: (keyof z.infer<T>)[]) => {
    fieldNames.forEach(fieldName => {
      form.resetField(fieldName as any)
    })
  }

  // Helper to validate all fields and return validation status
  const validateAllFields = async () => {
    const values = form.getValues()
    try {
      await schema.parseAsync(values)
      return { isValid: true, errors: {} }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          const fieldPath = err.path.join('.')
          if (!fieldErrors[fieldPath]) {
            fieldErrors[fieldPath] = err.message
          }
        })
        return { isValid: false, errors: fieldErrors }
      }
      return { isValid: false, errors: {} }
    }
  }

  return {
    ...form,
    validateField,
    getFieldError,
    isFieldValid,
    resetFields,
    validateAllFields,
    schema,
  }
}
