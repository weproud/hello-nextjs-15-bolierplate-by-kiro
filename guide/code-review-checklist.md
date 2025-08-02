# 코드 리뷰 체크리스트

Next.js 15 Best Practice 프로젝트의 코드 리뷰를 위한 포괄적인 체크리스트입니다.

## 📋 일반 사항

### ✅ 기본 요구사항

- [ ] 코드가 요구사항을 충족하는가?
- [ ] 기능이 예상대로 작동하는가?
- [ ] 에지 케이스가 적절히 처리되었는가?
- [ ] 성능에 부정적인 영향이 없는가?
- [ ] 보안 취약점이 없는가?

### ✅ 코드 품질

- [ ] 코드가 읽기 쉽고 이해하기 쉬운가?
- [ ] 적절한 주석이 있는가?
- [ ] 함수와 변수명이 명확한가?
- [ ] 코드 중복이 최소화되었는가?
- [ ] SOLID 원칙을 따르고 있는가?

## 🏗️ 아키텍처 및 구조

### ✅ 프로젝트 구조

- [ ] 파일이 적절한 디렉토리에 위치하는가?
- [ ] 파일명이 kebab-case 규칙을 따르는가?
- [ ] 컴포넌트가 기능별로 적절히 그룹화되었는가?
- [ ] 절대 경로 임포트를 사용하고 있는가?

### ✅ 컴포넌트 아키텍처

- [ ] Server Components First 접근법을 따르고 있는가?
- [ ] `"use client"`가 필요한 곳에만 사용되었는가?
- [ ] 컴포넌트가 단일 책임 원칙을 따르는가?
- [ ] Props 인터페이스가 명확히 정의되었는가?

```typescript
// ✅ 좋은 예
interface UserProfileProps {
  user: User
  onUpdate?: (user: User) => void
  className?: string
}

export function UserProfile({ user, onUpdate, className }: UserProfileProps) {
  // 구현...
}

// ❌ 나쁜 예
export function UserProfile(props: any) {
  // 구현...
}
```

## 🔧 TypeScript

### ✅ 타입 안전성

- [ ] `any` 타입 사용을 피했는가?
- [ ] 적절한 타입 정의가 있는가?
- [ ] 타입 가드를 사용했는가?
- [ ] 제네릭을 적절히 활용했는가?

```typescript
// ✅ 좋은 예
interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj
}

// ❌ 나쁜 예
function processData(data: any): any {
  return data.someProperty
}
```

### ✅ 타입 임포트

- [ ] 타입 전용 임포트에 `type` 키워드를 사용했는가?
- [ ] 중앙화된 타입 정의를 사용하고 있는가?

```typescript
// ✅ 좋은 예
import type { User, Project } from '@/types'
import { Button } from '@/components/ui/button'

// ❌ 나쁜 예
import { User, Project, Button } from '@/components'
```

## ⚛️ React 및 Next.js

### ✅ React 패턴

- [ ] 적절한 훅을 사용했는가?
- [ ] 의존성 배열이 올바르게 설정되었는가?
- [ ] 메모이제이션이 필요한 곳에 적용되었는가?
- [ ] 컴포넌트가 순수 함수인가?

```typescript
// ✅ 좋은 예
const MemoizedComponent = memo(function Component({ data }: Props) {
  const processedData = useMemo(() =>
    expensiveCalculation(data),
    [data]
  )

  const handleClick = useCallback(() => {
    // 핸들러 로직
  }, [])

  return <div>{processedData}</div>
})

// ❌ 나쁜 예
function Component({ data }: Props) {
  const processedData = expensiveCalculation(data) // 매번 실행

  return <div onClick={() => {}}>{processedData}</div> // 새로운 함수 생성
}
```

### ✅ Next.js 특화

- [ ] App Router 패턴을 올바르게 사용했는가?
- [ ] 적절한 메타데이터가 설정되었는가?
- [ ] 이미지 최적화를 위해 Next.js Image를 사용했는가?
- [ ] 동적 임포트를 적절히 활용했는가?

```typescript
// ✅ 좋은 예
import dynamic from 'next/dynamic'
import { OptimizedImage } from '@/components/ui/optimized-image'

const LazyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <Skeleton />,
  ssr: false
})

// ❌ 나쁜 예
import HeavyComponent from './heavy-component' // 항상 로드됨
import Image from 'next/image'
<img src="/image.jpg" alt="image" /> // 최적화되지 않음
```

## 🎨 스타일링

### ✅ Tailwind CSS

