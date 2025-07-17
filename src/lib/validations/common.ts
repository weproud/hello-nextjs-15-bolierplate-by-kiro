import { z } from 'zod'

// Common validation schemas
export const idSchema = z.string().cuid()
export const emailSchema = z.string().email('Invalid email address')
export const urlSchema = z.string().url('Invalid URL')
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')

// String validations
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
export const descriptionSchema = z
  .string()
  .max(500, 'Description too long')
  .optional()
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')

// Number validations
export const positiveIntSchema = z.number().int().positive()
export const pageSchema = z.number().int().min(1).default(1)
export const limitSchema = z.number().int().min(1).max(100).default(10)

// Date validations
export const dateSchema = z.date()
export const futureDateSchema = z.date().refine(date => date > new Date(), {
  message: 'Date must be in the future',
})

// Pagination schema
export const paginationSchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  filters: z.record(z.any()).optional(),
})

// File upload schema
export const fileSchema = z.object({
  name: z.string(),
  size: z.number().max(10 * 1024 * 1024, 'File too large (max 10MB)'),
  type: z.string(),
})

// Common response schemas
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
})

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.any().optional(),
})

export const apiResponseSchema = z.union([
  successResponseSchema,
  errorResponseSchema,
])

// Validation helpers
export const createArraySchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.array(itemSchema).min(1, 'At least one item is required')

export const createOptionalArraySchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) => z.array(itemSchema).optional()

export const createEnumSchema = <T extends readonly [string, ...string[]]>(
  values: T
) => z.enum(values)

// Custom validation functions
export const isValidCuid = (value: string): boolean => {
  return /^c[a-z0-9]{24}$/.test(value)
}

export const isValidSlug = (value: string): boolean => {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

export const sanitizeString = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ')
}
// Advanced validation schemas for complex forms
export const eventRegistrationSchema = z.object({
  eventId: z.string().min(1, '이벤트를 선택해주세요.'),
  attendeeInfo: z.object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    company: z.string().optional(),
    jobTitle: z.string().optional(),
  }),
  dietaryRestrictions: z.array(z.string()).optional(),
  specialRequests: z
    .string()
    .max(500, '특별 요청사항은 최대 500자까지 입력 가능합니다.')
    .optional(),
  emergencyContact: z.object({
    name: z.string().min(1, '비상연락처 이름을 입력해주세요.'),
    phone: phoneSchema,
    relationship: z.string().min(1, '관계를 입력해주세요.'),
  }),
})

export const productReviewSchema = z.object({
  productId: z.string().min(1, '제품 ID가 필요합니다.'),
  rating: z
    .number()
    .min(1, '최소 1점을 선택해주세요.')
    .max(5, '최대 5점까지 선택 가능합니다.'),
  title: z
    .string()
    .min(1, '리뷰 제목을 입력해주세요.')
    .max(100, '제목은 최대 100자까지 입력 가능합니다.'),
  content: z
    .string()
    .min(10, '리뷰 내용은 최소 10자 이상 입력해주세요.')
    .max(1000, '리뷰 내용은 최대 1000자까지 입력 가능합니다.'),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  wouldRecommend: z.boolean(),
  images: z
    .array(z.instanceof(File))
    .max(5, '최대 5개의 이미지까지 업로드 가능합니다.')
    .optional(),
})

export const jobApplicationSchema = z.object({
  position: z.string().min(1, '지원 직책을 입력해주세요.'),
  personalInfo: z.object({
    firstName: z.string().min(1, '이름을 입력해주세요.'),
    lastName: z.string().min(1, '성을 입력해주세요.'),
    email: emailSchema,
    phone: phoneSchema,
    address: addressSchema,
  }),
  experience: z.object({
    yearsOfExperience: z.number().min(0, '경력은 0년 이상이어야 합니다.'),
    currentPosition: z.string().optional(),
    currentCompany: z.string().optional(),
    skills: z.array(z.string()).min(1, '최소 하나의 기술을 입력해주세요.'),
    portfolio: urlSchema,
  }),
  education: z.array(
    z.object({
      degree: z.string().min(1, '학위를 입력해주세요.'),
      institution: z.string().min(1, '교육기관을 입력해주세요.'),
      graduationYear: z
        .number()
        .min(1900, '올바른 졸업년도를 입력해주세요.')
        .max(new Date().getFullYear() + 10, '올바른 졸업년도를 입력해주세요.'),
      gpa: z.number().min(0).max(4.5).optional(),
    })
  ),
  documents: z.object({
    resume: z.instanceof(File, { message: '이력서를 업로드해주세요.' }),
    coverLetter: z.instanceof(File).optional(),
    portfolio: z.instanceof(File).optional(),
  }),
  availability: z.object({
    startDate: z.date({ message: '입사 가능일을 선택해주세요.' }),
    salaryExpectation: z
      .number()
      .min(0, '희망 연봉을 입력해주세요.')
      .optional(),
    workType: z.enum(['full-time', 'part-time', 'contract', 'remote'], {
      message: '근무 형태를 선택해주세요.',
    }),
  }),
})

