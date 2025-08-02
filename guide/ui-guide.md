# UI/UX 디자인 시스템 가이드

> shadcn/ui + Tailwind CSS 4.0 기반 현대적 디자인 시스템 가이드

## 목차

1. [디자인 시스템 개요](#1-디자인-시스템-개요)
2. [컴포넌트 라이브러리](#2-컴포넌트-라이브러리)
3. [테마 시스템](#3-테마-시스템)
4. [레이아웃 패턴](#4-레이아웃-패턴)
5. [접근성 가이드라인](#5-접근성-가이드라인)
6. [성능 최적화](#6-성능-최적화)
7. [모바일 최적화](#7-모바일-최적화)

---

## 1. 디자인 시스템 개요

### 1.1 디자인 원칙

- **일관성**: 모든 컴포넌트에서 일관된 디자인 언어 사용
- **접근성**: WCAG 2.1 AA 기준 준수
- **반응형**: 모든 화면 크기에서 최적화된 경험
- **성능**: 빠른 로딩과 부드러운 상호작용
- **확장성**: 새로운 컴포넌트와 패턴을 쉽게 추가

### 1.2 기술 스택

- **Tailwind CSS 4.0**: 유틸리티 우선 CSS 프레임워크
- **shadcn/ui**: Radix UI 기반 컴포넌트 라이브러리
- **CSS Variables**: 동적 테마 지원
- **Lucide React**: 일관된 아이콘 시스템

---

## 2. 컴포넌트 라이브러리

### 2.1 기본 컴포넌트

#### 버튼 컴포넌트

```typescript
// src/components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive: 'bg-destructive text-white shadow-xs hover:bg-destructive/90',
        outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3',
        lg: 'h-10 rounded-md px-6',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// 사용 예시
<Button variant="outline" size="sm">
  취소
</Button>
<Button variant="default" size="lg">
  저장
</Button>
```

#### 카드 컴포넌트

```typescript
// 카드 사용 패턴
<Card>
  <CardHeader>
    <CardTitle>프로젝트 제목</CardTitle>
    <CardDescription>프로젝트 설명</CardDescription>
    <CardAction>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    <p>카드 내용</p>
  </CardContent>
  <CardFooter>
    <Button variant="outline">편집</Button>
    <Button>저장</Button>
  </CardFooter>
</Card>
```

#### 폼 컴포넌트

```typescript
// FormField 컴포넌트 사용
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>이메일</FormLabel>
      <FormControl>
        <Input {...field} type="email" placeholder="이메일을 입력하세요" />
      </FormControl>
      <FormDescription>
        로그인에 사용할 이메일 주소입니다.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

// Select 컴포넌트
<Select onValueChange={field.onChange} defaultValue={field.value}>
  <FormControl>
    <SelectTrigger>
      <SelectValue placeholder="카테고리를 선택하세요" />
    </SelectTrigger>
  </FormControl>
  <SelectContent>
    <SelectItem value="web">웹 개발</SelectItem>
    <SelectItem value="mobile">모바일 앱</SelectItem>
    <SelectItem value="api">API 서버</SelectItem>
  </SelectContent>
</Select>
```

#### 피드백 컴포넌트

```typescript
// Alert 컴포넌트
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>주의</AlertTitle>
  <AlertDescription>
    이 작업은 되돌릴 수 없습니다.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>오류</AlertTitle>
  <AlertDescription>
    파일을 업로드하는 중 오류가 발생했습니다.
  </AlertDescription>
</Alert>

// Toast 사용
import { toast } from 'sonner'

toast.success('프로젝트가 생성되었습니다')
toast.error('오류가 발생했습니다')
toast.loading('처리 중...')
```

### 2.2 복합 컴포넌트

#### 데이터 테이블

```typescript
// 테이블 컴포넌트
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>이름</TableHead>
      <TableHead>상태</TableHead>
      <TableHead>생성일</TableHead>
      <TableHead className="text-right">액션</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {projects.map((project) => (
      <TableRow key={project.id}>
        <TableCell className="font-medium">{project.name}</TableCell>
        <TableCell>
          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
            {project.status}
          </Badge>
        </TableCell>
        <TableCell>{formatDate(project.createdAt)}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>편집</DropdownMenuItem>
              <DropdownMenuItem>복제</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### 네비게이션

```typescript
// 사이드바 네비게이션
<Sidebar>
  <SidebarHeader>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link href="/">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Command className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Acme Inc</span>
              <span className="truncate text-xs">Enterprise</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarHeader>
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>플랫폼</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/dashboard">
              <Home className="size-4" />
              <span>대시보드</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/projects">
              <Folder className="size-4" />
              <span>프로젝트</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  </SidebarContent>
</Sidebar>
```

---

## 3. 테마 시스템

### 3.1 색상 시스템

#### CSS 변수 기반 테마

```css
/* src/app/globals.css */
:root {
  /* 기본 색상 */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;

  /* 카드 */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;

  /* 팝오버 */
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;

  /* 프라이머리 */
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;

  /* 세컨더리 */
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;

  /* 뮤트 */
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;

  /* 액센트 */
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;

  /* 파괴적 */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;

  /* 보더 */
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;

  /* 링 */
  --ring: 221.2 83.2% 53.3%;

  /* 차트 색상 */
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;

  /* 반지름 */
  --radius: 0.75rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;

  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;

  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;

  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;

  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;

  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;

  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;

  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;

  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;

  --ring: 224.3 76.3% 94.1%;

  --chart-1: 220 70% 50%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
}
```

#### 색상 사용 가이드라인

```typescript
// Tailwind 클래스 사용
<div className="bg-background text-foreground">
  <div className="bg-card text-card-foreground rounded-lg border">
    <Button className="bg-primary text-primary-foreground">
      Primary Button
    </Button>
    <Button variant="secondary" className="bg-secondary text-secondary-foreground">
      Secondary Button
    </Button>
  </div>
</div>

// CSS-in-JS에서 사용
const styles = {
  container: {
    backgroundColor: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
  },
  card: {
    backgroundColor: 'hsl(var(--card))',
    color: 'hsl(var(--card-foreground))',
  },
}
```

### 3.2 테마 전환

#### 테마 프로바이더 설정

```typescript
// src/components/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// src/app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

#### 테마 토글 컴포넌트

```typescript
// src/components/theme-toggle.tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">테마 전환</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          라이트
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          다크
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          시스템
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 3.3 커스텀 테마 생성

```typescript
// src/lib/themes.ts
export const customThemes = {
  blue: {
    light: {
      primary: '214 100% 50%',
      'primary-foreground': '0 0% 100%',
    },
    dark: {
      primary: '214 100% 60%',
      'primary-foreground': '0 0% 0%',
    },
  },
  green: {
    light: {
      primary: '142 76% 36%',
      'primary-foreground': '0 0% 100%',
    },
    dark: {
      primary: '142 76% 46%',
      'primary-foreground': '0 0% 0%',
    },
  },
}

// 테마 적용 함수
export function applyCustomTheme(theme: keyof typeof customThemes, mode: 'light' | 'dark') {
  const themeColors = customThemes[theme][mode]

  Object.entries(themeColors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value)
  })
}
```

---

## 4. 레이아웃 패턴

### 4.1 그리드 시스템

#### 반응형 그리드

```typescript
// 기본 반응형 그리드
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {items.map((item) => (
    <Card key={item.id}>
      <CardContent>{item.content}</CardContent>
    </Card>
  ))}
</div>

// 자동 맞춤 그리드
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
  {projects.map((project) => (
    <ProjectCard key={project.id} project={project} />
  ))}
</div>

// 컨테이너 쿼리 활용
<div className="@container">
  <div className="grid @sm:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4 gap-4">
    {/* 내용 */}
  </div>
</div>
```

#### 복잡한 그리드 레이아웃

```typescript
// 대시보드 그리드 레이아웃
<div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
  {/* 통계 카드들 */}
  <div className="col-span-full">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </div>
  </div>

  {/* 차트 영역 */}
  <div className="col-span-full md:col-span-3 lg:col-span-4">
    <Card>
      <CardHeader>
        <CardTitle>프로젝트 진행률</CardTitle>
      </CardHeader>
      <CardContent>
        <Chart data={chartData} />
      </CardContent>
    </Card>
  </div>

  {/* 사이드바 영역 */}
  <div className="col-span-full md:col-span-1 lg:col-span-2">
    <Card>
      <CardHeader>
        <CardTitle>최근 활동</CardTitle>
      </CardHeader>
      <CardContent>
        <ActivityList activities={activities} />
      </CardContent>
    </Card>
  </div>
</div>
```

### 4.2 플렉스 레이아웃

#### 기본 플렉스 패턴

```typescript
// 헤더 레이아웃
<header className="flex items-center justify-between p-4 border-b">
  <div className="flex items-center space-x-4">
    <Logo />
    <nav className="hidden md:flex space-x-4">
      <NavLink href="/dashboard">대시보드</NavLink>
      <NavLink href="/projects">프로젝트</NavLink>
    </nav>
  </div>

  <div className="flex items-center space-x-2">
    <ThemeToggle />
    <UserMenu />
  </div>
</header>

// 카드 내부 레이아웃
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">총 수익</CardTitle>
    <DollarSign className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">$45,231.89</div>
    <p className="text-xs text-muted-foreground">
      +20.1% from last month
    </p>
  </CardContent>
</Card>
```

### 4.3 스택 레이아웃

```typescript
// 수직 스택
<div className="space-y-4">
  <h1 className="text-2xl font-bold">페이지 제목</h1>
  <p className="text-muted-foreground">페이지 설명</p>
  <div className="flex space-x-2">
    <Button>주요 액션</Button>
    <Button variant="outline">보조 액션</Button>
  </div>
</div>

// 수평 스택
<div className="flex items-center space-x-4">
  <Avatar>
    <AvatarImage src={user.avatar} />
    <AvatarFallback>{user.initials}</AvatarFallback>
  </Avatar>
  <div>
    <p className="text-sm font-medium">{user.name}</p>
    <p className="text-xs text-muted-foreground">{user.email}</p>
  </div>
</div>
```

---

## 5. 접근성 가이드라인

### 5.1 키보드 네비게이션

#### 포커스 관리

```typescript
// 포커스 트랩 구현
import { useRef, useEffect } from 'react'

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus()
      }
    }
  }, [isOpen])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {children}
    </div>
  )
}
```

#### 키보드 단축키

```typescript
// 글로벌 키보드 단축키
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: 검색 열기
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }

      // Cmd/Ctrl + N: 새 프로젝트
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        createNewProject()
      }

      // Escape: 모달 닫기
      if (e.key === 'Escape') {
        closeModal()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}