- [ ] Tailwind 유틸리티 클래스를 우선 사용했는가?
- [ ] `cn()` 함수를 사용해 클래스를 병합했는가?
- [ ] 반응형 클래스를 적절히 사용했는가?
- [ ] 커스텀 CSS가 정말 필요한 경우에만 사용했는가?

```typescript
// ✅ 좋은 예
import { cn } from '@/lib/utils'

function Component({ className, variant }: Props) {
  return (
    <div className={cn(
      'base-styles',
      'md:responsive-styles',
      variant === 'primary' && 'primary-styles',
      className
    )}>
      Content
    </div>
  )
}

// ❌ 나쁜 예
function Component({ className }: Props) {
  return (
    <div className={`base-styles ${className}`}>
      Content
    </div>
  )
}
```

### ✅ shadcn/ui 컴포넌트

- [ ] 기존 shadcn/ui 컴포넌트를 재사용했는가?
- [ ] 컴포넌트 변형(variants)을 적절히 활용했는가?
- [ ] 일관된 디자인 시스템을 따르고 있는가?

## 📝 폼 처리

### ✅ React Hook Form + Zod

- [ ] `useFormWithAction` 훅을 사용했는가?
- [ ] Zod 스키마로 검증을 정의했는가?
- [ ] 에러 메시지가 사용자 친화적인가?
- [ ] 폼 상태가 적절히 관리되고 있는가?

```typescript
// ✅ 좋은 예
const schema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
})

function LoginForm() {
  const { form, handleSubmit, isLoading } = useFormWithAction(
    schema,
    loginAction,
    {
      successMessage: '로그인되었습니다',
      onSuccess: () => router.push('/dashboard')
    }
  )

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>이메일</FormLabel>
            <FormControl>
              <Input {...field} type="email" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '로그인 중...' : '로그인'}
      </Button>
    </form>
  )
}
```

## 🔄 상태 관리

### ✅ Zustand

- [ ] 전역 상태가 정말 필요한가?
- [ ] 스토어가 적절히 분리되었는가?
- [ ] Immer 미들웨어를 사용했는가?
- [ ] 액션과 상태가 명확히 분리되었는가?

```typescript
// ✅ 좋은 예
interface AppState {
  user: User | null
  theme: Theme
}

interface AppActions {
  setUser: (user: User | null) => void
  setTheme: (theme: Theme) => void
}

export const useAppStore = create<AppState & AppActions>()(
  immer(set => ({
    user: null,
    theme: 'system',
    setUser: user =>
      set(state => {
        state.user = user
      }),
    setTheme: theme =>
      set(state => {
        state.theme = theme
      }),
  }))
)
```

## 🛡️ 에러 처리

### ✅ 에러 바운더리

- [ ] 적절한 레벨에서 에러 바운더리를 사용했는가?
- [ ] 에러 폴백 UI가 사용자 친화적인가?
- [ ] 에러 복구 메커니즘이 있는가?

```typescript
// ✅ 좋은 예
<UnifiedErrorBoundary level="component" name="UserProfile">
  <UserProfile user={user} />
</UnifiedErrorBoundary>
```

### ✅ 서버 액션 에러 처리

- [ ] `next-safe-action`을 사용했는가?
- [ ] 적절한 에러 메시지를 반환하는가?
- [ ] 인증 에러를 적절히 처리했는가?

## 🗄️ 데이터베이스

### ✅ Prisma

- [ ] Repository 패턴을 사용했는가?
- [ ] N+1 쿼리 문제를 피했는가?
- [ ] 필요한 필드만 선택했는가?
- [ ] 적절한 인덱스가 있는가?

```typescript
// ✅ 좋은 예
async findPostsWithAuthors() {
  return await this.model.findMany({
    select: {
      id: true,
      title: true,
      excerpt: true,
      author: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })
}

// ❌ 나쁜 예
async findPostsWithAuthors() {
  const posts = await this.model.findMany()
  for (const post of posts) {
    post.author = await prisma.user.findUnique({
      where: { id: post.authorId }
    })
  }
  return posts
}
```

## 🚀 성능

### ✅ 최적화

- [ ] 불필요한 리렌더링을 방지했는가?
- [ ] 큰 목록에서 가상화를 고려했는가?
- [ ] 이미지가 최적화되었는가?
- [ ] 번들 크기가 적절한가?

### ✅ 캐싱

- [ ] 적절한 캐싱 전략을 사용했는가?
- [ ] 캐시 무효화가 올바르게 구현되었는가?

```typescript
// ✅ 좋은 예
export const getCachedPosts = unstable_cache(
  async (page: number) => {
    return await postRepository.findMany({
      take: 10,
      skip: (page - 1) * 10,
    })
  },
  ['posts'],
  {
    revalidate: 60,
    tags: ['posts'],
  }
)
```

