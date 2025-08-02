'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  useErrorHandler,
  useGlobalErrorHandler,
  useServerActionErrorHandler,
} from '@/hooks/use-error-handler'
import {
  GlobalErrorBoundary,
  PageErrorBoundary,
  ComponentErrorBoundary,
  ComponentErrorWrapper,
} from '@/components/error'

/**
 * 에러 처리 시스템 사용 예제
 */
export function ErrorHandlingExamples() {
  const [activeExample, setActiveExample] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>통합 에러 처리 시스템 예제</CardTitle>
          <p className="text-sm text-gray-600">
            다양한 에러 처리 패턴과 에러 바운더리 사용법을 확인할 수 있습니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExampleCard
              title="클라이언트 에러 처리"
              description="useErrorHandler 훅을 사용한 클라이언트 에러 처리"
              isActive={activeExample === 'client'}
              onToggle={() =>
                setActiveExample(activeExample === 'client' ? null : 'client')
              }
            >
              {activeExample === 'client' && <ClientErrorExample />}
            </ExampleCard>

            <ExampleCard
              title="서버 액션 에러 처리"
              description="서버 액션에서 발생하는 에러 처리"
              isActive={activeExample === 'server'}
              onToggle={() =>
                setActiveExample(activeExample === 'server' ? null : 'server')
              }
            >
              {activeExample === 'server' && <ServerActionErrorExample />}
            </ExampleCard>

            <ExampleCard
              title="컴포넌트 에러 바운더리"
              description="컴포넌트 레벨 에러 바운더리 사용"
              isActive={activeExample === 'component'}
              onToggle={() =>
                setActiveExample(
                  activeExample === 'component' ? null : 'component'
                )
              }
            >
              {activeExample === 'component' && <ComponentErrorExample />}
            </ExampleCard>

            <ExampleCard
              title="전역 에러 처리"
              description="전역 에러 핸들러 사용"
              isActive={activeExample === 'global'}
              onToggle={() =>
                setActiveExample(activeExample === 'global' ? null : 'global')
              }
            >
              {activeExample === 'global' && <GlobalErrorExample />}
            </ExampleCard>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * 예제 카드 컴포넌트
 */
function ExampleCard({
  title,
  description,
  isActive,
  onToggle,
  children,
}: {
  title: string
  description: string
  isActive: boolean
  onToggle: () => void
  children?: React.ReactNode
}) {
  return (
    <Card
      className={`transition-all ${isActive ? 'ring-2 ring-blue-500' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <Button
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={onToggle}
          >
            {isActive ? '닫기' : '보기'}
          </Button>
        </div>
      </CardHeader>
      {isActive && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  )
}

/**
 * 클라이언트 에러 처리 예제
 */
function ClientErrorExample() {
  const { handleError, handleFormError, handleApiError, handleNetworkError } =
    useErrorHandler()

  const triggerError = async (type: string) => {
    try {
      switch (type) {
        case 'validation':
          throw new Error('입력 데이터가 유효하지 않습니다.')
        case 'network':
          await handleNetworkError(new Error('네트워크 연결에 실패했습니다.'))
          break
        case 'api':
          await handleApiError(
            new Error('API 요청이 실패했습니다.'),
            '/api/test'
          )
          break
        case 'form':
          await handleFormError(
            new Error('폼 제출 중 오류가 발생했습니다.'),
            'test-form'
          )
          break
        default:
          await handleError(new Error('알 수 없는 오류가 발생했습니다.'))
      }
    } catch (error) {
      // 에러는 이미 handleError에서 처리됨
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        다양한 타입의 클라이언트 에러를 테스트해보세요:
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => triggerError('validation')}
        >
          검증 에러
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => triggerError('network')}
        >
          네트워크 에러
        </Button>
        <Button size="sm" variant="outline" onClick={() => triggerError('api')}>
          API 에러
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => triggerError('form')}
        >
          폼 에러
        </Button>
      </div>
    </div>
  )
}

/**
 * 서버 액션 에러 처리 예제
 */
function ServerActionErrorExample() {
  const { handleServerActionError } = useServerActionErrorHandler()

  const simulateServerAction = async (errorType: string) => {
    // 서버 액션 결과 시뮬레이션
    const result = {
      serverError:
        errorType === 'server' ? '서버에서 오류가 발생했습니다.' : undefined,
      validationErrors:
        errorType === 'validation'
          ? { email: ['유효하지 않은 이메일입니다.'] }
          : undefined,
    }

    await handleServerActionError(result)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        서버 액션에서 발생할 수 있는 에러들을 테스트해보세요:
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => simulateServerAction('server')}
        >
          서버 에러
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => simulateServerAction('validation')}
        >
          검증 에러
        </Button>
      </div>
    </div>
  )
}

/**
 * 컴포넌트 에러 바운더리 예제
 */
function ComponentErrorExample() {
  const [shouldError, setShouldError] = useState(false)

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        컴포넌트 에러 바운더리가 에러를 포착하는 것을 확인해보세요:
      </p>

      <ComponentErrorWrapper componentName="ErrorTestComponent" inline>
        <ErrorProneComponent shouldError={shouldError} />
      </ComponentErrorWrapper>

      <Button
        size="sm"
        variant="outline"
        onClick={() => setShouldError(!shouldError)}
      >
        {shouldError ? '에러 해제' : '에러 발생'}
      </Button>
    </div>
  )
}

/**
 * 전역 에러 처리 예제
 */
function GlobalErrorExample() {
  const { handleError, registerGlobalHandlers } = useGlobalErrorHandler()

  const triggerGlobalError = () => {
    // 전역 에러 발생
    setTimeout(() => {
      throw new Error('전역 에러가 발생했습니다!')
    }, 100)
  }

  const triggerUnhandledPromise = () => {
    // 처리되지 않은 Promise 거부
    Promise.reject(new Error('처리되지 않은 Promise 거부가 발생했습니다!'))
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        전역 에러 핸들러가 처리하는 에러들을 테스트해보세요:
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={triggerGlobalError}>
          전역 에러
        </Button>
        <Button size="sm" variant="outline" onClick={triggerUnhandledPromise}>
          Unhandled Promise
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleError(new Error('수동 에러'))}
        >
          수동 에러 처리
        </Button>
      </div>
    </div>
  )
}

/**
 * 에러를 발생시키는 테스트 컴포넌트
 */
function ErrorProneComponent({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('컴포넌트에서 의도적으로 발생시킨 에러입니다!')
  }

  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded">
      <p className="text-sm text-green-700">
        ✅ 컴포넌트가 정상적으로 렌더링되었습니다.
      </p>
    </div>
  )
}

/**
 * 에러 바운더리 계층 구조 예제
 */
export function ErrorBoundaryHierarchyExample() {
  return (
    <GlobalErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <PageErrorBoundary
        pageName="error-examples"
        showDetails={process.env.NODE_ENV === 'development'}
      >
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                에러 바운더리 계층 구조
                <Badge variant="outline">DEMO</Badge>
              </CardTitle>
              <p className="text-sm text-gray-600">
                글로벌 → 페이지 → 컴포넌트 순서로 에러 바운더리가 적용되어
                있습니다.
              </p>
            </CardHeader>
            <CardContent>
              <ComponentErrorBoundary
                componentName="demo-component"
                showDetails={process.env.NODE_ENV === 'development'}
              >
                <ErrorHandlingExamples />
              </ComponentErrorBoundary>
            </CardContent>
          </Card>
        </div>
      </PageErrorBoundary>
    </GlobalErrorBoundary>
  )
}
