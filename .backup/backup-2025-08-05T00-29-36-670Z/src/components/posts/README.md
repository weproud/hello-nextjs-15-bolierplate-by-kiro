# 포스트 컴포넌트 문서

블로그 포스트 관련 기능을 담당하는 컴포넌트들입니다. 포스트 작성, 편집, 목록 표시, 상세 보기 등의
기능을 제공합니다.

## 주요 컴포넌트

### PostForm

포스트 작성 및 편집을 위한 폼 컴포넌트입니다.

```typescript
import { PostForm } from '@/components/posts/post-form'

// 새 포스트 작성
<PostForm
  onSubmit={handleCreatePost}
  submitText="포스트 작성"
/>

// 기존 포스트 편집
<PostForm
  initialData={existingPost}
  onSubmit={handleUpdatePost}
  submitText="포스트 수정"
  mode="edit"
/>

// 커스텀 설정
<PostForm
  onSubmit={handleSubmit}
  showPreview={true}
  autoSave={true}
  enableDrafts={true}
  maxLength={5000}
/>
```

**Props:**

- `initialData?: Partial<Post>` - 초기 데이터 (편집 모드)
- `onSubmit: (data: PostFormData) => Promise<void>` - 제출 콜백
- `submitText?: string` - 제출 버튼 텍스트
- `mode?: 'create' | 'edit'` - 폼 모드
- `showPreview?: boolean` - 미리보기 표시 여부
- `autoSave?: boolean` - 자동 저장 활성화
- `enableDrafts?: boolean` - 임시저장 기능 활성화
- `maxLength?: number` - 최대 글자 수 제한

### PostCard

포스트 목록에서 사용되는 카드 컴포넌트입니다.

```typescript
import { PostCard } from '@/components/posts/post-card'

// 기본 사용법
<PostCard
  post={post}
  onClick={() => router.push(`/posts/${post.id}`)}
/>

// 커스텀 액션 버튼
<PostCard
  post={post}
  showActions={true}
  actions={[
    { label: '편집', onClick: () => editPost(post.id) },
    { label: '삭제', onClick: () => deletePost(post.id), variant: 'destructive' }
  ]}
/>

// 컴팩트 모드
<PostCard
  post={post}
  variant="compact"
  showExcerpt={false}
  showTags={false}
/>

// 그리드 레이아웃용
<PostCard
  post={post}
  variant="grid"
  aspectRatio="16:9"
  showImage={true}
/>
```

**Props:**

- `post: Post` - 포스트 데이터
- `variant?: 'default' | 'compact' | 'grid'` - 카드 스타일
- `onClick?: () => void` - 클릭 이벤트 핸들러
- `showActions?: boolean` - 액션 버튼 표시 여부
- `actions?: CardAction[]` - 커스텀 액션 버튼들
- `showExcerpt?: boolean` - 요약 표시 여부
- `showTags?: boolean` - 태그 표시 여부
- `showImage?: boolean` - 이미지 표시 여부
- `aspectRatio?: string` - 이미지 비율

### InfinitePostList

무한 스크롤을 지원하는 포스트 목록 컴포넌트입니다.

```typescript
import { InfinitePostList } from '@/components/posts/infinite-post-list'

// 기본 사용법
<InfinitePostList />

// 필터링된 목록
<InfinitePostList
  filters={{
    category: 'tech',
    tags: ['react', 'nextjs'],
    author: 'user-id'
  }}
/>

// 커스텀 레이아웃
<InfinitePostList
  layout="grid"
  columns={{ sm: 1, md: 2, lg: 3 }}
  cardVariant="grid"
/>

// 검색 기능 포함
<InfinitePostList
  searchable={true}
  searchPlaceholder="포스트 검색..."
  onSearch={handleSearch}
/>
```

**Props:**

- `filters?: PostFilters` - 필터 조건
- `layout?: 'list' | 'grid'` - 레이아웃 타입
- `columns?: ResponsiveValue<number>` - 그리드 컬럼 수
- `cardVariant?: CardVariant` - 카드 스타일
- `searchable?: boolean` - 검색 기능 활성화
- `searchPlaceholder?: string` - 검색 플레이스홀더
- `onSearch?: (query: string) => void` - 검색 콜백
- `pageSize?: number` - 페이지당 아이템 수

