'use client'

import React, { memo, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import {
  TextField,
  SelectField,
  CheckboxField,
  FormSection,
  FormActions,
} from './form-field-components'
import { useFormAction } from '@/hooks/use-form-action'
import {
  simpleFormSchema,
  type SimpleFormInput,
} from '@/lib/validations/component-schemas'

type SimpleFormData = SimpleFormInput

const roleOptions = [
  { value: 'student', label: '학생' },
  { value: 'professional', label: '직장인' },
  { value: 'freelancer', label: '프리랜서' },
]

export const SimpleFormExample = memo(function SimpleFormExample() {
  const defaultValues = useMemo(
    () => ({
      name: '',
      email: '',
      role: undefined as any,
      newsletter: false,
    }),
    []
  )

  const form = useForm<SimpleFormData>({
    resolver: zodResolver(simpleFormSchema),
    defaultValues,
  })

  const { executeAction, isExecuting } = useFormAction()

  const onSubmit = useCallback(
    async (data: SimpleFormData) => {
      await executeAction(async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Form submitted:', data)
        return { success: true, message: '성공적으로 제출되었습니다!' }
      })
    },
    [executeAction]
  )

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
})
