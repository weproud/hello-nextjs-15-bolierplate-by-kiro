'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { createProject, submitFeedback } from '@/lib/actions/form-actions'
import { projectSchema, feedbackSchema } from '@/lib/validations/common'
import type { ProjectInput, FeedbackInput } from '@/lib/validations/common'

// Project Creation Form Component
export function ProjectForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
  })

  const { execute, status, result } = useAction(createProject, {
    onSuccess: data => {
      toast.success('프로젝트가 성공적으로 생성되었습니다!')
      console.log('Project created:', data)
      reset()
    },
    onError: error => {
      toast.error(error.error.serverError || '프로젝트 생성에 실패했습니다.')
      console.error('Project creation failed:', error)
    },
  })

  const onSubmit = (data: ProjectInput) => {
    execute(data)
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>새 프로젝트 생성</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>프로젝트 제목</Label>
            <Input
              id='title'
              {...register('title')}
              placeholder='프로젝트 제목을 입력하세요'
              disabled={status === 'executing'}
            />
            {errors.title && (
              <p className='text-sm text-red-500'>{errors.title.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>프로젝트 설명 (선택사항)</Label>
            <Textarea
              id='description'
              {...register('description')}
              placeholder='프로젝트에 대한 간단한 설명을 입력하세요'
              disabled={status === 'executing'}
            />
            {errors.description && (
              <p className='text-sm text-red-500'>
                {errors.description.message}
              </p>
            )}
          </div>

          <Button
            type='submit'
            className='w-full'
            disabled={status === 'executing'}
          >
            {status === 'executing' ? '생성 중...' : '프로젝트 생성'}
          </Button>

          {result?.data && (
            <div className='p-3 bg-green-50 border border-green-200 rounded-md'>
              <p className='text-sm text-green-800'>
                프로젝트 ID: {result.data.id}
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

// Feedback Form Component
export function FeedbackForm() {
  const [feedbackType, setFeedbackType] = useState<string>('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
  })

  const { execute, status, result } = useAction(submitFeedback, {
    onSuccess: data => {
      toast.success('피드백이 성공적으로 제출되었습니다!')
      console.log('Feedback submitted:', data)
      reset()
      setFeedbackType('')
    },
    onError: error => {
      toast.error(error.error.serverError || '피드백 제출에 실패했습니다.')
      console.error('Feedback submission failed:', error)
    },
  })

  const onSubmit = (data: FeedbackInput) => {
    execute(data)
  }

  const handleTypeChange = (value: string) => {
    setFeedbackType(value)
    setValue('type', value as FeedbackInput['type'])
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>피드백 제출</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='type'>피드백 유형</Label>
            <Select
              onValueChange={handleTypeChange}
              disabled={status === 'executing'}
            >
              <SelectTrigger>
                <SelectValue placeholder='피드백 유형을 선택하세요' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='bug'>버그 신고</SelectItem>
                <SelectItem value='feature'>기능 요청</SelectItem>
                <SelectItem value='improvement'>개선 제안</SelectItem>
                <SelectItem value='other'>기타</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className='text-sm text-red-500'>{errors.type.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='title'>제목</Label>
            <Input
              id='title'
              {...register('title')}
              placeholder='피드백 제목을 입력하세요'
              disabled={status === 'executing'}
            />
            {errors.title && (
              <p className='text-sm text-red-500'>{errors.title.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>설명</Label>
            <Textarea
              id='description'
              {...register('description')}
              placeholder='피드백에 대한 자세한 설명을 입력하세요'
              disabled={status === 'executing'}
              rows={4}
            />
            {errors.description && (
              <p className='text-sm text-red-500'>
                {errors.description.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='priority'>우선순위</Label>
            <Select
              onValueChange={value =>
                setValue('priority', value as FeedbackInput['priority'])
              }
              disabled={status === 'executing'}
            >
              <SelectTrigger>
                <SelectValue placeholder='우선순위를 선택하세요' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='low'>낮음</SelectItem>
                <SelectItem value='medium'>보통</SelectItem>
                <SelectItem value='high'>높음</SelectItem>
              </SelectContent>
            </Select>
            {errors.priority && (
              <p className='text-sm text-red-500'>{errors.priority.message}</p>
            )}
          </div>

          <Button
            type='submit'
            className='w-full'
            disabled={status === 'executing'}
          >
            {status === 'executing' ? '제출 중...' : '피드백 제출'}
          </Button>

          {result?.data && (
            <div className='p-3 bg-green-50 border border-green-200 rounded-md'>
              <p className='text-sm text-green-800'>
                피드백 ID: {result.data.id}
              </p>
              <p className='text-sm text-green-600'>
                상태: {result.data.status}
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

// Combined Example Component
export function SafeActionExamples() {
  return (
    <div className='container mx-auto py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-4'>Next Safe Action Examples</h1>
        <p className='text-gray-600'>
          이 예제들은 next-safe-action과 React Hook Form을 함께 사용하는 방법을
          보여줍니다.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <ProjectForm />
        <FeedbackForm />
      </div>

      <div className='mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md'>
        <h3 className='font-semibold text-blue-800 mb-2'>주요 특징:</h3>
        <ul className='text-sm text-blue-700 space-y-1'>
          <li>• Zod 스키마를 사용한 타입 안전한 검증</li>
          <li>• 인증이 필요한 액션과 공개 액션 구분</li>
          <li>• 자동 에러 처리 및 로깅</li>
          <li>• React Hook Form과의 완벽한 통합</li>
          <li>• 로딩 상태 및 결과 처리</li>
          <li>• Toast 알림을 통한 사용자 피드백</li>
        </ul>
      </div>
    </div>
  )
}
