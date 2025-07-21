'use client'

import React, { useState, useCallback, useEffect } from 'react'
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { type AppError } from '@/lib/error-handler'
import { type ErrorRecoveryAction } from '@/lib/error-boundary-system'

interface ErrorRecoveryProps {
  error: AppError
  actions: ErrorRecoveryAction[]
  onActionExecute: (action: ErrorRecoveryAction) => Promise<void>
  onDismiss?: () => void
  className?: string
}

interface RecoveryState {
  isRecovering: boolean
  currentAction: ErrorRecoveryAction | null
  progress: number
  attempts: number
  lastAttemptTime: number
  recoveryHistory: Array<{
    action: ErrorRecoveryAction
    success: boolean
    timestamp: Date
    error?: string
  }>
}

/**
 * 에러 복구 컴포넌트
 *
 * 에러 발생 시 사용자가 선택할 수 있는 복구 옵션들을 제공하고
 * 복구 과정을 시각적으로 표시합니다.
 */
export function ErrorRecovery({
  error,
  actions,
  onActionExecute,
  onDismiss,
  className = '',
}: ErrorRecoveryProps) {
  const [recoveryState, setRecoveryState] = useState<RecoveryState>({
    isRecovering: false,
    currentAction: null,
    progress: 0,
    attempts: 0,
    lastAttemptTime: 0,
    recoveryHistory: [],
  })

  /**
   * 복구 액션 실행
   */
  const executeAction = useCallback(
    async (action: ErrorRecoveryAction) => {
      const now = Date.now()
      const timeSinceLastAttempt = now - recoveryState.lastAttemptTime

      // 너무 빠른 재시도 방지 (최소 1초 간격)
      if (timeSinceLastAttempt < 1000 && recoveryState.attempts > 0) {
        return
      }

      setRecoveryState(prev => ({
        ...prev,
        isRecovering: true,
        currentAction: action,
        progress: 0,
        attempts: prev.attempts + 1,
        lastAttemptTime: now,
      }))

      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setRecoveryState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }))
      }, 100)

      try {
        await onActionExecute(action)

        // 성공
        setRecoveryState(prev => ({
          ...prev,
          progress: 100,
          recoveryHistory: [
            ...prev.recoveryHistory,
            {
              action,
              success: true,
              timestamp: new Date(),
            },
          ],
        }))

        // 성공 후 잠시 대기 후 상태 초기화
        setTimeout(() => {
          setRecoveryState(prev => ({
            ...prev,
            isRecovering: false,
            currentAction: null,
            progress: 0,
          }))
        }, 1000)
      } catch (recoveryError) {
        // 실패
        setRecoveryState(prev => ({
          ...prev,
          isRecovering: false,
          currentAction: null,
          progress: 0,
          recoveryHistory: [
            ...prev.recoveryHistory,
            {
              action,
              success: false,
              timestamp: new Date(),
              error:
                recoveryError instanceof Error
                  ? recoveryError.message
                  : String(recoveryError),
            },
          ],
        }))
      } finally {
        clearInterval(progressInterval)
      }
    },
    [onActionExecute, recoveryState.lastAttemptTime, recoveryState.attempts]
  )

  /**
   * 자동 재시도 (네트워크 에러 등)
   */
  useEffect(() => {
    if (error.type === 'network' && recoveryState.attempts === 0) {
      const retryAction = actions.find(action => action.type === 'retry')
      if (retryAction) {
        // 3초 후 자동 재시도
        const timer = setTimeout(() => {
          executeAction(retryAction)
        }, 3000)

        return () => clearTimeout(timer)
      }
    }
  }, [error.type, actions, recoveryState.attempts, executeAction])

  /**
   * 액션 아이콘 반환
   */
  const getActionIcon = (action: ErrorRecoveryAction) => {
    switch (action.type) {
      case 'retry':
        return <RefreshCw className="w-4 h-4" />
      case 'reload':
        return <RefreshCw className="w-4 h-4" />
      default:
        return null
    }
  }

  /**
   * 에러 심각도에 따른 스타일
   */
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          badgeVariant: 'destructive' as const,
        }
      case 'high':
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600',
          badgeVariant: 'secondary' as const,
        }
      case 'medium':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          badgeVariant: 'outline' as const,
        }
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          badgeVariant: 'secondary' as const,
        }
    }
  }

  const styles = getSeverityStyles(error.severity)

  return (
    <Card className={`${styles.borderColor} border ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${styles.iconColor}`} />
            <CardTitle className="text-base">오류 복구</CardTitle>
            <Badge variant={styles.badgeVariant} className="text-xs">
              {error.severity}
            </Badge>
          </div>
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="h-7 px-2"
            >
              닫기
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 에러 정보 */}
        <div className={`p-3 rounded-lg ${styles.bgColor}`}>
          <p className="text-sm font-medium mb-1">{error.message}</p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>타입: {error.type}</div>
            <div>발생 시간: {error.timestamp.toLocaleString('ko-KR')}</div>
            {recoveryState.attempts > 0 && (
              <div>복구 시도: {recoveryState.attempts}회</div>
            )}
          </div>
        </div>

        {/* 진행 중인 복구 작업 */}
        {recoveryState.isRecovering && recoveryState.currentAction && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{recoveryState.currentAction.label} 중...</span>
            </div>
            <Progress value={recoveryState.progress} className="h-2" />
          </div>
        )}

        {/* 복구 액션 버튼들 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">복구 옵션</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {actions.map(action => {
              const isCurrentAction =
                recoveryState.currentAction?.id === action.id
              const isDisabled =
                recoveryState.isRecovering ||
                (action.type === 'retry' && recoveryState.attempts >= 3)

              return (
                <Button
                  key={action.id}
                  onClick={() => executeAction(action)}
                  disabled={isDisabled}
                  variant={action.primary ? 'default' : 'outline'}
                  className="justify-start"
                  size="sm"
                >
                  {getActionIcon(action)}
                  <span className="ml-2">
                    {isCurrentAction ? '처리 중...' : action.label}
                  </span>
                  {action.type === 'retry' && recoveryState.attempts > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {recoveryState.attempts}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>
        </div>

        {/* 복구 히스토리 */}
        {recoveryState.recoveryHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">복구 기록</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {recoveryState.recoveryHistory.slice(-5).map((record, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-xs p-2 bg-gray-50 rounded"
                >
                  {record.success ? (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-600" />
                  )}
                  <span className="flex-1">
                    {record.action.label} - {record.success ? '성공' : '실패'}
                  </span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{record.timestamp.toLocaleTimeString('ko-KR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 자동 재시도 안내 */}
        {error.type === 'network' && recoveryState.attempts === 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500 p-2 bg-blue-50 rounded">
            <Clock className="w-3 h-3" />
            <span>
              네트워크 오류가 감지되었습니다. 3초 후 자동으로 재시도합니다.
            </span>
          </div>
        )}

        {/* 추가 도움말 */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <p>
            문제가 지속되면 페이지를 새로고침하거나 고객지원에 문의해주세요.
          </p>
          <p className="mt-1">
            오류 ID:{' '}
            <code className="bg-gray-100 px-1 rounded">{error.id}</code>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * 간단한 복구 버튼 컴포넌트
 */
export function SimpleRecoveryButton({
  action,
  onExecute,
  disabled = false,
  className = '',
}: {
  action: ErrorRecoveryAction
  onExecute: (action: ErrorRecoveryAction) => Promise<void>
  disabled?: boolean
  className?: string
}) {
  const [isExecuting, setIsExecuting] = useState(false)

  const handleClick = async () => {
    if (isExecuting || disabled) return

    setIsExecuting(true)
    try {
      await onExecute(action)
    } catch (error) {
      console.error('Recovery action failed:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isExecuting}
      variant={action.primary ? 'default' : 'outline'}
      size="sm"
      className={className}
    >
      {action.type === 'retry' && (
        <RefreshCw
          className={`w-4 h-4 mr-2 ${isExecuting ? 'animate-spin' : ''}`}
        />
      )}
      {isExecuting ? '처리 중...' : action.label}
    </Button>
  )
}

/**
 * 복구 액션 실행 훅
 */
export function useErrorRecovery() {
  const [isRecovering, setIsRecovering] = useState(false)
  const [lastRecoveryTime, setLastRecoveryTime] = useState(0)

  const executeRecovery = useCallback(
    async (
      action: ErrorRecoveryAction,
      handler: (action: ErrorRecoveryAction) => Promise<void>
    ) => {
      const now = Date.now()
      const timeSinceLastRecovery = now - lastRecoveryTime

      // 너무 빠른 재시도 방지
      if (timeSinceLastRecovery < 1000 && lastRecoveryTime > 0) {
        return
      }

      setIsRecovering(true)
      setLastRecoveryTime(now)

      try {
        await handler(action)
      } catch (error) {
        console.error('Recovery failed:', error)
        throw error
      } finally {
        setIsRecovering(false)
      }
    },
    [lastRecoveryTime]
  )

  return {
    isRecovering,
    executeRecovery,
  }
}
