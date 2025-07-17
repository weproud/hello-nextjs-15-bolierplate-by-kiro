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
import {
  authActionClient,
  publicActionClient,
  createAuthAction,
  createPublicAction,
  createCrudAction,
  createFormAction,
} from '@/lib/safe-action'
import { prisma } from '@/lib/prisma'

// Generic action result type (kept for backward compatibility)
type ActionResult<T = any> = {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
}

// Helper function to handle validation errors (kept for backward compatibility)
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

// ===== NEW NEXT-SAFE-ACTION IMPLEMENTATIONS =====

/**
 * Enhanced type-safe project creation action using new helper functions
 */
export const createProjectAction = createCrudAction('createProject', {
  rateLimit: {
    maxRequests: 10, // Allow 10 project creations per minute
    windowMs: 60000,
  },
  logLevel: 'info',
})
  .schema(projectSchema)
  .action(async ({ parsedInput, ctx }) => {
    // User is guaranteed to exist due to auth middleware
    const { user } = ctx

    if (!user) {
      throw new Error('인증이 필요합니다.')
    }

    try {
      // Create project in database
      const project = await prisma.project.create({
        data: {
          title: parsedInput.title,
          description: parsedInput.description || null,
          userId: user.id,
        },
      })

      // Revalidate projects page
      revalidatePath('/projects')
      revalidatePath('/dashboard')

      return {
        success: true,
        project,
      }
    } catch (error) {
      console.error('Database error creating project:', error)
      throw new Error('프로젝트 생성 중 데이터베이스 오류가 발생했습니다.')
    }
  })

/**
 * Enhanced type-safe contact form submission using new helper functions
 */
export const submitContactAction = createFormAction('submitContact', {
  requiresAuth: false,
  rateLimit: {
    maxRequests: 3, // Allow only 3 contact submissions per 5 minutes
    windowMs: 300000, // 5 minutes
  },
  logLevel: 'info',
})
  .schema(contactSchema)
  .action(async ({ parsedInput }) => {
    try {
      // TODO: Replace with actual email sending service
      // For now, just log the contact submission
      console.log('Contact form submitted:', {
        name: parsedInput.name,
        email: parsedInput.email,
        subject: parsedInput.subject,
        message: parsedInput.message,
        timestamp: new Date().toISOString(),
      })

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      return {
        success: true,
        message: '문의가 성공적으로 전송되었습니다.',
      }
    } catch (error) {
      console.error('Contact form submission error:', error)
      throw new Error('문의 전송 중 오류가 발생했습니다.')
    }
  })

/**
 * Type-safe profile update action using next-safe-action
 */
export const updateProfileAction = authActionClient
  .metadata({
    actionName: 'updateProfile',
    requiresAuth: true,
  })
  .schema(profileSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx

    if (!user) {
      throw new Error('인증이 필요합니다.')
    }

    try {
      // Update user profile in database
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: parsedInput.name,
          email: parsedInput.email,
          // Note: phone, bio, website, location would need to be added to User model
        },
      })

      // Revalidate profile page
      revalidatePath('/profile')
      revalidatePath('/dashboard')

      return {
        success: true,
        user: updatedUser,
      }
    } catch (error) {
      console.error('Database error updating profile:', error)
      throw new Error('프로필 업데이트 중 데이터베이스 오류가 발생했습니다.')
    }
  })

/**
 * Type-safe feedback submission action using next-safe-action
 */
export const submitFeedbackAction = authActionClient
  .metadata({
    actionName: 'submitFeedback',
    requiresAuth: false, // Allow anonymous feedback
  })
  .schema(feedbackSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      // TODO: Replace with actual feedback storage in database
      // For now, just log the feedback
      const feedback = {
        id: Math.random().toString(36).substr(2, 9),
        type: parsedInput.type,
        title: parsedInput.title,
        description: parsedInput.description,
        priority: parsedInput.priority,
        userId: ctx.user?.id || null,
        createdAt: new Date(),
        status: 'pending' as const,
      }

      console.log('Feedback submitted:', feedback)

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1200))

      return {
        success: true,
        feedback,
      }
    } catch (error) {
      console.error('Feedback submission error:', error)
      throw new Error('피드백 제출 중 오류가 발생했습니다.')
    }
  })

/**
 * Example of a more complex action with custom validation
 */
