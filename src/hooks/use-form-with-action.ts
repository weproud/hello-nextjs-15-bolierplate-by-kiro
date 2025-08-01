import { useState, useTransition } from 'react'
import {
  useForm,
  type UseFormProps,
  type UseFormReturn,
  type FieldValues,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type z } from 'zod'
import { toast } from 'sonner'
import { useAction } from 'next-safe-action/hooks'
import type { HookSafeActionFn } from 'next-safe-action/hooks'

// 통합 폼 액션 결과 타입
export interface FormActionResult<T = unknown> {
  success?: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[]>
  serverError?: string
  validationErrors?: Record<string, string[]>
}

// 통합 폼 훅 옵션
export interface UseFormWithActionOptions<
  TSchema extends z.ZodType<any, any, any>,
  TFormData extends FieldValues = z.input<TSchema>,
  TResult = unknown,
> {
  // React Hook Form 옵션
  formOptions?: Omit<UseFormProps<TFormData>, 'resolver'>

  // 액션 처리 옵션
  showToast?: boolean
  successMessage?: string
  errorMessage?: string

  // 콜백 함수
  onSuccess?: (data?: TResult, formData?: TFormData) => void
  onError?: (error: string, formData?: TFormData) => void
  onSubmitStart?: (formData: TFormData) => void
  onSubmitEnd?: (formData: TFormData) => void

  // 폼 리셋 옵션
  resetOnSuccess?: boolean
  resetOnError?: boolean

  // 에러 처리 옵션
  clearErrorsOnSubmit?: boolean
  setFieldErrorsFromServer?: boolean
}

/**
 * React Hook Form + Zod + next-safe-action 통합 훅
 *
 * @param schema - Zod 스키마
 * @param action - next-safe-action 액션
 * @param options - 폼 및 액션 처리 옵션
 */
export function useFormWithAction<
  TSchema extends z.ZodType<any, any, any>,
  TFormData extends FieldValues = z.input<TSchema>,
  TResult = unknown,
>(
  schema: TSchema,
  action: HookSafeActionFn<any, TSchema, any>,
  options: UseFormWithActionOptions<TSchema, TFormData, TResult> = {}
) {
  const {
    formOptions = {},
    showToast = true,
    successMessage = '성공적으로 처리되었습니다.',
    errorMessage = '처리 중 오류가 발생했습니다.',
    onSuccess,
    onError,
    onSubmitStart,
    onSubmitEnd,
    resetOnSuccess = false,
    resetOnError = false,
    clearErrorsOnSubmit = true,
    setFieldErrorsFromServer = true,
  } = options

  // React Hook Form 초기화
  const form = useForm<TFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    ...formOptions,
  })

  // next-safe-action 훅 사용
  const { execute, result, isExecuting, reset: resetAction } = useAction(action)

  // 추가 상태 관리
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSubmittedData, setLastSubmittedData] = useState<TFormData | null>(
    null
  )

  // 폼 제출 핸들러
  const handleSubmit = form.handleSubmit(async (data: TFormData) => {
    try {
      setIsSubmitting(true)
      setLastSubmittedData(data)

      // 제출 시작 콜백
      onSubmitStart?.(data)

      // 에러 클리어 (옵션에 따라)
      if (clearErrorsOnSubmit) {
        form.clearErrors()
      }

      // 액션 실행
      await execute(data as z.input<TSchema>)
    } catch (error) {
      console.error('Form submission error:', error)

      const message = error instanceof Error ? error.message : errorMessage

      if (showToast) {
        toast.error(message)
      }

      onError?.(message, data)

      if (resetOnError) {
        form.reset()
      }
    } finally {
      setIsSubmitting(false)
      onSubmitEnd?.(data)
    }
  })

  // 결과 처리 (next-safe-action 결과 모니터링)
  useState(() => {
    if (!result) return

    const { data, serverError, validationErrors } = result

    if (serverError) {
      // 서버 에러 처리
      if (showToast) {
        toast.error(serverError)
      }
      onError?.(serverError, lastSubmittedData || undefined)

      if (resetOnError) {
        form.reset()
      }
    } else if (validationErrors) {
      // 유효성 검사 에러 처리
      if (setFieldErrorsFromServer) {
        Object.entries(validationErrors).forEach(([field, errors]) => {
          if (Array.isArray(errors) && errors.length > 0) {
            form.setError(field as keyof TFormData, {
              type: 'server',
              message: errors[0],
            })
          }
        })
      }

      const message = '입력 정보를 확인해주세요.'
      if (showToast) {
        toast.error(message)
      }
      onError?.(message, lastSubmittedData || undefined)
    } else if (data !== undefined) {
      // 성공 처리
      if (showToast) {
        toast.success(successMessage)
      }
      onSuccess?.(data as TResult, lastSubmittedData || undefined)

      if (resetOnSuccess) {
        form.reset()
      }
    }
  })

  // 폼 리셋 (액션 결과도 함께 리셋)
  const resetForm = () => {
    form.reset()
    resetAction()
    setLastSubmittedData(null)
  }

  // 에러 상태 계산
  const hasErrors = !!(
    Object.keys(form.formState.errors).length > 0 ||
    result?.serverError ||
    result?.validationErrors
  )

  // 성공 상태 계산
  const isSuccess = !!(
    result?.data !== undefined &&
    !result?.serverError &&
    !result?.validationErrors
  )

  // 로딩 상태 계산
  const isLoading = isExecuting || isSubmitting

  return {
    // React Hook Form 인스턴스
    form,

    // 폼 제출 핸들러
    handleSubmit,

    // 상태
    isLoading,
    isSubmitting: isLoading,
    isSuccess,
    hasErrors,

    // 결과 데이터
    result: result?.data as TResult | undefined,
    error:
      result?.serverError || (hasErrors ? '폼에 오류가 있습니다.' : undefined),
    fieldErrors: result?.validationErrors,

    // 유틸리티 함수
    reset: resetForm,
    resetAction,

    // 마지막 제출 데이터
    lastSubmittedData,

    // 원본 next-safe-action 결과 (필요시 접근)
    actionResult: result,
  }
}

