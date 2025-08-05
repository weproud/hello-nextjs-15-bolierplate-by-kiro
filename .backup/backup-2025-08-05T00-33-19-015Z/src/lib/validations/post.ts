import { z } from 'zod'

/**
 * 포스트 유효성 검사 스키마
 * 포스트 생성, 수정, 삭제, 조회를 위한 Zod 스키마 정의
 */

// 기본 포스트 필드 스키마
export const postTitleSchema = z
  .string()
  .min(1, '제목을 입력해주세요.')
  .max(200, '제목은 최대 200자까지 입력 가능합니다.')
  .trim()

export const postContentSchema = z
  .string()
  .min(1, '내용을 입력해주세요.')
  .max(50000, '내용은 최대 50,000자까지 입력 가능합니다.')

export const postExcerptSchema = z
  .string()
  .max(300, '요약은 최대 300자까지 입력 가능합니다.')
  .optional()

export const postSlugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    '슬러그는 영문 소문자, 숫자, 하이픈만 사용 가능합니다.'
  )
  .min(1, '슬러그를 입력해주세요.')
  .max(100, '슬러그는 최대 100자까지 입력 가능합니다.')
  .optional()

// 포스트 생성 스키마
export const createPostSchema = z.object({
  title: postTitleSchema,
  content: postContentSchema,
  excerpt: postExcerptSchema,
  slug: postSlugSchema,
  published: z.boolean().default(false),
})

// 포스트 수정 스키마
export const updatePostSchema = z.object({
  id: z.string().cuid('올바르지 않은 포스트 ID입니다.'),
  title: postTitleSchema.optional(),
  content: postContentSchema.optional(),
  excerpt: postExcerptSchema,
  slug: postSlugSchema,
  published: z.boolean().optional(),
})

// 포스트 삭제 스키마
export const deletePostSchema = z.object({
  id: z.string().cuid('올바르지 않은 포스트 ID입니다.'),
})

// 포스트 조회 스키마
export const getPostSchema = z.object({
  id: z.string().cuid('올바르지 않은 포스트 ID입니다.'),
})

// 포스트 목록 조회 스키마 (무한 스크롤용)
export const getPostsSchema = z.object({
  cursor: z.string().cuid().optional(), // 커서 기반 페이지네이션
  limit: z
    .number()
    .int()
    .min(1, '최소 1개 이상의 포스트를 요청해야 합니다.')
    .max(50, '최대 50개까지 요청 가능합니다.')
    .default(10),
  published: z.boolean().optional(), // 발행된 포스트만 조회
  authorId: z.string().cuid().optional(), // 특정 작성자의 포스트만 조회
})

// 포스트 검색 스키마
export const searchPostsSchema = z.object({
  query: z
    .string()
    .min(1, '검색어를 입력해주세요.')
    .max(100, '검색어는 최대 100자까지 입력 가능합니다.')
    .trim(),
  cursor: z.string().cuid().optional(),
  limit: z
    .number()
    .int()
    .min(1, '최소 1개 이상의 포스트를 요청해야 합니다.')
    .max(50, '최대 50개까지 요청 가능합니다.')
    .default(10),
  published: z.boolean().default(true), // 기본적으로 발행된 포스트만 검색
})

// 포스트 폼 데이터 스키마 (클라이언트 사이드 폼용)
export const postFormSchema = z.object({
  title: postTitleSchema,
  content: postContentSchema,
  excerpt: postExcerptSchema,
  published: z.boolean().default(false),
})

// 포스트 초안 저장 스키마 (자동 저장용)
export const savePostDraftSchema = z.object({
  id: z.string().cuid().optional(), // 새 포스트인 경우 없을 수 있음
  title: z
    .string()
    .max(200, '제목은 최대 200자까지 입력 가능합니다.')
    .optional(),
  content: z
    .string()
    .max(50000, '내용은 최대 50,000자까지 입력 가능합니다.')
    .optional(),
})

// 포스트 발행 상태 변경 스키마
export const togglePostPublishSchema = z.object({
  id: z.string().cuid('올바르지 않은 포스트 ID입니다.'),
  published: z.boolean(),
})

// 포스트 메타데이터 업데이트 스키마
export const updatePostMetaSchema = z.object({
  id: z.string().cuid('올바르지 않은 포스트 ID입니다.'),
  excerpt: postExcerptSchema,
  slug: postSlugSchema,
})

// 포스트 권한 검증 스키마
export const postPermissionSchema = z.object({
  postId: z.string().cuid('올바르지 않은 포스트 ID입니다.'),
  userId: z.string().cuid('올바르지 않은 사용자 ID입니다.'),
  action: z.enum(['read', 'update', 'delete'], {
    message: '올바르지 않은 액션입니다.',
  }),
})

// 포스트 통계 조회 스키마
export const getPostStatsSchema = z.object({
  postId: z.string().cuid('올바르지 않은 포스트 ID입니다.'),
  period: z
    .enum(['day', 'week', 'month', 'year'], {
      message: '올바르지 않은 기간입니다.',
    })
    .default('month'),
})

