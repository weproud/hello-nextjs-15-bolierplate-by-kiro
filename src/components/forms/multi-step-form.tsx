'use client'

import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { useFormWithValidation } from '@/hooks/use-form'
import {
  personalInfoSchema,
  professionalInfoSchema,
  type PersonalInfoInput,
  type ProfessionalInfoInput,
} from '@/lib/validations/common'

interface MultiStepFormProps {
  onSubmit: (
    data: PersonalInfoInput & ProfessionalInfoInput
  ) => void | Promise<void>
  isLoading?: boolean
}

export function MultiStepForm({
  onSubmit,
  isLoading = false,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [personalData, setPersonalData] = useState<PersonalInfoInput | null>(
    null
  )

  const personalForm = useFormWithValidation(personalInfoSchema, {
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: new Date(),
      gender: 'male' as const,
    },
  })

  const professionalForm = useFormWithValidation(professionalInfoSchema, {
    defaultValues: {
      jobTitle: '',
      company: '',
      experience: 0,
      skills: [],
    },
  })

  const handlePersonalSubmit = async (data: PersonalInfoInput) => {
    setPersonalData(data)
    setCurrentStep(2)
  }

  const handleProfessionalSubmit = async (data: ProfessionalInfoInput) => {
    if (personalData) {
      await onSubmit({ ...personalData, ...data })
    }
  }

  const goBack = () => {
    setCurrentStep(1)
  }

  const steps = [
    {
      number: 1,
      title: '개인 정보',
      description: '기본 개인 정보를 입력해주세요',
    },
    {
      number: 2,
      title: '직업 정보',
      description: '직업 관련 정보를 입력해주세요',
    },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.number
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-muted-foreground text-muted-foreground'
                }`}
              >
                {step.number}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Personal Information */}
      {currentStep === 1 && (
        <Form {...personalForm}>
          <form
            onSubmit={personalForm.handleSubmit(handlePersonalSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={personalForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input placeholder="홍길동" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={personalForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>성</FormLabel>
                    <FormControl>
                      <Input placeholder="홍" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={personalForm.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>생년월일</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value
                          ? field.value.toISOString().split('T')[0]
                          : ''
                      }
                      onChange={e => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={personalForm.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>성별</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="male">남성</option>
                      <option value="female">여성</option>
                      <option value="other">기타</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              다음 단계
            </Button>
          </form>
        </Form>
      )}

      {/* Step 2: Professional Information */}
      {currentStep === 2 && (
        <Form {...professionalForm}>
          <form
            onSubmit={professionalForm.handleSubmit(handleProfessionalSubmit)}
            className="space-y-6"
          >
            <FormField
              control={professionalForm.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>직책</FormLabel>
                  <FormControl>
                    <Input placeholder="소프트웨어 엔지니어" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={professionalForm.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>회사명</FormLabel>
                  <FormControl>
                    <Input placeholder="테크 컴퍼니" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={professionalForm.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>경력 (년)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="5"
                      {...field}
                      onChange={e =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    총 경력 년수를 입력해주세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={professionalForm.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>기술 스택</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="React, TypeScript, Node.js (쉼표로 구분)"
                      value={field.value.join(', ')}
                      onChange={e =>
                        field.onChange(
                          e.target.value
                            .split(',')
                            .map(skill => skill.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    보유 기술을 쉼표로 구분하여 입력해주세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                className="flex-1"
              >
                이전 단계
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? '제출 중...' : '제출하기'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}
