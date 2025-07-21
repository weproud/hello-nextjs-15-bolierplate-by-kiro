'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  UnifiedErrorBoundary,
  HierarchicalErrorBoundaryWrapper,
  withComponentErrorBoundary,
  ErrorBoundaryTester,
  ErrorBoundaryDebugger,
} from './unified-error-boundary'

/**
 * 에러 바운더리 시스템 사용 예제 컴포넌트
 *
 * 다양한 에러 바운더리 사용법과 테스트를 위한 예제들을 제공합니다.
 */

// 에러를 발생시키는 테스트 컴포넌트
function ErrorThrower({
  errorType = 'unknown',
  message = 'Test error',
  delay = 0,
}: {
  errorType?: string
  message?: string
  delay?: number
}) {
  const [shouldThrow, setShouldThrow] = useState(false)

  React.useEffect(() => {
    if (shouldThrow) {
      if (delay > 0) {
        setTimeout(() => {
          const error = new Error(message)
          error.name = `${errorType}Error`
          throw error
        }, delay)
      } else {
        const error = new Error(message)
        error.name = `${errorType}Error`
        throw error
      }
    }
  }, [shouldThrow, errorType, message, delay])

  return (
    <div className="p-4 border rounded">
      <h4 className="font-medium mb-2">에러 발생기</h4>
      <div className="space-y-2">
        <Button
          onClick={() => setShouldThrow(true)}
          variant="destructive"
          size="sm"
        >
          {errorType} 에러 발생
        </Button>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  )
}

// 컴포넌트 에러 바운더리로 감싼 컴포넌트
const ProtectedErrorThrower = withComponentErrorBoundary(
  ErrorThrower,
  'ErrorThrower',
  {
    inline: true,
    minimal: true,
    showDetails: true,
  }
)

// 네트워크 에러 시뮬레이터
function NetworkErrorSimulator() {
  const [isLoading, setIsLoading] = useState(false)

  const simulateNetworkError = async () => {
    setIsLoading(true)
    try {
      // 네트워크 요청 시뮬레이션
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Failed to fetch: Network error'))
        }, 1000)
      })
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded">
      <h4 className="font-medium mb-2">네트워크 에러 시뮬레이터</h4>
      <Button
        onClick={simulateNetworkError}
        disabled={isLoading}
        variant="outline"
        size="sm"
      >
        {isLoading ? '로딩 중...' : '네트워크 요청 실패'}
      </Button>
    </div>
  )
}

const ProtectedNetworkSimulator = withComponentErrorBoundary(
  NetworkErrorSimulator,
  'NetworkErrorSimulator',
  {
    inline: true,
    showDetails: true,
  }
)

// 인증 에러 시뮬레이터
function AuthErrorSimulator() {
  const throwAuthError = () => {
    const error = new Error('Unauthorized: Please login to continue')
    error.name = 'AuthError'
    throw error
  }

  return (
    <div className="p-4 border rounded">
      <h4 className="font-medium mb-2">인증 에러 시뮬레이터</h4>
      <Button onClick={throwAuthError} variant="outline" size="sm">
        인증 에러 발생
      </Button>
    </div>
  )
}

const ProtectedAuthSimulator = withComponentErrorBoundary(
  AuthErrorSimulator,
  'AuthErrorSimulator',
  {
    inline: true,
    showDetails: true,
  }
)

