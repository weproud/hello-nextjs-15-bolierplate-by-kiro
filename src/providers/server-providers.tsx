import { type ReactNode } from 'react'

interface ServerProvidersProps {
  children: ReactNode
}

/**
 * Server Providers Component
 * 
 * 서버 사이드에서 실행 가능한 provider들을 통합합니다.
 * 현재는 서버 사이드 provider가 없지만, 향후 확장을 위해 준비된 구조입니다.
 * 
 * 향후 추가 가능한 provider들:
 * - 메타데이터 provider
 * - 정적 설정 provider
 * - 서버 사이드 컨텍스트
 * - 국제화(i18n) provider
 * - 서버 사이드 캐시 provider
 * 
 * 주의사항:
 * - 이 컴포넌트는 서버 컴포넌트이므로 'use client' 지시어를 사용하지 않습니다.
 * - 브라우저 API나 클라이언트 전용 기능을 사용하지 않습니다.
 * - 상태 관리나 이벤트 핸들러를 포함하지 않습니다.
 */
export function ServerProviders({ children }: ServerProvidersProps) {
  // 현재는 서버 사이드 provider가 없으므로 children만 반환
  // 향후 서버 사이드 provider들이 추가되면 여기에 래핑
  return <>{children}</>
}

/**
 * 향후 확장 예시:
 * 
 * export function ServerProviders({ children }: ServerProvidersProps) {
 *   return (
 *     <MetadataProvider>
 *       <I18nProvider>
 *         <StaticConfigProvider>
 *           {children}
 *         </StaticConfigProvider>
 *       </I18nProvider>
 *     </MetadataProvider>
 *   )
 * }
 */
