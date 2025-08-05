'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { contactSchema, type ContactInput } from '@/lib/validations/common'
import { submitContact } from '@/lib/actions/form-actions'
import { useFormAction } from '@/hooks/use-form-action'

export function ContactFormSafeAction() {
  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  })

  const formAction = useFormAction(submitContact, {
    form,
    showToast: true,
    successMessage: '문의가 성공적으로 전송되었습니다!',
    errorMessage: '문의 전송 중 오류가 발생했습니다.',
    onSuccess: () => {
      form.reset()
    },
  })

  const onSubmit = (data: ContactInput) => {
    formAction.execute(data)
  }

  return (
    <div className='max-w-md mx-auto p-6'>
      <div className='text-center mb-6'>
        <h1 className='text-2xl font-bold mb-2'>문의하기</h1>
        <p className='text-muted-foreground'>
          next-safe-action을 사용한 폼 예제
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름</FormLabel>
                <FormControl>
                  <Input placeholder='홍길동' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='hong@example.com'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='subject'
            render={({ field }) => (
              <FormItem>
                <FormLabel>제목</FormLabel>
                <FormControl>
                  <Input placeholder='문의 제목을 입력하세요' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='message'
            render={({ field }) => (
              <FormItem>
                <FormLabel>메시지</FormLabel>
                <FormControl>
                  <textarea
                    className='flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                    placeholder='문의 내용을 입력하세요...'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => form.reset()}
              disabled={formAction.isPending}
            >
              초기화
            </Button>
            <Button
              type='submit'
              disabled={formAction.isPending}
              className='flex-1'
            >
              {formAction.isPending ? '전송 중...' : '문의 전송'}
            </Button>
          </div>

          {/* Action Status */}
          {formAction.result && (
            <div className='mt-4 p-3 rounded-md text-sm'>
              {formAction.isSuccess ? (
                <div className='text-green-600 bg-green-50 p-3 rounded-md'>
                  ✅ 문의가 성공적으로 전송되었습니다!
                </div>
              ) : (
                <div className='text-red-600 bg-red-50 p-3 rounded-md'>
                  ❌ {formAction.result.error || '오류가 발생했습니다.'}
                </div>
              )}
            </div>
          )}
        </form>
      </Form>

      {/* Debug Info */}
      <details className='mt-6 p-3 bg-muted/30 rounded-md'>
        <summary className='cursor-pointer text-sm font-medium'>
          디버그 정보
        </summary>
        <div className='mt-2 space-y-2 text-xs'>
          <div>
            <strong>Form State:</strong>
            <pre className='mt-1 p-2 bg-background rounded overflow-auto'>
              {JSON.stringify(
                {
                  isValid: form.formState.isValid,
                  isDirty: form.formState.isDirty,
                  isSubmitting: form.formState.isSubmitting,
                },
                null,
                2
              )}
            </pre>
          </div>
          <div>
            <strong>Action State:</strong>
            <pre className='mt-1 p-2 bg-background rounded overflow-auto'>
              {JSON.stringify(
                {
                  isPending: formAction.isPending,
                  isSuccess: formAction.isSuccess,
                  isError: formAction.isError,
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