```

### 5.2 ARIA 속성

#### 적절한 ARIA 라벨링

```typescript
// 버튼 접근성
<Button
  aria-label="사용자 메뉴 열기"
  aria-expanded={isMenuOpen}
  aria-controls="user-menu"
  onClick={toggleMenu}
>
  <UserIcon className="h-4 w-4" />
</Button>

// 폼 접근성
<div>
  <Label htmlFor="email">이메일</Label>
  <Input
    id="email"
    type="email"
    aria-describedby="email-description email-error"
    aria-invalid={!!errors.email}
    {...register('email')}
  />
  <div id="email-description" className="text-sm text-muted-foreground">
    로그인에 사용할 이메일 주소입니다.
  </div>
  {errors.email && (
    <div id="email-error" role="alert" className="text-sm text-destructive">
      {errors.email.message}
    </div>
  )}
</div>

// 상태 표시
<div
  role="status"
  aria-live="polite"
  aria-label={`프로젝트 진행률 ${progress}%`}
>
  <Progress value={progress} className="w-full" />
  <span className="sr-only">{progress}% 완료</span>
</div>
```

### 5.3 색상 대비 및 시각적 접근성

```typescript
// 고대비 모드 지원
<Button
  className={cn(
    "bg-primary text-primary-foreground",
    "contrast-more:border-2 contrast-more:border-current"
  )}
