import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 시드 데이터 생성 시작...')

  // 기존 포스트 삭제 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    await prisma.post.deleteMany()
    console.log('기존 포스트 데이터 삭제 완료')
  }

  // 첫 번째 사용자 찾기 또는 생성
  let user = await prisma.user.findFirst()

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: '테스트 사용자',
        email: 'test@example.com',
        displayName: '테스트 사용자',
      },
    })
    console.log('테스트 사용자 생성 완료')
  }

  // 샘플 포스트 데이터
  const samplePosts = [
    {
      title: 'Next.js 15와 App Router 시작하기',
      content: `
        <h1>Next.js 15 소개</h1>
        <p>Next.js 15는 React 19와 함께 출시된 최신 버전으로, 많은 새로운 기능과 개선사항을 제공합니다.</p>
        
        <h2>주요 기능</h2>
        <ul>
          <li><strong>App Router</strong>: 새로운 라우팅 시스템</li>
          <li><strong>Server Components</strong>: 서버 사이드 렌더링 개선</li>
          <li><strong>Turbopack</strong>: 빠른 번들러</li>
        </ul>
        
        <h3>시작하기</h3>
        <p>새로운 Next.js 프로젝트를 시작하려면 다음 명령어를 사용하세요:</p>
        <p><code>npx create-next-app@latest my-app</code></p>
        
        <p>이 가이드를 통해 Next.js 15의 강력한 기능들을 활용해보세요!</p>
      `,
      excerpt:
        'Next.js 15의 새로운 기능들과 App Router를 활용한 개발 방법을 알아보세요.',
      published: true,
    },
    {
      title: 'React 19의 새로운 기능들',
      content: `
        <h1>React 19 새로운 기능</h1>
        <p>React 19에서 도입된 혁신적인 기능들을 살펴보겠습니다.</p>
        
        <h2>React Compiler</h2>
        <p>자동 최적화를 통해 성능을 크게 향상시킵니다.</p>
        
        <h2>Server Components</h2>
        <p>서버에서 실행되는 컴포넌트로 초기 로딩 속도를 개선합니다.</p>
        
        <h3>사용 예시</h3>
        <p>다음은 Server Component의 간단한 예시입니다:</p>
        
        <p>이러한 기능들로 React 애플리케이션의 성능과 개발 경험이 크게 향상되었습니다.</p>
      `,
      excerpt:
        'React 19에서 새롭게 도입된 컴파일러와 Server Components 등의 기능을 소개합니다.',
      published: true,
    },
    {
      title: 'TypeScript 5.8의 새로운 기능',
      content: `
        <h1>TypeScript 5.8 업데이트</h1>
        <p>TypeScript 5.8에서 추가된 새로운 기능들을 알아보겠습니다.</p>
        
        <h2>향상된 타입 추론</h2>
        <p>더욱 정확하고 스마트한 타입 추론이 가능해졌습니다.</p>
        
        <h2>성능 개선</h2>
        <ul>
          <li>컴파일 속도 향상</li>
          <li>메모리 사용량 최적화</li>
          <li>IDE 반응성 개선</li>
        </ul>
        
        <h3>새로운 유틸리티 타입</h3>
        <p>개발자들이 자주 사용하는 패턴을 위한 새로운 유틸리티 타입들이 추가되었습니다.</p>
        
        <p>이번 업데이트로 TypeScript 개발 경험이 한층 더 향상되었습니다.</p>
      `,
      excerpt:
        'TypeScript 5.8의 향상된 타입 추론과 성능 개선 사항들을 살펴봅니다.',
      published: true,
    },
    {
      title: 'Tailwind CSS 4.0 베타 리뷰',
      content: `
        <h1>Tailwind CSS 4.0 베타</h1>
        <p>Tailwind CSS 4.0 베타 버전의 주요 변경사항을 살펴보겠습니다.</p>
        
        <h2>새로운 엔진</h2>
        <p>완전히 새로 작성된 엔진으로 더 빠른 빌드 속도를 제공합니다.</p>
        
        <h2>CSS 변수 지원</h2>
        <p>네이티브 CSS 변수를 활용한 더 유연한 테마 시스템을 지원합니다.</p>
        
        <h3>마이그레이션 가이드</h3>
        <ul>
          <li>기존 프로젝트 업그레이드 방법</li>
          <li>주요 변경사항 대응</li>
          <li>새로운 기능 활용법</li>
        </ul>
        
        <p>Tailwind CSS 4.0으로 더욱 효율적인 스타일링을 경험해보세요!</p>
      `,
      excerpt:
        'Tailwind CSS 4.0 베타의 새로운 엔진과 CSS 변수 지원 등의 기능을 리뷰합니다.',
      published: true,
    },
    {
      title: 'Prisma ORM 완벽 가이드',
      content: `
        <h1>Prisma ORM 시작하기</h1>
        <p>Prisma는 현대적인 데이터베이스 툴킷으로, 타입 안전한 데이터베이스 액세스를 제공합니다.</p>
        
        <h2>주요 특징</h2>
        <ul>
          <li><strong>타입 안전성</strong>: TypeScript와 완벽한 통합</li>
          <li><strong>자동 마이그레이션</strong>: 스키마 변경 자동 관리</li>
          <li><strong>직관적인 API</strong>: 쉽고 명확한 쿼리 작성</li>
        </ul>
        
        <h3>설치 및 설정</h3>
        <p>Prisma를 프로젝트에 설치하고 설정하는 방법을 알아보겠습니다.</p>
        
        <h3>스키마 정의</h3>
        <p>데이터베이스 스키마를 Prisma 스키마 언어로 정의하는 방법입니다.</p>
        
        <p>Prisma를 활용하여 효율적인 데이터베이스 작업을 시작해보세요!</p>
      `,
      excerpt:
        'Prisma ORM의 설치부터 스키마 정의까지 완벽한 가이드를 제공합니다.',
      published: true,
    },
    {
      title: '웹 성능 최적화 전략',
      content: `
        <h1>웹 성능 최적화</h1>
        <p>사용자 경험을 향상시키는 웹 성능 최적화 전략들을 알아보겠습니다.</p>
        
        <h2>Core Web Vitals</h2>
        <ul>
          <li><strong>LCP</strong>: Largest Contentful Paint</li>
          <li><strong>FID</strong>: First Input Delay</li>
          <li><strong>CLS</strong>: Cumulative Layout Shift</li>
        </ul>
        
        <h3>이미지 최적화</h3>
        <p>Next.js Image 컴포넌트를 활용한 이미지 최적화 방법입니다.</p>
        
        <h3>코드 분할</h3>
        <p>동적 임포트를 통한 번들 크기 최적화 기법을 소개합니다.</p>
        
        <h3>캐싱 전략</h3>
        <p>효과적인 캐싱으로 로딩 속도를 개선하는 방법들입니다.</p>
        
        <p>이러한 최적화 기법들로 더 빠른 웹사이트를 만들어보세요!</p>
      `,
      excerpt:
        'Core Web Vitals 개선과 이미지 최적화 등 웹 성능 향상을 위한 실용적인 전략들을 소개합니다.',
      published: true,
    },
    {
      title: '모던 CSS 기법들',
      content: `
        <h1>모던 CSS 기법</h1>
        <p>최신 CSS 기능들을 활용한 모던 웹 개발 기법들을 살펴보겠습니다.</p>
        
        <h2>CSS Grid와 Flexbox</h2>
        <p>레이아웃을 위한 강력한 도구들의 활용법을 알아봅니다.</p>
        
        <h2>CSS 변수 (Custom Properties)</h2>
        <p>동적 스타일링과 테마 시스템 구축에 활용하는 방법입니다.</p>
        
        <h3>Container Queries</h3>
        <p>반응형 디자인의 새로운 패러다임을 제시하는 Container Queries입니다.</p>
        
        <h3>CSS-in-JS vs CSS Modules</h3>
        <p>각각의 장단점과 적절한 사용 시나리오를 비교해봅니다.</p>
        
        <p>이러한 모던 CSS 기법들로 더 효율적인 스타일링을 경험해보세요!</p>
      `,
      excerpt:
        'CSS Grid, Flexbox, CSS 변수 등 최신 CSS 기능들을 활용한 모던 웹 개발 기법을 소개합니다.',
      published: true,
    },
    {
      title: 'JavaScript ES2024 새로운 기능들',
      content: `
        <h1>JavaScript ES2024</h1>
        <p>ES2024(ES15)에서 새롭게 추가된 JavaScript 기능들을 살펴보겠습니다.</p>
        
        <h2>새로운 Array 메서드들</h2>
        <ul>
          <li><code>Array.prototype.toReversed()</code></li>
          <li><code>Array.prototype.toSorted()</code></li>
          <li><code>Array.prototype.toSpliced()</code></li>
        </ul>
        
        <h3>Temporal API</h3>
        <p>날짜와 시간 처리를 위한 새로운 API가 도입되었습니다.</p>
        
        <h3>Pattern Matching</h3>
        <p>함수형 프로그래밍 패러다임을 지원하는 패턴 매칭 기능입니다.</p>
        
        <h3>Record & Tuple</h3>
        <p>불변 데이터 구조를 위한 새로운 타입들이 추가되었습니다.</p>
        
        <p>이러한 새로운 기능들로 더 표현력 있는 JavaScript 코드를 작성해보세요!</p>
      `,
      excerpt:
        'ES2024에서 새롭게 추가된 Array 메서드, Temporal API, Pattern Matching 등의 기능을 소개합니다.',
      published: true,
    },
  ]

  // 포스트 생성
  for (const postData of samplePosts) {
    await prisma.post.create({
      data: {
        ...postData,
        authorId: user.id,
      },
    })
  }

  console.log(`✅ ${samplePosts.length}개의 샘플 포스트 생성 완료`)
  console.log('🎉 시드 데이터 생성 완료!')
}

main()
  .catch(e => {
    console.error('❌ 시드 데이터 생성 실패:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
