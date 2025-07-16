'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import {
  contactSchema,
  projectSchema,
  registerSchema,
  loginSchema,
  profileSchema,
  feedbackSchema,
  teamInviteSchema,
} from '@/lib/validations/common'

// Generic action result type
type ActionResult<T = any> = {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

// Helper function to handle validation errors
function handleValidationError(error: z.ZodError): ActionResult {
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
    error: '입력 데이터가 올바르지 않습니다.',
    fieldErrors,
  }
}

// Project creation action
export async function createProject(formData: FormData): Promise<ActionResult> {
  try {
    // Parse form data
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
    }

    // Validate with Zod schema
    const validatedData = projectSchema.parse(rawData)

    // TODO: Replace with actual database operation
    // For now, simulate a successful creation
    await new Promise(resolve => setTimeout(resolve, 1000))

    const project = {
      id: Math.random().toString(36).substr(2, 9),
      ...validatedData,
      createdAt: new Date(),
    }

    // Revalidate the projects page
    revalidatePath('/projects')

    return {
      success: true,
      data: project,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error)
    }

    console.error('Project creation error:', error)
    return {
      success: false,
      error: '프로젝트 생성 중 오류가 발생했습니다.',
    }
  }
}

// Contact form submission action
export async function submitContact(formData: FormData): Promise<ActionResult> {
  try {
    // Parse form data
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    }

    // Validate with Zod schema
    const validatedData = contactSchema.parse(rawData)

    // TODO: Replace with actual email sending or database storage
    // For now, simulate a successful submission
    await new Promise(resolve => setTimeout(resolve, 1500))

    console.log('Contact form submitted:', validatedData)

    return {
      success: true,
      data: { message: '문의가 성공적으로 전송되었습니다.' },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error)
    }

    console.error('Contact form submission error:', error)
    return {
      success: false,
      error: '문의 전송 중 오류가 발생했습니다.',
    }
  }
}

// User registration action
export async function registerUser(formData: FormData): Promise<ActionResult> {
  try {
    // Parse form data
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      terms: formData.get('terms') === 'on',
    }

    // Validate with Zod schema
    const validatedData = registerSchema.parse(rawData)

    // TODO: Replace with actual user creation logic
    // For now, simulate a successful registration
    await new Promise(resolve => setTimeout(resolve, 1000))

    const user = {
      id: Math.random().toString(36).substr(2, 9),
      name: validatedData.name,
      email: validatedData.email,
      createdAt: new Date(),
    }

    return {
      success: true,
      data: user,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error)
    }

    console.error('User registration error:', error)
    return {
      success: false,
      error: '회원가입 중 오류가 발생했습니다.',
    }
  }
}

// Profile update action
export async function updateProfile(formData: FormData): Promise<ActionResult> {
  try {
    // Parse form data
    const rawData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || undefined,
      bio: formData.get('bio') || undefined,
      website: formData.get('website') || undefined,
      location: formData.get('location') || undefined,
    }

    // Validate with Zod schema
    const validatedData = profileSchema.parse(rawData)

    // TODO: Replace with actual profile update logic
    await new Promise(resolve => setTimeout(resolve, 800))

    revalidatePath('/profile')

    return {
      success: true,
      data: validatedData,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error)
    }

    console.error('Profile update error:', error)
    return {
      success: false,
      error: '프로필 업데이트 중 오류가 발생했습니다.',
    }
  }
}

// Feedback submission action
export async function submitFeedback(
  formData: FormData
): Promise<ActionResult> {
  try {
    // Parse form data
    const rawData = {
      type: formData.get('type'),
      title: formData.get('title'),
      description: formData.get('description'),
      priority: formData.get('priority') || 'medium',
    }

    // Validate with Zod schema
    const validatedData = feedbackSchema.parse(rawData)

    // TODO: Replace with actual feedback storage logic
    await new Promise(resolve => setTimeout(resolve, 1200))

    const feedback = {
      id: Math.random().toString(36).substr(2, 9),
      ...validatedData,
      createdAt: new Date(),
      status: 'pending',
    }

    return {
      success: true,
      data: feedback,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error)
    }

    console.error('Feedback submission error:', error)
    return {
      success: false,
      error: '피드백 제출 중 오류가 발생했습니다.',
    }
  }
}

