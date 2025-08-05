'use server'

import { createLogger } from '@/lib/logger'
import { actionClient } from '@/lib/safe-action'
import { ApiResponse } from '@/lib/type-utils'
import {
  contactSchema,
  feedbackSchema,
  profileSchema,
  projectSchema,
  registerSchema,
  teamInviteSchema,
} from '@/lib/validations/common'
import {
  batchDeleteSchema,
  fileUploadSchema,
  multiStepFormSchema,
  newsletterSubscriptionSchema,
  searchItemsSchema,
} from '@/lib/validations/form-action-schemas'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const logger = createLogger('form-actions')

// Helper functions for file validation
function validateFileSize(file: File, maxSize: number = 5 * 1024 * 1024): void {
  if (file.size > maxSize) {
    throw new Error('파일 크기는 5MB 이하여야 합니다.')
  }
}

function validateFileType(
  file: File,
  category: 'avatar' | 'document' | 'image'
): void {
  const allowedTypes = {
    avatar: ['image/jpeg', 'image/png', 'image/webp'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  }

  if (!allowedTypes[category].includes(file.type)) {
    throw new Error(`${category} 카테고리에 허용되지 않는 파일 형식입니다.`)
  }
}

// Create action instances - use base actionClient to access .input() method
const action = actionClient
const authAction = actionClient

// Use the improved ApiResponse type from type-utils
type ActionResult<T = unknown> = ApiResponse<T>

// Helper function to handle validation errors
function handleValidationError(error: z.ZodError): ActionResult {
  const fieldErrors: Record<string, string[]> = {}

  error.issues.forEach(err => {
    const path = err.path.join('.')
    if (!fieldErrors[path]) {
      fieldErrors[path] = []
    }
    fieldErrors[path].push(err.message)
  })

  return {
    success: false,
    error: '입력 데이터가 올바르지 않습니다.',
    details: fieldErrors,
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

    // Create project in database
    const { projectRepository } = await import('@/lib/repositories')
    const { getCurrentSession } = await import('@/services/auth')

    const session = await getCurrentSession()
    if (!session?.user?.id) {
      throw new Error('로그인이 필요합니다.')
    }

    const project = await projectRepository.create({
      title: validatedData.title,
      description: validatedData.description,
      user: {
        connect: { id: session.user.id },
      },
    })

    // Revalidate the projects page
    revalidatePath('/projects')

    logger.info('Project created successfully', {
      projectId: project.id,
      title: project.title,
    })
    return {
      success: true,
      data: project,
    }
  } catch (error) {
    logger.error('Failed to create project', error as Error)
    if (error instanceof z.ZodError) {
      return handleValidationError(error)
    }
    return {
      success: false,
      error: '프로젝트 생성 중 오류가 발생했습니다.',
    }
  }
}

// Contact form submission action using next-safe-action
export const submitContact = action
  .inputSchema(contactSchema)
  .action(async ({ parsedInput }) => {
    try {
      logger.info('Contact form submitted', {
        name: parsedInput.name,
        email: parsedInput.email,
        subject: parsedInput.subject,
      })

      // Send email using email service
      const { emailService } = await import('@/services/email')

      await emailService.sendContactFormEmail(
        process.env['CONTACT_EMAIL'] || 'admin@example.com',
        {
          name: parsedInput.name,
          email: parsedInput.email,
          subject: parsedInput.subject,
          message: parsedInput.message,
        }
      )

      logger.info('Contact form processed successfully')
      return { message: '문의가 성공적으로 전송되었습니다.' }
    } catch (error) {
      logger.error('Failed to submit contact form', error as Error)
      throw new Error('문의 전송 중 오류가 발생했습니다.')
    }
  })

// User registration action using next-safe-action
export const registerUser = action
  .inputSchema(registerSchema)
  .action(async ({ parsedInput }) => {
    'use server'
    try {
      logger.info('User registration attempt', {
        name: parsedInput.name,
        email: parsedInput.email,
      })

      // Create user in database
      const { userRepository } = await import('@/lib/repositories')

      // Check if user already exists
      const existingUser = await userRepository.findByEmail(parsedInput.email)

      if (existingUser) {
        throw new Error('이미 등록된 이메일 주소입니다.')
      }

      const user = await userRepository.create({
        name: parsedInput.name,
        email: parsedInput.email,
      })

      logger.info('User registered successfully', { userId: user.id })
      return user
    } catch (error) {
      logger.error('Failed to register user', error as Error)
      throw new Error('사용자 등록 중 오류가 발생했습니다.')
    }
  })

// Profile update action using authenticated next-safe-action
export const updateProfile = authAction
  .inputSchema(profileSchema)
  .use(async ({ next }) => {
    const { getCurrentSession } = await import('@/services/auth')
    const session = await getCurrentSession()

    if (!session?.user) {
      throw new Error('로그인이 필요합니다.')
    }

    return next({
      ctx: {
        userId: session.user.id,
        user: session.user,
        session,
      },
    })
  })
  .action(async ({ parsedInput, ctx }) => {
    'use server'
    try {
      logger.info('Updating profile', {
        userId: ctx.userId,
        name: parsedInput.name,
        email: parsedInput.email,
      })

      // Update user profile in database
      const { userRepository } = await import('@/lib/repositories')

      await userRepository.update(ctx.userId, {
        name: parsedInput.name,
        email: parsedInput.email,
      })

      revalidatePath('/profile')

      logger.info('Profile updated successfully', { userId: ctx.userId })
      return parsedInput
    } catch (error) {
      logger.error('Failed to update profile', error as Error, {
        userId: ctx.userId,
      })
      throw new Error('프로필 업데이트 중 오류가 발생했습니다.')
    }
  })

// Feedback submission action using authenticated next-safe-action
export const submitFeedback = authAction
  .inputSchema(feedbackSchema)
  .use(async ({ next }) => {
    const { getCurrentSession } = await import('@/services/auth')
    const session = await getCurrentSession()

    if (!session?.user) {
      throw new Error('로그인이 필요합니다.')
    }

    return next({
      ctx: {
        userId: session.user.id,
        user: session.user,
        session,
      },
    })
  })
  .action(async ({ parsedInput, ctx }) => {
    'use server'
    try {
      logger.info('Submitting feedback', {
        userId: ctx.userId,
        type: parsedInput.type,
        title: parsedInput.title,
      })

      // Store feedback in database (시뮬레이션 - 실제로는 feedback 테이블 필요)
      // 현재 스키마에 feedback 테이블이 없으므로 임시로 시뮬레이션 유지
      await new Promise(resolve => setTimeout(resolve, 1200))

      const feedback = {
        id: Math.random().toString(36).substring(2, 11),
        ...parsedInput,
        userId: ctx.userId,
        createdAt: new Date(),
        status: 'pending' as const,
      }

      logger.info('Feedback submitted successfully', {
        userId: ctx.userId,
        feedbackId: feedback.id,
      })
      return feedback
    } catch (error) {
      logger.error('Failed to submit feedback', error as Error, {
        userId: ctx.userId,
      })
      throw new Error('피드백 제출 중 오류가 발생했습니다.')
    }
  })

// Team invite action using authenticated next-safe-action
export const inviteTeamMember = authAction
  .inputSchema(teamInviteSchema)
  .use(async ({ next }) => {
    const { getCurrentSession } = await import('@/services/auth')
    const session = await getCurrentSession()

    if (!session?.user) {
      throw new Error('로그인이 필요합니다.')
    }

    return next({
      ctx: {
        userId: session.user.id,
        user: session.user,
        session,
      },
    })
  })
  .action(async ({ parsedInput, ctx }) => {
    'use server'
    try {
      logger.info('Inviting team member', {
        userId: ctx.userId,
        email: parsedInput.email,
        role: parsedInput.role,
      })

      // TODO: Replace with actual team invite logic
      await new Promise(resolve => setTimeout(resolve, 1000))

      const invite = {
        id: Math.random().toString(36).substring(2, 11),
        ...parsedInput,
        invitedBy: ctx.userId,
        status: 'pending' as const,
        createdAt: new Date(),
      }

      logger.info('Team invite sent successfully', {
        userId: ctx.userId,
        inviteId: invite.id,
      })
      return invite
    } catch (error) {
      logger.error('Failed to invite team member', error as Error, {
        userId: ctx.userId,
      })
      throw new Error('팀 멤버 초대 중 오류가 발생했습니다.')
    }
  })
// File upload action with validation
export const uploadFile = authAction
  .inputSchema(fileUploadSchema)
  .use(async ({ next }) => {
    const { getCurrentSession } = await import('@/services/auth')
    const session = await getCurrentSession()

    if (!session?.user) {
      throw new Error('로그인이 필요합니다.')
    }

    return next({
      ctx: {
        userId: session.user.id,
        user: session.user,
        session,
      },
    })
  })
  .action(async ({ parsedInput, ctx }) => {
    'use server'
    try {
      logger.info('Uploading file', {
        userId: ctx.userId,
        name: parsedInput.file.name,
        size: parsedInput.file.size,
        type: parsedInput.file.type,
        category: parsedInput.category,
      })

      // Validate file using helper functions
      validateFileSize(parsedInput.file)
      validateFileType(parsedInput.file, parsedInput.category)

      // Upload file using storage service
      const { storage, uploadPresets } = await import('@/services/storage')

      const preset = uploadPresets[parsedInput.category]
      const uploadResult = await storage.upload(parsedInput.file, preset)

      const result = {
        id: Math.random().toString(36).substring(2, 11),
        filename: parsedInput.file.name,
        size: parsedInput.file.size,
        type: parsedInput.file.type,
        category: parsedInput.category,
        url: uploadResult.url,
        key: uploadResult.key,
        uploadedBy: ctx.userId,
        uploadedAt: new Date(),
      }

      logger.info('File uploaded successfully', {
        userId: ctx.userId,
        fileId: (uploadResult as any).id || 'unknown',
      })
      return uploadResult
    } catch (error) {
      logger.error('Failed to upload file', error as Error, {
        userId: ctx.userId,
      })
      throw error instanceof Error
        ? error
        : new Error('파일 업로드 중 오류가 발생했습니다.')
    }
  })

// Batch delete action
export const batchDeleteItems = authAction
  .inputSchema(batchDeleteSchema)
  .use(async ({ next }) => {
    const { getCurrentSession } = await import('@/services/auth')
    const session = await getCurrentSession()

    if (!session?.user) {
      throw new Error('로그인이 필요합니다.')
    }

    return next({
      ctx: {
        userId: session.user.id,
        user: session.user,
        session,
      },
    })
  })
  .action(async ({ parsedInput, ctx }) => {
    'use server'
    try {
      logger.info('Batch deleting items', {
        userId: ctx.userId,
        type: parsedInput.type,
        ids: parsedInput.ids,
      })

      // Batch delete items from database
      const { prisma } = await import('@/lib/prisma')

      const successIds: string[] = []
      const failedIds: string[] = []

      for (const id of parsedInput.ids) {
        try {
          if (parsedInput.type === 'projects') {
            const { projectRepository } = await import('@/lib/repositories')
            // Check if project belongs to user before deleting
            const project = await projectRepository.findFirst({
              where: { id, userId: ctx.userId },
            })
            if (project) {
              await projectRepository.delete(id)
            } else {
              throw new Error('Project not found or access denied')
            }
          }
          // Add other types as needed
          successIds.push(id)
        } catch (error) {
          failedIds.push(id)
        }
      }

      const result = {
        success: successIds,
        failed: failedIds,
        total: parsedInput.ids.length,
        successCount: successIds.length,
        failedCount: failedIds.length,
      }

      // Revalidate relevant pages
      revalidatePath(`/${parsedInput.type}`)

      logger.info('Batch delete completed', {
        userId: ctx.userId,
        result,
      })
      return result
    } catch (error) {
      logger.error('Failed to batch delete', error as Error, {
        userId: ctx.userId,
      })
      throw new Error('일괄 삭제 중 오류가 발생했습니다.')
    }
  })

// Search action with filters
export const searchItems = action
  .inputSchema(searchItemsSchema)
  .action(async ({ parsedInput }) => {
    'use server'
    try {
      logger.info('Searching items', {
        query: parsedInput.query,
        filters: parsedInput.filters,
        pagination: { page: parsedInput.page, limit: parsedInput.limit },
      })

      // TODO: Replace with actual search logic (e.g., Elasticsearch, database search)
      await new Promise(resolve => setTimeout(resolve, 800))

      // Simulate search results
      const mockResults = Array.from({ length: parsedInput.limit }, (_, i) => ({
        id: Math.random().toString(36).substring(2, 11),
        title: `Search Result ${i + 1} for "${parsedInput.query}"`,
        description: `This is a mock search result that matches your query: ${parsedInput.query}`,
        category: parsedInput.filters?.category || 'general',
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
        relevanceScore: Math.random(),
      }))

      const result = {
        items: mockResults,
        pagination: {
          page: parsedInput.page,
          limit: parsedInput.limit,
          total: 150, // Mock total
          totalPages: Math.ceil(150 / parsedInput.limit),
        },
        query: parsedInput.query,
        filters: parsedInput.filters,
        searchTime: Math.random() * 100 + 50, // Mock search time in ms
      }

      logger.info('Search completed', {
        query: parsedInput.query,
        resultCount: result.items.length,
        searchTime: result.searchTime,
      })
      return result
    } catch (error) {
      logger.error('Search failed', error as Error)
      throw new Error('검색 중 오류가 발생했습니다.')
    }
  })

// Newsletter subscription with double opt-in
export const subscribeNewsletter = action
  .inputSchema(newsletterSubscriptionSchema)
  .action(async ({ parsedInput }) => {
    'use server'
    try {
      logger.info('Newsletter subscription', {
        email: parsedInput.email,
        preferences: parsedInput.preferences,
        frequency: parsedInput.frequency,
      })

      // TODO: Replace with actual newsletter subscription logic
      await new Promise(resolve => setTimeout(resolve, 1200))

      const subscription = {
        id: Math.random().toString(36).substring(2, 11),
        email: parsedInput.email,
        preferences: parsedInput.preferences,
        frequency: parsedInput.frequency,
        status: 'pending_confirmation',
        subscribedAt: new Date(),
        confirmationToken: Math.random().toString(36).substring(2, 15),
      }

      // TODO: Send confirmation email
      logger.info('Confirmation email would be sent', {
        email: parsedInput.email,
      })

      logger.info('Newsletter subscription created', {
        subscriptionId: subscription.id,
      })
      return {
        message:
          '구독 신청이 완료되었습니다. 이메일을 확인하여 구독을 활성화해주세요.',
        subscriptionId: subscription.id,
      }
    } catch (error) {
      logger.error('Newsletter subscription failed', error as Error)
      throw new Error('뉴스레터 구독 중 오류가 발생했습니다.')
    }
  })

// Multi-step form submission action
export const submitMultiStepForm = action
  .inputSchema(multiStepFormSchema)
  .action(async ({ parsedInput }) => {
    'use server'
    try {
      logger.info('Multi-step form submission', {
        name: parsedInput.basicInfo.name,
        email: parsedInput.basicInfo.email,
        interests: parsedInput.preferences.interests,
        language: parsedInput.preferences.language,
      })

      // TODO: Replace with actual user registration logic
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simulate verification code validation
      if (parsedInput.verification.verificationCode !== '123456') {
        throw new Error('인증코드가 올바르지 않습니다.')
      }

      const user = {
        id: Math.random().toString(36).substring(2, 11),
        name: parsedInput.basicInfo.name,
        email: parsedInput.basicInfo.email,
        phone: parsedInput.basicInfo.phone,
        preferences: parsedInput.preferences,
        createdAt: new Date(),
        status: 'active',
      }

      logger.info('Multi-step registration completed', { userId: user.id })
      return {
        message: '회원가입이 성공적으로 완료되었습니다!',
        user,
      }
    } catch (error) {
      logger.error('Multi-step form submission failed', error as Error)
      throw error instanceof Error
        ? error
        : new Error('회원가입 중 오류가 발생했습니다.')
    }
  })

// Generic typed form action creator
export function createTypedFormAction<TSchema extends z.ZodType>(
  schema: TSchema,
  handler: (data: z.infer<TSchema>) => Promise<any>
) {
  return action.inputSchema(schema).action(async ({ parsedInput }) => {
    return await handler(parsedInput)
  })
}
