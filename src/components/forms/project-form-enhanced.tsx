'use client'

import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { EnhancedForm, type FormFieldConfig } from './enhanced-form'
import { useFormWithAction } from '@/hooks/use-form-with-action'
import {
  createProjectAction,
  updateProjectAction,
} from '@/lib/actions/project-actions'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus, Save } from 'lucide-react'

// 프로젝트 스키마 정의
const projectSchema = z.object({
  title: z
    .string()
    .min(1, '프로젝트 제목을 입력해주세요.')
    .max(255, '제목은 255자 이하로 입력해주세요.'),
  description: z
    .string()
    .max(1000, '설명은 1000자 이하로 입력해주세요.')
    .optional(),
})

const updateProjectSchema = projectSchema.extend({
  id: z.string().min(1, '프로젝트 ID가 필요합니다.'),
})

type ProjectFormData = z.infer<typeof projectSchema>
type UpdateProjectFormData = z.infer<typeof updateProjectSchema>

interface ProjectFormEnhancedProps {
  mode?: 'create' | 'edit'
  initialData?: {
    id: string
    title: string
    description?: string | null
  }
  onSuccess?: (project?: any) => void
  onCancel?: () => void
  showCard?: boolean
}

export function ProjectFormEnhanced({
  mode = 'create',
  initialData,
  onSuccess,
  onCancel,
  showCard = true,
}: ProjectFormEnhancedProps) {
  const router = useRouter()

  // 폼 필드 설정
  const fields: FormFieldConfig<ProjectFormData>[] = [
    {
      name: 'title',
      type: 'input',
      label: '프로젝트 제목',
      placeholder: '예: 새로운 기술 스택 학습하기',
      helperText: '프로젝트의 목표나 주제를 간단히 표현해주세요. (최대 255자)',
      required: true,
      validation: {
        showIndicator: true,
        realTime: true,
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: '프로젝트 설명',
      placeholder:
        '프로젝트의 목적, 기대 효과, 주요 활동 등을 자세히 설명해주세요...',
      helperText: '프로젝트에 대한 상세한 설명을 입력해주세요. (최대 1000자)',
      required: false,
      props: {
        rows: 5,
      },
    },
  ]

  // 폼 옵션 설정
  const formOptions = {
    formOptions: {
      defaultValues: {
        title: initialData?.title || '',
        description: initialData?.description || '',
      },
    },
    successMessage:
      mode === 'create'
        ? '프로젝트가 성공적으로 생성되었습니다!'
        : '프로젝트가 성공적으로 수정되었습니다!',
    onSuccess: (data: any, formData: ProjectFormData) => {
      onSuccess?.(data)
      if (!onSuccess && mode === 'create') {
        router.push('/projects')
      }
    },
    resetOnSuccess: mode === 'create',
    showToast: true,
  }

  // 액션 선택
  const action = mode === 'create' ? createProjectAction : updateProjectAction
  const schema = mode === 'create' ? projectSchema : updateProjectSchema

  // 수정 모드일 때 ID 필드 추가
  const enhancedFields =
    mode === 'edit' && initialData?.id
      ? [
          {
            name: 'id' as keyof UpdateProjectFormData,
            type: 'input' as const,
            label: 'ID',
            render: () => <input type='hidden' value={initialData.id} />,
          },
          ...fields,
        ]
      : fields

  const formContent = (
    <EnhancedForm
      schema={schema}
      action={action}
      fields={enhancedFields as any}
      formOptions={formOptions}
      title={mode === 'create' ? '새 프로젝트 만들기' : '프로젝트 수정'}
      description={
        mode === 'create'
          ? '새로운 프로젝트를 만들어 목표를 체계적으로 관리해보세요.'
          : '프로젝트 정보를 수정하세요.'
      }
      submitText={mode === 'create' ? '프로젝트 생성' : '변경사항 저장'}
      cancelText='취소'
      onCancel={onCancel}
      showProgress={true}
      showErrorSummary={true}
      layout='vertical'
      className='w-full max-w-2xl mx-auto'
      header={
        <div className='flex items-center gap-2 mb-4'>
          {mode === 'create' ? (
            <Plus className='h-5 w-5' />
          ) : (
            <Save className='h-5 w-5' />
          )}
        </div>
      }
    />
  )

  return showCard ? (
    <Card className='w-full max-w-2xl mx-auto'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          {mode === 'create' ? (
            <>
              <Plus className='h-5 w-5' />새 프로젝트 만들기
            </>
          ) : (
            <>
              <Save className='h-5 w-5' />
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
      <CardContent>{formContent}</CardContent>
    </Card>
  ) : (
    <div className='w-full max-w-2xl mx-auto'>{formContent}</div>
  )
}

// 사용 예시를 위한 래퍼 컴포넌트들
export function CreateProjectForm(
  props: Omit<ProjectFormEnhancedProps, 'mode'>
) {
  return <ProjectFormEnhanced {...props} mode='create' />
}

export function EditProjectForm(props: Omit<ProjectFormEnhancedProps, 'mode'>) {
  return <ProjectFormEnhanced {...props} mode='edit' />
}