### PostContent

포스트 상세 내용을 표시하는 컴포넌트입니다.

```typescript
import { PostContent } from '@/components/posts/post-content'

// 기본 사용법
<PostContent post={post} />

// 편집 권한이 있는 경우
<PostContent
  post={post}
  canEdit={true}
  onEdit={() => router.push(`/posts/${post.id}/edit`)}
  onDelete={() => handleDelete(post.id)}
/>

// 댓글 기능 포함
<PostContent
  post={post}
  showComments={true}
  commentsEnabled={true}
/>

// 공유 기능 포함
<PostContent
  post={post}
  showShare={true}
  shareOptions={['twitter', 'facebook', 'linkedin', 'copy']}
/>
```

**Props:**

- `post: Post` - 포스트 데이터
- `canEdit?: boolean` - 편집 권한 여부
- `onEdit?: () => void` - 편집 버튼 클릭 핸들러
- `onDelete?: () => void` - 삭제 버튼 클릭 핸들러
- `showComments?: boolean` - 댓글 섹션 표시 여부
- `commentsEnabled?: boolean` - 댓글 작성 가능 여부
- `showShare?: boolean` - 공유 버튼 표시 여부
- `shareOptions?: ShareOption[]` - 공유 옵션들

## 고급 기능

### 포스트 검색

```typescript
import { PostSearch } from '@/components/posts/post-search'

<PostSearch
  onSearch={handleSearch}
  filters={[
    { key: 'category', label: '카테고리', options: categories },
    { key: 'tags', label: '태그', options: tags, multiple: true },
    { key: 'author', label: '작성자', options: authors }
  ]}
  sortOptions={[
    { key: 'createdAt', label: '최신순' },
    { key: 'title', label: '제목순' },
    { key: 'views', label: '조회수순' }
  ]}
/>
```

### 포스트 통계

```typescript
import { PostStats } from '@/components/posts/post-stats'

<PostStats
  post={post}
  showViews={true}
  showLikes={true}
  showComments={true}
  showShares={true}
  onLike={handleLike}
  onShare={handleShare}
/>
```

### 관련 포스트

```typescript
import { RelatedPosts } from '@/components/posts/related-posts'

<RelatedPosts
  currentPost={post}
  maxItems={3}
  algorithm="tags" // 'tags' | 'category' | 'author'
/>
```

## 폼 통합

### React Hook Form과 Zod 검증

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { postSchema } from '@/lib/validations/post'

const postSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목은 100자 이하로 입력해주세요'),
  content: z.string().min(10, '내용을 10자 이상 입력해주세요'),
  excerpt: z.string().max(200, '요약은 200자 이하로 입력해주세요').optional(),
  tags: z.array(z.string()).max(5, '태그는 최대 5개까지 선택할 수 있습니다'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  published: z.boolean().default(false)
})

function PostFormExample() {
  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      tags: [],
      category: '',
      published: false
    }
  })

  return (
    <PostForm
      form={form}
      onSubmit={form.handleSubmit(handleSubmit)}
    />
  )
}
```

### 서버 액션 통합

```typescript
import { createPost, updatePost } from '@/lib/actions/post-actions'
import { useAction } from 'next-safe-action/hooks'

function PostFormWithAction() {
  const { execute: createPostAction, isExecuting } = useAction(createPost)

  const handleSubmit = async (data: PostFormData) => {
    const result = await createPostAction(data)

    if (result?.data) {
      router.push(`/posts/${result.data.id}`)
    }
  }

  return (
    <PostForm
      onSubmit={handleSubmit}
      isLoading={isExecuting}
    />
  )
}
```

## 상태 관리

### Zustand 스토어 통합

```typescript
import { usePostsStore } from '@/store/posts-store'

function PostListWithStore() {
  const {
    posts,
    isLoading,
    fetchPosts,
    addPost,
    updatePost,
    deletePost
  } = usePostsStore()

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return (
    <InfinitePostList
      posts={posts}
      isLoading={isLoading}
      onLoadMore={fetchPosts}
    />
  )
}
```

## 성능 최적화

### 가상화된 목록

```typescript
import { FixedSizeList as List } from 'react-window'

