'use client'

import * as React from 'react'
import { type z } from 'zod'
import { type FieldValues, type Path } from 'react-hook-form'
import { type HookSafeActionFn } from 'next-safe-action/hooks'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  FormField,
  InputField,
  TextareaField,
  SelectField,
  CheckboxField,
} from '@/components/ui/form-field'
import { FormErrorSummary, FormProgress } from '@/components/ui/form-error'
import {
  useFormWithAction,
  type UseFormWithActionOptions,
} from '@/hooks/use-form-with-action'
import { Loader2 } from 'lucide-react'

// 폼 필드 타입 정의
export interface FormFieldConfig<TFormData extends FieldValues> {
  name: Path<TFormData>
  type: 'input' | 'textarea' | 'select' | 'checkbox' | 'custom'
  label: string
  placeholder?: string
  helperText?: string
  required?: boolean
  options?: Array<{ value: string; label: string }> // select용
  validation?: {
    showIndicator?: boolean
    realTime?: boolean
  }
  props?: Record<string, any> // 추가 props
  render?: (field: any, error?: string) => React.ReactNode // 커스텀 렌더링
}

// 향상된 폼 컴포넌트 Props
export interface EnhancedFormProps<
  TSchema extends z.ZodType<any, any, any>,
  TFormData extends FieldValues = z.input<TSchema>,
  TResult = unknown,
> {
  schema: TSchema
  action: HookSafeActionFn<any, TSchema, any>
  fields: FormFieldConfig<TFormData>[]

  // 폼 옵션
  formOptions?: UseFormWithActionOptions<TSchema, TFormData, TResult>

  // UI 옵션
  title?: string
  description?: string
  submitText?: string
  cancelText?: string
  showProgress?: boolean
  showErrorSummary?: boolean
  layout?: 'vertical' | 'horizontal' | 'grid'
  columns?: number

  // 이벤트 핸들러
  onCancel?: () => void

  // 스타일링
  className?: string
  formClassName?: string
  fieldClassName?: string

  // 추가 컨텐츠
  header?: React.ReactNode
  footer?: React.ReactNode
  beforeSubmit?: React.ReactNode
  afterSubmit?: React.ReactNode
}

/**
 * 향상된 폼 컴포넌트
 * useFormWithAction 훅과 통합되어 완전한 폼 솔루션을 제공합니다.
 */
export function EnhancedForm<
  TSchema extends z.ZodType<any, any, any>,
  TFormData extends FieldValues = z.input<TSchema>,
  TResult = unknown,