>
  버튼 텍스트
</Button>

// 모션 감소 지원
<div
  className={cn(
    "transition-all duration-200",
    "motion-reduce:transition-none"
  )}
>
  애니메이션 콘텐츠
</div>

// 포커스 표시 개선
<Button
  className={cn(
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  )}
>
  접근 가능한 버튼
</Button>
```

---

## 6. 성능 최적화

### 6.1 컴포넌트 최적화

#### 메모이제이션 패턴

```typescript
// React.memo 사용
export const ProjectCard = memo(function ProjectCard({
  project,
  onUpdate
}: ProjectCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{project.description}</p>
      </CardContent>
    </Card>
  )
})

// useMemo로 비용이 큰 계산 최적화
function ProjectList({ projects, filters }: ProjectListProps) {
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      return filters.category ? project.category === filters.category : true
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [projects, filters])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredProjects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

### 6.2 이미지 최적화

```typescript
// OptimizedImage 컴포넌트
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  className,
  priority = false,
}: OptimizedImageProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="object-cover transition-transform hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}
```

### 6.3 지연 로딩

```typescript
// 컴포넌트 지연 로딩
import dynamic from 'next/dynamic'

const LazyChart = dynamic(() => import('./chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
})

const LazyModal = dynamic(() => import('./modal'), {
  loading: () => <div>Loading...</div>,
})

// 이미지 지연 로딩
<Image
  src="/large-image.jpg"
  alt="Large image"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

---

## 7. 모바일 최적화

### 7.1 터치 인터페이스

```typescript
// 터치 친화적 버튼 크기
<Button
  size="lg" // 최소 44px 높이 보장
  className="min-h-[44px] min-w-[44px]"