function VirtualizedPostList({ posts }: { posts: Post[] }) {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <PostCard post={posts[index]} variant="compact" />
    </div>
  )

  return (
    <List
      height={600}
      itemCount={posts.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

### 이미지 최적화

```typescript
import { OptimizedImage } from '@/components/ui/optimized-image'

function PostCardWithOptimizedImage({ post }: { post: Post }) {
  return (
    <Card>
      {post.image && (
        <OptimizedImage
          src={post.image}
          alt={post.title}
          width={400}
          height={200}
          className="rounded-t-lg object-cover"
          priority={false}
        />
      )}
      <CardContent>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
      </CardContent>
    </Card>
  )
}
```

## 접근성 기능

### 키보드 네비게이션

```typescript
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'

function AccessiblePostCard({ post }: { post: Post }) {
  const { handleKeyDown } = useKeyboardNavigation({
    onEnter: () => router.push(`/posts/${post.id}`),
    onSpace: () => router.push(`/posts/${post.id}`)
  })

  return (
    <Card
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="article"
      aria-labelledby={`post-title-${post.id}`}
    >
      <CardHeader>
        <CardTitle id={`post-title-${post.id}`}>
          {post.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p aria-describedby={`post-excerpt-${post.id}`}>
          {post.excerpt}
        </p>
      </CardContent>
    </Card>
  )
}
```

### 스크린 리더 지원

```typescript
function AccessiblePostList({ posts }: { posts: Post[] }) {
  return (
    <section
      role="main"
      aria-label="블로그 포스트 목록"
      aria-live="polite"
    >
      <h1>최신 포스트</h1>
      <div role="list" aria-label={`총 ${posts.length}개의 포스트`}>
        {posts.map((post, index) => (
          <div key={post.id} role="listitem">
            <PostCard
              post={post}
              aria-posinset={index + 1}
              aria-setsize={posts.length}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
```

## 테스트 예제

### 컴포넌트 테스트

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PostCard } from '../post-card'

const mockPost = {
  id: '1',
  title: '테스트 포스트',
  excerpt: '테스트 요약',
  content: '테스트 내용',
  author: { name: '작성자', email: 'author@example.com' },
  createdAt: new Date(),
  updatedAt: new Date(),
  published: true
}

describe('PostCard', () => {
  it('포스트 정보를 올바르게 렌더링한다', () => {
    render(<PostCard post={mockPost} />)

    expect(screen.getByText('테스트 포스트')).toBeInTheDocument()
    expect(screen.getByText('테스트 요약')).toBeInTheDocument()
    expect(screen.getByText('작성자')).toBeInTheDocument()
  })

  it('클릭 이벤트가 올바르게 작동한다', async () => {
    const handleClick = vi.fn()
    render(<PostCard post={mockPost} onClick={handleClick} />)

    await userEvent.click(screen.getByRole('article'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('액션 버튼들이 올바르게 렌더링된다', () => {
    const actions = [
      { label: '편집', onClick: vi.fn() },
      { label: '삭제', onClick: vi.fn() }
    ]

    render(<PostCard post={mockPost} showActions={true} actions={actions} />)

    expect(screen.getByText('편집')).toBeInTheDocument()
    expect(screen.getByText('삭제')).toBeInTheDocument()
  })
})
```

## 타입 정의

```typescript
// src/types/post.ts
export interface Post {
  id: string
  title: string
  content: string
  excerpt?: string
  image?: string
  published: boolean
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    name: string
    email: string
    image?: string
  }
  category?: {
    id: string
    name: string
    slug: string
  }
  tags: {
    id: string
    name: string
    slug: string
  }[]
  _count?: {
    comments: number
    likes: number
    views: number
  }
}

export interface PostFormData {
  title: string
  content: string
  excerpt?: string
  image?: string
  categoryId?: string
  tagIds: string[]
  published: boolean
}

export interface PostFilters {
  category?: string
  tags?: string[]
  author?: string
  published?: boolean
  search?: string
}
```

## 모범 사례

1. **성능**: 큰 목록에서는 가상화 사용
2. **접근성**: 적절한 ARIA 속성과 키보드 네비게이션 제공
3. **SEO**: 메타데이터와 구조화된 데이터 포함
4. **사용자 경험**: 로딩 상태와 에러 처리 제공
5. **반응형**: 모든 화면 크기에서 최적화된 레이아웃
