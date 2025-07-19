'use client'

import React, { useState, memo, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
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
import { useFormAction } from '@/hooks/use-form-action'
import { publicActionClient } from '@/lib/safe-action'
import {
  comprehensiveFormSchema,
  type ComprehensiveFormInput,
} from '@/lib/validations/component-schemas'

type ComprehensiveFormData = ComprehensiveFormInput

// Create a comprehensive server action
const submitComprehensiveForm = publicActionClient
  .schema(comprehensiveFormSchema)
  .action(async ({ parsedInput }) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simulate random errors for demonstration
    if (Math.random() < 0.3) {
      throw new Error('서버에서 처리 중 오류가 발생했습니다.')
    }

    // Return success result
    return {
      id: Math.random().toString(36).substring(2, 11),
      ...parsedInput,
      createdAt: new Date(),
      status: 'active',
    }
  })

export const ComprehensiveFormExample = memo(
  function ComprehensiveFormExample() {
    const [showAdvanced, setShowAdvanced] = useState(false)

    const defaultValues = useMemo(
      () => ({
        name: '',
        email: '',
        age: 18,
        phone: '',
        website: '',
        newsletter: false,
        role: 'student' as const,
        company: '',
        studentId: '',
      }),
      []
    )

    const form = useForm<ComprehensiveFormData>({
      resolver: zodResolver(comprehensiveFormSchema),
      defaultValues,
    })

    const formActionConfig = useMemo(
      () => ({
        form,
        showToast: true,
        successMessage: '폼이 성공적으로 제출되었습니다!',
        errorMessage: '폼 제출 중 오류가 발생했습니다.',
        onSuccess: (data: any) => {
          console.log('Form submitted successfully:', data)
          form.reset()
        },
        onError: (error: any) => {
          console.error('Form submission error:', error)
        },
      }),
      [form]
    )

    const formAction = useFormAction(submitComprehensiveForm, formActionConfig)

    const watchedRole = form.watch('role')

    const onSubmit = useCallback(
      (data: ComprehensiveFormData) => {
        console.log('Submitting form data:', data)
        formAction.execute(data)
      },
      [formAction]
    )

    const toggleAdvanced = useCallback(() => {
      setShowAdvanced(prev => !prev)
    }, [])

    const resetForm = useCallback(() => {
      form.reset()
    }, [form])

    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">종합 폼 예제</h1>
          <p className="text-muted-foreground">
            next-safe-action의 모든 기능을 보여주는 종합적인 폼 예제입니다.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h2 className="text-lg font-semibold">기본 정보</h2>

              <FormField
                control={form.control}
                name="name"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>이름 *</FormLabel>
                    <FormControl>
                      <Input placeholder="홍길동" {...field} />
                    </FormControl>
                    <FormDescription>실명을 입력해주세요.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>이메일 *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="hong@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>나이 *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="18"
                        max="100"
                        {...field}
                        onChange={e =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      18세 이상 100세 이하만 가입 가능합니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h2 className="text-lg font-semibold">역할 선택</h2>

              <FormField
                control={form.control}
                name="role"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>역할 *</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="student">학생</option>
                        <option value="professional">직장인</option>
                        <option value="freelancer">프리랜서</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional fields based on role */}
              {watchedRole === 'professional' && (
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>회사명 *</FormLabel>
                      <FormControl>
                        <Input placeholder="회사명을 입력하세요" {...field} />
                      </FormControl>
                      <FormDescription>
                        직장인으로 선택하신 경우 회사명이 필요합니다.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {watchedRole === 'student' && (
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>학번 *</FormLabel>
                      <FormControl>
                        <Input placeholder="학번을 입력하세요" {...field} />
                      </FormControl>
                      <FormDescription>
                        학생으로 선택하신 경우 학번이 필요합니다.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Advanced Options */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">추가 옵션</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleAdvanced}
                >
                  {showAdvanced ? '숨기기' : '더 보기'}
                </Button>
              </div>

              {showAdvanced && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>전화번호</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="010-1234-5678"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>선택사항입니다.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>웹사이트</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          개인 웹사이트나 포트폴리오 URL (선택사항)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newsletter"
                    render={({ field }: { field: any }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>뉴스레터 구독</FormLabel>
                          <FormDescription>
                            최신 소식과 업데이트를 이메일로 받아보세요.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={formAction.isPending}
              >
                초기화
              </Button>
              <Button
                type="submit"
                disabled={formAction.isPending || !form.formState.isValid}
                className="flex-1"
              >
                {formAction.isPending ? '제출 중...' : '폼 제출'}
              </Button>
            </div>

            {/* Action Status */}
            {formAction.result && (
              <div className="mt-4">
                {formAction.isSuccess ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex">
                      <div className="text-green-600">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          성공적으로 제출되었습니다!
                        </h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>폼 데이터가 성공적으로 처리되었습니다.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                      <div className="text-red-600">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          오류가 발생했습니다
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>
                            {formAction.result.error ||
                              '알 수 없는 오류가 발생했습니다.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </Form>

        {/* Debug Information */}
        <details className="mt-8 p-4 bg-muted/30 rounded-lg">
          <summary className="cursor-pointer font-medium mb-2">
            개발자 정보 (디버그)
          </summary>
          <div className="space-y-4 text-sm">
            <div>
              <strong>현재 폼 값:</strong>
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
                    errors: form.formState.errors,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
            <div>
              <strong>액션 상태:</strong>
              <pre className="mt-1 p-2 bg-background rounded text-xs overflow-auto">
                {JSON.stringify(
                  {
                    isPending: formAction.isPending,
                    isSuccess: formAction.isSuccess,
                    isError: formAction.isError,
                    result: formAction.result,
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
)
