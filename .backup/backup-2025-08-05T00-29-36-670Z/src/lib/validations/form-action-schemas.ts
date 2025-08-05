import { z } from 'zod'
import { emailSchema, nameSchema, phoneSchema } from './common'

/**
 * Form action validation schemas
 * 이 파일은 form-actions.ts에서 사용되는 스키마들을 별도로 정의합니다.
 */

// File upload schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  category: z.enum(['avatar', 'document', 'image']),
})

// Batch delete schema
export const batchDeleteSchema = z.object({
  ids: z
    .array(z.string())
    .min(1, '삭제할 항목을 선택해주세요.')
    .max(50, '한 번에 최대 50개까지 삭제 가능합니다.'),
  type: z.enum(['projects', 'files', 'comments']),
})

// Date range schema
export const dateRangeSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
})

// Search filters schema
export const searchFiltersSchema = z.object({
  category: z.string().optional(),
  dateRange: dateRangeSchema.optional(),
  sortBy: z.enum(['relevance', 'date', 'name']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Search items schema
export const searchItemsSchema = z.object({
  query: z.string().min(1, '검색어를 입력해주세요.').max(100),
  filters: searchFiltersSchema.optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

// Newsletter preferences schema
export const newsletterPreferencesSchema = z
  .array(z.enum(['tech', 'design', 'business', 'marketing']))
  .min(1, '최소 하나의 관심사를 선택해주세요.')

// Newsletter subscription schema
export const newsletterSubscriptionSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
  preferences: newsletterPreferencesSchema,
  frequency: z.enum(['daily', 'weekly', 'monthly']),
})

// Basic info schema for multi-step form
export const basicInfoSchema = z.object({
  basicInfo: z.object({
    name: nameSchema,
    email: emailSchema,
    phone: z.string().min(1, '전화번호를 입력해주세요.'),
  }),
})

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  push: z.boolean(),
})

// Preferences schema for multi-step form
export const preferencesSchema = z.object({
  preferences: z.object({
    interests: z.array(z.string()).min(1, '최소 하나의 관심사를 선택해주세요.'),
    notifications: notificationPreferencesSchema,
    language: z.enum(['ko', 'en', 'ja'], {
      message: '언어를 선택해주세요.',
    }),
  }),
})

// Verification schema for multi-step form
export const verificationSchema = z.object({
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

// Multi-step form schema
export const multiStepFormSchema = basicInfoSchema
  .merge(preferencesSchema)
  .merge(verificationSchema)

// Type exports
export type FileUploadInput = z.infer<typeof fileUploadSchema>
export type BatchDeleteInput = z.infer<typeof batchDeleteSchema>
export type SearchItemsInput = z.infer<typeof searchItemsSchema>
export type NewsletterSubscriptionInput = z.infer<
  typeof newsletterSubscriptionSchema
>
export type MultiStepFormInput = z.infer<typeof multiStepFormSchema>
export type BasicInfoInput = z.infer<typeof basicInfoSchema>
export type PreferencesInput = z.infer<typeof preferencesSchema>
export type VerificationInput = z.infer<typeof verificationSchema>
