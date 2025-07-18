'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import {
  TextField,
  SelectField,
  CheckboxField,
  FormSection,
  FormActions,
} from './form-field-components'
import { useFormAction } from '@/hooks/use-form-action'

// Simple form schema
const simpleSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
  email: z.string().email('올바른 이메일 주소를 입력하세요.'),
  role: z.enum(['student', 'professional', 'freelancer'], {
    message: '역할을 선택해주세요.',
  }),
  newsletter: z.boolean().default(false),
})

type SimpleFormData = z.infer<typeof simpleSchema>

const roleOptions = [
  { value: 'student', label: '학생' },
  { value: 'professional', label: '직장인' },
  { value: 'freelancer', label: '프리랜서' },
]

export function SimpleFormExample() {
  const form = useForm<SimpleFormData>({
    resolver: zodResolver(simpleSchema),
    defaultValues: {
      name: '',
      email: '',
      role: undefined,
      newsletter: false,
    },
  })

  const { executeAction, isExecuting } = useFormAction()

  const onSubmit = async (data: SimpleFormData) => {
    await executeAction(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Form submitted:', data)
      return { success: true, message: '성공적으로 제출되었습니다!' }
    })
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">간단한 폼 예제</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="기본 정보">
            <TextField
              control={form.control}
              name="name"
              label="이름"
              placeholder="이름을 입력하세요"
            />

            <TextField
              control={form.control}
              name="email"
              label="이메일"
              type="email"
              placeholder="이메일을 입력하세요"
            />

            <SelectField
              control={form.control}
              name="role"
              label="역할"
              options={roleOptions}
              placeholder="역할을 선택하세요"
            />
          </FormSection>

          <FormSection title="설정">
            <CheckboxField
              control={form.control}
              name="newsletter"
              label="뉴스레터 구독"
              description="새로운 소식을 이메일로 받아보세요"
            />
          </FormSection>

          <FormActions isSubmitting={isExecuting} submitText="제출하기" />
        </form>
      </Form>
    </div>
  )
}
