'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  TiptapEditor,
  type TiptapEditorRef,
} from '@/components/editor/tiptap-editor'
import { createPostAction, updatePostAction } from '@/lib/actions/post-actions'
import { postFormSchema, generateExcerpt } from '@/lib/validations/post'
import type { PostFormInput } from '@/lib/validations/post'
import { toast } from 'sonner'
import { Loader2, Save, Plus, FileText, Eye, EyeOff } from 'lucide-react'

interface PostFormProps {
  mode?: 'create' | 'edit'
  initialData?: {
    id: string
    title: string
    content: string
    excerpt?: string | null
    published: boolean
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function PostForm({
  mode = 'create',
  initialData,
  onSuccess,
  onCancel,
}: PostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const router = useRouter()
  const editorRef = useRef<TiptapEditorRef>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

  const form = useForm<PostFormInput>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      excerpt: initialData?.excerpt || '',
      published: initialData?.published || false,
    },
  })

  const { watch, setValue } = form
  const watchedContent = watch('content')
  const watchedTitle = watch('title')
  const watchedPublished = watch('published')

  // 자동 저장 기능 (편집 모드에서만)
  useEffect(() => {
    if (mode === 'edit' && initialData?.id) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      // Set new timeout for auto-save
      autoSaveTimeoutRef.current = setTimeout(async () => {
        const title = watchedTitle?.trim()
        const content = watchedContent?.trim()

        // Only auto-save if there's content and it's different from initial
        if (
          (title && title !== initialData.title) ||
          (content && content !== initialData.content)
        ) {
          await handleAutoSave()
        }
      }, 3000) // 3초 후 자동 저장

      return () => {
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current)
        }
      }
    }
  }, [watchedTitle, watchedContent, mode, initialData])

  // 내용 변경 시 자동으로 요약 생성
  useEffect(() => {
    if (watchedContent) {
      const excerpt = generateExcerpt(watchedContent, 200)
      setValue('excerpt', excerpt)
    }
  }, [watchedContent, setValue])

  const handleAutoSave = async () => {
    if (!initialData?.id || isSubmitting) return

    setIsAutoSaving(true)
    try {
      const formData = form.getValues()
      const result = await updatePostAction({
        id: initialData.id,
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        published: formData.published,
      })

      if (result?.data?.success) {
        setLastSaved(new Date())
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }

  const onSubmit = async (data: PostFormInput) => {
    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        const result = await createPostAction({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          published: data.published,
        })

        if (result?.data?.success) {
          toast.success('포스트가 성공적으로 생성되었습니다!')
          form.reset()
          onSuccess?.()
          router.push('/posts')
        } else {
          throw new Error(
            result?.data?.message || '포스트 생성에 실패했습니다.'
          )
        }
      } else if (initialData?.id) {
        const result = await updatePostAction({
          id: initialData.id,
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          published: data.published,
        })

        if (result?.data?.success) {
          toast.success('포스트가 성공적으로 수정되었습니다!')
          onSuccess?.()
          if (data.published) {
            router.push(`/posts/${initialData.id}`)
          }
        } else {
          throw new Error(
            result?.data?.message || '포스트 수정에 실패했습니다.'
          )
        }
      }
    } catch (error) {
      console.error('Post form error:', error)
      toast.error(
        error instanceof Error ? error.message : '오류가 발생했습니다.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContentChange = (content: string) => {
    setValue('content', content, { shouldValidate: true })
  }

  return (
    <div className='w-full max-w-4xl mx-auto space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            {mode === 'create' ? (
              <>
                <Plus className='h-5 w-5' />새 포스트 작성
              </>
            ) : (
              <>
                <FileText className='h-5 w-5' />
                포스트 편집
              </>
            )}
          </CardTitle>
          <CardDescription className='flex items-center justify-between'>
            <span>
              {mode === 'create'
                ? 'Tiptap 에디터를 사용하여 리치 텍스트 포스트를 작성하세요.'
                : '포스트 내용을 수정하세요.'}
            </span>
            {mode === 'edit' && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                {isAutoSaving && (
                  <>
                    <Loader2 className='h-3 w-3 animate-spin' />
                    자동 저장 중...
                  </>
                )}
                {lastSaved && !isAutoSaving && (
                  <span>마지막 저장: {lastSaved.toLocaleTimeString()}</span>
                )}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='포스트 제목을 입력하세요...'
                        {...field}
                        disabled={isSubmitting}
                        className='text-lg font-medium'
                      />
                    </FormControl>
                    <FormDescription>
                      포스트의 제목을 입력해주세요. (최대 200자)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>내용 *</FormLabel>
                    <FormControl>
                      <TiptapEditor
                        ref={editorRef}
                        content={field.value}
                        onChange={handleContentChange}
                        placeholder='포스트 내용을 입력하세요...'
                        showToolbar={true}
                        className='min-h-[400px]'
                      />
                    </FormControl>
                    <FormDescription>
                      Tiptap 에디터를 사용하여 리치 텍스트 콘텐츠를 작성하세요.
                      헤딩, 볼드, 이탤릭, 리스트 등을 사용할 수 있습니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='excerpt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>요약</FormLabel>
                    <FormControl>
                      <textarea
                        className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none'
                        placeholder='포스트 요약을 입력하세요... (자동 생성됨)'
                        disabled={isSubmitting}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      포스트의 요약입니다. 내용을 입력하면 자동으로 생성되며,
                      직접 수정할 수도 있습니다. (최대 300자)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='published'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base flex items-center gap-2'>
                        {field.value ? (
                          <>
                            <Eye className='h-4 w-4' />
                            발행됨
                          </>
                        ) : (
                          <>
                            <EyeOff className='h-4 w-4' />
                            초안
                          </>
                        )}
                      </FormLabel>
                      <FormDescription>
                        {field.value
                          ? '이 포스트는 공개적으로 표시됩니다.'
                          : '이 포스트는 초안으로 저장되며 공개되지 않습니다.'}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className='flex gap-3 pt-4'>
                <Button
                  type='submit'
                  disabled={isSubmitting}
                  className='flex-1'
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {mode === 'create' ? '생성 중...' : '저장 중...'}
                    </>
                  ) : (
                    <>
                      {mode === 'create' ? (
                        <>
                          <Plus className='mr-2 h-4 w-4' />
                          {watchedPublished ? '포스트 발행' : '초안 저장'}
                        </>
                      ) : (
                        <>
                          <Save className='mr-2 h-4 w-4' />
                          {watchedPublished ? '변경사항 발행' : '초안 저장'}
                        </>
                      )}
                    </>
                  )}
                </Button>

                {onCancel && (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    취소
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