const deleteProjectSchema = z.object({
  projectId: z.string().min(1, '프로젝트 ID가 필요합니다.'),
  confirmTitle: z.string().min(1, '프로젝트 제목 확인이 필요합니다.'),
})

export const deleteProjectAction = authActionClient
  .metadata({
    actionName: 'deleteProject',
    requiresAuth: true,
  })
  .schema(deleteProjectSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx

    if (!user) {
      throw new Error('인증이 필요합니다.')
    }

    try {
      // First, verify the project exists and belongs to the user
      const project = await prisma.project.findFirst({
        where: {
          id: parsedInput.projectId,
          userId: user.id,
        },
      })

      if (!project) {
        throw new Error('프로젝트를 찾을 수 없거나 삭제 권한이 없습니다.')
      }

      // Verify the confirmation title matches
      if (project.title !== parsedInput.confirmTitle) {
        throw new Error('프로젝트 제목이 일치하지 않습니다.')
      }

      // Delete the project
      await prisma.project.delete({
        where: { id: parsedInput.projectId },
      })

      // Revalidate relevant pages
      revalidatePath('/projects')
      revalidatePath('/dashboard')

      return {
        success: true,
        deletedProject: {
          id: project.id,
          title: project.title,
        },
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error // Re-throw known errors
      }

      console.error('Database error deleting project:', error)
      throw new Error('프로젝트 삭제 중 데이터베이스 오류가 발생했습니다.')
    }
  })
// ===== ADDITIONAL ENHANCED EXAMPLES =====

/**
 * Example of a high-frequency action with strict rate limiting
 */
const searchSchema = z.object({
  query: z
    .string()
    .min(1, '검색어를 입력해주세요.')
    .max(100, '검색어는 100자 이하여야 합니다.'),
  filters: z
    .object({
      category: z.string().optional(),
      dateRange: z.string().optional(),
    })
    .optional(),
})

export const searchAction = createPublicAction('search', {
  rateLimit: {
    maxRequests: 30, // Allow 30 searches per minute
    windowMs: 60000,
  },
  logLevel: 'debug', // More detailed logging for search
})
  .schema(searchSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      // TODO: Replace with actual search implementation
      // For now, simulate search results
      const results = [
        {
          id: '1',
          title: `Results for "${parsedInput.query}"`,
          type: 'project',
        },
        {
          id: '2',
          title: `More results for "${parsedInput.query}"`,
          type: 'user',
        },
      ]

      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 200))

      return {
        success: true,
        query: parsedInput.query,
        results,
        totalCount: results.length,
        searchTime: 200,
      }
    } catch (error) {
      console.error('Search error:', error)
      throw new Error('검색 중 오류가 발생했습니다.')
    }
  })

/**
 * Example of an admin-only action with custom authorization
 */
const adminActionSchema = z.object({
  action: z.enum(['delete_user', 'ban_user', 'promote_user']),
  targetUserId: z.string().min(1, '대상 사용자 ID가 필요합니다.'),
  reason: z.string().min(10, '사유는 최소 10자 이상이어야 합니다.'),
})

export const adminAction = createAuthAction('adminAction', {
  requiresAuth: true,
  rateLimit: {
    maxRequests: 5, // Very strict rate limiting for admin actions
    windowMs: 300000, // 5 minutes
  },
  logLevel: 'warn', // Log all admin actions as warnings for audit
})
  .schema(adminActionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx

    if (!user) {
      throw new Error('인증이 필요합니다.')
    }

    // TODO: Replace with actual admin role check
    // For now, simulate admin check (in real app, check user.role === 'admin')
    const isAdmin = user.email?.endsWith('@admin.com') // Placeholder logic

    if (!isAdmin) {
      throw new Error('관리자 권한이 필요합니다.')
    }

    try {
      // TODO: Replace with actual admin action implementation
      console.log('Admin action executed:', {
        adminId: user.id,
        adminEmail: user.email,
        action: parsedInput.action,
        targetUserId: parsedInput.targetUserId,
        reason: parsedInput.reason,
        timestamp: new Date().toISOString(),
      })

      // Simulate admin action processing
      await new Promise(resolve => setTimeout(resolve, 1000))

      return {
        success: true,
        action: parsedInput.action,
        targetUserId: parsedInput.targetUserId,
        executedBy: user.id,
        executedAt: new Date(),
      }
    } catch (error) {
      console.error('Admin action error:', error)
      throw new Error('관리자 작업 중 오류가 발생했습니다.')
    }
  })