// Team invite action
export async function inviteTeamMember(
  formData: FormData
): Promise<ActionResult> {
  try {
    // Parse form data
    const rawData = {
      email: formData.get('email'),
      role: formData.get('role'),
      message: formData.get('message') || undefined,
    }

    // Validate with Zod schema
    const validatedData = teamInviteSchema.parse(rawData)

    // TODO: Replace with actual team invite logic
    await new Promise(resolve => setTimeout(resolve, 1000))

    const invite = {
      id: Math.random().toString(36).substr(2, 9),
      ...validatedData,
      status: 'pending',
      createdAt: new Date(),
    }

    return {
      success: true,
      data: invite,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleValidationError(error)
    }

    console.error('Team invite error:', error)
    return {
      success: false,
      error: '팀 초대 중 오류가 발생했습니다.',
    }
  }
}

// Generic form action wrapper for type safety
export function createFormAction<T extends z.ZodType>(
  schema: T,
  handler: (data: z.infer<T>) => Promise<any>
) {
  return async (formData: FormData): Promise<ActionResult> => {
    try {
      // Convert FormData to object
      const rawData: Record<string, any> = {}
      for (const [key, value] of formData.entries()) {
        // Handle checkboxes and multiple values
        if (rawData[key]) {
          // Convert to array if multiple values exist
          if (Array.isArray(rawData[key])) {
            rawData[key].push(value)
          } else {
            rawData[key] = [rawData[key], value]
          }
        } else {
          rawData[key] = value
        }
      }

      // Handle boolean fields (checkboxes)
      Object.keys(rawData).forEach(key => {
        if (rawData[key] === 'on') {
          rawData[key] = true
        } else if (rawData[key] === 'off' || rawData[key] === '') {
          // Check if this should be a boolean field
          const schemaShape = (schema as any)._def?.shape
          if (
            schemaShape &&
            schemaShape[key] &&
            schemaShape[key]._def?.typeName === 'ZodBoolean'
          ) {
            rawData[key] = false
          }
        }
      })

      // Validate with schema
      const validatedData = schema.parse(rawData)

      // Execute handler
      const result = await handler(validatedData)

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return handleValidationError(error)
      }

      console.error('Form action error:', error)
      return {
        success: false,
        error: '처리 중 오류가 발생했습니다.',
      }
    }
  }
}

// Helper function to create type-safe form actions with better error handling
export function createTypedFormAction<T extends z.ZodType>(
  schema: T,
  handler: (data: z.infer<T>) => Promise<any>,
  options?: {
    successMessage?: string
    errorMessage?: string
    revalidatePaths?: string[]
  }
) {
  return async (formData: FormData): Promise<ActionResult> => {
    try {
      // Convert FormData to object with proper type handling
      const rawData: Record<string, any> = {}

      for (const [key, value] of formData.entries()) {
        if (rawData[key]) {
          // Handle multiple values (arrays)
          if (Array.isArray(rawData[key])) {
            rawData[key].push(value)
          } else {
            rawData[key] = [rawData[key], value]
          }
        } else {
          rawData[key] = value
        }
      }

      // Handle special form data types
      Object.keys(rawData).forEach(key => {
        const value = rawData[key]

        // Handle checkboxes
        if (value === 'on') {
          rawData[key] = true
        } else if (value === 'off') {
          rawData[key] = false
        }

        // Handle numbers
        if (
          typeof value === 'string' &&
          !isNaN(Number(value)) &&
          value !== ''
        ) {
          const schemaShape = (schema as any)._def?.shape
          if (
            schemaShape &&
            schemaShape[key] &&
            schemaShape[key]._def?.typeName === 'ZodNumber'
          ) {
            rawData[key] = Number(value)
          }
        }

        // Handle dates
        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const schemaShape = (schema as any)._def?.shape
          if (
            schemaShape &&
            schemaShape[key] &&
            schemaShape[key]._def?.typeName === 'ZodDate'
          ) {
            rawData[key] = new Date(value)
          }
        }
      })

      // Validate with schema
      const validatedData = schema.parse(rawData)

      // Execute handler
      const result = await handler(validatedData)

      // Revalidate paths if specified
      if (options?.revalidatePaths) {
        options.revalidatePaths.forEach(path => revalidatePath(path))
      }

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return handleValidationError(error)
      }

      console.error('Form action error:', error)
      return {
        success: false,
        error: options?.errorMessage || '처리 중 오류가 발생했습니다.',
      }
    }
  }
}
