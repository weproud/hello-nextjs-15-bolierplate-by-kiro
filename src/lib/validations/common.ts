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
