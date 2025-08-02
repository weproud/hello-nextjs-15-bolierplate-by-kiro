# 통합 폼 시스템

이 디렉토리는 React Hook Form + Zod + next-safe-action을 통합한 완전한 폼 처리 시스템을 제공합니다.

## 주요 특징

- **통합된 폼 처리**: `useFormWithAction` 훅으로 폼 상태, 유효성 검사, 서버 액션을 한 번에 처리
- **재사용 가능한 컴포넌트**: 다양한 폼 필드 타입을 지원하는 컴포넌트들
- **실시간 유효성 검사**: 사용자 입력에 따른 즉시 피드백
- **에러 처리**: 서버 에러와 클라이언트 에러를 통합 처리
- **진행률 표시**: 폼 완성도를 시각적으로 표시
- **다중 단계 폼**: 복잡한 폼을 단계별로 나누어 처리

## 사용법

### 1. 기본 폼 사용

```tsx
import { useFormWithAction } from '@/hooks'
import { FormField } from '@/components/forms'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
})

function MyForm() {
  const { form, handleSubmit, isLoading } = useFormWithAction(schema, myAction, {
    successMessage: '성공적으로 저장되었습니다!',
    onSuccess: data => console.log('Success:', data),
  })

  return (
    <form onSubmit={handleSubmit}>
      <FormField label='이름' error={form.formState.errors.name} required>
        <input {...form.register('name')} />
      </FormField>

      <FormField label='이메일' error={form.formState.errors.email} required>
        <input type='email' {...form.register('email')} />
      </FormField>

      <button type='submit' disabled={isLoading}>
        {isLoading ? '처리 중...' : '제출'}
      </button>
    </form>
  )
}
```

### 2. 향상된 폼 컴포넌트 사용

```tsx
import { EnhancedForm } from '@/components/forms'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, '이름을 입력해주세요'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  message: z.string().min(10, '메시지는 10자 이상 입력해주세요'),
})

function ContactForm() {
  return (
    <EnhancedForm
      schema={schema}
      action={contactAction}
      fields={[
        {
          name: 'name',
          type: 'input',
          label: '이름',
          required: true,
          validation: { showIndicator: true },
        },
        {
          name: 'email',
          type: 'input',
          label: '이메일',
          required: true,
          validation: { showIndicator: true, realTime: true },
        },
        {
          name: 'message',
          type: 'textarea',
          label: '메시지',
          required: true,
          props: { rows: 5 },
        },
      ]}
      title='연락하기'
      description='궁금한 점이 있으시면 언제든 연락해주세요.'
      submitText='메시지 보내기'
      showProgress={true}
      showErrorSummary={true}
    />
  )
}
```

### 3. 다중 단계 폼 사용

```tsx
import { useMultiStepFormWithAction } from '@/hooks'

const steps = [
  {
    name: '기본 정보',
    fields: ['name', 'email'],
  },
  {
    name: '추가 정보',
    fields: ['phone', 'address'],
  },
  {
    name: '확인',
    fields: ['terms', 'newsletter'],
  },
]

function MultiStepForm() {
  const { form, currentStep, isLastStep, nextStep, prevStep, submitForm, progress } =
    useMultiStepFormWithAction(schema, action, steps)

  return (
    <div>
      <div className='progress-bar'>
        <div style={{ width: `${progress}%` }} />
      </div>

      <form onSubmit={isLastStep ? submitForm : nextStep}>
        {/* 현재 단계의 필드들 렌더링 */}

        <div className='buttons'>
          {currentStep > 0 && (
            <button type='button' onClick={prevStep}>
              이전
            </button>
          )}

          <button type='submit'>{isLastStep ? '제출' : '다음'}</button>
        </div>
      </form>
    </div>
  )
}
```

### 4. 폼 템플릿 사용

```tsx
import { EnhancedForm, FormTemplates } from '@/components/forms'

function LoginPage() {
  return (
    <EnhancedForm
      {...FormTemplates.login(loginSchema, loginAction)}
      formOptions={{
        onSuccess: () => router.push('/dashboard'),
      }}
    />
  )
}
```

## 컴포넌트 API

### useFormWithAction

React Hook Form + Zod + next-safe-action을 통합한 훅입니다.

```tsx
const {
  form, // React Hook Form 인스턴스
  handleSubmit, // 폼 제출 핸들러
  isLoading, // 로딩 상태
  isSuccess, // 성공 상태
  hasErrors, // 에러 존재 여부
  error, // 일반 에러 메시지
  fieldErrors, // 필드별 에러
  result, // 액션 결과 데이터
  reset, // 폼 리셋
} = useFormWithAction(schema, action, options)
```

### EnhancedForm

완전한 폼 솔루션을 제공하는 컴포넌트입니다.

```tsx
<EnhancedForm
  schema={zodSchema}
  action={safeAction}
  fields={fieldConfigs}
  title='폼 제목'
  description='폼 설명'
  showProgress={true}
  showErrorSummary={true}
  layout='vertical' // 'vertical' | 'horizontal' | 'grid'
  onSuccess={data => console.log(data)}
/>
```

### FormField

재사용 가능한 폼 필드 컴포넌트입니다.

```tsx
<FormField
  label='필드 라벨'
  error={fieldError}
  helperText='도움말 텍스트'
  required={true}
  showValidationIndicator={true}
  isValidating={false}
  isValid={true}
>
  <input {...register('fieldName')} />
</FormField>
```

## 고급 기능

### 실시간 유효성 검사

```tsx
const { form } = useFormWithAction(schema, action, {
  formOptions: { mode: 'onChange' },
})

// 필드별 실시간 검사
<FormField
  showValidationIndicator={true}
  isValidating={form.formState.isValidating}
  isValid={!form.formState.errors.fieldName}
>
```

### 자동 저장

```tsx
import { useAutoSaveForm } from '@/hooks'

const form = useAutoSaveForm(
  schema,
  async data => {
    await autoSaveAction(data)
  },
  {
    autoSaveDelay: 2000,
    enableAutoSave: true,
  }
)
```

### 낙관적 업데이트

```tsx
import { useOptimisticFormAction } from '@/hooks'

const { execute, optimisticData } = useOptimisticFormAction(updateAction, formData => ({
  // 낙관적 업데이트 데이터
  id: 'temp-id',
  ...Object.fromEntries(formData),
}))
```

## 모범 사례

1. **스키마 정의**: Zod 스키마를 명확하게 정의하고 에러 메시지를 한국어로 작성
2. **에러 처리**: 서버 에러와 클라이언트 에러를 구분하여 처리
3. **사용자 경험**: 로딩 상태, 진행률, 실시간 피드백 제공
4. **접근성**: 적절한 라벨, ARIA 속성, 키보드 네비게이션 지원
5. **성능**: 불필요한 리렌더링 방지, 디바운싱 활용

## 문제 해결

### 일반적인 문제들

1. **타입 에러**: 스키마와 폼 데이터 타입이 일치하는지 확인
2. **액션 에러**: next-safe-action 설정이 올바른지 확인
3. **유효성 검사**: Zod 스키마가 예상한 데이터 구조와 일치하는지 확인
4. **리렌더링**: 불필요한 의존성이 useEffect에 포함되지 않았는지 확인

### 디버깅 팁

```tsx
// 폼 상태 디버깅
console.log('Form state:', form.formState)
console.log('Form values:', form.getValues())
console.log('Form errors:', form.formState.errors)

// 액션 결과 디버깅
console.log('Action result:', actionResult)
```