>({
  schema,
  action,
  fields,
  formOptions = {},
  title,
  description,
  submitText = '제출',
  cancelText = '취소',
  showProgress = false,
  showErrorSummary = true,
  layout = 'vertical',
  columns = 1,
  onCancel,
  className,
  formClassName,
  fieldClassName,
  header,
  footer,
  beforeSubmit,
  afterSubmit,
}: EnhancedFormProps<TSchema, TFormData, TResult>) {
  // 통합 폼 훅 사용
  const {
    form,
    handleSubmit,
    isLoading,
    isSuccess,
    hasErrors,
    error,
    fieldErrors,
    reset,
  } = useFormWithAction(schema, action, formOptions)

  // 진행률 계산
  const totalFields = fields.length
  const validFields = fields.filter(
    field => !form.formState.errors[field.name]
  ).length

  // 레이아웃 스타일
  const layoutStyles = {
    vertical: 'space-y-4',
    horizontal: 'space-y-4', // 수평 레이아웃은 필드별로 처리
    grid: `grid gap-4 ${columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : 'grid-cols-1'}`,
  }

  // 필드 렌더링
  const renderField = (fieldConfig: FormFieldConfig<TFormData>) => {
    const {
      name,
      type,
      label,
      placeholder,
      helperText,
      required,
      options,
      validation,
      props,
      render,
    } = fieldConfig
    const fieldError = form.formState.errors[name]
    const fieldValue = form.watch(name)

    // 실시간 유효성 검사 상태
    const isValidating = validation?.realTime && form.formState.isValidating
    const isValid = !fieldError && fieldValue !== undefined && fieldValue !== ''

    const commonProps = {
      label,
      error: fieldError,
      helperText,
      required,
      showValidationIndicator: validation?.showIndicator,
      isValidating,
      isValid,
      className: fieldClassName,
    }

    // 커스텀 렌더링
    if (render) {
      return (
        <div key={name} className={fieldClassName}>
          {render(form.register(name), fieldError?.message)}
        </div>
      )
    }

    // 타입별 필드 렌더링
    switch (type) {
      case 'input':
        return (
          <InputField
            key={name}
            {...commonProps}
            inputProps={{
              placeholder,
              ...form.register(name),
              ...props,
            }}
          />
        )

      case 'textarea':
        return (
          <TextareaField
            key={name}
            {...commonProps}
            textareaProps={{
              placeholder,
              ...form.register(name),
              ...props,
            }}
          />
        )

      case 'select':
        return (
          <SelectField
            key={name}
            {...commonProps}
            placeholder={placeholder}
            options={options}
            selectProps={{
              ...form.register(name),
              ...props,
            }}
          />
        )

      case 'checkbox':
        return (
          <CheckboxField
            key={name}
            {...commonProps}
            label={label}
            description={helperText}
            checkboxProps={{
              ...form.register(name),
              ...props,
            }}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className={cn('w-full', className)}>
      {/* 헤더 */}
      {(header || title || description) && (
        <div className="mb-6">
          {header}
          {title && (
            <h2 className="text-2xl font-bold tracking-tight mb-2">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* 진행률 표시 */}
      {showProgress && (
        <div className="mb-6">
          <FormProgress
            totalFields={totalFields}
            validFields={validFields}
            showPercentage={true}
            showText={true}
          />
        </div>
      )}

      {/* 에러 요약 */}
      {showErrorSummary && fieldErrors && (
        <div className="mb-6">
          <FormErrorSummary
            errors={fieldErrors}
            title="다음 오류를 수정해주세요:"
            showFieldNames={true}
            maxErrors={5}
          />
        </div>
      )}

      {/* 폼 */}
      <form onSubmit={handleSubmit} className={cn(formClassName)}>
        {/* 필드들 */}
        <div className={layoutStyles[layout]}>{fields.map(renderField)}</div>

        {/* 제출 전 컨텐츠 */}
        {beforeSubmit}

        {/* 버튼 영역 */}
        <div className="flex gap-3 pt-6">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              submitText
            )}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          )}
        </div>

        {/* 제출 후 컨텐츠 */}
        {afterSubmit}
      </form>

      {/* 푸터 */}
      {footer}

      {/* 성공/에러 상태 표시 */}
      {isSuccess && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm">성공적으로 처리되었습니다!</p>
        </div>
      )}

      {error && !fieldErrors && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

// 사전 정의된 폼 템플릿들
export const FormTemplates = {
  // 기본 연락처 폼
  contact: <T extends z.ZodType>(
    schema: T,
    action: HookSafeActionFn<any, T, any>
  ) => ({
    schema,
    action,
    fields: [
      {
        name: 'name' as any,
        type: 'input' as const,
        label: '이름',
        required: true,
      },
      {
        name: 'email' as any,
        type: 'input' as const,
        label: '이메일',
        required: true,
      },
      {
        name: 'message' as any,
        type: 'textarea' as const,
        label: '메시지',
        required: true,
      },
    ],
    title: '연락하기',
    submitText: '메시지 보내기',
  }),

  // 기본 로그인 폼
  login: <T extends z.ZodType>(
    schema: T,
    action: HookSafeActionFn<any, T, any>
  ) => ({
    schema,
    action,
    fields: [
      {
        name: 'email' as any,
        type: 'input' as const,
        label: '이메일',
        required: true,
      },
      {
        name: 'password' as any,
        type: 'input' as const,
        label: '비밀번호',
        required: true,
        props: { type: 'password' },
      },
      {
        name: 'remember' as any,
        type: 'checkbox' as const,
        label: '로그인 상태 유지',
      },
    ],
    title: '로그인',
    submitText: '로그인',
  }),

  // 기본 회원가입 폼
  register: <T extends z.ZodType>(
    schema: T,
    action: HookSafeActionFn<any, T, any>
  ) => ({
    schema,
    action,
    fields: [
      {
        name: 'name' as any,
        type: 'input' as const,
        label: '이름',
        required: true,
      },
      {
        name: 'email' as any,
        type: 'input' as const,
        label: '이메일',
        required: true,
      },
      {
        name: 'password' as any,
        type: 'input' as const,
        label: '비밀번호',
        required: true,
        props: { type: 'password' },
      },
      {
        name: 'confirmPassword' as any,
        type: 'input' as const,
        label: '비밀번호 확인',
        required: true,
        props: { type: 'password' },
      },
      {
        name: 'terms' as any,
        type: 'checkbox' as const,
        label: '이용약관에 동의합니다',
        required: true,
      },
    ],
    title: '회원가입',
    submitText: '가입하기',
    showProgress: true,
  }),
}

// 타입 내보내기
export type EnhancedFormComponent<
  TSchema extends z.ZodType<any, any, any>,
  TFormData extends FieldValues = z.input<TSchema>,
  TResult = unknown,
> = React.ComponentType<EnhancedFormProps<TSchema, TFormData, TResult>>
