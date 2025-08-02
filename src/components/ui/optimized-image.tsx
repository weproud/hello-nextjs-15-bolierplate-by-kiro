'use client'

import Image from 'next/image'
import { useState, forwardRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageIcon, AlertCircle } from 'lucide-react'

// Image optimization presets
export const IMAGE_PRESETS = {
  avatar: {
    width: 40,
    height: 40,
    quality: 90,
    sizes: '40px',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    quality: 90,
    sizes: '80px',
  },
  thumbnail: {
    width: 200,
    height: 200,
    quality: 85,
    sizes: '(max-width: 768px) 100vw, 200px',
  },
  card: {
    width: 400,
    height: 300,
    quality: 85,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px',
  },
  hero: {
    width: 1200,
    height: 600,
    quality: 90,
    sizes: '100vw',
  },
  gallery: {
    width: 800,
    height: 600,
    quality: 85,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px',
  },
  fullWidth: {
    width: 1920,
    height: 1080,
    quality: 90,
    sizes: '100vw',
  },
} as const

export type ImagePreset = keyof typeof IMAGE_PRESETS

interface OptimizedImageProps {
  src: string
  alt: string
  preset?: ImagePreset
  width?: number
  height?: number
  quality?: number
  priority?: boolean
  fill?: boolean
  sizes?: string
  className?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  objectPosition?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  unoptimized?: boolean
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
  onError?: () => void
  fallback?: React.ReactNode
  showSkeleton?: boolean
  aspectRatio?: string
}

export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      src,
      alt,
      preset,
      width,
      height,
      quality = 85,
      priority = false,
      fill = false,
      sizes,
      className,
      objectFit = 'cover',
      objectPosition = 'center',
      placeholder = 'empty',
      blurDataURL,
      unoptimized = false,
      loading = 'lazy',
      onLoad,
      onError,
      fallback,
      showSkeleton = true,
      aspectRatio,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [imageSrc, setImageSrc] = useState(src)

    // Apply preset if provided
    const presetConfig = preset ? IMAGE_PRESETS[preset] : null
    const finalWidth = width || presetConfig?.width
    const finalHeight = height || presetConfig?.height
    const finalQuality = quality || presetConfig?.quality || 85
    const finalSizes = sizes || presetConfig?.sizes

    // Handle image load
    const handleLoad = () => {
      setIsLoading(false)
      onLoad?.()
    }

    // Handle image error
    const handleError = () => {
      setIsLoading(false)
      setHasError(true)
      onError?.()
    }

    // Reset states when src changes
    useEffect(() => {
      setIsLoading(true)
      setHasError(false)
      setImageSrc(src)
    }, [src])

    // Generate blur data URL for placeholder
    const generateBlurDataURL = (width: number, height: number) => {
      if (blurDataURL) return blurDataURL

      // Generate a simple blur placeholder
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      if (ctx) {
        ctx.fillStyle = '#f3f4f6'
        ctx.fillRect(0, 0, width, height)
        return canvas.toDataURL()
      }

      return undefined
    }

    // Error fallback component
    const ErrorFallback = () => (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          fill ? 'absolute inset-0' : 'w-full h-full',
          className
        )}
        style={{
          width: fill ? undefined : finalWidth,
          height: fill ? undefined : finalHeight,
          aspectRatio: aspectRatio,
        }}
      >
        {fallback || (
          <div className='flex flex-col items-center gap-2 p-4'>
            <AlertCircle className='h-8 w-8' />
            <span className='text-sm'>이미지를 불러올 수 없습니다</span>
          </div>
        )}
      </div>
    )

    // Loading skeleton
    const LoadingSkeleton = () => (
      <Skeleton
        className={cn(fill ? 'absolute inset-0' : 'w-full h-full', className)}
        style={{
          width: fill ? undefined : finalWidth,
          height: fill ? undefined : finalHeight,
          aspectRatio: aspectRatio,
        }}
      />
    )

    // Show error fallback if image failed to load
    if (hasError) {
      return <ErrorFallback />
    }

    // Container for fill images
    if (fill) {
      return (
        <div
          className={cn('relative overflow-hidden', className)}
          style={{ aspectRatio }}
        >
          {isLoading && showSkeleton && <LoadingSkeleton />}
          <Image
            ref={ref}
            src={imageSrc}
            alt={alt}
            fill
            quality={finalQuality}
            priority={priority}
            sizes={finalSizes}
            placeholder={placeholder}
            blurDataURL={
              placeholder === 'blur' && finalWidth && finalHeight
                ? generateBlurDataURL(finalWidth, finalHeight)
                : undefined
            }
            unoptimized={unoptimized}
            loading={loading}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
            style={{
              objectFit,
              objectPosition,
            }}
            {...props}
          />
        </div>
      )
    }

    // Regular image with dimensions
    return (
      <div className={cn('relative', className)} style={{ aspectRatio }}>
        {isLoading && showSkeleton && <LoadingSkeleton />}
        <Image
          ref={ref}
          src={imageSrc}
          alt={alt}
          width={finalWidth}
          height={finalHeight}
          quality={finalQuality}
          priority={priority}
          sizes={finalSizes}
          placeholder={placeholder}
          blurDataURL={
            placeholder === 'blur' && finalWidth && finalHeight
              ? generateBlurDataURL(finalWidth, finalHeight)
              : undefined
          }
          unoptimized={unoptimized}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            'rounded-lg object-cover'
          )}
          style={{
            objectFit,
            objectPosition,
          }}
          {...props}
        />
      </div>
    )
  }
)

OptimizedImage.displayName = 'OptimizedImage'

// Avatar component using OptimizedImage
export interface AvatarImageProps {
  src?: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallback?: React.ReactNode
}

export function AvatarImage({
  src,
  alt,
  size = 'md',
  className,
  fallback,
}: AvatarImageProps) {
  const sizeMap = {
    sm: 'avatar',
    md: 'avatar',
    lg: 'avatarLarge',
    xl: 'avatarLarge',
  } as const

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
  }

  if (!src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted text-muted-foreground',
          sizeClasses[size],
          className
        )}
      >
        {fallback || <ImageIcon className='h-1/2 w-1/2' />}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      preset={sizeMap[size]}
      className={cn('rounded-full', sizeClasses[size], className)}
      fallback={fallback}
    />
  )
}

// Gallery image component
export interface GalleryImageProps {
  src: string
  alt: string
  caption?: string
  className?: string
  onClick?: () => void
}

export function GalleryImage({
  src,
  alt,
  caption,
  className,
  onClick,
}: GalleryImageProps) {
  return (
    <div className={cn('group cursor-pointer', className)} onClick={onClick}>
      <OptimizedImage
        src={src}
        alt={alt}
        preset='gallery'
        className='transition-transform duration-200 group-hover:scale-105'
        aspectRatio='4/3'
      />
      {caption && (
        <p className='mt-2 text-sm text-muted-foreground'>{caption}</p>
      )}
    </div>
  )
}

// Hero image component
export interface HeroImageProps {
  src: string
  alt: string
  overlay?: boolean
  className?: string
  children?: React.ReactNode
}

export function HeroImage({
  src,
  alt,
  overlay = false,
  className,
  children,
}: HeroImageProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        preset='hero'
        fill
        priority
        className='absolute inset-0'
      />
      {overlay && <div className='absolute inset-0 bg-black/40' />}
      {children && (
        <div className='relative z-10 flex h-full items-center justify-center'>
          {children}
        </div>
      )}
    </div>
  )
}
