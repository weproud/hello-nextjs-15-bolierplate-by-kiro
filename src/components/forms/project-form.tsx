'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useFormWithValidation } from '@/hooks/use-form'
import { useFormAction } from '@/hooks/use-form-action'
import {
  EnhancedForm,
  EnhancedFormField,
  FormSection,
  FormValidationStatus,
} from './enhanced-form'
import { projectSchema, type ProjectInput } from '@/lib/validations/common'
import { createProject } from '@/lib/actions/form-actions'
import { toast } from 'sonner'

export function ProjectForm() {
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false)

  const form = useFormWithValidation(projectSchema, {
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const handleSubmit = async (data: ProjectInput) => {
    console.log('Project form submitted:', data)
    toast.success('프로젝트가 성공적으로 생성되었습니다!')
  }

  const handleAutoSave = async (data: ProjectInput) => {
    console.log('Auto-saving project:', data)
    // Simulate auto-save delay
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">새 프로젝트 생성</h1>
        <p className="text-muted-foreground">
          프로젝트 정보를 입력하여 새로운 프로젝트를 생성하세요
        </p>
      </div>

      {/* Form Controls */}
      <div className="flex gap-4 p-4 bg-muted/50 rounded-lg mb-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={autoSaveEnabled}
            onChange={e => setAutoSaveEnabled(e.target.checked)}
          />
          <span className="text-sm">자동 저장 활성화</span>
        </label>
      </div>

      {/* Form Validation Status */}
      <FormValidationStatus form={form} showProgress={true} />

      <EnhancedForm
        form={form}
        onSubmit={handleSubmit}
        serverAction={createProject}
        className="space-y-6"
        submitText="프로젝트 생성"
        showToast={true}
        successMessage="프로젝트가 성공적으로 생성되었습니다!"
        errorMessage="프로젝트 생성 중 오류가 발생했습니다."
        autoSave={autoSaveEnabled}
        onAutoSave={handleAutoSave}
        showSummaryErrors={true}
        resetOnSuccess={true}
      >
        <FormSection
          title="프로젝트 기본 정보"
          description="프로젝트의 기본 정보를 입력해주세요"
        >
          <EnhancedFormField
            form={form}
            name="title"
            label="프로젝트 제목"
            required
            validateOnBlur={true}
            validateOnChange={false}
            description="프로젝트를 식별할 수 있는 명확한 제목을 입력해주세요"
          >
            {field => (
              <Input placeholder="예: 새로운 웹사이트 개발" {...field} />
            )}
          </EnhancedFormField>

          <EnhancedFormField
            form={form}
            name="description"
            label="프로젝트 설명"
            validateOnBlur={true}
            description="프로젝트에 대한 상세한 설명을 입력해주세요 (선택사항)"
          >
            {field => (
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="프로젝트의 목표, 범위, 주요 기능 등을 설명해주세요..."
                {...field}
              />
            )}
          </EnhancedFormField>
        </FormSection>

        {/* Project Preview */}
        {form.watch('title') && (
          <FormSection
            title="프로젝트 미리보기"
            description="입력한 정보로 생성될 프로젝트의 미리보기입니다"
            collapsible={true}
            defaultExpanded={false}
          >
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">
                {form.watch('title')}
              </h3>
              {form.watch('description') && (
                <p className="text-muted-foreground text-sm">
                  {form.watch('description')}
                </p>
              )}
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span>생성일: {new Date().toLocaleDateString('ko-KR')}</span>
                <span>상태: 준비 중</span>
                <span>진행률: 0%</span>
              </div>
            </div>
          </FormSection>
        )}
      </EnhancedForm>

      {/* Form Debug Information */}
      <details className="mt-8 p-4 bg-muted/30 rounded-lg">
        <summary className="cursor-pointer font-medium mb-2">
          디버그 정보 (개발용)
        </summary>
        <div className="space-y-2 text-sm">
          <div>
            <strong>현재 값:</strong>
            <pre className="mt-1 p-2 bg-background rounded text-xs overflow-auto">
              {JSON.stringify(form.watch(), null, 2)}
            </pre>
          </div>
          <div>
            <strong>폼 상태:</strong>
            <pre className="mt-1 p-2 bg-background rounded text-xs overflow-auto">
              {JSON.stringify(
                {
                  isValid: form.formState.isValid,
                  isDirty: form.formState.isDirty,
                  isSubmitting: form.formState.isSubmitting,
                  touchedFields: form.formState.touchedFields,
                  errors: form.formState.errors,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </details>
    </div>
  )
}
