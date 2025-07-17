import * as React from 'react'
import {
  useForm,
  UseFormProps,
  UseFormReturn,
  FieldValues,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Enhanced useForm hook with Zod validation
export function useFormWithValidation<
  TSchema extends z.ZodType<any, any, any>,
  TFieldValues extends FieldValues = z.input<TSchema>,
>(
  schema: TSchema,
  options?: Omit<UseFormProps<TFieldValues>, 'resolver'>
): UseFormReturn<TFieldValues> {
  return useForm<TFieldValues>({
    resolver: zodResolver(schema) as any,
    mode: 'onChange',
    ...options,
  })
}

// Hook for progressive form validation (multi-step forms)
export function useProgressiveForm<
  TSchema extends z.ZodType<any, any, any>,
  TFieldValues extends FieldValues = z.input<TSchema>,
>(schema: TSchema, options?: Omit<UseFormProps<TFieldValues>, 'resolver'>) {
  const form = useFormWithValidation(schema, options)

  const validateStep = async (stepFields: (keyof TFieldValues)[]) => {
    const isValid = await form.trigger(stepFields as any)
    return isValid
  }

  const getStepErrors = (stepFields: (keyof TFieldValues)[]) => {
    const errors: Record<string, any> = {}
    stepFields.forEach(field => {
      const fieldError = form.formState.errors[field as string]
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
export function useRealtimeValidation<
  TSchema extends z.ZodType<any, any, any>,
  TFieldValues extends FieldValues = z.input<TSchema>,
>(
  schema: TSchema,
  options?: Omit<UseFormProps<TFieldValues>, 'resolver'> & {
    debounceMs?: number
  }
) {
  const { debounceMs = 300, ...formOptions } = options || {}

  const form = useFormWithValidation(schema, {
    ...formOptions,
    mode: 'onChange',
  })

  // Debounced validation trigger
  const debouncedValidate = (fieldName: keyof TFieldValues) => {
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
export function useConditionalForm<
  TSchema extends z.ZodType<any, any, any>,
  TFieldValues extends FieldValues = z.input<TSchema>,
>(schema: TSchema, options?: Omit<UseFormProps<TFieldValues>, 'resolver'>) {
  const form = useFormWithValidation(schema, options)

  const validateConditionally = async (
    condition: (values: TFieldValues) => boolean,
    fields: (keyof TFieldValues)[]
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
export function useAutoSaveForm<
  TSchema extends z.ZodType<any, any, any>,
  TFieldValues extends FieldValues = z.input<TSchema>,
>(
  schema: TSchema,
  onAutoSave: (data: z.output<TSchema>) => Promise<void> | void,
  options?: Omit<UseFormProps<TFieldValues>, 'resolver'> & {
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
          // Parse and validate the data before auto-saving
          const validatedData = schema.parse(data)
          await onAutoSave(validatedData)
        } catch (error) {
          console.error('Auto-save failed:', error)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [form, onAutoSave, enableAutoSave, schema])

  return form
}

// Export types for better TypeScript support
export type FormWithValidation<
  TSchema extends z.ZodType<any, any, any>,
  TFieldValues extends FieldValues = z.input<TSchema>,
> = UseFormReturn<TFieldValues>

export type ProgressiveForm<
  TSchema extends z.ZodType<any, any, any>,
  TFieldValues extends FieldValues = z.input<TSchema>,
> = ReturnType<typeof useProgressiveForm<TSchema, TFieldValues>>

export type RealtimeForm<
  TSchema extends z.ZodType<any, any, any>,
  TFieldValues extends FieldValues = z.input<TSchema>,
> = ReturnType<typeof useRealtimeValidation<TSchema, TFieldValues>>

export type ConditionalForm<
  TSchema extends z.ZodType<any, any, any>,
  TFieldValues extends FieldValues = z.input<TSchema>,
> = ReturnType<typeof useConditionalForm<TSchema, TFieldValues>>
