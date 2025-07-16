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
import { useFormAction } from '@/hooks/use-form-action'
import { createProject } from '@/lib/actions/form-actions'
import { projectSchema, type ProjectInput } from '@/lib/validations/common'

interface ProjectFormProps {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  defaultValues?: Partial<ProjectInput>
}

export function ProjectForm({
  onSuccess,
  onError,
  defaultValues,
}: ProjectFormProps) {
  const form = useForm(projectSchema, {
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
    },
  })

  const { execute, isPending } = useFormAction(createProject, {
    form,
    onSuccess: data => {
      form.reset()
      onSuccess?.(data)
    },
    onError,
  })

  const handleSubmit = (data: ProjectInput) => {
    const formData = new FormData()
    formData.append('title', data.title)
    if (data.description) {
      formData.append('description', data.description)
    }
    execute(formData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>프로젝트 제목</FormLabel>
              <FormControl>
                <Input placeholder="프로젝트 제목을 입력해주세요" {...field} />
              </FormControl>
              <FormDescription>
                프로젝트의 이름을 입력해주세요. (최대 100자)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>프로젝트 설명</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="프로젝트에 대한 설명을 입력해주세요"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                프로젝트에 대한 간단한 설명을 입력해주세요. (최대 500자)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? '저장 중...' : '프로젝트 생성'}
        </Button>
      </form>
    </Form>
  )
}
