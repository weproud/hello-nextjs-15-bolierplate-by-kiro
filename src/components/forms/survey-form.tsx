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
import { useFormWithValidation } from '@/hooks/use-form'
import { useFormAction } from '@/hooks/use-form-action'
import { surveySchema, type SurveyInput } from '@/lib/validations/common'

interface SurveyFormProps {
  onSubmit: (data: SurveyInput) => void | Promise<void>
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

const improvementOptions = [
  { id: 'ui', label: '사용자 인터페이스' },
  { id: 'performance', label: '성능' },
  { id: 'features', label: '기능' },
  { id: 'documentation', label: '문서화' },
  { id: 'support', label: '고객 지원' },
]

export function SurveyForm({ onSubmit, onSuccess, onError }: SurveyFormProps) {
  const form = useFormWithValidation(surveySchema, {
    defaultValues: {
      rating: 5,
      feedback: '',
      recommend: true,
      improvements: [],
    },
  })

  const handleSubmit = async (data: SurveyInput) => {
    try {
      await onSubmit(data)
      form.reset()
      onSuccess?.(data)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '설문 제출 중 오류가 발생했습니다.'
      onError?.(errorMessage)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">서비스 만족도 설문</h2>
        <p className="text-muted-foreground">
          서비스 개선을 위해 소중한 의견을 들려주세요.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>전체적인 만족도</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        className={`w-10 h-10 rounded-full border-2 transition-colors ${
                          field.value >= rating
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-muted-foreground hover:border-primary'
                        }`}
                        onClick={() => field.onChange(rating)}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormDescription>
                  1점(매우 불만족)부터 5점(매우 만족)까지 평가해주세요.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="feedback"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상세 피드백</FormLabel>
                <FormControl>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="서비스에 대한 자세한 의견을 들려주세요..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  서비스 이용 경험에 대해 자세히 작성해주세요. (10-500자)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recommend"
            render={({ field }) => (
              <FormItem>
                <FormLabel>추천 의향</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={field.value === true}
                        onChange={() => field.onChange(true)}
                        className="w-4 h-4"
                      />
                      <span>예, 추천하겠습니다</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={field.value === false}
                        onChange={() => field.onChange(false)}
                        className="w-4 h-4"
                      />
                      <span>아니오, 추천하지 않겠습니다</span>
                    </label>
                  </div>
                </FormControl>
                <FormDescription>
                  다른 사람에게 이 서비스를 추천하시겠습니까?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="improvements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>개선이 필요한 영역 (선택사항)</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-3">
                    {improvementOptions.map(option => (
                      <label
                        key={option.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={field.value?.includes(option.id) || false}
                          onChange={e => {
                            const currentValue = field.value || []
                            if (e.target.checked) {
                              field.onChange([...currentValue, option.id])
                            } else {
                              field.onChange(
                                currentValue.filter(id => id !== option.id)
                              )
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </FormControl>
                <FormDescription>
                  개선이 필요하다고 생각하는 영역을 선택해주세요.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            설문 제출하기
          </Button>
        </form>
      </Form>
    </div>
  )
}
