import React from 'react'
import { useForm, UseFormProps, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Enhanced useForm hook with Zod validation
export function useFormWithValidation<T extends z.ZodType>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<T>>, 'resolver'>
): UseFormReturn<z.infer<T>> {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    ...options,
  })
}

// Hook for progressive form validation (multi-step forms)
export function useProgressiveForm<T extends z.ZodType>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<T>>, 'resolver'>
) {
  const form = useFormWithValidation(schema, options)

  const validateStep = async (stepFields: (keyof z.infer<T>)[]) => {
    const isValid = await form.trigger(stepFields as any)
    return isValid
  }

  const getStepErrors = (stepFields: (keyof z.infer<T>)[]) => {
    const errors: Record<string, any> = {}
    stepFields.forEach(field => {
      const fieldError = form.formState.errors[field]
      if (fieldError) {
        errors[field as string] = fieldError
      }
    })
    return errors
  }

  return {
    ...form,
    validateStep,
    getStepErrors,
  }
}

// Hook for real-time validation with debouncing
export function useRealtimeValidation<T extends z.ZodType>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<T>>, 'resolver'> & {
    debounceMs?: number
  }
) {
  const { debounceMs = 300, ...formOptions } = options || {}

  const form = useFormWithValidation(schema, {
    ...formOptions,
    mode: 'onChange',
  })

  // Debounced validation trigger
  const debouncedValidate = (fieldName: keyof z.infer<T>) => {
    const timeoutId = setTimeout(() => {
      form.trigger(fieldName as any)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }

  return {
    ...form,
    debouncedValidate,
  }
}

// Hook for conditional form validation
export function useConditionalForm<T extends z.ZodType>(
  schema: T,
  options?: Omit<UseFormProps<z.infer<T>>, 'resolver'>
) {
  const form = useFormWithValidation(schema, options)

  const validateConditionally = async (
    condition: (values: z.infer<T>) => boolean,
    fields: (keyof z.infer<T>)[]
  ) => {
    const values = form.getValues()
    if (condition(values)) {
      return await form.trigger(fields as any)
    }
    return true
  }

  return {
    ...form,
    validateConditionally,
  }
}

// Hook for form with auto-save functionality
export function useAutoSaveForm<T extends z.ZodType>(
  schema: T,
  onAutoSave: (data: z.infer<T>) => Promise<void> | void,
  options?: Omit<UseFormProps<z.infer<T>>, 'resolver'> & {
    autoSaveDelay?: number
    enableAutoSave?: boolean
  }
) {
  const {
    autoSaveDelay = 2000,
    enableAutoSave = true,
    ...formOptions
  } = options || {}

  const form = useFormWithValidation(schema, formOptions)

  React.useEffect(() => {
    if (!enableAutoSave) return

    const subscription = form.watch(async data => {
      if (form.formState.isValid && form.formState.isDirty) {
        try {
          await onAutoSave(data as z.infer<T>)
        } catch (error) {
          console.error('Auto-save failed:', error)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [form, onAutoSave, enableAutoSave])

  return form
}

// Export types for better TypeScript support
export type FormWithValidation<T extends z.ZodType> = UseFormReturn<z.infer<T>>
export type ProgressiveForm<T extends z.ZodType> = ReturnType<
  typeof useProgressiveForm<T>
>
export type RealtimeForm<T extends z.ZodType> = ReturnType<
  typeof useRealtimeValidation<T>
>
export type ConditionalForm<T extends z.ZodType> = ReturnType<
  typeof useConditionalForm<T>
>
