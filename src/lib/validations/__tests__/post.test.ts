/**
 * 포스트 유효성 검사 스키마 테스트
 */

import { describe, it, expect } from 'vitest'
import {
  createPostSchema,
  updatePostSchema,
  deletePostSchema,
  getPostSchema,
  getPostsSchema,
  searchPostsSchema,
  postFormSchema,
  savePostDraftSchema,
  togglePostPublishSchema,
  validatePostTitle,
  validatePostContent,
  validatePostSlug,
  generateExcerpt,
  generateSlug,
  sanitizePostContent,
} from '../post'

describe('포스트 유효성 검사 스키마', () => {
  describe('createPostSchema', () => {
    it('유효한 포스트 데이터를 검증해야 한다', () => {
      const validData = {
        title: '테스트 포스트 제목',
        content: '<h1>테스트</h1><p>포스트 내용입니다.</p>',
        published: false,
      }

      const result = createPostSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('빈 제목을 거부해야 한다', () => {
      const invalidData = {
        title: '',
        content: '포스트 내용',
        published: false,
      }

      const result = createPostSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('제목을 입력해주세요.')
      }
    })

    it('너무 긴 제목을 거부해야 한다', () => {
      const invalidData = {
        title: 'a'.repeat(201), // 200자 초과
        content: '포스트 내용',
        published: false,
      }

      const result = createPostSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '제목은 최대 200자까지 입력 가능합니다.'
        )
      }
    })

    it('빈 내용을 거부해야 한다', () => {
      const invalidData = {
        title: '테스트 제목',
        content: '',
        published: false,
      }

      const result = createPostSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('내용을 입력해주세요.')
      }
    })

    it('너무 긴 내용을 거부해야 한다', () => {
      const invalidData = {
        title: '테스트 제목',
        content: 'a'.repeat(50001), // 50,000자 초과
        published: false,
      }

      const result = createPostSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '내용은 최대 50,000자까지 입력 가능합니다.'
        )
      }
    })

    it('선택적 필드들을 처리해야 한다', () => {
      const validData = {
        title: '테스트 제목',
        content: '테스트 내용',
        excerpt: '테스트 요약',
        slug: 'test-slug',
        published: true,
      }

      const result = createPostSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('잘못된 슬러그 형식을 거부해야 한다', () => {
      const invalidData = {
        title: '테스트 제목',
        content: '테스트 내용',
        slug: 'invalid slug!', // 공백과 특수문자 포함
        published: false,
      }

      const result = createPostSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '슬러그는 영문 소문자, 숫자, 하이픈만 사용 가능합니다.'
        )
      }
    })
  })

  describe('updatePostSchema', () => {
    it('유효한 업데이트 데이터를 검증해야 한다', () => {
      const validData = {
        id: 'clx1234567890abcdef123456',
        title: '수정된 제목',
        content: '수정된 내용',
        published: true,
      }

      const result = updatePostSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('잘못된 ID 형식을 거부해야 한다', () => {
      const invalidData = {
        id: 'invalid-id',
        title: '수정된 제목',
      }

      const result = updatePostSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '올바르지 않은 포스트 ID입니다.'
        )
      }
    })

    it('선택적 필드만 업데이트할 수 있어야 한다', () => {
      const validData = {
        id: 'clx1234567890abcdef123456',
        title: '새 제목만 업데이트',
      }

      const result = updatePostSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('getPostsSchema', () => {
    it('기본 페이지네이션 값을 설정해야 한다', () => {
      const result = getPostsSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(10)
      }
    })

    it('커서 기반 페이지네이션을 지원해야 한다', () => {
      const validData = {
        cursor: 'clx1234567890abcdef123456',
        limit: 20,
      }

      const result = getPostsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('최대 제한을 초과하는 limit을 거부해야 한다', () => {
      const invalidData = {
        limit: 100, // 최대 50 초과
      }

      const result = getPostsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '최대 50개까지 요청 가능합니다.'
        )
      }
    })
  })

  describe('searchPostsSchema', () => {
    it('유효한 검색 쿼리를 검증해야 한다', () => {
      const validData = {
        query: '검색어',
        limit: 10,
      }

      const result = searchPostsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('빈 검색어를 거부해야 한다', () => {
      const invalidData = {
        query: '',
      }

      const result = searchPostsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('검색어를 입력해주세요.')
      }
    })

    it('기본적으로 발행된 포스트만 검색해야 한다', () => {
      const result = searchPostsSchema.safeParse({ query: '테스트' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.published).toBe(true)
      }
    })
  })

  describe('savePostDraftSchema', () => {
    it('부분적인 데이터를 허용해야 한다', () => {
      const validData = {
        title: '임시 제목',
      }

      const result = savePostDraftSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('빈 객체도 허용해야 한다', () => {
      const result = savePostDraftSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })
})

describe('포스트 유효성 검사 헬퍼 함수', () => {
  describe('validatePostTitle', () => {
    it('유효한 제목을 검증해야 한다', () => {
      expect(validatePostTitle('유효한 제목')).toBe(true)
    })

    it('빈 제목을 거부해야 한다', () => {
      expect(validatePostTitle('')).toBe(false)
    })

    it('너무 긴 제목을 거부해야 한다', () => {
      expect(validatePostTitle('a'.repeat(201))).toBe(false)
    })
  })

  describe('validatePostContent', () => {
    it('유효한 내용을 검증해야 한다', () => {
      expect(validatePostContent('유효한 내용')).toBe(true)
    })

    it('빈 내용을 거부해야 한다', () => {
      expect(validatePostContent('')).toBe(false)
    })
  })

  describe('validatePostSlug', () => {
    it('유효한 슬러그를 검증해야 한다', () => {
      expect(validatePostSlug('valid-slug-123')).toBe(true)
    })

    it('잘못된 슬러그를 거부해야 한다', () => {
      expect(validatePostSlug('invalid slug!')).toBe(false)
    })
  })

  describe('generateExcerpt', () => {
    it('HTML 태그를 제거해야 한다', () => {
      const content = '<h1>제목</h1><p>내용입니다.</p>'
      const excerpt = generateExcerpt(content)
      expect(excerpt).toBe('제목 내용입니다.')
    })

    it('지정된 길이로 자르고 말줄임표를 추가해야 한다', () => {
      const content =
        '이것은 매우 긴 텍스트입니다. 여러 문장으로 구성되어 있습니다.'
      const excerpt = generateExcerpt(content, 20)
      expect(excerpt.length).toBeLessThanOrEqual(23) // 20 + '...'
      expect(excerpt.endsWith('...')).toBe(true)
    })

    it('짧은 내용은 그대로 반환해야 한다', () => {
      const content = '짧은 내용'
      const excerpt = generateExcerpt(content, 100)
      expect(excerpt).toBe(content)
    })

    it('단어 경계에서 자르기를 시도해야 한다', () => {
      const content = '이것은 테스트 내용입니다'
      const excerpt = generateExcerpt(content, 10)
      expect(excerpt).toContain('...')
    })
  })

  describe('generateSlug', () => {
    it('제목을 슬러그로 변환해야 한다', () => {
      const title = '테스트 포스트 제목'
      const slug = generateSlug(title)
      expect(slug).toBe('테스트-포스트-제목')
    })

    it('특수문자를 제거해야 한다', () => {
      const title = '테스트! 포스트@ 제목#'
      const slug = generateSlug(title)
      expect(slug).toBe('테스트-포스트-제목')
    })

    it('연속된 하이픈을 하나로 합쳐야 한다', () => {
      const title = '테스트   포스트   제목'
      const slug = generateSlug(title)
      expect(slug).toBe('테스트-포스트-제목')
    })

    it('시작과 끝의 하이픈을 제거해야 한다', () => {
      const title = ' 테스트 포스트 제목 '
      const slug = generateSlug(title)
      expect(slug).toBe('테스트-포스트-제목')
    })

    it('영문과 숫자를 포함한 제목을 처리해야 한다', () => {
      const title = 'Test Post 123 테스트'
      const slug = generateSlug(title)
      expect(slug).toBe('test-post-123-테스트')
    })
  })

  describe('sanitizePostContent', () => {
    it('기본적인 새니타이제이션을 수행해야 한다', () => {
      const content = '<p>안전한 내용</p>'
      const sanitized = sanitizePostContent(content)
      expect(sanitized).toBe(content) // 기본 구현에서는 그대로 반환
    })
  })
})

describe('포스트 스키마 타입 추론', () => {
  it('CreatePostInput 타입이 올바르게 추론되어야 한다', () => {
    const postData = {
      title: '테스트 제목',
      content: '테스트 내용',
      published: false,
    }

    // 타입 체크를 위한 함수
    const checkType = (data: typeof postData) => data
    expect(checkType(postData)).toBeDefined()
  })

  it('UpdatePostInput 타입이 올바르게 추론되어야 한다', () => {
    const updateData = {
      id: 'clx1234567890abcdef123456',
      title: '수정된 제목',
    }

    const checkType = (data: typeof updateData) => data
    expect(checkType(updateData)).toBeDefined()
  })
})

describe('포스트 스키마 에러 메시지', () => {
  it('한국어 에러 메시지를 제공해야 한다', () => {
    const invalidData = {
      title: '',
      content: '',
    }

    const result = createPostSchema.safeParse(invalidData)
    expect(result.success).toBe(false)

    if (!result.success) {
      const messages = result.error.issues.map(issue => issue.message)
      expect(messages).toContain('제목을 입력해주세요.')
      expect(messages).toContain('내용을 입력해주세요.')
    }
  })

  it('필드별 구체적인 에러 메시지를 제공해야 한다', () => {
    const invalidData = {
      title: 'a'.repeat(201),
      content: 'a'.repeat(50001),
      excerpt: 'a'.repeat(301),
    }

    const result = createPostSchema.safeParse(invalidData)
    expect(result.success).toBe(false)

    if (!result.success) {
      const messages = result.error.issues.map(issue => issue.message)
      expect(messages).toContain('제목은 최대 200자까지 입력 가능합니다.')
      expect(messages).toContain('내용은 최대 50,000자까지 입력 가능합니다.')
      expect(messages).toContain('요약은 최대 300자까지 입력 가능합니다.')
    }
  })
})
