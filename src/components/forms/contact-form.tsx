'use client'

import {
  EnhancedForm,
  EnhancedFormField,
  FormSection,
} from '@/components/forms/enhanced-form'
import { Input } from '@/components/ui/input'
import { useFormWithValidation } from '@/hooks/use-form'
import { submitContact } from '@/lib/actions/form-actions'
import { contactSchema, type ContactInput } from '@/lib/validations/common'
import { memo, useCallback, useMemo } from 'react'

export const ContactForm = memo(function ContactForm() {
  const defaultValues = useMemo(
    () => ({
      name: '',
      email: '',
      subject: '',
      message: '',
    }),
    []
  )

  const form = useFormWithValidation(contactSchema, {
    defaultValues,
  })

  const handleSubmit = useCallback(async (data: ContactInput) => {
    console.log('Contact form submitted:', data)
    // Handle client-side submission if needed
  }, [])

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold mb-2'>문의하기</h1>
        <p className='text-muted-foreground'>
          궁금한 점이 있으시면 언제든지 문의해주세요.
        </p>
      </div>

      <EnhancedForm
        form={form}
        onSubmit={handleSubmit}
        serverAction={submitContact}
        className='space-y-6'
        submitText='문의 보내기'
        showToast={true}
        successMessage='문의가 성공적으로 전송되었습니다!'
        errorMessage='문의 전송 중 오류가 발생했습니다.'
        showSummaryErrors={true}
      >
        <FormSection
          title='연락처 정보'
          description='연락 가능한 정보를 입력해주세요'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <EnhancedFormField
              form={form}
              name='name'
              label='이름'
              required
              validateOnBlur={true}
            >
              {field => <Input placeholder='홍길동' {...field} />}
            </EnhancedFormField>

            <EnhancedFormField
              form={form}
              name='email'
              label='이메일'
              required
              validateOnBlur={true}
            >
              {field => (
                <Input type='email' placeholder='hong@example.com' {...field} />
              )}
            </EnhancedFormField>
          </div>
        </FormSection>

        <FormSection
          title='문의 내용'
          description='문의하실 내용을 자세히 작성해주세요'
        >
          <EnhancedFormField
            form={form}
            name='subject'
            label='제목'
            required
            validateOnBlur={true}
          >
            {field => (
              <Input placeholder='문의 제목을 입력해주세요' {...field} />
            )}
          </EnhancedFormField>

          <EnhancedFormField
            form={form}
            name='message'
            label='메시지'
            required
            validateOnBlur={true}
            description='최소 10자 이상 입력해주세요'
          >
            {field => (
              <textarea
                className='flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                placeholder='문의하실 내용을 자세히 작성해주세요...'
                {...field}
              />
            )}
          </EnhancedFormField>
        </FormSection>
      </EnhancedForm>
    </div>
  )
})
