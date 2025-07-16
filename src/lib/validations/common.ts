import { z } from 'zod'

// Common field validations
export const emailSchema = z
  .string()
  .min(1, '이메일을 입력해주세요.')
  .email('올바른 이메일 형식을 입력해주세요.')

export const passwordSchema = z
  .string()
  .min(1, '비밀번호를 입력해주세요.')
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.'
  )

export const nameSchema = z
  .string()
  .min(1, '이름을 입력해주세요.')
  .min(2, '이름은 최소 2자 이상이어야 합니다.')
  .max(50, '이름은 최대 50자까지 입력 가능합니다.')

export const phoneSchema = z
  .string()
  .min(1, '전화번호를 입력해주세요.')
  .regex(
    /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/,
    '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)'
  )

export const urlSchema = z
  .string()
  .url('올바른 URL 형식을 입력해주세요.')
  .optional()
  .or(z.literal(''))

// Project related validations
export const projectSchema = z.object({
  title: z
    .string()
    .min(1, '프로젝트 제목을 입력해주세요.')
    .max(100, '프로젝트 제목은 최대 100자까지 입력 가능합니다.'),
  description: z
    .string()
    .max(500, '프로젝트 설명은 최대 500자까지 입력 가능합니다.')
    .optional(),
})

// Contact form validation
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z
    .string()
    .min(1, '제목을 입력해주세요.')
    .max(100, '제목은 최대 100자까지 입력 가능합니다.'),
  message: z
    .string()
    .min(1, '메시지를 입력해주세요.')
    .min(10, '메시지는 최소 10자 이상 입력해주세요.')
    .max(1000, '메시지는 최대 1000자까지 입력 가능합니다.'),
})

// Search form validation
export const searchSchema = z.object({
  query: z
    .string()
    .min(1, '검색어를 입력해주세요.')
    .max(100, '검색어는 최대 100자까지 입력 가능합니다.'),
  category: z.string().optional(),
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      file => file.size <= 5 * 1024 * 1024,
      '파일 크기는 5MB 이하여야 합니다.'
    )
    .refine(
      file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      '지원되는 파일 형식: JPEG, PNG, WebP'
    ),
})

// Date range validation
export const dateRangeSchema = z
  .object({
    startDate: z.date({
      message: '시작 날짜를 선택해주세요.',
    }),
    endDate: z.date({
      message: '종료 날짜를 선택해주세요.',
    }),
  })
  .refine(data => data.endDate >= data.startDate, {
    message: '종료 날짜는 시작 날짜보다 늦어야 합니다.',
    path: ['endDate'],
  })

// Address validation
export const addressSchema = z.object({
  street: z
    .string()
    .min(1, '주소를 입력해주세요.')
    .max(100, '주소는 최대 100자까지 입력 가능합니다.'),
  city: z
    .string()
    .min(1, '도시를 입력해주세요.')
    .max(50, '도시명은 최대 50자까지 입력 가능합니다.'),
  state: z
    .string()
    .min(1, '시/도를 입력해주세요.')
    .max(50, '시/도명은 최대 50자까지 입력 가능합니다.'),
  zipCode: z
    .string()
    .min(1, '우편번호를 입력해주세요.')
    .regex(/^\d{5}(-\d{4})?$/, '올바른 우편번호 형식을 입력해주세요.'),
  country: z
    .string()
    .min(1, '국가를 입력해주세요.')
    .max(50, '국가명은 최대 50자까지 입력 가능합니다.'),
})

// Payment form validation
export const paymentSchema = z.object({
  cardNumber: z
    .string()
    .min(1, '카드 번호를 입력해주세요.')
    .regex(
      /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
      '올바른 카드 번호를 입력해주세요.'
    ),
  expiryDate: z
    .string()
    .min(1, '만료일을 입력해주세요.')
    .regex(
      /^(0[1-9]|1[0-2])\/\d{2}$/,
      '올바른 만료일 형식을 입력해주세요. (MM/YY)'
    ),
  cvv: z
    .string()
    .min(1, 'CVV를 입력해주세요.')
    .regex(/^\d{3,4}$/, 'CVV는 3-4자리 숫자여야 합니다.'),
  cardholderName: z
    .string()
    .min(1, '카드 소유자 이름을 입력해주세요.')
    .max(50, '이름은 최대 50자까지 입력 가능합니다.'),
})