## ♿ 접근성

### ✅ ARIA 및 시맨틱

- [ ] 적절한 ARIA 속성을 사용했는가?
- [ ] 시맨틱 HTML을 사용했는가?
- [ ] 키보드 네비게이션이 가능한가?
- [ ] 색상 대비가 충분한가?

```typescript
// ✅ 좋은 예
<button
  aria-label="사용자 메뉴 열기"
  aria-expanded={isOpen}
  aria-controls="user-menu"
  onClick={toggleMenu}
>
  <UserIcon />
</button>

<div
  id="user-menu"
  role="menu"
  aria-labelledby="user-menu-button"
  hidden={!isOpen}
>
  {/* 메뉴 아이템들 */}
</div>
```

## 🧪 테스트

### ✅ 테스트 커버리지

- [ ] 주요 기능에 대한 테스트가 있는가?
- [ ] 에지 케이스가 테스트되었는가?
- [ ] 테스트가 독립적이고 반복 가능한가?
- [ ] 테스트 이름이 명확한가?

```typescript
// ✅ 좋은 예
describe('UserProfile', () => {
  it('should display user information correctly', () => {
    const user = { name: 'John Doe', email: 'john@example.com' }
    render(<UserProfile user={user} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('should handle missing user data gracefully', () => {
    render(<UserProfile user={null} />)

    expect(screen.getByText('사용자 정보를 불러올 수 없습니다')).toBeInTheDocument()
  })
})
```

## 🔒 보안

### ✅ 보안 체크

- [ ] 사용자 입력이 적절히 검증되었는가?
- [ ] XSS 공격을 방지했는가?
- [ ] CSRF 보호가 있는가?
- [ ] 민감한 정보가 클라이언트에 노출되지 않는가?

```typescript
// ✅ 좋은 예
export const createPostAction = authActionClient
  .schema(createPostSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { userId } = ctx // 인증된 사용자만 접근 가능

    // 입력 검증은 Zod 스키마로 자동 처리
    const post = await postRepository.create({
      ...parsedInput,
      authorId: userId,
    })

    return { post }
  })
```

## 📚 문서화

### ✅ 코드 문서화

- [ ] 복잡한 로직에 주석이 있는가?
- [ ] JSDoc 주석이 적절히 작성되었는가?
- [ ] README가 업데이트되었는가?
- [ ] 타입 정의가 명확한가?

```typescript
// ✅ 좋은 예
/**
 * 사용자의 프로젝트 목록을 페이지네이션과 함께 조회합니다.
 *
 * @param userId - 조회할 사용자 ID
 * @param page - 페이지 번호 (1부터 시작)
 * @param limit - 페이지당 항목 수
 * @returns 프로젝트 목록과 페이지네이션 정보
 */
async function getUserProjects(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Project>> {
  // 구현...
}
```

## 🔄 Git 및 커밋

### ✅ 커밋 메시지

- [ ] 커밋 메시지가 명확하고 설명적인가?
- [ ] 컨벤셔널 커밋 형식을 따르는가?
- [ ] 변경사항이 논리적으로 그룹화되었는가?

```bash
# ✅ 좋은 예
feat(auth): add Google OAuth login functionality
fix(ui): resolve button hover state issue
docs(readme): update installation instructions

# ❌ 나쁜 예
update stuff
fix bug
wip
```

## 📋 최종 체크리스트

### ✅ 배포 전 확인사항

- [ ] 모든 테스트가 통과하는가?
- [ ] 빌드가 성공하는가?
- [ ] 타입 체크가 통과하는가?
- [ ] 린트 에러가 없는가?
- [ ] 성능 회귀가 없는가?
- [ ] 브라우저 호환성이 확인되었는가?

### ✅ 코드 리뷰 완료

- [ ] 모든 피드백이 반영되었는가?
- [ ] 추가 테스트가 필요한가?
- [ ] 문서 업데이트가 필요한가?
- [ ] 다른 팀원에게 공유할 내용이 있는가?

---

## 🎯 리뷰어를 위한 팁

1. **건설적인 피드백**: 문제점을 지적할 때는 해결 방안도 함께 제시
2. **우선순위 표시**: 중요한 이슈와 사소한 개선사항을 구분
3. **칭찬도 함께**: 좋은 코드나 개선사항에 대해서도 언급
4. **학습 기회**: 새로운 패턴이나 기법을 공유할 기회로 활용

## 📖 참고 자료

- [Next.js 15 Best Practices](https://nextjs.org/docs)
- [React 19 Guidelines](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)
