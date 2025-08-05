/**
 * Utils 라이브러리 테스트
 */

import { describe, expect, it } from 'vitest'
import { cn, capitalize, truncate, formatDate, formatFileSize } from './utils'

describe('Utils Library', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-2 py-1', 'text-sm')).toBe('px-2 py-1 text-sm')
    })

    it('should handle conditional classes', () => {
      expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class')
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
    })

    it('should handle Tailwind conflicts', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
    })
  })

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('WORLD')).toBe('World')
      expect(capitalize('tEST')).toBe('Test')
    })

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('')
    })

    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A')
    })
  })

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('This is a long string', 10)).toBe('This is...')
    })

    it('should not truncate short strings', () => {
      expect(truncate('Short', 10)).toBe('Short')
    })

    it('should use custom suffix', () => {
      expect(truncate('This is a long string', 10, '---')).toBe('This is---')
    })

    it('should handle edge cases', () => {
      expect(truncate('', 10)).toBe('')
      expect(truncate('Test', 4)).toBe('Test')
    })
  })

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/2024/)
    })

    it('should handle string dates', () => {
      const formatted = formatDate('2024-01-15')
      expect(formatted).toMatch(/2024/)
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB')
      expect(formatFileSize(1048576)).toBe('1.0 MB')
      expect(formatFileSize(1073741824)).toBe('1.0 GB')
    })

    it('should handle small sizes', () => {
      expect(formatFileSize(500)).toBe('500 B')
      expect(formatFileSize(0)).toBe('0 B')
    })

    it('should handle large sizes', () => {
      expect(formatFileSize(1099511627776)).toBe('1.0 TB')
    })
  })
})