/**
 * 다중 단계 폼을 위한 확장된 useFormWithAction
 */
export function useMultiStepFormWithAction<
  TSchema extends z.ZodType<any, any, any>,
  TFormData extends FieldValues = z.input<TSchema>,
  TResult = unknown,
>(
  schema: TSchema,
  action: HookSafeActionFn<any, TSchema, any>,
  steps: Array<{
    name: string
    fields: Array<keyof TFormData>
    schema?: z.ZodType<any, any, any>
  }>,
  options: UseFormWithActionOptions<TSchema, TFormData, TResult> = {}
) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const baseForm = useFormWithAction(schema, action, {
    ...options,
    // 다중 단계에서는 자동 제출 방지
    onSubmitStart: data => {
      options.onSubmitStart?.(data)
    },
  })

  // 현재 단계 유효성 검사
  const validateCurrentStep = async () => {
    const currentStepConfig = steps[currentStep]
    if (!currentStepConfig) return false

    const isValid = await baseForm.form.trigger(currentStepConfig.fields as any)

    if (isValid) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
    }

    return isValid
  }

  // 다음 단계로 이동
  const nextStep = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
    return isValid
  }

  // 이전 단계로 이동
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  // 특정 단계로 이동
  const goToStep = async (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      // 현재 단계까지의 모든 단계 유효성 검사
      for (let i = 0; i <= Math.min(currentStep, stepIndex - 1); i++) {
        const stepConfig = steps[i]
        const isValid = await baseForm.form.trigger(stepConfig.fields as any)
        if (!isValid) {
          return false
        }
        setCompletedSteps(prev => new Set([...prev, i]))
      }
      setCurrentStep(stepIndex)
      return true
    }
    return false
  }

  // 최종 제출 (마지막 단계에서만)
  const submitForm = async () => {
    if (currentStep === steps.length - 1) {
      const isValid = await validateCurrentStep()
      if (isValid) {
        return baseForm.handleSubmit()
      }
    }
    return Promise.resolve()
  }

  // 현재 단계 정보
  const currentStepConfig = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const canGoNext = completedSteps.has(currentStep)
  const progress = ((currentStep + 1) / steps.length) * 100

  return {
    ...baseForm,

    // 단계 관리
    currentStep,
    currentStepConfig,
    steps,
    completedSteps: Array.from(completedSteps),

    // 단계 상태
    isFirstStep,
    isLastStep,
    canGoNext,
    progress,

    // 단계 제어
    nextStep,
    prevStep,
    goToStep,
    validateCurrentStep,

    // 최종 제출
    submitForm,

    // 다중 단계 전용 제출 핸들러
    handleSubmit: isLastStep ? baseForm.handleSubmit : nextStep,
  }
}

// 타입 내보내기
export type FormWithActionHook<
  TSchema extends z.ZodType<any, any, any>,
  TFormData extends FieldValues = z.input<TSchema>,
  TResult = unknown,
> = ReturnType<typeof useFormWithAction<TSchema, TFormData, TResult>>

export type MultiStepFormWithActionHook<
  TSchema extends z.ZodType<any, any, any>,
  TFormData extends FieldValues = z.input<TSchema>,
  TResult = unknown,
> = ReturnType<typeof useMultiStepFormWithAction<TSchema, TFormData, TResult>>
