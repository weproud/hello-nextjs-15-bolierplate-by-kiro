import { z } from 'zod'

/**
 * Component validation schemas
 * 이 파일은 컴포넌트에서 사용되는 스키마들을 별도로 정의합니다.
 */

// Simple form schema (used in simple-form-example.tsx)
export const simpleFormSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
  email: z.string().email('올바른 이메일 주소를 입력하세요.'),
  role: z.enum(['student', 'professional', 'freelancer'], {
    message: '역할을 선택해주세요.',
  }),
  newsletter: z.boolean().default(false),
})

// Comprehensive form schema (used in comprehensive-form-example.tsx)
export const comprehensiveFormSchema = z
  .object({
    // Basic fields
    name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
    email: z.string().email('올바른 이메일 주소를 입력하세요.'),
    age: z
      .number()
      .min(18, '18세 이상이어야 합니다.')
      .max(100, '100세 이하여야 합니다.'),

    // Optional fields
    phone: z.string().optional(),
    website: z
      .string()
      .url('올바른 URL을 입력하세요.')
      .optional()
      .or(z.literal('')),

    // Boolean field
    newsletter: z.boolean(),

    // Enum field
    role: z.enum(['student', 'professional', 'freelancer'], {
      message: '역할을 선택해주세요.',
    }),

    // Conditional validation
    company: z.string().optional(),
    studentId: z.string().optional(),
  })
  .refine(
    data => {
      if (data.role === 'professional' && !data.company) {
        return false
      }
      return true
    },
    {
      message: '직장인은 회사명을 입력해야 합니다.',
      path: ['company'],
    }
  )
  .refine(
    data => {
      if (data.role === 'student' && !data.studentId) {
        return false
      }
      return true
    },
    {
      message: '학생은 학번을 입력해야 합니다.',
      path: ['studentId'],
    }
  )

// File upload form schema (used in advanced-safe-action-examples.tsx)
export const fileUploadFormSchema = z.object({
  file: z.instanceof(File, { message: '파일을 선택해주세요.' }),
  category: z.enum(['avatar', 'document', 'image'], {
    message: '카테고리를 선택해주세요.',
  }),
})

// Batch delete form schema (used in advanced-safe-action-examples.tsx)
export const batchDeleteFormSchema = z.object({
  ids: z.array(z.string()).min(1, '삭제할 항목을 선택해주세요.'),
  type: z.enum(['projects', 'files', 'comments']),
})

// Newsletter form schema (used in advanced-safe-action-examples.tsx)
export const newsletterFormSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
  preferences: z
    .array(z.enum(['tech', 'design', 'business', 'marketing']))
    .min(1, '최소 하나의 관심사를 선택해주세요.'),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
})

// Test input schema (used in test actions)
export const testInputSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})

// Complex validation schema (used in sample-actions.ts)
export const complexValidationSchema = z.object({
  email: z.string().email('Invalid email format'),
  age: z.number().int().min(18, 'Must be at least 18').max(120, 'Invalid age'),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']),
    notifications: z.boolean(),
    language: z.string().length(2, 'Language must be 2 characters'),
  }),
  tags: z.array(z.string().min(1).max(20)).max(5, 'Maximum 5 tags allowed'),
})

// Bulk delete projects schema (used in sample-actions.ts)
export const bulkDeleteProjectsSchema = z.object({
  projectIds: z
    .array(z.string().uuid('Invalid project ID'))
    .min(1, 'At least one project ID is required')
    .max(10, 'Cannot delete more than 10 projects at once'),
})

// Additional schemas for sample-actions.ts
export const duplicateProjectSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  newTitle: z
    .string()
    .min(1, 'New title is required')
    .max(255, 'Title must be less than 255 characters'),
})

export const getProjectStatsSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
})

export const rateLimitedActionSchema = z.object({
  message: z.string().min(1).max(100),
})

// Project CRUD schemas (used in project-crud-examples.tsx)
export const createProjectFormSchema = z.object({
  title: z.string().min(1, '프로젝트 제목을 입력해주세요.').max(255),
  description: z.string().max(1000).optional(),
})

export const updateProjectFormSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, '프로젝트 제목을 입력해주세요.').max(255),
  description: z.string().max(1000).optional(),
})

// Search form schema (used in advanced-safe-action-examples.tsx)
export const searchFormSchema = z.object({
  query: z.string().min(1, '검색어를 입력해주세요.'),
  category: z.string().optional(),
  sortBy: z.enum(['relevance', 'date', 'name']).default('relevance'),
})

// Type exports
export type SimpleFormInput = z.infer<typeof simpleFormSchema>
export type ComprehensiveFormInput = z.infer<typeof comprehensiveFormSchema>
export type FileUploadFormInput = z.infer<typeof fileUploadFormSchema>
export type BatchDeleteFormInput = z.infer<typeof batchDeleteFormSchema>
export type NewsletterFormInput = z.infer<typeof newsletterFormSchema>
export type TestInput = z.infer<typeof testInputSchema>
export type ComplexValidationInput = z.infer<typeof complexValidationSchema>
export type BulkDeleteProjectsInput = z.infer<typeof bulkDeleteProjectsSchema>
export type DuplicateProjectInput = z.infer<typeof duplicateProjectSchema>
export type GetProjectStatsInput = z.infer<typeof getProjectStatsSchema>
export type RateLimitedActionInput = z.infer<typeof rateLimitedActionSchema>
export type CreateProjectFormInput = z.infer<typeof createProjectFormSchema>
export type UpdateProjectFormInput = z.infer<typeof updateProjectFormSchema>
export type SearchFormInput = z.infer<typeof searchFormSchema>
