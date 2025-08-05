'use client'

import { useState, useRef, useCallback, forwardRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { OptimizedImage } from './optimized-image'
import {
  validateImage,
  validateImageDimensions,
  getImageMetadata,
  formatBytes,
  type ImageValidationOptions,
} from '@/lib/image/image-utils'

interface ImageUploadProps {
  value?: string | string[]
  onChange?: (value: string | string[]) => void
  multiple?: boolean
  maxFiles?: number
  accept?: string
  validation?: ImageValidationOptions
  className?: string
  disabled?: boolean
  placeholder?: string
  showPreview?: boolean
  onUpload?: (files: File[]) => Promise<string[]>
}

interface UploadedFile {
  id: string
  file: File
  preview: string
  status: 'uploading' | 'success' | 'error'
  progress: number
  url?: string
  error?: string
}

export const ImageUpload = forwardRef<HTMLInputElement, ImageUploadProps>(
  (
    {
      value,
      onChange,
      multiple = false,
      maxFiles = 5,
      accept = 'image/*',
      validation,
      className,
      disabled = false,
      placeholder = '이미지를 업로드하세요',
      showPreview = true,
      onUpload,
    },
    ref
  ) => {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [isDragOver, setIsDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Handle file selection
    const handleFileSelect = useCallback(
      async (files: FileList | null) => {
        if (!files || files.length === 0) return

        const fileArray = Array.from(files)
        const validFiles: File[] = []
        const errors: string[] = []

        // Validate files
        for (const file of fileArray) {
          const basicValidation = validateImage(file, validation)
          if (!basicValidation.valid) {
            errors.push(`${file.name}: ${basicValidation.errors.join(', ')}`)
            continue
          }

          const dimensionValidation = await validateImageDimensions(
            file,
            validation
          )
          if (!dimensionValidation.valid) {
            errors.push(
              `${file.name}: ${dimensionValidation.errors.join(', ')}`
            )
            continue
          }

          validFiles.push(file)
        }

        // Show errors if any
        if (errors.length > 0) {
          console.error('File validation errors:', errors)
          // You might want to show these errors in a toast or alert
        }

        // Check file count limit
        const currentCount = uploadedFiles.length
        const remainingSlots = maxFiles - currentCount
        const filesToProcess = validFiles.slice(0, remainingSlots)

        if (validFiles.length > remainingSlots) {
          console.warn(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다`)
        }

        // Create uploaded file objects
        const newUploadedFiles: UploadedFile[] = filesToProcess.map(file => ({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          status: 'uploading',
          progress: 0,
        }))

        setUploadedFiles(prev => [...prev, ...newUploadedFiles])

        // Upload files if onUpload is provided
        if (onUpload) {
          try {
            const urls = await onUpload(filesToProcess)

            setUploadedFiles(prev =>
              prev.map((uploadedFile, index) => {
                const fileIndex = prev.length - filesToProcess.length + index
                if (fileIndex >= 0 && fileIndex < urls.length) {
                  return {
                    ...uploadedFile,
                    status: 'success',
                    progress: 100,
                    url: urls[fileIndex],
                  }
                }
                return uploadedFile
              })
            )

            // Update form value
            if (multiple) {
              const allUrls = [...(Array.isArray(value) ? value : []), ...urls]
              onChange?.(allUrls)
            } else {
              onChange?.(urls[0])
            }
          } catch (error) {
            console.error('Upload failed:', error)
            setUploadedFiles(prev =>
              prev.map(uploadedFile => ({
                ...uploadedFile,
                status: 'error',
                error: error instanceof Error ? error.message : '업로드 실패',
              }))
            )
          }
        }
      },
      [uploadedFiles, maxFiles, validation, onUpload, onChange, value, multiple]
    )

    // Handle drag and drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
    }, [])

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)

        if (disabled) return

        const files = e.dataTransfer.files
        handleFileSelect(files)
      },
      [disabled, handleFileSelect]
    )

    // Handle file input change
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(e.target.files)
      },
      [handleFileSelect]
    )

    // Remove file
    const removeFile = useCallback(
      (id: string) => {
        setUploadedFiles(prev => {
          const updated = prev.filter(file => file.id !== id)

          // Update form value
          if (multiple) {
            const urls = updated.filter(f => f.url).map(f => f.url!)
            onChange?.(urls)
          } else {
            onChange?.(undefined)
          }

          return updated
        })
      },
      [multiple, onChange]
    )

    // Open file dialog
    const openFileDialog = useCallback(() => {
      if (!disabled) {
        fileInputRef.current?.click()
      }
    }, [disabled])

    return (
      <div className={cn('space-y-4', className)}>
        {/* Upload Area */}
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type='file'
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            disabled={disabled}
            className='hidden'
          />

          <div className='flex flex-col items-center justify-center space-y-2 text-center'>
            <Upload className='h-8 w-8 text-muted-foreground' />
            <div className='space-y-1'>
              <p className='text-sm font-medium'>{placeholder}</p>
              <p className='text-xs text-muted-foreground'>
                {multiple ? `최대 ${maxFiles}개 파일` : '1개 파일'} •
                {validation?.maxSize
                  ? ` ${formatBytes(validation.maxSize)} 이하`
                  : ''}
              </p>
            </div>
          </div>
        </div>

        {/* File Previews */}
        {showPreview && uploadedFiles.length > 0 && (
          <div className='space-y-3'>
            {uploadedFiles.map(uploadedFile => (
              <FilePreview
                key={uploadedFile.id}
                uploadedFile={uploadedFile}
                onRemove={() => removeFile(uploadedFile.id)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
)

ImageUpload.displayName = 'ImageUpload'

// File preview component
interface FilePreviewProps {
  uploadedFile: UploadedFile
  onRemove: () => void
}

function FilePreview({ uploadedFile, onRemove }: FilePreviewProps) {
  const [metadata, setMetadata] = useState<any>(null)

  // Load metadata
  useState(() => {
    getImageMetadata(uploadedFile.file).then(setMetadata).catch(console.error)
  })

  return (
    <div className='flex items-center space-x-3 p-3 border rounded-lg'>
      {/* Image Preview */}
      <div className='flex-shrink-0'>
        <OptimizedImage
          src={uploadedFile.preview}
          alt={uploadedFile.file.name}
          width={60}
          height={60}
          className='rounded object-cover'
        />
      </div>

      {/* File Info */}
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium truncate'>{uploadedFile.file.name}</p>
        <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
          <span>{formatBytes(uploadedFile.file.size)}</span>
          {metadata && (
            <span>
              {metadata.dimensions.width} × {metadata.dimensions.height}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {uploadedFile.status === 'uploading' && (
          <div className='mt-2'>
            <Progress value={uploadedFile.progress} className='h-1' />
          </div>
        )}

        {/* Error Message */}
        {uploadedFile.status === 'error' && uploadedFile.error && (
          <p className='mt-1 text-xs text-destructive'>{uploadedFile.error}</p>
        )}
      </div>

      {/* Status Icon */}
      <div className='flex-shrink-0'>
        {uploadedFile.status === 'uploading' && (
          <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
        )}
        {uploadedFile.status === 'success' && (
          <div className='h-2 w-2 rounded-full bg-green-500' />
        )}
        {uploadedFile.status === 'error' && (
          <div className='h-2 w-2 rounded-full bg-red-500' />
        )}
      </div>

      {/* Remove Button */}
      <Button
        variant='ghost'
        size='sm'
        onClick={onRemove}
        className='flex-shrink-0 h-8 w-8 p-0'
      >
        <X className='h-4 w-4' />
      </Button>
    </div>
  )
}
