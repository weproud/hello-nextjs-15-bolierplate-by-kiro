'use client'

import { Progress } from '@/components/ui/progress'
import { useProgress } from '@/hooks/use-loading-state'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

// Basic progress indicator
interface ProgressIndicatorProps {
  progressKey: string
  className?: string
  showMessage?: boolean
  showPercentage?: boolean
}

export function ProgressIndicator({
  progressKey,
  className,
  showMessage = true,
  showPercentage = true,
}: ProgressIndicatorProps) {
  const { progress } = useProgress(progressKey)

  if (!progress) return null

  const percentage = Math.round((progress.current / progress.total) * 100)

  return (
    <div
      className={cn('space-y-2', className)}
      role='status'
      aria-live='polite'
    >
      <div className='flex items-center justify-between'>
        {showMessage && progress.message && (
          <span
            className='text-sm text-muted-foreground'
            id={`${progressKey}-message`}
          >
            {progress.message}
          </span>
        )}
        {showPercentage && (
          <span
            className='text-sm font-medium'
            aria-label={`진행률 ${percentage}퍼센트`}
          >
            {percentage}%
          </span>
        )}
      </div>
      <Progress
        value={percentage}
        className='h-2'
        aria-labelledby={
          progress.message ? `${progressKey}-message` : undefined
        }
        aria-label={!progress.message ? `진행률 ${percentage}%` : undefined}
      />
      {progress.stage && (
        <div className='text-xs text-muted-foreground' aria-live='polite'>
          {progress.stage}
        </div>
      )}
    </div>
  )
}

// Circular progress indicator
interface CircularProgressProps {
  progressKey: string
  size?: number
  strokeWidth?: number
  className?: string
}

export function CircularProgress({
  progressKey,
  size = 40,
  strokeWidth = 4,
  className,
}: CircularProgressProps) {
  const { progress } = useProgress(progressKey)

  if (!progress) return null

  const percentage = (progress.current / progress.total) * 100
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
      role='progressbar'
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`원형 진행률 ${Math.round(percentage)}%`}
    >
      <svg
        width={size}
        height={size}
        className='transform -rotate-90'
        aria-hidden='true'
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='currentColor'
          strokeWidth={strokeWidth}
          fill='transparent'
          className='text-muted-foreground/20'
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='currentColor'
          strokeWidth={strokeWidth}
          fill='transparent'
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className='text-primary transition-all duration-300 ease-in-out'
          strokeLinecap='round'
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='text-xs font-medium' aria-live='polite'>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}

// Multi-stage progress indicator
interface MultiStageProgressProps {
  stages: Array<{
    key: string
    label: string
    description?: string
  }>
  currentStage?: string
  className?: string
}

export function MultiStageProgress({
  stages,
  currentStage,
  className,
}: MultiStageProgressProps) {
  const currentIndex = currentStage
    ? stages.findIndex(stage => stage.key === currentStage)
    : -1

  return (
    <div className={cn('space-y-4', className)}>
      <div className='flex items-center justify-between'>
        {stages.map((stage, index) => (
          <div key={stage.key} className='flex items-center'>
            <div className='flex flex-col items-center'>
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  index <= currentIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {index + 1}
              </div>
              <div className='mt-2 text-center'>
                <div className='text-sm font-medium'>{stage.label}</div>
                {stage.description && (
                  <div className='text-xs text-muted-foreground'>
                    {stage.description}
                  </div>
                )}
              </div>
            </div>
            {index < stages.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-4 transition-colors',
                  index < currentIndex ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Animated loading dots
export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className='w-2 h-2 bg-current rounded-full animate-pulse'
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  )
}

// Skeleton with progress
interface SkeletonWithProgressProps {
  progressKey: string
  children: React.ReactNode
  className?: string
}

export function SkeletonWithProgress({
  progressKey,
  children,
  className,
}: SkeletonWithProgressProps) {
  const { progress } = useProgress(progressKey)

  return (
    <div className={cn('space-y-4', className)}>
      {progress && <ProgressIndicator progressKey={progressKey} />}
      {children}
    </div>
  )
}

// Pulse loading indicator
interface PulseLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PulseLoading({ size = 'md', className }: PulseLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'bg-primary rounded-full animate-pulse',
          sizeClasses[size]
        )}
      />
    </div>
  )
}

// Spinner loading indicator
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div
      className={cn('flex items-center justify-center', className)}
      role='status'
      aria-label='로딩 중'
    >
      <div
        className={cn(
          'border-2 border-muted border-t-primary rounded-full animate-spin',
          sizeClasses[size]
        )}
        aria-hidden='true'
      />
      <span className='sr-only'>로딩 중</span>
    </div>
  )
}

// Progressive loading with stages
interface ProgressiveLoadingProps {
  stages: Array<{
    key: string
    label: string
    component: React.ReactNode
  }>
  currentStage: string
  className?: string
}

export function ProgressiveLoading({
  stages,
  currentStage,
  className,
}: ProgressiveLoadingProps) {
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set())
  const currentIndex = stages.findIndex(stage => stage.key === currentStage)

  useEffect(() => {
    if (currentIndex >= 0) {
      const newCompleted = new Set<string>()
      for (let i = 0; i < currentIndex; i++) {
        newCompleted.add(stages[i].key)
      }
      setCompletedStages(newCompleted)
    }
  }, [currentIndex, stages])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stage indicators */}
      <MultiStageProgress
        stages={stages.map(stage => ({
          key: stage.key,
          label: stage.label,
        }))}
        currentStage={currentStage}
      />

      {/* Current stage content */}
      <div className='min-h-[200px]'>
        {stages.map((stage, index) => (
          <div
            key={stage.key}
            className={cn(
              'transition-opacity duration-300',
              stage.key === currentStage ? 'opacity-100' : 'opacity-0 hidden'
            )}
          >
            {stage.component}
          </div>
        ))}
      </div>
    </div>
  )
}

// Loading overlay
interface LoadingOverlayProps {
  isLoading: boolean
  progressKey?: string
  message?: string
  children: React.ReactNode
  className?: string
}

export function LoadingOverlay({
  isLoading,
  progressKey,
  message,
  children,
  className,
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className='absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10'>
          <div className='text-center space-y-4'>
            {progressKey ? (
              <ProgressIndicator progressKey={progressKey} />
            ) : (
              <Spinner size='lg' />
            )}
            {message && (
              <p className='text-sm text-muted-foreground'>{message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
