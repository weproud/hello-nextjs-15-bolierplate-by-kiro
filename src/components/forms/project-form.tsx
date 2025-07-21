'use client'

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
import {
  createProjectAction,
  updateProjectAction,
} from '@/lib/actions/project-actions'
import {
  createProjectSchema,
  updateProjectSchema,
} from '@/lib/validations/project'
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from '@/lib/validations/project'
import { toast } from 'sonner'
import { Loader2, Save, Plus } from 'lucide-react'
import { useDataLoading, useProgress } from '@/hooks/use-loading-state'
import {
  LoadingOverlay,
  ProgressIndicator,
} from '@/components/ui/progress-indicators'

interface ProjectFormProps {
  mode?: 'create' | 'edit'
  initialData?: {
    id: string
    title: string
    description?: string | null
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProjectForm({
  mode = 'create',
  initialData,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const router = useRouter()

  // 통합 로딩 상태 관리
  const formLoading = useDataLoading(`project-form-${mode}`)
  const { updateProgress, clearProgress } = useProgress(`project-form-${mode}`)

  const form = useForm<CreateProjectInput | UpdateProjectInput>({
    resolver: zodResolver(
      mode === 'create' ? createProjectSchema : updateProjectSchema
    ),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      ...(mode === 'edit' && initialData?.id && { id: initialData.id }),
    },
  })

  const onSubmit = async (data: CreateProjectInput | UpdateProjectInput) => {
    formLoading.setLoading(true)

    try {
      // 진행률 업데이트
      updateProgress({
        current: 10,
        total: 100,
        message: '데이터 검증 중...',
        stage: 'validation',
      })

      // 잠시 대기 (사용자 경험을 위해)
      await new Promise(resolve => setTimeout(resolve, 300))

      updateProgress({
        current: 30,
        total: 100,
        message:
          mode === 'create' ? '프로젝트 생성 중...' : '프로젝트 수정 중...',
        stage: 'processing',
      })

      if (mode === 'create') {
        const result = await createProjectAction(data as CreateProjectInput)

        updateProgress({
          current: 80,
          total: 100,
          message: '결과 처리 중...',
          stage: 'finalizing',
        })

        if (result?.data?.success) {
          updateProgress({
            current: 100,
            total: 100,
            message: '완료!',
            stage: 'completed',
          })

          toast.success('프로젝트가 성공적으로 생성되었습니다!')
          form.reset()
          onSuccess?.()

          // 완료 후 잠시 대기
          setTimeout(() => {
            clearProgress()
            router.push('/projects')
          }, 500)
        } else {
          throw new Error(
            result?.data?.message || '프로젝트 생성에 실패했습니다.'
          )
        }
      } else {
        const result = await updateProjectAction(data as UpdateProjectInput)

        updateProgress({
          current: 80,
          total: 100,
          message: '결과 처리 중...',
          stage: 'finalizing',
        })

        if (result?.data?.success) {
          updateProgress({
            current: 100,
            total: 100,
            message: '완료!',
            stage: 'completed',
          })

          toast.success('프로젝트가 성공적으로 수정되었습니다!')
          onSuccess?.()

          setTimeout(() => {
            clearProgress()
          }, 500)
        } else {
          throw new Error(
            result?.data?.message || '프로젝트 수정에 실패했습니다.'
          )
        }
      }
    } catch (error) {
      console.error('Project form error:', error)
      clearProgress()
      toast.error(
        error instanceof Error ? error.message : '오류가 발생했습니다.'
      )
    } finally {
      formLoading.setLoading(false)
    }
  }

  return (
    <LoadingOverlay
      isLoading={formLoading.isLoading}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mode === 'create' ? (
              <>
                <Plus className="h-5 w-5" />새 프로젝트 만들기
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                프로젝트 수정
              </>
            )}
          </CardTitle>
          <CardDescription>
            {mode === 'create'
              ? '새로운 프로젝트를 만들어 목표를 체계적으로 관리해보세요.'
              : '프로젝트 정보를 수정하세요.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 진행률 표시 */}
          {formLoading.isLoading && (
            <div className="mb-6">
              <ProgressIndicator
                progressKey={`project-form-${mode}`}
                showMessage={true}
                showPercentage={true}
              />
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>프로젝트 제목 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 새로운 기술 스택 학습하기"
                        {...field}
                        disabled={formLoading.isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      프로젝트의 목표나 주제를 간단히 표현해주세요. (최대 255자)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>프로젝트 설명</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        placeholder="프로젝트의 목적, 기대 효과, 주요 활동 등을 자세히 설명해주세요..."
                        disabled={formLoading.isLoading}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      프로젝트에 대한 상세한 설명을 입력해주세요. (최대 1000자)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={formLoading.isLoading}
                  className="flex-1"
                >
                  {formLoading.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === 'create' ? '생성 중...' : '수정 중...'}
                    </>
                  ) : (
                    <>
                      {mode === 'create' ? (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          프로젝트 생성
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          변경사항 저장
                        </>
                      )}
                    </>
                  )}
                </Button>

                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={formLoading.isLoading}
                  >
                    취소
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </LoadingOverlay>
  )
}
