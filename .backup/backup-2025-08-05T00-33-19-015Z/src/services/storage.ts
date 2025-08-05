/**
 * Storage Service
 *
 * File upload and storage utilities for handling
 * file operations in the application.
 */

import { createLogger } from '@/lib/logger'

const logger = createLogger('storage-service')

export interface UploadOptions {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  folder?: string
}

export interface UploadResult {
  url: string
  key: string
  size: number
  type: string
  filename: string
}

export interface StorageProvider {
  upload(file: File, options?: UploadOptions): Promise<UploadResult>
  delete(key: string): Promise<void>
  getUrl(key: string): string
}

/**
 * Local storage provider (for development)
 */
export class LocalStorageProvider implements StorageProvider {
  private baseUrl: string
  private uploadDir: string

  constructor(baseUrl = '', uploadDir = '/uploads') {
    this.baseUrl = baseUrl
    this.uploadDir = uploadDir
  }

  async upload(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
      ],
      folder = 'general',
    } = options

    // Validate file size
    if (file.size > maxSize) {
      throw new Error(`File size exceeds limit of ${maxSize} bytes`)
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomString}.${extension}`
    const key = `${folder}/${filename}`

    // In a real implementation, you would save the file to disk or cloud storage
    // For now, we'll simulate the upload
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      url: `${this.baseUrl}${this.uploadDir}/${key}`,
      key,
      size: file.size,
      type: file.type,
      filename: file.name,
    }
  }

  async delete(key: string): Promise<void> {
    // In a real implementation, you would delete the file from storage
    logger.info('Deleting file from local storage', { key })
  }

  getUrl(key: string): string {
    return `${this.baseUrl}${this.uploadDir}/${key}`
  }
}

/**
 * AWS S3 storage provider (placeholder)
 */
export class S3StorageProvider implements StorageProvider {
  private bucket: string
  private region: string

  constructor(bucket: string, region = 'us-east-1') {
    this.bucket = bucket
    this.region = region
  }

  async upload(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    try {
      const {
        maxSize = 5 * 1024 * 1024, // 5MB default
        allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/pdf',
        ],
        folder = 'general',
      } = options

      // Validate file size
      if (file.size > maxSize) {
        throw new Error(`File size exceeds limit of ${maxSize} bytes`)
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`)
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const filename = `${timestamp}-${randomString}.${extension}`
      const key = `${folder}/${filename}`

      logger.info('Uploading file to S3', {
        bucket: this.bucket,
        key,
        size: file.size,
        type: file.type,
      })

      // S3 업로드 시뮬레이션 (실제 환경에서는 AWS SDK 사용)
      await new Promise(resolve => setTimeout(resolve, 1500))

      const result: UploadResult = {
        url: this.getUrl(key),
        key,
        size: file.size,
        type: file.type,
        filename: file.name,
      }

      logger.info('File uploaded successfully to S3', { key, url: result.url })
      return result
    } catch (error) {
      logger.error('Failed to upload file to S3', error as Error, {
        bucket: this.bucket,
        fileName: file.name,
      })
      throw error
    }
  }

  async delete(key: string): Promise<void> {
    try {
      logger.info('Deleting file from S3', { bucket: this.bucket, key })

      // S3 삭제 시뮬레이션 (실제 환경에서는 AWS SDK 사용)
      await new Promise(resolve => setTimeout(resolve, 500))

      logger.info('File deleted successfully from S3', { key })
    } catch (error) {
      logger.error('Failed to delete file from S3', error as Error, {
        bucket: this.bucket,
        key,
      })
      throw error
    }
  }

  getUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`
  }
}

/**
 * Cloudinary storage provider (placeholder)
 */
export class CloudinaryStorageProvider implements StorageProvider {
  private cloudName: string
  private apiKey: string
  private apiSecret: string

  constructor(cloudName: string, apiKey: string, apiSecret: string) {
    this.cloudName = cloudName
    this.apiKey = apiKey
    this.apiSecret = apiSecret
  }

  async upload(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    try {
      const {
        maxSize = 5 * 1024 * 1024, // 5MB default
        allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        folder = 'general',
      } = options

      // Validate file size
      if (file.size > maxSize) {
        throw new Error(`File size exceeds limit of ${maxSize} bytes`)
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`)
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const filename = `${timestamp}-${randomString}.${extension}`
      const key = `${folder}/${filename}`

      logger.info('Uploading file to Cloudinary', {
        cloudName: this.cloudName,
        key,
        size: file.size,
        type: file.type,
      })

      // Cloudinary 업로드 시뮬레이션 (실제 환경에서는 Cloudinary SDK 사용)
      await new Promise(resolve => setTimeout(resolve, 1200))

      const result: UploadResult = {
        url: this.getUrl(key),
        key,
        size: file.size,
        type: file.type,
        filename: file.name,
      }

      logger.info('File uploaded successfully to Cloudinary', {
        key,
        url: result.url,
      })
      return result
    } catch (error) {
      logger.error('Failed to upload file to Cloudinary', error as Error, {
        cloudName: this.cloudName,
        fileName: file.name,
      })
      throw error
    }
  }

  async delete(key: string): Promise<void> {
    try {
      logger.info('Deleting file from Cloudinary', {
        cloudName: this.cloudName,
        key,
      })

      // Cloudinary 삭제 시뮬레이션 (실제 환경에서는 Cloudinary SDK 사용)
      await new Promise(resolve => setTimeout(resolve, 600))

      logger.info('File deleted successfully from Cloudinary', { key })
    } catch (error) {
      logger.error('Failed to delete file from Cloudinary', error as Error, {
        cloudName: this.cloudName,
        key,
      })
      throw error
    }
  }

  getUrl(key: string): string {
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${key}`
  }
}

// Default storage provider
export const storage: StorageProvider = new LocalStorageProvider()

/**
 * File validation utilities
 */
export const fileUtils = {
  /**
   * Validate file type
   */
  isValidType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type)
  },

  /**
   * Validate file size
   */
  isValidSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize
  },

  /**
   * Get file extension
   */
  getExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || ''
  },

  /**
   * Format file size for display
   */
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  /**
   * Check if file is an image
   */
  isImage(file: File): boolean {
    return file.type.startsWith('image/')
  },

  /**
   * Check if file is a document
   */
  isDocument(file: File): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]
    return documentTypes.includes(file.type)
  },

  /**
   * Generate unique filename
   */
  generateFilename(originalName: string, prefix?: string): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = this.getExtension(originalName)
    const name = prefix
      ? `${prefix}-${timestamp}-${randomString}`
      : `${timestamp}-${randomString}`
    return `${name}.${extension}`
  },
}

/**
 * Upload presets for common use cases
 */
export const uploadPresets = {
  avatar: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    folder: 'avatars',
  },

  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    folder: 'documents',
  },

  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    folder: 'images',
  },
}
