# UI 컴포넌트 문서

shadcn/ui 기반의 재사용 가능한 UI 컴포넌트들입니다. 모든 컴포넌트는 TailwindCSS와 Radix UI를
기반으로 구축되었습니다.

## 기본 컴포넌트

### Button

다양한 스타일과 크기를 지원하는 버튼 컴포넌트입니다.

```typescript
import { Button } from '@/components/ui/button'

// 기본 사용법
<Button>Click me</Button>

// 다양한 variant
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// 다양한 크기
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>

// 비활성화 상태
<Button disabled>Disabled</Button>

// 로딩 상태
<Button disabled>
  <Spinner className="mr-2 h-4 w-4" />
  Loading...
</Button>
```

**Props:**

- `variant`: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
- `size`: 'default' | 'sm' | 'lg' | 'icon'
- `disabled`: boolean
- `onClick`: (event: MouseEvent) => void

### Input

텍스트 입력을 위한 기본 입력 컴포넌트입니다.

```typescript
import { Input } from '@/components/ui/input'

// 기본 사용법
<Input placeholder="Enter text..." />

// 타입 지정
<Input type="email" placeholder="Enter email..." />
<Input type="password" placeholder="Enter password..." />

// 비활성화 상태
<Input disabled placeholder="Disabled input" />

// 에러 상태
<Input className="border-destructive" placeholder="Error state" />
```

**Props:**

- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
- `placeholder`: string
- `disabled`: boolean
- `value`: string
- `onChange`: (event: ChangeEvent<HTMLInputElement>) => void

### Card

콘텐츠를 그룹화하는 카드 컴포넌트입니다.

```typescript
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## 폼 컴포넌트

### FormField

React Hook Form과 통합된 폼 필드 컴포넌트입니다.

```typescript
import { FormField, InputField, TextareaField } from '@/components/ui/form-field'
import { useForm } from 'react-hook-form'

function MyForm() {
  const form = useForm()

  return (
    <form>
      <InputField
        label="이름"
        name="name"
        placeholder="이름을 입력하세요"
        required
        form={form}
      />

      <TextareaField
        label="설명"
        name="description"
        placeholder="설명을 입력하세요"
        form={form}
      />
    </form>
  )
}
```

### Select

드롭다운 선택 컴포넌트입니다.

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

<Select>
  <SelectTrigger>
    <SelectValue placeholder="옵션을 선택하세요" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">옵션 1</SelectItem>
    <SelectItem value="option2">옵션 2</SelectItem>
    <SelectItem value="option3">옵션 3</SelectItem>
  </SelectContent>
</Select>
```

## 피드백 컴포넌트

### Alert

사용자에게 중요한 정보를 표시하는 알림 컴포넌트입니다.

```typescript
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

// 기본 알림
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>알림</AlertTitle>
  <AlertDescription>
    중요한 정보입니다.
  </AlertDescription>
</Alert>

// 에러 알림
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>오류</AlertTitle>
  <AlertDescription>
    문제가 발생했습니다.
  </AlertDescription>
</Alert>
```

### Dialog

모달 다이얼로그 컴포넌트입니다.

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>다이얼로그 열기</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>다이얼로그 제목</DialogTitle>
      <DialogDescription>
        다이얼로그 설명입니다.
      </DialogDescription>
    </DialogHeader>
    <div>다이얼로그 내용</div>
  </DialogContent>
</Dialog>
```

## 네비게이션 컴포넌트

### DropdownMenu

드롭다운 메뉴 컴포넌트입니다.

```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">메뉴</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>프로필</DropdownMenuItem>
    <DropdownMenuItem>설정</DropdownMenuItem>
    <DropdownMenuItem>로그아웃</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Breadcrumb

페이지 경로를 표시하는 브레드크럼 컴포넌트입니다.

```typescript
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">홈</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/projects">프로젝트</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>현재 페이지</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

## 데이터 표시 컴포넌트

### Table

테이블 데이터를 표시하는 컴포넌트입니다.

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>이름</TableHead>
      <TableHead>이메일</TableHead>
      <TableHead>역할</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>홍길동</TableCell>
      <TableCell>hong@example.com</TableCell>
      <TableCell>관리자</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Badge

상태나 카테고리를 표시하는 배지 컴포넌트입니다.

```typescript
import { Badge } from '@/components/ui/badge'

<Badge>기본</Badge>
<Badge variant="secondary">보조</Badge>
<Badge variant="destructive">삭제</Badge>
<Badge variant="outline">외곽선</Badge>
```

## 로딩 및 스켈레톤 컴포넌트

### Spinner

로딩 상태를 표시하는 스피너 컴포넌트입니다.

```typescript
import { Spinner } from '@/components/ui/spinner'

<Spinner />
<Spinner size="sm" />
<Spinner size="lg" />
```

### Skeleton

콘텐츠 로딩 중 플레이스홀더를 표시하는 스켈레톤 컴포넌트입니다.

```typescript
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton
} from '@/components/ui/skeleton'

<div className="space-y-2">
  <SkeletonAvatar />
  <SkeletonText lines={3} />
  <SkeletonButton />
</div>
```

## 특수 컴포넌트

### OptimizedImage

Next.js Image 컴포넌트를 기반으로 한 최적화된 이미지 컴포넌트입니다.

```typescript
import { OptimizedImage } from '@/components/ui/optimized-image'

<OptimizedImage
  src="/image.jpg"
  alt="설명"
  width={800}
  height={600}
  priority={false}
  className="rounded-lg"
/>
```

### Logo

애플리케이션 로고 컴포넌트입니다.

```typescript
import { Logo } from '@/components/ui/logo'

<Logo size="sm" />
<Logo size="md" />
<Logo size="lg" />
```

## 접근성 가이드라인

모든 UI 컴포넌트는 다음 접근성 표준을 준수합니다:

1. **키보드 네비게이션**: Tab, Enter, Escape 키 지원
2. **ARIA 속성**: 적절한 role, aria-label, aria-describedby 속성
3. **포커스 관리**: 시각적 포커스 표시 및 논리적 포커스 순서
4. **색상 대비**: WCAG 2.1 AA 기준 준수
5. **스크린 리더**: 의미 있는 텍스트 및 대체 텍스트 제공

## 테마 지원

모든 컴포넌트는 다크/라이트 모드를 지원합니다:

```typescript
// CSS Variables 사용
.component {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}

// TailwindCSS 클래스 사용
<div className="bg-background text-foreground">
  Content
</div>
```

## 커스터마이징

컴포넌트는 `className` prop을 통해 커스터마이징할 수 있습니다:

```typescript
import { cn } from '@/lib/utils'

<Button className={cn("custom-styles", className)}>
  Custom Button
</Button>
```

## 성능 최적화

- 모든 컴포넌트는 React.memo로 최적화
- 불필요한 리렌더링 방지
- 번들 크기 최소화를 위한 트리 쉐이킹 지원