// 메인 예제 컴포넌트
export function ErrorBoundaryExamples() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">통합 에러 바운더리 시스템</h1>
        <p className="text-gray-600">계층적 에러 처리와 복구 메커니즘 예제</p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">기본 사용법</TabsTrigger>
          <TabsTrigger value="hierarchical">계층적 구조</TabsTrigger>
          <TabsTrigger value="recovery">에러 복구</TabsTrigger>
          <TabsTrigger value="testing">테스트 도구</TabsTrigger>
        </TabsList>

        {/* 기본 사용법 */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>기본 에러 바운더리 사용법</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 컴포넌트 레벨 에러 바운더리 */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  컴포넌트 레벨 에러 바운더리
                  <Badge variant="outline">Component</Badge>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UnifiedErrorBoundary
                    level="component"
                    name="ValidationTest"
                    inline={true}
                    minimal={true}
                    showDetails={true}
                  >
                    <ErrorThrower
                      errorType="validation"
                      message="Invalid input: Email format is incorrect"
                    />
                  </UnifiedErrorBoundary>

                  <UnifiedErrorBoundary
                    level="component"
                    name="DatabaseTest"
                    inline={true}
                    showDetails={true}
                  >
                    <ErrorThrower
                      errorType="database"
                      message="Database connection failed"
                    />
                  </UnifiedErrorBoundary>
                </div>
              </div>

              {/* HOC 사용 예제 */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  HOC 패턴 사용
                  <Badge variant="secondary">HOC</Badge>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ProtectedErrorThrower
                    errorType="network"
                    message="Network request timeout"
                  />
                  <ProtectedNetworkSimulator />
                  <ProtectedAuthSimulator />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 계층적 구조 */}
        <TabsContent value="hierarchical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>계층적 에러 바운더리 구조</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  <p>Global → Route → Component 순서로 에러가 처리됩니다.</p>
                  <p>
                    하위 레벨에서 처리되지 않은 에러는 상위 레벨로 전파됩니다.
                  </p>
                </div>

                <HierarchicalErrorBoundaryWrapper
                  appName="ExampleApp"
                  routeName="ErrorTestRoute"
                  routePath="/examples/error-boundary"
                  componentName="HierarchicalTest"
                  showDetails={true}
                >
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center space-y-4">
                      <h3 className="text-lg font-semibold">
                        계층적 에러 바운더리 테스트 영역
                      </h3>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Badge variant="outline">Global</Badge>
                        <span>→</span>
                        <Badge variant="outline">Route</Badge>
                        <span>→</span>
                        <Badge variant="outline">Component</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <ErrorThrower
                          errorType="permission"
                          message="Access denied: Insufficient permissions"
                        />
                        <ErrorThrower
                          errorType="unknown"
                          message="Critical system error"
                        />
                      </div>
                    </div>
                  </div>
                </HierarchicalErrorBoundaryWrapper>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 에러 복구 */}
        <TabsContent value="recovery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>에러 복구 메커니즘</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                <p>에러 타입에 따라 다양한 복구 옵션이 제공됩니다.</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>재시도 (Retry): 네트워크, 데이터베이스 에러</li>
                  <li>폴백 (Fallback): 컴포넌트 렌더링 에러</li>
                  <li>리다이렉트 (Redirect): 인증, 권한 에러</li>
                  <li>새로고침 (Reload): 시스템 에러</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 재시도 가능한 에러 */}
                <UnifiedErrorBoundary
                  level="component"
                  name="RetryableError"
                  inline={true}
                  showDetails={true}
                >
                  <div className="p-4 border rounded">
                    <h4 className="font-medium mb-2">재시도 가능한 에러</h4>
                    <ErrorThrower
                      errorType="network"
                      message="Connection timeout - retryable"
                    />
                  </div>
                </UnifiedErrorBoundary>

                {/* 복구 불가능한 에러 */}
                <UnifiedErrorBoundary
                  level="component"
                  name="NonRetryableError"
                  inline={true}
                  showDetails={true}
                >
                  <div className="p-4 border rounded">
                    <h4 className="font-medium mb-2">복구 불가능한 에러</h4>
                    <ErrorThrower
                      errorType="validation"
                      message="Invalid data format - non-retryable"
                    />
                  </div>
                </UnifiedErrorBoundary>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 테스트 도구 */}
        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>에러 바운더리 테스트 도구</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ErrorBoundaryTester
                  level="component"
                  errorType="validation"
                  message="Form validation failed"
                />
                <ErrorBoundaryTester
                  level="component"
                  errorType="network"
                  message="API request failed"
                />
                <ErrorBoundaryTester
                  level="component"
                  errorType="auth"
                  message="Authentication required"
                />
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">개발자 도구</h4>
                <div className="space-y-2 text-sm">
                  <p>개발 환경에서 다음 기능들을 사용할 수 있습니다:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>
                      브라우저 콘솔에서 <code>debugErrorBoundaries()</code> 실행
                    </li>
                    <li>에러 바운더리 통계 및 상태 확인</li>
                    <li>에러 히스토리 및 복구 기록 조회</li>
                    <li>실시간 에러 모니터링</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 개발 도구 디버거 */}
      <ErrorBoundaryDebugger />
    </div>
  )
}

/**
 * 실제 애플리케이션에서 사용할 수 있는 예제 레이아웃
 */
export function AppWithErrorBoundaries({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <HierarchicalErrorBoundaryWrapper
      appName="MyApp"
      routeName="CurrentRoute"
      routePath={typeof window !== 'undefined' ? window.location.pathname : '/'}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </HierarchicalErrorBoundaryWrapper>
  )
}

/**
 * 페이지별 에러 바운더리 예제
 */
export function PageWithErrorBoundary({
  pageName,
  children,
}: {
  pageName: string
  children: React.ReactNode
}) {
  return (
    <UnifiedErrorBoundary
      level="route"
      name={pageName}
      routePath={typeof window !== 'undefined' ? window.location.pathname : '/'}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </UnifiedErrorBoundary>
  )
}

/**
 * 컴포넌트별 에러 바운더리 예제
 */
export function ComponentWithErrorBoundary({
  componentName,
  inline = false,
  minimal = false,
  children,
}: {
  componentName: string
  inline?: boolean
  minimal?: boolean
  children: React.ReactNode
}) {
  return (
    <UnifiedErrorBoundary
      level="component"
      name={componentName}
      inline={inline}
      minimal={minimal}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </UnifiedErrorBoundary>
  )
}