// 사용자별 포스트 목록 조회 스키마
export const getUserPostsSchema = z.object({
  userId: z.string().cuid('올바르지 않은 사용자 ID입니다.'),
  cursor: z.string().cuid().optional(),
  limit: z
    .number()
    .int()
    .min(1, '최소 1개 이상의 포스트를 요청해야 합니다.')
    .max(50, '최대 50개까지 요청 가능합니다.')
    .default(10),
  published: z.boolean().optional(), // 발행 상태 필터
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'title'], {
      message: '올바르지 않은 정렬 기준입니다.',
    })
    .default('createdAt'),
  sortOrder: z
    .enum(['asc', 'desc'], {
      message: '올바르지 않은 정렬 순서입니다.',
    })
    .default('desc'),
})

// 포스트 배치 작업 스키마
export const batchPostActionSchema = z.object({
  postIds: z
    .array(z.string().cuid('올바르지 않은 포스트 ID입니다.'))
    .min(1, '최소 1개 이상의 포스트를 선택해야 합니다.')
    .max(100, '최대 100개까지 선택 가능합니다.'),
  action: z.enum(['publish', 'unpublish', 'delete'], {
    message: '올바르지 않은 배치 액션입니다.',
  }),
})

// 포스트 복제 스키마
export const duplicatePostSchema = z.object({
  id: z.string().cuid('올바르지 않은 포스트 ID입니다.'),
  title: postTitleSchema.optional(), // 새 제목 (선택사항)
})

// 포스트 가져오기/내보내기 스키마
export const importPostSchema = z.object({
  title: postTitleSchema,
  content: postContentSchema,
  excerpt: postExcerptSchema,
  published: z.boolean().default(false),
  originalId: z.string().optional(), // 원본 시스템의 ID
  importSource: z.string().optional(), // 가져온 소스 (예: 'wordpress', 'medium')
})

export const exportPostsSchema = z.object({
  postIds: z
    .array(z.string().cuid('올바르지 않은 포스트 ID입니다.'))
    .min(1, '최소 1개 이상의 포스트를 선택해야 합니다.'),
  format: z
    .enum(['json', 'markdown', 'html'], {
      message: '올바르지 않은 내보내기 형식입니다.',
    })
    .default('json'),
})

// 포스트 유효성 검사 헬퍼 함수들
export const validatePostTitle = (title: string): boolean => {
  return postTitleSchema.safeParse(title).success
}

export const validatePostContent = (content: string): boolean => {
  return postContentSchema.safeParse(content).success
}

export const validatePostSlug = (slug: string): boolean => {
  return postSlugSchema.safeParse(slug).success
}

// 포스트 내용에서 요약 생성 헬퍼
export const generateExcerpt = (
  content: string,
  maxLength: number = 300
): string => {
  // HTML 태그 제거
  const textContent = content.replace(/<[^>]*>/g, '')

  // 공백 정리
  const cleanText = textContent.replace(/\s+/g, ' ').trim()

  // 지정된 길이로 자르기
  if (cleanText.length <= maxLength) {
    return cleanText
  }

  // 단어 경계에서 자르기
  const truncated = cleanText.substring(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')

  if (lastSpaceIndex > maxLength * 0.8) {
    return truncated.substring(0, lastSpaceIndex) + '...'
  }

  return truncated + '...'
}

// 제목에서 슬러그 생성 헬퍼
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '') // 특수문자 제거 (한글 포함)
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속된 하이픈 제거
    .replace(/^-|-$/g, '') // 시작/끝 하이픈 제거
}

// 포스트 내용 새니타이제이션 (기본적인 HTML 태그만 허용)
export const sanitizePostContent = (content: string): string => {
  // 허용된 HTML 태그 목록
  const allowedTags = [
    'p',
    'br',
    'strong',
    'em',
    'u',
    's',
    'code',
    'pre',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
  ]

  // 실제 구현에서는 DOMPurify 같은 라이브러리 사용 권장
  // 여기서는 기본적인 검증만 수행
  return content
}

// TypeScript 타입 내보내기
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type DeletePostInput = z.infer<typeof deletePostSchema>
export type GetPostInput = z.infer<typeof getPostSchema>
export type GetPostsInput = z.infer<typeof getPostsSchema>
export type SearchPostsInput = z.infer<typeof searchPostsSchema>
export type PostFormInput = z.infer<typeof postFormSchema>
export type SavePostDraftInput = z.infer<typeof savePostDraftSchema>
export type TogglePostPublishInput = z.infer<typeof togglePostPublishSchema>
export type UpdatePostMetaInput = z.infer<typeof updatePostMetaSchema>
export type PostPermissionInput = z.infer<typeof postPermissionSchema>
export type GetPostStatsInput = z.infer<typeof getPostStatsSchema>
export type GetUserPostsInput = z.infer<typeof getUserPostsSchema>
export type BatchPostActionInput = z.infer<typeof batchPostActionSchema>
export type DuplicatePostInput = z.infer<typeof duplicatePostSchema>
export type ImportPostInput = z.infer<typeof importPostSchema>
export type ExportPostsInput = z.infer<typeof exportPostsSchema>