export const bookingSchema = z.object({
  serviceType: z.enum(['consultation', 'appointment', 'meeting'], {
    message: '서비스 유형을 선택해주세요.',
  }),
  dateTime: z.date({ message: '날짜와 시간을 선택해주세요.' }),
  duration: z
    .number()
    .min(15, '최소 15분 이상 선택해주세요.')
    .max(480, '최대 8시간까지 선택 가능합니다.'),
  clientInfo: z.object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    company: z.string().optional(),
  }),
  requirements: z
    .string()
    .max(1000, '요구사항은 최대 1000자까지 입력 가능합니다.')
    .optional(),
  location: z.enum(['online', 'office', 'client-site'], {
    message: '미팅 장소를 선택해주세요.',
  }),
  participants: z
    .array(
      z.object({
        name: z.string().min(1, '참가자 이름을 입력해주세요.'),
        email: emailSchema,
        role: z.string().optional(),
      })
    )
    .min(1, '최소 한 명의 참가자가 필요합니다.'),
})

// Form validation with conditional fields
export const conditionalValidationSchema = z.discriminatedUnion('userType', [
  z.object({
    userType: z.literal('student'),
    name: nameSchema,
    email: emailSchema,
    studentId: z.string().min(1, '학번을 입력해주세요.'),
    university: z.string().min(1, '대학교를 입력해주세요.'),
    major: z.string().min(1, '전공을 입력해주세요.'),
    graduationYear: z.number().min(2020, '올바른 졸업년도를 입력해주세요.'),
  }),
  z.object({
    userType: z.literal('professional'),
    name: nameSchema,
    email: emailSchema,
    company: z.string().min(1, '회사명을 입력해주세요.'),
    position: z.string().min(1, '직책을 입력해주세요.'),
    experience: z.number().min(0, '경력을 입력해주세요.'),
    industry: z.string().min(1, '업계를 선택해주세요.'),
  }),
  z.object({
    userType: z.literal('freelancer'),
    name: nameSchema,
    email: emailSchema,
    businessName: z.string().min(1, '사업체명을 입력해주세요.'),
    services: z.array(z.string()).min(1, '제공 서비스를 선택해주세요.'),
    portfolio: urlSchema,
    hourlyRate: z.number().min(0, '시간당 요금을 입력해주세요.'),
  }),
])

// Multi-step form schemas
export const step1Schema = z.object({
  basicInfo: z.object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
  }),
})

export const step2Schema = z.object({
  preferences: z.object({
    interests: z.array(z.string()).min(1, '최소 하나의 관심사를 선택해주세요.'),
    notifications: z.object({
      email: z.boolean(),
      sms: z.boolean(),
      push: z.boolean(),
    }),
    language: z.enum(['ko', 'en', 'ja'], { message: '언어를 선택해주세요.' }),
  }),
})

export const step3Schema = z.object({
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

// Combined multi-step schema
export const multiStepFormSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)

// Dynamic form builder schema
export const formBuilderSchema = z.object({
  formTitle: z
    .string()
    .min(1, '폼 제목을 입력해주세요.')
    .max(100, '제목은 최대 100자까지 입력 가능합니다.'),
  formDescription: z
    .string()
    .max(500, '설명은 최대 500자까지 입력 가능합니다.')
    .optional(),
  fields: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum([
          'text',
          'email',
          'number',
          'select',
          'checkbox',
          'radio',
          'textarea',
          'date',
          'file',
        ]),
        label: z.string().min(1, '필드 라벨을 입력해주세요.'),
        placeholder: z.string().optional(),
        required: z.boolean().default(false),
        options: z.array(z.string()).optional(), // for select, radio, checkbox
        validation: z
          .object({
            min: z.number().optional(),
            max: z.number().optional(),
            pattern: z.string().optional(),
            customMessage: z.string().optional(),
          })
          .optional(),
      })
    )
    .min(1, '최소 하나의 필드가 필요합니다.'),
  settings: z.object({
    allowMultipleSubmissions: z.boolean().default(false),
    requireAuthentication: z.boolean().default(false),
    sendConfirmationEmail: z.boolean().default(true),
    redirectUrl: urlSchema,
  }),
})

// Type exports
export type ProjectInput = z.infer<typeof projectSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
export type DateRangeInput = z.infer<typeof dateRangeSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type PaymentInput = z.infer<typeof paymentSchema>
export type NewsletterInput = z.infer<typeof newsletterSchema>
export type SurveyInput = z.infer<typeof surveySchema>
export type PersonalInfoInput = z.infer<typeof personalInfoSchema>
export type ProfessionalInfoInput = z.infer<typeof professionalInfoSchema>
export type DynamicFieldInput = z.infer<typeof dynamicFieldSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type NotificationSettingsInput = z.infer<
  typeof notificationSettingsSchema
>
export type FeedbackInput = z.infer<typeof feedbackSchema>
export type TeamInviteInput = z.infer<typeof teamInviteSchema>
export type ConditionalFormInput = z.infer<typeof conditionalFormSchema>
export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>
export type ProductReviewInput = z.infer<typeof productReviewSchema>
export type JobApplicationInput = z.infer<typeof jobApplicationSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type ConditionalValidationInput = z.infer<
  typeof conditionalValidationSchema
>
export type Step1Input = z.infer<typeof step1Schema>
export type Step2Input = z.infer<typeof step2Schema>
export type Step3Input = z.infer<typeof step3Schema>
export type MultiStepFormInput = z.infer<typeof multiStepFormSchema>
export type FormBuilderInput = z.infer<typeof formBuilderSchema>
