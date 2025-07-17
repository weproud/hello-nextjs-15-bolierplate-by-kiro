'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
  contactSchema,
  projectSchema,
  registerSchema,
  profileSchema,
  feedbackSchema,
  teamInviteSchema,
} from '../validations/common'
import {
  actionClient,
  authActionClient,
  publicActionClient,
  createAuthAction,
  createPublicAction,
  createCrudAction,
  createFormAction,
} from '../safe-action'

// Create action instances - use base actionClient to access .input() method
const action = actionClient
const authAction = actionClient

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
      id: Math.random().toString(36).substring(2, 11),
      ...validatedData,
      createdAt: new Date(),
    }

    // Revalidate the projects page
    revalidatePath('/projects')

    console.log('Project created successfully:', project.id)
    return {
      success: true,
      data: project,
    }
  } catch (error) {
    console.error('Failed to create project:', error)
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
      console.log('Contact form submitted:', {
        name: parsedInput.name,
        email: parsedInput.email,
        subject: parsedInput.subject,
      })

      // TODO: Replace with actual email sending or database storage
      // For now, simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500))

      console.log('Contact form processed successfully')
      return { message: '문의가 성공적으로 전송되었습니다.' }
    } catch (error) {
      console.error('Failed to submit contact form:', error)
      throw new Error('문의 전송 중 오류가 발생했습니다.')
    }
  })

// User registration action using next-safe-action
export const registerUser = action
  .inputSchema(registerSchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log('User registration attempt:', {
        name: parsedInput.name,
        email: parsedInput.email,
      })

      // TODO: Replace with actual user creation logic
      // For now, simulate a successful registration
      await new Promise(resolve => setTimeout(resolve, 1000))

      const user = {
        id: Math.random().toString(36).substring(2, 11),
        name: parsedInput.name,
        email: parsedInput.email,
        createdAt: new Date(),
      }

      console.log('User registered successfully:', user.id)
      return user
    } catch (error) {
      console.error('Failed to register user:', error)
      throw new Error('사용자 등록 중 오류가 발생했습니다.')
    }
  })

// Profile update action using authenticated next-safe-action
export const updateProfile = authAction
  .inputSchema(profileSchema)
  .use(async ({ next }) => {
    const { auth } = await import('../../auth')
    const session = await auth()

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
    try {
      console.log(`[${ctx.userId}] Updating profile:`, {
        name: parsedInput.name,
        email: parsedInput.email,
      })

      // TODO: Replace with actual profile update logic
      await new Promise(resolve => setTimeout(resolve, 800))

      revalidatePath('/profile')

      console.log(`[${ctx.userId}] Profile updated successfully`)
      return parsedInput
    } catch (error) {
      console.error(`[${ctx.userId}] Failed to update profile:`, error)
      throw new Error('프로필 업데이트 중 오류가 발생했습니다.')
    }
  })

// Feedback submission action using authenticated next-safe-action
export const submitFeedback = authAction
  .inputSchema(feedbackSchema)
  .use(async ({ next }) => {
    const { auth } = await import('../../auth')
    const session = await auth()

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
    try {
      console.log(`[${ctx.userId}] Submitting feedback:`, {
        type: parsedInput.type,
        title: parsedInput.title,
      })

      // TODO: Replace with actual feedback storage logic
      await new Promise(resolve => setTimeout(resolve, 1200))

      const feedback = {
        id: Math.random().toString(36).substring(2, 11),
        ...parsedInput,
        userId: ctx.userId,
        createdAt: new Date(),
        status: 'pending' as const,
      }

      console.log(
        `[${ctx.userId}] Feedback submitted successfully:`,
        feedback.id
      )
      return feedback
    } catch (error) {
      console.error(`[${ctx.userId}] Failed to submit feedback:`, error)
      throw new Error('피드백 제출 중 오류가 발생했습니다.')
    }
  })