>
  터치 버튼
</Button>

// 스와이프 제스처 지원
import { useSwipeable } from 'react-swipeable'

function SwipeableCard({ onSwipeLeft, onSwipeRight, children }: SwipeableCardProps) {
  const handlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    onSwipedRight: onSwipeRight,
    trackMouse: true,
  })

  return (
    <div {...handlers} className="touch-pan-y">
      {children}
    </div>
  )
}
```

### 7.2 반응형 네비게이션

```typescript
// 모바일 네비게이션
export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="메뉴 열기"
      >
        <Menu className="h-6 w-6" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <nav className="flex flex-col space-y-4">
            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
              대시보드
            </Link>
            <Link href="/projects" onClick={() => setIsOpen(false)}>
              프로젝트
            </Link>
            <Link href="/settings" onClick={() => setIsOpen(false)}>
              설정
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
```

### 7.3 모바일 폼 최적화

```typescript
// 모바일 친화적 폼
<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="email">이메일</Label>
    <Input
      id="email"
      type="email"
      inputMode="email"
      autoComplete="email"
      className="text-base" // iOS 줌 방지
      placeholder="이메일을 입력하세요"
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="phone">전화번호</Label>
    <Input
      id="phone"
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      className="text-base"
      placeholder="010-1234-5678"
    />
  </div>

  <Button type="submit" className="w-full">
    제출
  </Button>
</form>
```

---

## 마무리

이 UI 가이드는 일관되고 접근 가능한 사용자 인터페이스를 구축하기 위한 포괄적인 지침을 제공합니다.
새로운 컴포넌트나 패턴이 추가될 때마다 이 가이드도 함께 업데이트해 주세요.

### 추가 리소스

- [shadcn/ui 공식 문서](https://ui.shadcn.com)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Radix UI 문서](https://www.radix-ui.com)
- [WCAG 2.1 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)
- [Next.js 이미지 최적화](https://nextjs.org/docs/basic-features/image-optimization)

### 8.1 인증 시스템 (NextAuth.js)

#### 설정

```typescript
// src/auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
})
```

#### 미들웨어 보호

```typescript
// src/middleware.ts
export default auth(req => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const protectedRoutes = ['/dashboard', '/workspace', '/projects']
  const isProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route))

  if (!isLoggedIn && isProtectedRoute) {
    const signInUrl = new URL('/auth/signin', nextUrl)
    signInUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})
```

### 8.2 에러 처리 패턴

#### 글로벌 에러 바운더리

```typescript
// src/components/global-error-boundary.tsx
export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Global error:', error, errorInfo)
        // 에러 로깅 서비스로 전송
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>오류가 발생했습니다</CardTitle>
          <CardDescription>
            {error.message || '알 수 없는 오류가 발생했습니다.'}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={resetErrorBoundary}>다시 시도</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
```

#### Server Action 에러 처리

```typescript
// src/lib/error-handling.ts
export class ActionError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'ActionError'
  }
}

export const handleActionError = (error: unknown): string => {
  if (error instanceof ActionError) {
    return error.message
  }

  if (error instanceof Error) {
    return process.env.NODE_ENV === 'production' ? '서버에서 오류가 발생했습니다.' : error.message
  }

  return '알 수 없는 오류가 발생했습니다.'
}
```

### 8.3 성능 최적화 규칙

#### 컴포넌트 최적화

```typescript
// React.memo 사용
export const ProjectCard = memo(function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card>
      {/* 컴포넌트 내용 */}
    </Card>
  )
})

// useCallback 사용
const handleSubmit = useCallback(async (data: FormData) => {
  await submitAction(data)
}, [])

// useMemo 사용
const filteredProjects = useMemo(() => {
  return projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  )
}, [projects, searchTerm])
```

#### 동적 임포트

```typescript
// 컴포넌트 지연 로딩
const ProjectModal = dynamic(() => import('./project-modal'), {
  loading: () => <Skeleton className="h-96 w-full" />,
})

// 라이브러리 지연 로딩
const loadChartLibrary = () => import('recharts')
```