/**
 * Example of a file upload action with enhanced validation
 */
const fileUploadSchema = z.object({
  fileName: z.string().min(1, '파일명이 필요합니다.'),
  fileSize: z
    .number()
    .max(10 * 1024 * 1024, '파일 크기는 10MB 이하여야 합니다.'), // 10MB limit
  fileType: z.enum(
    ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    {
      errorMap: () => ({ message: '지원하지 않는 파일 형식입니다.' }),
    }
  ),
  projectId: z.string().optional(),
})

export const uploadFileAction = createAuthAction('uploadFile', {
  requiresAuth: true,
  rateLimit: {
    maxRequests: 20, // Allow 20 file uploads per minute
    windowMs: 60000,
  },
  logLevel: 'info',
})
  .schema(fileUploadSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx

    if (!user) {
      throw new Error('인증이 필요합니다.')
    }

    try {
      // TODO: Replace with actual file upload logic (S3, Cloudinary, etc.)
      // For now, simulate file upload
      const fileId = Math.random().toString(36).substr(2, 12)
      const uploadUrl = `/uploads/${fileId}-${parsedInput.fileName}`

      console.log('File upload simulated:', {
        userId: user.id,
        fileName: parsedInput.fileName,
        fileSize: parsedInput.fileSize,
        fileType: parsedInput.fileType,
        uploadUrl,
        timestamp: new Date().toISOString(),
      })

      // Simulate upload processing time
      await new Promise(resolve => setTimeout(resolve, 2000))

      // If projectId is provided, associate file with project
      if (parsedInput.projectId) {
        // TODO: Create file record in database associated with project
        console.log(`File associated with project: ${parsedInput.projectId}`)
      }

      return {
        success: true,
        fileId,
        fileName: parsedInput.fileName,
        uploadUrl,
        uploadedAt: new Date(),
      }
    } catch (error) {
      console.error('File upload error:', error)
      throw new Error('파일 업로드 중 오류가 발생했습니다.')
    }
  })

/**
 * Example of a batch operation with transaction-like behavior
 */
const batchUpdateSchema = z.object({
  projectIds: z
    .array(z.string())
    .min(1, '최소 하나의 프로젝트를 선택해주세요.')
    .max(10, '한 번에 최대 10개까지만 처리할 수 있습니다.'),
  updates: z.object({
    status: z.enum(['active', 'inactive', 'archived']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  }),
})

export const batchUpdateProjectsAction = createCrudAction(
  'batchUpdateProjects',
  {
    rateLimit: {
      maxRequests: 5, // Strict limit for batch operations
      windowMs: 300000, // 5 minutes
    },
    logLevel: 'info',
  }
)
  .schema(batchUpdateSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { user } = ctx

    if (!user) {
      throw new Error('인증이 필요합니다.')
    }

    try {
      // Verify all projects belong to the user
      const projects = await prisma.project.findMany({
        where: {
          id: { in: parsedInput.projectIds },
          userId: user.id,
        },
        select: { id: true, title: true },
      })

      if (projects.length !== parsedInput.projectIds.length) {
        throw new Error('일부 프로젝트에 대한 권한이 없거나 존재하지 않습니다.')
      }

      // Perform batch update
      const updateData: any = {}
      if (parsedInput.updates.status) {
        updateData.status = parsedInput.updates.status
      }
      if (parsedInput.updates.priority) {
        updateData.priority = parsedInput.updates.priority
      }

      // TODO: Add status and priority fields to Project model
      // For now, just simulate the update
      console.log('Batch update simulated:', {
        userId: user.id,
        projectIds: parsedInput.projectIds,
        updates: parsedInput.updates,
        affectedProjects: projects.length,
        timestamp: new Date().toISOString(),
      })

      // Simulate batch processing time
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Revalidate relevant pages
      revalidatePath('/projects')
      revalidatePath('/dashboard')

      return {
        success: true,
        updatedProjects: projects,
        appliedUpdates: parsedInput.updates,
        processedAt: new Date(),
      }
    } catch (error) {
      console.error('Batch update error:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('일괄 업데이트 중 오류가 발생했습니다.')
    }
  })