// Team invite action using authenticated next-safe-action
export const inviteTeamMember = authAction
  .inputSchema(teamInviteSchema)
  .use(async ({ next }) => {
    const { auth } = await import('../../auth')
    const session = await auth()

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
    try {
      console.log(`[${ctx.userId}] Inviting team member:`, {
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

      console.log(`[${ctx.userId}] Team invite sent successfully:`, invite.id)
      return invite
    } catch (error) {
      console.error(`[${ctx.userId}] Failed to invite team member:`, error)
      throw new Error('팀 멤버 초대 중 오류가 발생했습니다.')
    }
  })
// File upload action with validation
export const uploadFile = authAction
  .inputSchema(
    z.object({
      file: z.instanceof(File),
      category: z.enum(['avatar', 'document', 'image']),
    })
  )
  .use(async ({ next }) => {
    const { auth } = await import('../../auth')
    const session = await auth()

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
    try {
      console.log(`[${ctx.userId}] Uploading file:`, {
        name: parsedInput.file.name,
        size: parsedInput.file.size,
        type: parsedInput.file.type,
        category: parsedInput.category,
      })

      // Validate file size (5MB limit)
      if (parsedInput.file.size > 5 * 1024 * 1024) {
        throw new Error('파일 크기는 5MB 이하여야 합니다.')
      }

      // Validate file type based on category
      const allowedTypes = {
        avatar: ['image/jpeg', 'image/png', 'image/webp'],
        document: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      }

      if (!allowedTypes[parsedInput.category].includes(parsedInput.file.type)) {
        throw new Error(
          `${parsedInput.category} 카테고리에 허용되지 않는 파일 형식입니다.`
        )
      }

      // TODO: Replace with actual file upload logic (e.g., AWS S3, Cloudinary)
      await new Promise(resolve => setTimeout(resolve, 2000))

      const uploadResult = {
        id: Math.random().toString(36).substring(2, 11),
        filename: parsedInput.file.name,
        size: parsedInput.file.size,
        type: parsedInput.file.type,
        category: parsedInput.category,
        url: `https://example.com/uploads/${Math.random().toString(36).substring(2, 11)}.${parsedInput.file.name.split('.').pop()}`,
        uploadedBy: ctx.userId,
        uploadedAt: new Date(),
      }

      console.log(
        `[${ctx.userId}] File uploaded successfully:`,
        uploadResult.id
      )
      return uploadResult
    } catch (error) {
      console.error(`[${ctx.userId}] Failed to upload file:`, error)
      throw error instanceof Error
        ? error
        : new Error('파일 업로드 중 오류가 발생했습니다.')
    }
  })

// Batch delete action
export const batchDeleteItems = authAction
  .inputSchema(
    z.object({
      ids: z
        .array(z.string())
        .min(1, '삭제할 항목을 선택해주세요.')
        .max(50, '한 번에 최대 50개까지 삭제 가능합니다.'),
      type: z.enum(['projects', 'files', 'comments']),
    })
  )
  .use(async ({ next }) => {
    const { auth } = await import('../../auth')
    const session = await auth()

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
    try {
      console.log(
        `[${ctx.userId}] Batch deleting ${parsedInput.type}:`,
        parsedInput.ids
      )

      // TODO: Replace with actual batch delete logic
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Simulate some items failing to delete
      const failedIds = parsedInput.ids.slice(0, Math.floor(Math.random() * 2))
      const successIds = parsedInput.ids.filter(id => !failedIds.includes(id))

      const result = {
        success: successIds,
        failed: failedIds,
        total: parsedInput.ids.length,
        successCount: successIds.length,
        failedCount: failedIds.length,
      }

      // Revalidate relevant pages
      revalidatePath(`/${parsedInput.type}`)

      console.log(`[${ctx.userId}] Batch delete completed:`, result)
      return result
    } catch (error) {
      console.error(`[${ctx.userId}] Failed to batch delete:`, error)
      throw new Error('일괄 삭제 중 오류가 발생했습니다.')
    }
  })

// Search action with filters
export const searchItems = action
  .inputSchema(
    z.object({
      query: z.string().min(1, '검색어를 입력해주세요.').max(100),
      filters: z
        .object({
          category: z.string().optional(),
          dateRange: z
            .object({
              from: z.date().optional(),
              to: z.date().optional(),
            })
            .optional(),
          sortBy: z.enum(['relevance', 'date', 'name']).default('relevance'),
          sortOrder: z.enum(['asc', 'desc']).default('desc'),
        })
        .optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    })
  )
  .action(async ({ parsedInput }) => {
    try {
      console.log('Searching items:', {
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

      console.log('Search completed:', {
        query: parsedInput.query,
        resultCount: result.items.length,
        searchTime: result.searchTime,
      })
      return result
    } catch (error) {
      console.error('Search failed:', error)
      throw new Error('검색 중 오류가 발생했습니다.')
    }
  })

// Newsletter subscription with double opt-in
export const subscribeNewsletter = action
  .inputSchema(
    z.object({
      email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
      preferences: z
        .array(z.enum(['tech', 'design', 'business', 'marketing']))
        .min(1, '최소 하나의 관심사를 선택해주세요.'),
      frequency: z.enum(['daily', 'weekly', 'monthly']),
    })
  )
  .action(async ({ parsedInput }) => {
    try {
      console.log('Newsletter subscription:', {
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
      console.log('Confirmation email would be sent to:', parsedInput.email)

      console.log('Newsletter subscription created:', subscription.id)
      return {
        message:
          '구독 신청이 완료되었습니다. 이메일을 확인하여 구독을 활성화해주세요.',
        subscriptionId: subscription.id,
      }
    } catch (error) {
      console.error('Newsletter subscription failed:', error)
      throw new Error('뉴스레터 구독 중 오류가 발생했습니다.')
    }
  })

// Multi-step form submission action
export const submitMultiStepForm = action
  .inputSchema(
    z.object({
      basicInfo: z.object({
        name: z.string().min(1, '이름을 입력해주세요.'),
        email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
        phone: z.string().min(1, '전화번호를 입력해주세요.'),
      }),
      preferences: z.object({
        interests: z
          .array(z.string())
          .min(1, '최소 하나의 관심사를 선택해주세요.'),
        notifications: z.object({
          email: z.boolean(),
          sms: z.boolean(),
          push: z.boolean(),
        }),
        language: z.enum(['ko', 'en', 'ja'], {
          message: '언어를 선택해주세요.',
        }),
      }),
      verification: z.object({
        terms: z.boolean().refine(val => val === true, {
          message: '이용약관에 동의해주세요.',
        }),
        privacy: z.boolean().refine(val => val === true, {
          message: '개인정보처리방침에 동의해주세요.',
        }),
        marketing: z.boolean().optional(),
        verificationCode: z
          .string()
          .min(6, '인증코드 6자리를 입력해주세요.')
          .max(6, '인증코드는 6자리입니다.'),
      }),
    })
  )
  .action(async ({ parsedInput }) => {
    try {
      console.log('Multi-step form submission:', {
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

      console.log('Multi-step registration completed:', user.id)
      return {
        message: '회원가입이 성공적으로 완료되었습니다!',
        user,
      }
    } catch (error) {
      console.error('Multi-step form submission failed:', error)
      throw error instanceof Error
        ? error
        : new Error('회원가입 중 오류가 발생했습니다.')
    }
  })