// Newsletter subscription validation
export const newsletterSchema = z.object({
  email: emailSchema,
  preferences: z.array(z.string()).min(1, '최소 하나의 관심사를 선택해주세요.'),
  frequency: z.enum(['daily', 'weekly', 'monthly'], {
    message: '수신 빈도를 선택해주세요.',
  }),
})

// Survey form validation
export const surveySchema = z.object({
  rating: z
    .number({
      message: '평점을 선택해주세요.',
    })
    .min(1, '평점은 1-5 사이여야 합니다.')
    .max(5, '평점은 1-5 사이여야 합니다.'),
  feedback: z
    .string()
    .min(10, '피드백은 최소 10자 이상 입력해주세요.')
    .max(500, '피드백은 최대 500자까지 입력 가능합니다.'),
  recommend: z.boolean({
    message: '추천 여부를 선택해주세요.',
  }),
  improvements: z.array(z.string()).optional(),
})

// Multi-step form validation
export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, '이름을 입력해주세요.')
    .max(30, '이름은 최대 30자까지 입력 가능합니다.'),
  lastName: z
    .string()
    .min(1, '성을 입력해주세요.')
    .max(30, '성은 최대 30자까지 입력 가능합니다.'),
  dateOfBirth: z.date({
    message: '생년월일을 선택해주세요.',
  }),
  gender: z.enum(['male', 'female', 'other'], {
    message: '성별을 선택해주세요.',
  }),
})

export const professionalInfoSchema = z.object({
  jobTitle: z
    .string()
    .min(1, '직책을 입력해주세요.')
    .max(50, '직책은 최대 50자까지 입력 가능합니다.'),
  company: z
    .string()
    .min(1, '회사명을 입력해주세요.')
    .max(50, '회사명은 최대 50자까지 입력 가능합니다.'),
  experience: z
    .number({
      message: '경력을 입력해주세요.',
    })
    .min(0, '경력은 0년 이상이어야 합니다.')
    .max(50, '경력은 50년 이하여야 합니다.'),
  skills: z.array(z.string()).min(1, '최소 하나의 기술을 선택해주세요.'),
})

// Dynamic form validation
export const dynamicFieldSchema = z.object({
  type: z.enum(['text', 'number', 'email', 'select', 'checkbox', 'radio']),
  label: z.string().min(1, '필드 라벨을 입력해주세요.'),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
})

// User registration and authentication schemas
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
    terms: z.boolean().refine(val => val === true, {
      message: '이용약관에 동의해주세요.',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
  rememberMe: z.boolean().optional(),
})

export const resetPasswordSchema = z.object({
  email: emailSchema,
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, '새 비밀번호 확인을 입력해주세요.'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: '새 비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  })

// Profile and settings schemas
export const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  bio: z
    .string()
    .max(500, '자기소개는 최대 500자까지 입력 가능합니다.')
    .optional(),
  website: urlSchema,
  location: z
    .string()
    .max(100, '위치는 최대 100자까지 입력 가능합니다.')
    .optional(),
})

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  weeklyDigest: z.boolean().default(true),
})

// Advanced form schemas
export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'other'], {
    message: '피드백 유형을 선택해주세요.',
  }),
  title: z
    .string()
    .min(1, '제목을 입력해주세요.')
    .max(100, '제목은 최대 100자까지 입력 가능합니다.'),
  description: z
    .string()
    .min(10, '설명은 최소 10자 이상 입력해주세요.')
    .max(1000, '설명은 최대 1000자까지 입력 가능합니다.'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  attachments: z
    .array(z.instanceof(File))
    .max(5, '최대 5개까지 첨부 가능합니다.')
    .optional(),
})

export const teamInviteSchema = z.object({
  email: emailSchema,
  role: z.enum(['admin', 'member', 'viewer'], {
    message: '역할을 선택해주세요.',
  }),
  message: z
    .string()
    .max(200, '메시지는 최대 200자까지 입력 가능합니다.')
    .optional(),
})

// Conditional validation schemas
export const conditionalFormSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('individual'),
    name: nameSchema,
    email: emailSchema,
  }),
  z.object({
    type: z.literal('company'),
    companyName: z
      .string()
      .min(1, '회사명을 입력해주세요.')
      .max(100, '회사명은 최대 100자까지 입력 가능합니다.'),
    contactPerson: nameSchema,
    email: emailSchema,
    taxId: z
      .string()
      .min(1, '사업자등록번호를 입력해주세요.')
      .regex(
        /^\d{3}-\d{2}-\d{5}$/,
        '올바른 사업자등록번호 형식을 입력해주세요.'
      ),
  }),
])

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
