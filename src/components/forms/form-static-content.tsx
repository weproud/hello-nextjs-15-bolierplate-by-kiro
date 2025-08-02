import { ReactNode } from 'react'

/**
 * Server Component - Static form header
 * 폼 헤더의 정적 부분을 담당하는 서버 컴포넌트
 */
export function FormHeader({
  title,
  description,
  className = '',
}: {
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={`text-center mb-8 ${className}`}>
      <h1 className='text-2xl font-bold mb-2'>{title}</h1>
      {description && <p className='text-muted-foreground'>{description}</p>}
    </div>
  )
}

/**
 * Server Component - Static form section
 * 폼 섹션의 정적 부분을 담당하는 서버 컴포넌트
 */
export function FormSectionStatic({
  title,
  description,
  children,
  className = '',
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className='text-lg font-medium'>{title}</h3>
        {description && (
          <p className='text-sm text-muted-foreground mt-1'>{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

/**
 * Server Component - Static field label and description
 * 필드 레이블과 설명의 정적 부분을 담당하는 서버 컴포넌트
 */
export function FieldLabelStatic({
  label,
  description,
  required = false,
  className = '',
}: {
  label: string
  description?: string
  required?: boolean
  className?: string
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>
      {description && (
        <p className='text-xs text-muted-foreground'>{description}</p>
      )}
    </div>
  )
}

/**
 * Server Component - Static form layout wrapper
 * 폼 레이아웃의 정적 구조를 담당하는 서버 컴포넌트
 */
export function FormLayoutStatic({
  children,
  maxWidth = 'max-w-2xl',
  className = '',
}: {
  children: ReactNode
  maxWidth?: string
  className?: string
}) {
  return (
    <div className={`${maxWidth} mx-auto p-6 ${className}`}>{children}</div>
  )
}

/**
 * Server Component - Static form grid layout
 * 폼 그리드 레이아웃의 정적 구조를 담당하는 서버 컴포넌트
 */
export function FormGridStatic({
  children,
  columns = 1,
  className = '',
}: {
  children: ReactNode
  columns?: 1 | 2 | 3
  className?: string
}) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }[columns]

  return (
    <div className={`grid ${gridClass} gap-4 ${className}`}>{children}</div>
  )
}

/**
 * Server Component - Static form tips and help text
 * 폼 도움말과 팁의 정적 부분을 담당하는 서버 컴포넌트
 */
export function FormHelpStatic({
  title,
  tips,
  className = '',
}: {
  title: string
  tips: string[]
  className?: string
}) {
  return (
    <div className={`bg-muted p-4 rounded-lg ${className}`}>
      <h4 className='font-medium mb-2'>{title}</h4>
      <ul className='space-y-1 text-sm text-muted-foreground'>
        {tips.map((tip, index) => (
          <li key={index}>• {tip}</li>
        ))}
      </ul>
    </div>
  )
}
