# Posts Components

이 디렉토리는 블로그 포스트 관련 컴포넌트들을 포함합니다.

## 컴포넌트 구조

### 핵심 컴포넌트

- **post-form.tsx** - 포스트 작성/편집 폼 컴포넌트
- **post-card.tsx** - 포스트 카드 컴포넌트 (목록에서 사용)
- **post-list.tsx** - 포스트 목록 컴포넌트
- **infinite-post-list.tsx** - 무한 스크롤 포스트 목록 컴포넌트
- **post-content.tsx** - 포스트 상세 내용 표시 컴포넌트
- **post-meta.tsx** - 포스트 메타데이터 (작성자, 날짜 등) 컴포넌트

### 테스트 파일

- ****tests**/** - 컴포넌트 단위 테스트 파일들

## 사용 패턴

### 포스트 목록 페이지

```tsx
import { InfinitePostList } from '@/components/posts/infinite-post-list'

export default function PostsPage() {
  return <InfinitePostList />
}
```

### 포스트 작성 페이지

```tsx
import { PostForm } from '@/components/posts/post-form'

export default function NewPostPage() {
  return <PostForm />
}
```

### 포스트 상세 페이지

```tsx
import { PostContent } from '@/components/posts/post-content'

export default function PostDetailPage({ post }) {
  return <PostContent post={post} />
}
```

## 디자인 시스템

모든 컴포넌트는 다음을 준수합니다:

- **shadcn/ui** 컴포넌트 사용
- **Tailwind CSS** 스타일링
- **다크/라이트 테마** 지원
- **반응형 디자인** 적용
- **접근성 (a11y)** 고려

## 상태 관리

- **React Hook Form** - 폼 상태 관리
- **Zod** - 유효성 검사
- **Server Actions** - 서버 상태 관리
- **React Query/SWR** - 데이터 페칭 (필요시)

## 타입 정의

모든 컴포넌트는 `src/types/post.ts`에 정의된 타입을 사용합니다.
