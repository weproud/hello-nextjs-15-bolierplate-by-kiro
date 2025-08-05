'use client'

import {
  EnhancedForm,
  EnhancedFormField,
  FormSection,
} from '@/components/forms/enhanced-form'
import { Button } from '@/components/ui/button'
import { useFormWithValidation } from '@/hooks/use-form'
import { createTypedFormAction } from '@/lib/actions/form-actions'
import { surveySchema, type SurveyInput } from '@/lib/validations/common'
import { memo, useCallback, useMemo, useState } from 'react'

// Create a server action for the survey
const submitSurvey = createTypedFormAction(
  surveySchema,
  async data => {
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000))

    const survey = {
      id: Math.random().toString(36).substring(2, 9),
      ...data,
      submittedAt: new Date(),
    }

    return survey
  },
  {
    successMessage: '설문조사가 성공적으로 제출되었습니다!',
    errorMessage: '설문조사 제출 중 오류가 발생했습니다.',
  }
)

export const SurveyForm = memo(function SurveyForm() {
  const [showResults, setShowResults] = useState(false)

  const defaultValues = useMemo(
    () => ({
      rating: 0,
      feedback: '',
      recommend: false,
      improvements: [],
    }),
    []
  )

  const form = useFormWithValidation(surveySchema, {
    defaultValues,
  })

  const handleSubmit = useCallback(async (data: SurveyInput) => {
    console.log('Survey submitted:', data)
    setShowResults(true)
  }, [])

  const resetSurvey = useCallback(() => {
    setShowResults(false)
    form.reset()
  }, [form])

  const watchedRating = form.watch('rating')
  const watchedRecommend = form.watch('recommend')

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold mb-2'>서비스 만족도 조사</h1>
        <p className='text-muted-foreground'>
          저희 서비스에 대한 솔직한 의견을 들려주세요
        </p>
      </div>

      {!showResults ? (
        <EnhancedForm
          form={form}
          onSubmit={handleSubmit}
          serverAction={submitSurvey}
          className='space-y-6'
          submitText='설문조사 제출'
          showToast={true}
          successMessage='설문조사가 성공적으로 제출되었습니다!'
          errorMessage='설문조사 제출 중 오류가 발생했습니다.'
          showSummaryErrors={true}
        >
          <FormSection
            title='서비스 평가'
            description='저희 서비스를 어떻게 평가하시나요?'
          >
            <EnhancedFormField
              form={form}
              name='rating'
              label='전체적인 만족도'
              required
              description='1점(매우 불만족)부터 5점(매우 만족)까지 평가해주세요'
            >
              {field => (
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      매우 불만족
                    </span>
                    <span className='text-sm text-muted-foreground'>
                      매우 만족
                    </span>
                  </div>
                  <div className='flex items-center justify-center space-x-2'>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type='button'
                        onClick={() => field.onChange(rating)}
                        className={`w-12 h-12 rounded-full border-2 transition-colors ${
                          field.value >= rating
                            ? 'bg-yellow-400 border-yellow-400 text-white'
                            : 'border-gray-300 hover:border-yellow-400'
                        }`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                  <div className='text-center'>
                    <span className='text-sm font-medium'>
                      {field.value > 0
                        ? `${field.value}점`
                        : '평점을 선택해주세요'}
                    </span>
                  </div>
                </div>
              )}
            </EnhancedFormField>

            {watchedRating > 0 && (
              <div className='text-center p-4 bg-muted/50 rounded-lg'>
                <p className='text-sm'>
                  {watchedRating <= 2 && '개선이 필요한 부분을 알려주세요 😔'}
                  {watchedRating === 3 &&
                    '보통이시군요. 더 나은 서비스를 위해 노력하겠습니다 😐'}
                  {watchedRating === 4 && '만족해주셔서 감사합니다! 😊'}
                  {watchedRating === 5 &&
                    '최고 평점을 주셔서 정말 감사합니다! 🎉'}
                </p>
              </div>
            )}
          </FormSection>

          <FormSection
            title='상세 피드백'
            description='구체적인 의견을 자유롭게 작성해주세요'
          >
            <EnhancedFormField
              form={form}
              name='feedback'
              label='상세 의견'
              required
              validateOnBlur={true}
              description='최소 10자 이상 작성해주세요'
            >
              {field => (
                <textarea
                  className='flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                  placeholder='서비스 이용 경험, 개선사항, 좋았던 점 등을 자유롭게 작성해주세요...'
                  {...field}
                />
              )}
            </EnhancedFormField>

            <EnhancedFormField
              form={form}
              name='recommend'
              label='추천 의향'
              required
              description='다른 사람에게 저희 서비스를 추천하시겠습니까?'
            >
              {field => (
                <div className='space-y-2'>
                  <label className='flex items-center space-x-2'>
                    <input
                      type='radio'
                      checked={field.value === true}
                      onChange={() => field.onChange(true)}
                    />
                    <span>네, 추천하겠습니다</span>
                  </label>
                  <label className='flex items-center space-x-2'>
                    <input
                      type='radio'
                      checked={field.value === false}
                      onChange={() => field.onChange(false)}
                    />
                    <span>아니요, 추천하지 않겠습니다</span>
                  </label>
                </div>
              )}
            </EnhancedFormField>

            {watchedRecommend === false && (
              <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                <p className='text-sm text-red-800 mb-2'>
                  추천하지 않으시는 이유를 알려주시면 개선에 도움이 됩니다.
                </p>
              </div>
            )}
          </FormSection>

          <FormSection
            title='개선 사항'
            description='어떤 부분이 개선되었으면 좋겠나요? (선택사항)'
          >
            <EnhancedFormField
              form={form}
              name='improvements'
              label='개선 희망 사항'
              description='해당하는 항목을 모두 선택해주세요'
            >
              {field => (
                <div className='space-y-2'>
                  {[
                    '사용자 인터페이스',
                    '응답 속도',
                    '기능 추가',
                    '고객 지원',
                    '가격 정책',
                    '문서화',
                    '모바일 앱',
                    '기타',
                  ].map(improvement => (
                    <label
                      key={improvement}
                      className='flex items-center space-x-2'
                    >
                      <input
                        type='checkbox'
                        checked={field.value?.includes(improvement) || false}
                        onChange={e => {
                          const currentImprovements = field.value || []
                          if (e.target.checked) {
                            field.onChange([
                              ...currentImprovements,
                              improvement,
                            ])
                          } else {
                            field.onChange(
                              currentImprovements.filter(
                                (i: string) => i !== improvement
                              )
                            )
                          }
                        }}
                      />
                      <span>{improvement}</span>
                    </label>
                  ))}
                </div>
              )}
            </EnhancedFormField>
          </FormSection>
        </EnhancedForm>
      ) : (
        <div className='text-center p-8 bg-green-50 border border-green-200 rounded-lg'>
          <div className='text-6xl mb-4'>🎉</div>
          <h2 className='text-2xl font-bold text-green-800 mb-2'>
            설문조사 완료!
          </h2>
          <p className='text-green-700 mb-4'>
            소중한 의견을 주셔서 감사합니다. 더 나은 서비스를 위해
            노력하겠습니다.
          </p>
          <Button onClick={resetSurvey} variant='outline'>
            다시 작성하기
          </Button>
        </div>
      )}

      {/* Form Debug Information */}
      <details className='mt-8 p-4 bg-muted/30 rounded-lg'>
        <summary className='cursor-pointer font-medium mb-2'>
          디버그 정보 (개발용)
        </summary>
        <div className='space-y-2 text-sm'>
          <div>
            <strong>현재 값:</strong>
            <pre className='mt-1 p-2 bg-background rounded text-xs overflow-auto'>
              {JSON.stringify(form.watch(), null, 2)}
            </pre>
          </div>
          <div>
            <strong>폼 상태:</strong>
            <pre className='mt-1 p-2 bg-background rounded text-xs overflow-auto'>
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
        </div>
      </details>
    </div>
  )
})
