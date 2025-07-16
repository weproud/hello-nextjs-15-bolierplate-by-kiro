'use client'

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
import { useForm } from '@/hooks/use-form'
import { contactSchema, type ContactInput } from '@/lib/validations/common'

interface ContactFormProps {
  onSubmit: (data: ContactInput) => void | Promise<void>
  isLoading?: boolean
}

export function ContactForm({ onSubmit, isLoading = false }: ContactFormProps) {
  const form = useForm(contactSchema, {
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  })

  const handleSubmit = async (data: ContactInput) => {
    try {
      await onSubmit(data)
      form.reset()
    } catch (error) {
      console.error('Contact form submission error:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
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
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
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
        </div>

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input placeholder="문의 제목을 입력해주세요" {...field} />
              </FormControl>
              <FormDescription>
                문의하실 내용의 제목을 입력해주세요.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>메시지</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="문의하실 내용을 자세히 입력해주세요"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                문의하실 내용을 자세히 작성해주세요. (10-1000자)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? '전송 중...' : '문의하기'}
        </Button>
      </form>
    </Form>
  )
}
