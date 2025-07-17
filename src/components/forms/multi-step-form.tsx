'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useProgressiveForm } from '@/hooks/use-form'
import {
  EnhancedForm,
  EnhancedFormField,
  FormSection,
  FormValidationStatus,
} from './enhanced-form'
import {
  multiStepFormSchema,
  type MultiStepFormInput,
  step1Schema,
  step2Schema,
  step3Schema,
} from '@/lib/validations/common'
import { submitMultiStepForm } from '@/lib/actions/form-actions'

const STEPS = [
  { id: 1, title: '기본 정보', description: '개인 정보를 입력해주세요' },
  {
    id: 2,
    title: '선호 설정',
    description: '관심사와 알림 설정을 선택해주세요',
  },
  {
    id: 3,
    title: '약관 동의',
    description: '이용약관에 동의하고 인증을 완료해주세요',
  },
]

export function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const form = useProgressiveForm(multiStepFormSchema, {
    defaultValues: {
      basicInfo: {
        name: '',
        email: '',
        phone: '',
      },
      preferences: {
        interests: [],
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        language: 'ko' as const,
      },
      verification: {
        terms: false,
        privacy: false,
        marketing: false,
        verificationCode: '',
      },
    },
  })

  const handleNext = async () => {
    let fieldsToValidate: string[] = []

    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          'basicInfo.name',
          'basicInfo.email',
          'basicInfo.phone',
        ]
        break
      case 2:
        fieldsToValidate = ['preferences.interests', 'preferences.language']
        break
      case 3:
        fieldsToValidate = [
          'verification.terms',
          'verification.privacy',
          'verification.verificationCode',
        ]
        break
    }

    const isValid = await form.validateStep(fieldsToValidate as any)

    if (isValid) {
      setCompletedSteps(prev => [...prev, currentStep])
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (data: MultiStepFormInput) => {
    console.log('Multi-step form submitted:', data)
  }

  const isStepCompleted = (step: number) => completedSteps.includes(step)
  const isCurrentStep = (step: number) => currentStep === step

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">회원가입</h1>
        <p className="text-muted-foreground">
          단계별로 정보를 입력하여 회원가입을 완료해주세요
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isStepCompleted(step.id)
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrentStep(step.id)
                      ? 'bg-primary border-primary text-white'
                      : 'bg-background border-muted-foreground text-muted-foreground'
                }`}
              >
                {isStepCompleted(step.id) ? '✓' : step.id}
              </div>
              <div className="ml-3 text-left">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">
                  {step.description}
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    isStepCompleted(step.id) ? 'bg-green-500' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Validation Status */}
      <FormValidationStatus form={form} showProgress={true} />

      <EnhancedForm
        form={form}
        onSubmit={handleSubmit}
        serverAction={
          currentStep === STEPS.length ? submitMultiStepForm : undefined
        }
        className="space-y-6"
        submitText={
          currentStep === STEPS.length ? '회원가입 완료' : '다음 단계'
        }
        showToast={true}
        successMessage="회원가입이 완료되었습니다!"
        errorMessage="회원가입 중 오류가 발생했습니다."
        showSummaryErrors={false}
      >
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <FormSection
            title="기본 정보"
            description="회원가입을 위한 기본 정보를 입력해주세요"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EnhancedFormField
                form={form}
                name="basicInfo.name"
                label="이름"
                required
                validateOnBlur={true}
              >
                {field => <Input placeholder="홍길동" {...field} />}
              </EnhancedFormField>

              <EnhancedFormField
                form={form}
                name="basicInfo.email"
                label="이메일"
                required
                validateOnBlur={true}
              >
                {field => (
                  <Input
                    type="email"
                    placeholder="hong@example.com"
                    {...field}
                  />
                )}
              </EnhancedFormField>
            </div>

            <EnhancedFormField
              form={form}
              name="basicInfo.phone"
              label="전화번호"
              required
              validateOnBlur={true}
            >
              {field => <Input placeholder="010-1234-5678" {...field} />}
            </EnhancedFormField>
          </FormSection>
        )}

        {/* Step 2: Preferences */}
        {currentStep === 2 && (
          <FormSection
            title="선호 설정"
            description="관심사와 알림 설정을 선택해주세요"
          >
            <EnhancedFormField
              form={form}
              name="preferences.interests"
              label="관심사"
              required
              description="관심 있는 분야를 선택해주세요 (복수 선택 가능)"
            >
              {field => (
                <div className="space-y-2">
                  {['기술', '디자인', '비즈니스', '마케팅', '교육'].map(
                    interest => (
                      <label
                        key={interest}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={field.value?.includes(interest) || false}
                          onChange={e => {
                            const currentInterests = field.value || []
                            if (e.target.checked) {
                              field.onChange([...currentInterests, interest])
                            } else {
                              field.onChange(
                                currentInterests.filter(
                                  (i: string) => i !== interest
                                )
                              )
                            }
                          }}
                        />
                        <span>{interest}</span>
                      </label>
                    )
                  )}
                </div>
              )}
            </EnhancedFormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EnhancedFormField
                form={form}
                name="preferences.language"
                label="언어"
                required
              >
                {field => (
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                  </select>
                )}
              </EnhancedFormField>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">알림 설정</h4>

              <EnhancedFormField
                form={form}
                name="preferences.notifications.email"
                label="이메일 알림"
              >
                {field => (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                    />
                    <span>이메일로 알림 받기</span>
                  </label>
                )}
              </EnhancedFormField>

              <EnhancedFormField
                form={form}
                name="preferences.notifications.sms"
                label="SMS 알림"
              >
                {field => (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                    />
                    <span>SMS로 알림 받기</span>
                  </label>
                )}
              </EnhancedFormField>

              <EnhancedFormField
                form={form}
                name="preferences.notifications.push"
                label="푸시 알림"
              >
                {field => (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                    />
                    <span>푸시 알림 받기</span>
                  </label>
                )}
              </EnhancedFormField>
            </div>
          </FormSection>
        )}

        {/* Step 3: Verification */}
        {currentStep === 3 && (
          <FormSection
            title="약관 동의 및 인증"
            description="이용약관에 동의하고 인증을 완료해주세요"
          >
            <div className="space-y-4">
              <EnhancedFormField
                form={form}
                name="verification.terms"
                label="이용약관 동의"
                required
              >
                {field => (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                    />
                    <span>이용약관에 동의합니다 (필수)</span>
                  </label>
                )}
              </EnhancedFormField>

              <EnhancedFormField
                form={form}
                name="verification.privacy"
                label="개인정보처리방침 동의"
                required
              >
                {field => (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                    />
                    <span>개인정보처리방침에 동의합니다 (필수)</span>
                  </label>
                )}
              </EnhancedFormField>

              <EnhancedFormField
                form={form}
                name="verification.marketing"
                label="마케팅 정보 수신 동의"
              >
                {field => (
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={field.value || false}
                      onChange={e => field.onChange(e.target.checked)}
                    />
                    <span>마케팅 정보 수신에 동의합니다 (선택)</span>
                  </label>
                )}
              </EnhancedFormField>
            </div>

            <EnhancedFormField
              form={form}
              name="verification.verificationCode"
              label="인증코드"
              required
              description="이메일로 전송된 6자리 인증코드를 입력해주세요"
            >
              {field => (
                <div className="flex gap-2">
                  <Input placeholder="123456" maxLength={6} {...field} />
                  <Button type="button" variant="outline">
                    인증코드 전송
                  </Button>
                </div>
              )}
            </EnhancedFormField>
          </FormSection>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            이전
          </Button>

          {currentStep < STEPS.length ? (
            <Button type="button" onClick={handleNext}>
              다음
            </Button>
          ) : (
            <Button type="submit">회원가입 완료</Button>
          )}
        </div>
      </EnhancedForm>
    </div>
  )
}
