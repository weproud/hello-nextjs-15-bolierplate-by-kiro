import { ReactNode } from 'react'

/**
 * Server Component wrapper that provides data to Client Components
 * 서버 컴포넌트에서 데이터를 가져와 클라이언트 컴포넌트에 전달하는 래퍼 패턴
 */
interface ServerClientBoundaryProps<T = any> {
  children: (data: T) => ReactNode
  fallback?: ReactNode
  errorFallback?: ReactNode
}

/**
 * Static content wrapper for hybrid components
 * 하이브리드 컴포넌트에서 정적 콘텐츠를 감싸는 래퍼
 */
export function StaticWrapper({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={className}>{children}</div>
}

/**
 * Server-side data fetching wrapper
 * 서버 사이드 데이터 페칭 래퍼
 */
export async function ServerDataWrapper<T>({
  fetchData,
  children,
  fallback,
  errorFallback,
}: {
  fetchData: () => Promise<T>
  children: (data: T) => ReactNode
  fallback?: ReactNode
  errorFallback?: ReactNode
}) {
  try {
    const data = await fetchData()
    return <>{children(data)}</>
  } catch (error) {
    console.error('ServerDataWrapper error:', error)
    return (
      <>
        {errorFallback || <div>데이터를 불러오는 중 오류가 발생했습니다.</div>}
      </>
    )
  }
}

/**
 * Conditional Client Component loader
 * 조건부 클라이언트 컴포넌트 로더
 */
export function ConditionalClientLoader({
  condition,
  clientComponent,
  serverFallback,
}: {
  condition: boolean
  clientComponent: ReactNode
  serverFallback: ReactNode
}) {
  if (condition) {
    return <>{clientComponent}</>
  }

  return <>{serverFallback}</>
}

/**
 * Static content with dynamic actions pattern
 * 정적 콘텐츠와 동적 액션을 분리하는 패턴
 */
export function StaticContentWithActions({
  staticContent,
  dynamicActions,
  className = '',
}: {
  staticContent: ReactNode
  dynamicActions: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      {staticContent}
      {dynamicActions}
    </div>
  )
}
