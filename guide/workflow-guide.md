# LagomPath 개발 워크플로우 및 성능 최적화 가이드

## 9. 개발 워크플로우

### 9.1 필수 명령어

#### 개발 서버

```bash
# 개발 서버 시작 (Turbopack 사용)
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 시작
pnpm start
```

#### 코드 품질

```bash
# 전체 품질 검사
pnpm quality

# 품질 문제 자동 수정
pnpm quality:fix

# 개별 도구 실행
pnpm type-check    # TypeScript 타입 검사
pnpm lint          # ESLint 검사
pnpm lint:fix      # ESLint 자동 수정
pnpm format        # Prettier 포맷팅
```

#### 데이터베이스

```bash
# 스키마 변경사항 푸시
pnpm db:push

# 마이그레이션 생성 및 실행
pnpm db:migrate

# Prisma Studio 열기
pnpm db:studio

# 데이터베이스 시드
pnpm db:seed
```

#### 테스트

```bash
# 테스트 실행
pnpm test

# 테스트 감시 모드
pnpm test:watch

# 테스트 UI
pnpm test:ui

# 커버리지 리포트
pnpm test:coverage
```

#### 성능 분석

```bash
# 번들 크기 분석
pnpm build:analyze

# Lighthouse 성능 측정
pnpm perf:lighthouse
```

### 9.2 프로젝트 설정

```bash
# 전체 프로젝트 설정 (처음 설정 시)
pnpm setup

# 캐시 정리
pnpm clean

# 전체 재설정
pnpm reset
```

### 9.3 Git 워크플로우

#### 브랜치 전략

```bash
# 기능 브랜치 생성
git checkout -b feature/user-authentication
git checkout -b fix/login-error
git checkout -b docs/update-readme

# 커밋 메시지 컨벤션
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login error"
git commit -m "docs: update README"
```

#### 커밋 전 검사

```bash
# 커밋 전 품질 검사 실행
pnpm quality

# 스테이징된 파일만 포맷팅
pnpm lint-staged
```

### 9.4 환경 변수 관리

```bash
# .env.local 파일 생성
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
```

---

## 10. 성능 최적화

### 10.1 Next.js 최적화 설정

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  experimental: {
    // 패키지 임포트 최적화
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-slot',
      'react-hook-form',
      'zod',
    ],
    // CSS 최적화
    optimizeCss: true,
  },

  compiler: {
    // 프로덕션에서 console.log 제거
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
}
```

### 10.2 번들 최적화

```typescript
// 동적 임포트로 코드 분할
const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <Skeleton />,
  ssr: false, // 클라이언트에서만 로드
})

// 라이브러리 지연 로딩
const loadDateLibrary = () => import('date-fns')
```

### 10.3 캐싱 전략

```typescript
// 정적 데이터 캐싱
export const getStaticData = unstable_cache(
  async () => {
    return await fetchStaticData()
  },
  ['static-data'],
  { revalidate: 86400 } // 24시간
)

// 사용자별 데이터 캐싱
export const getUserData = unstable_cache(
  async (userId: string) => {
    return await fetchUserData(userId)
  },
  ['user-data'],
  {
    tags: ['user'],
    revalidate: 3600, // 1시간
  }
)
```

### 10.4 성능 모니터링

```typescript
// 성능 메트릭 수집
export function reportWebVitals(metric: NextWebVitalsMetric) {
  switch (metric.name) {
    case 'CLS':
    case 'FID':
    case 'FCP':
    case 'LCP':
    case 'TTFB':
      // 메트릭을 분석 서비스로 전송
      console.log(metric)
      break
    default:
      break
  }
}
```

### 10.5 이미지 최적화

```typescript
// Next.js Image 컴포넌트 사용
import Image from 'next/image'

<Image
  src="/hero-image.jpg"
  alt="Hero Image"
  width={1200}
  height={600}
  priority // LCP 이미지에 사용
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// 반응형 이미지
<Image
  src="/responsive-image.jpg"
  alt="Responsive Image"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

### 10.6 폰트 최적화

```typescript
// next/font 사용
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}
```

---

## 결론

이 가이드는 LagomPath 프로젝트의 모든 핵심 요소를 다루며, 현대적인 Next.js 15 애플리케이션 개발을 위한 완전한 참조 자료입니다.

### 주요 장점

- **타입 안전성**: TypeScript 엄격 모드로 런타임 오류 방지
- **개발자 경험**: 포괄적인 도구 체인과 자동화
- **성능 최적화**: 최신 Next.js 기능 활용
- **확장성**: 모듈화된 아키텍처
- **유지보수성**: 일관된 코딩 컨벤션과 패턴

### 권장 개발 프로세스

1. **설계 단계**: 요구사항 분석 및 아키텍처 설계
2. **개발 단계**: 컴포넌트 기반 개발 및 테스트 작성
3. **품질 검사**: ESLint, Prettier, TypeScript 검사
4. **성능 최적화**: 번들 분석 및 최적화
5. **배포**: 프로덕션 빌드 및 배포

이 가이드를 참조하여 고품질의 현대적인 웹 애플리케이션을 개발하시기 바랍니다.
