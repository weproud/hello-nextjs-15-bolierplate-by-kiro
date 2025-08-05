/**
 * Image Processing Utilities
 *
 * 이미지 업로드, 리사이징, 최적화를 위한 유틸리티 함수들
 */

// Image format types
export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'avif'

// Image processing options
export interface ImageProcessingOptions {
  width?: number
  height?: number
  quality?: number
  format?: ImageFormat
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right'
}

// Image validation options
export interface ImageValidationOptions {
  maxSize?: number // in bytes
  maxWidth?: number
  maxHeight?: number
  allowedFormats?: string[]
  minWidth?: number
  minHeight?: number
}

// Default validation options
export const DEFAULT_IMAGE_VALIDATION: ImageValidationOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  maxWidth: 4000,
  maxHeight: 4000,
  minWidth: 50,
  minHeight: 50,
  allowedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
}

// Image validation function
export function validateImage(
  file: File,
  options: ImageValidationOptions = DEFAULT_IMAGE_VALIDATION
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check file size
  if (options.maxSize && file.size > options.maxSize) {
    errors.push(`파일 크기가 ${formatBytes(options.maxSize)}를 초과합니다`)
  }

  // Check file format
  if (options.allowedFormats && !options.allowedFormats.includes(file.type)) {
    errors.push(
      `지원하지 않는 파일 형식입니다. 허용된 형식: ${options.allowedFormats.join(', ')}`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Validate image dimensions
export async function validateImageDimensions(
  file: File,
  options: ImageValidationOptions = DEFAULT_IMAGE_VALIDATION
): Promise<{
  valid: boolean
  errors: string[]
  dimensions?: { width: number; height: number }
}> {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const errors: string[] = []
      const dimensions = { width: img.width, height: img.height }

      // Check maximum dimensions
      if (options.maxWidth && img.width > options.maxWidth) {
        errors.push(`이미지 너비가 ${options.maxWidth}px를 초과합니다`)
      }

      if (options.maxHeight && img.height > options.maxHeight) {
        errors.push(`이미지 높이가 ${options.maxHeight}px를 초과합니다`)
      }

      // Check minimum dimensions
      if (options.minWidth && img.width < options.minWidth) {
        errors.push(`이미지 너비가 ${options.minWidth}px 미만입니다`)
      }

      if (options.minHeight && img.height < options.minHeight) {
        errors.push(`이미지 높이가 ${options.minHeight}px 미만입니다`)
      }

      resolve({
        valid: errors.length === 0,
        errors,
        dimensions,
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({
        valid: false,
        errors: ['이미지를 읽을 수 없습니다'],
      })
    }

    img.src = url
  })
}

// Resize image using canvas
export async function resizeImage(
  file: File,
  options: ImageProcessingOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      const {
        width: targetWidth,
        height: targetHeight,
        quality = 0.9,
        format = 'jpeg',
      } = options

      // Calculate dimensions
      let { width, height } = img

      if (targetWidth && targetHeight) {
        width = targetWidth
        height = targetHeight
      } else if (targetWidth) {
        height = (img.height * targetWidth) / img.width
        width = targetWidth
      } else if (targetHeight) {
        width = (img.width * targetHeight) / img.height
        height = targetHeight
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw and resize image
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        `image/${format}`,
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

// Generate multiple image sizes
export async function generateImageSizes(
  file: File,
  sizes: Array<{
    name: string
    width: number
    height?: number
    quality?: number
  }>
): Promise<Array<{ name: string; blob: Blob; size: number }>> {
  const results = []

  for (const size of sizes) {
    try {
      const blob = await resizeImage(file, {
        width: size.width,
        height: size.height,
        quality: size.quality || 0.85,
        format: 'webp', // Use WebP for better compression
      })

      results.push({
        name: size.name,
        blob,
        size: blob.size,
      })
    } catch (error) {
      console.error(`Failed to generate ${size.name} size:`, error)
    }
  }

  return results
}

// Convert image to WebP format
export async function convertToWebP(file: File, quality = 0.85): Promise<Blob> {
  return resizeImage(file, {
    format: 'webp',
    quality,
  })
}

// Generate blur placeholder
export async function generateBlurPlaceholder(
  file: File,
  size = 10
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      // Create small blurred version
      canvas.width = size
      canvas.height = size

      ctx.filter = 'blur(2px)'
      ctx.drawImage(img, 0, 0, size, size)

      resolve(canvas.toDataURL('image/jpeg', 0.1))
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

// Get image metadata
export async function getImageMetadata(file: File): Promise<{
  name: string
  size: number
  type: string
  dimensions: { width: number; height: number }
  aspectRatio: number
}> {
  const dimensionResult = await validateImageDimensions(file)

  if (!dimensionResult.valid || !dimensionResult.dimensions) {
    throw new Error('Failed to get image dimensions')
  }

  const { width, height } = dimensionResult.dimensions

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    dimensions: { width, height },
    aspectRatio: width / height,
  }
}

// Format bytes utility
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Image optimization presets
export const IMAGE_OPTIMIZATION_PRESETS = {
  avatar: [
    { name: 'small', width: 40, height: 40, quality: 0.9 },
    { name: 'medium', width: 80, height: 80, quality: 0.9 },
    { name: 'large', width: 160, height: 160, quality: 0.9 },
  ],
  thumbnail: [
    { name: 'small', width: 150, height: 150, quality: 0.8 },
    { name: 'medium', width: 300, height: 300, quality: 0.85 },
    { name: 'large', width: 600, height: 600, quality: 0.85 },
  ],
  gallery: [
    { name: 'thumbnail', width: 200, height: 200, quality: 0.8 },
    { name: 'medium', width: 800, height: 600, quality: 0.85 },
    { name: 'large', width: 1200, height: 900, quality: 0.9 },
  ],
  hero: [
    { name: 'mobile', width: 768, height: 400, quality: 0.85 },
    { name: 'tablet', width: 1024, height: 600, quality: 0.9 },
    { name: 'desktop', width: 1920, height: 1080, quality: 0.9 },
  ],
} as const

// Batch image processing
export async function processImageBatch(
  files: File[],
  preset: keyof typeof IMAGE_OPTIMIZATION_PRESETS
): Promise<
  Array<{
    original: File
    processed: Array<{ name: string; blob: Blob; size: number }>
    metadata: any
  }>
> {
  const results = []

  for (const file of files) {
    try {
      const [processed, metadata] = await Promise.all([
        generateImageSizes(file, IMAGE_OPTIMIZATION_PRESETS[preset]),
        getImageMetadata(file),
      ])

      results.push({
        original: file,
        processed,
        metadata,
      })
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error)
    }
  }

  return results
}

// Image compression utility
export async function compressImage(
  file: File,
  targetSizeKB: number,
  maxIterations = 10
): Promise<Blob> {
  let quality = 0.9
  let compressed = await resizeImage(file, { quality, format: 'webp' })
  let iterations = 0

  while (compressed.size > targetSizeKB * 1024 && iterations < maxIterations) {
    quality -= 0.1
    if (quality < 0.1) quality = 0.1

    compressed = await resizeImage(file, { quality, format: 'webp' })
    iterations++
  }

  return compressed
}
