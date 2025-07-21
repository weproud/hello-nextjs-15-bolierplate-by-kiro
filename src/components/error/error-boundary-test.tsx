'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ComponentErrorBoundary,
  PageErrorBoundary,
  ModalErrorBoundary,
} from './hierarchical-error-boundary'

/**
 * 에러 바운더리 시스템 테스트 컴포넌트
 */

// 에러를 발생시키는 테스트 컴포넌트
function ErrorTrigger({ errorType }: { errorType: string }) {
  const [shouldError, setShouldError] = useState(false)

  if (shouldError) {
    switch (errorType) {
      case 'network':
        throw new Error('Network request failed: Connection timeout')
      case 'validation':
        throw new Error('Validation failed: Required field missing')
      case 'auth':
        throw new Error('Authentication failed: Token expired')
      case 'database':
        throw new Error('Database error: Connection lost')
      case 'permission':
        throw new Error('Permission denied: Insufficient privileges')
      default:
        throw new Error('Unknown error occurred')
    }
  }

  return (
    <div className="p-4 border rounded">
      <p className="mb-2">에러 타입: {errorType}</p>
      <Button
        onClick={() => setShouldError(true)}
        variant="destructive"
        size="sm"
      >
        {errorType} 에러 발생시키기
      </Button>
    </div>
  )
}

// 컴포넌트 레벨 에러 테스트
function ComponentErrorTest() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>컴포넌트 레벨 에러 바운더리 테스트</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ComponentErrorBoundary componentName="network-component">
          <ErrorTrigger errorType="network" />
        </ComponentErrorBoundary>

        <ComponentErrorBoundary componentName="validation-component">
          <ErrorTrigger errorType="validation" />
        </ComponentErrorBoundary>

        <ComponentErrorBoundary componentName="auth-component">
          <ErrorTrigger errorType="auth" />
        </ComponentErrorBoundary>
      </CardContent>
    </Card>
  )
}

// 페이지 레벨 에러 테스트
function PageErrorTest() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>페이지 레벨 에러 바운더리 테스트</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PageErrorBoundary pageName="test-page">
          <ErrorTrigger errorType="database" />
        </PageErrorBoundary>

        <PageErrorBoundary pageName="test-page-2">
          <ErrorTrigger errorType="permission" />
        </PageErrorBoundary>
      </CardContent>
    </Card>
  )
}

// 모달 레벨 에러 테스트
function ModalErrorTest() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>모달 레벨 에러 바운더리 테스트</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ModalErrorBoundary modalName="test-modal">
          <ErrorTrigger errorType="unknown" />
        </ModalErrorBoundary>
      </CardContent>
    </Card>
  )
}

// 메인 테스트 컴포넌트
export function ErrorBoundaryTest() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">에러 바운더리 시스템 테스트</h1>
        <p className="text-muted-foreground">
          각 버튼을 클릭하여 계층적 에러 바운더리 시스템을 테스트해보세요.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <ComponentErrorTest />
        <PageErrorTest />
      </div>

      <ModalErrorTest />

      <Card>
        <CardHeader>
          <CardTitle>테스트 안내</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>각 에러 타입별로 다른 UI와 복구 옵션이 표시됩니다</li>
            <li>컴포넌트 레벨 에러는 해당 컴포넌트만 영향을 받습니다</li>
            <li>페이지 레벨 에러는 더 큰 영역에 영향을 줍니다</li>
            <li>모달 레벨 에러는 모달 전용 에러 처리를 보여줍니다</li>
            <li>재시도 버튼을 클릭하면 에러가 복구됩니다</li>
            <li>개발 모드에서는 상세한 에러 정보가 표시됩니다</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
