'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useFormWithValidation } from '@/hooks/use-form'
import { EnhancedForm, EnhancedFormField } from './enhanced-form'
import { projectSchema, type ProjectInput } from '@/lib/validations/common'
import { createProject } from '@/lib/actions/form-actions'

export function SimpleFormExample() {
  const form = useFormWithValidation(projectSchema, {
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const handleSubmit = async (data: ProjectInput) => {
    console.log('Project form submitted:', data)
    // Handle client-side submission if needed
  }

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">프로젝트 생성</h2>
        <p className="text-sm text-muted-foreground">
          새로운 프로젝트를 생성해보세요
        </p>
      </div>

      <EnhancedForm
        form={form}
        onSubmit={handleSubmit}
        serverAction={createProject}
        className="space-y-4"
        submitText="프로젝트 생성"
        showToast={true}
        successMessage="프로젝트가 성공적으로 생성되었습니다!"
        errorMessage="프로젝트 생성 중 오류가 발생했습니다."
      >
        <EnhancedFormField
          form={form}
          name="title"
          label="프로젝트 제목"
          required
          validateOnBlur={true}
        >
          {field => <Input placeholder="멋진 프로젝트" {...field} />}
        </EnhancedFormField>

        <EnhancedFormField
          form={form}
          name="description"
          label="프로젝트 설명"
          description="프로젝트에 대한 간단한 설명을 입력해주세요 (선택사항)"
        >
          {field => (
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="이 프로젝트는..."
              {...field}
            />
          )}
        </EnhancedFormField>
      </EnhancedForm>
    </div>
  )
}
