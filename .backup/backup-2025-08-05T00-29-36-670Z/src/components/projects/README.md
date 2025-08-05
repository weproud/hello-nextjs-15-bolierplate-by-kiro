# 프로젝트 컴포넌트 문서

프로젝트 관리 기능을 담당하는 컴포넌트들입니다. 프로젝트 생성, 편집, 목록 표시, 상세 보기 등의
기능을 제공합니다.

## 주요 컴포넌트

### ProjectList

프로젝트 목록을 표시하는 컴포넌트입니다.

```typescript
import { ProjectList } from '@/components/projects/project-list'

// 기본 사용법
<ProjectList />

// 사용자별 프로젝트 목록
<ProjectList userId="user-id" />

// 필터링된 목록
<ProjectList
  filters={{
    status: 'active',
    category: 'web',
    tags: ['react', 'nextjs']
  }}
/>

// 그리드 레이아웃
<ProjectList
  layout="grid"
  columns={{ sm: 1, md: 2, lg: 3 }}
  showCreateButton={true}
/>
```

**Props:**

- `userId?: string` - 특정 사용자의 프로젝트만 표시
- `filters?: ProjectFilters` - 필터 조건
- `layout?: 'list' | 'grid'` - 레이아웃 타입
- `columns?: ResponsiveValue<number>` - 그리드 컬럼 수
- `showCreateButton?: boolean` - 생성 버튼 표시 여부
- `onProjectSelect?: (project: Project) => void` - 프로젝트 선택 콜백

### ProjectCard

개별 프로젝트를 카드 형태로 표시하는 컴포넌트입니다.

```typescript
import { ProjectCard } from '@/components/projects/project-card'

// 기본 사용법
<ProjectCard
  project={project}
  onClick={() => router.push(`/projects/${project.id}`)}
/>

// 액션 버튼 포함
<ProjectCard
  project={project}
  showActions={true}
  actions={[
    { label: '편집', onClick: () => editProject(project.id) },
    { label: '복제', onClick: () => cloneProject(project.id) },
    { label: '삭제', onClick: () => deleteProject(project.id), variant: 'destructive' }
  ]}
/>

// 컴팩트 모드
<ProjectCard
  project={project}
  variant="compact"
  showDescription={false}
  showTags={false}
/>

// 선택 가능한 카드
<ProjectCard
  project={project}
  selectable={true}
  selected={selectedProjects.includes(project.id)}
  onSelect={(selected) => handleProjectSelect(project.id, selected)}
/>
```

**Props:**

- `project: Project` - 프로젝트 데이터
- `variant?: 'default' | 'compact' | 'detailed'` - 카드 스타일
- `onClick?: () => void` - 클릭 이벤트 핸들러
- `showActions?: boolean` - 액션 버튼 표시 여부
- `actions?: CardAction[]` - 커스텀 액션 버튼들
- `showDescription?: boolean` - 설명 표시 여부
- `showTags?: boolean` - 태그 표시 여부
- `selectable?: boolean` - 선택 가능 여부
- `selected?: boolean` - 선택 상태
- `onSelect?: (selected: boolean) => void` - 선택 상태 변경 콜백

### CreateProjectModal

프로젝트 생성을 위한 모달 컴포넌트입니다.

```typescript
import { CreateProjectModal } from '@/components/projects/create-project-modal'

// 기본 사용법
<CreateProjectModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSuccess={(project) => {
    console.log('프로젝트 생성됨:', project)
    router.push(`/projects/${project.id}`)
  }}
/>

// 템플릿 선택 포함
<CreateProjectModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  showTemplates={true}
  templates={[
    { id: 'web', name: '웹 애플리케이션', description: 'React/Next.js 프로젝트' },
    { id: 'mobile', name: '모바일 앱', description: 'React Native 프로젝트' },
    { id: 'api', name: 'API 서버', description: 'Node.js/Express 프로젝트' }
  ]}
/>

// 초기 데이터 설정
<CreateProjectModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  initialData={{
    name: '새 프로젝트',
    description: '프로젝트 설명',
    category: 'web'
  }}
/>
```

**Props:**

- `isOpen: boolean` - 모달 열림 상태
- `onClose: () => void` - 모달 닫기 콜백
- `onSuccess?: (project: Project) => void` - 생성 성공 콜백
- `showTemplates?: boolean` - 템플릿 선택 표시 여부
- `templates?: ProjectTemplate[]` - 사용 가능한 템플릿들
- `initialData?: Partial<ProjectFormData>` - 초기 폼 데이터

### ProjectForm

프로젝트 생성 및 편집을 위한 폼 컴포넌트입니다.

```typescript
import { ProjectForm } from '@/components/projects/project-form'

// 새 프로젝트 생성
<ProjectForm
  onSubmit={handleCreateProject}
  submitText="프로젝트 생성"
/>

// 기존 프로젝트 편집
<ProjectForm
  initialData={existingProject}
  onSubmit={handleUpdateProject}
  submitText="프로젝트 수정"
  mode="edit"
/>

// 고급 설정 포함
<ProjectForm
  onSubmit={handleSubmit}
  showAdvancedSettings={true}
  enableCollaboration={true}
  enableIntegrations={true}
/>
```

**Props:**

- `initialData?: Partial<Project>` - 초기 데이터 (편집 모드)
- `onSubmit: (data: ProjectFormData) => Promise<void>` - 제출 콜백
- `submitText?: string` - 제출 버튼 텍스트
- `mode?: 'create' | 'edit'` - 폼 모드
- `showAdvancedSettings?: boolean` - 고급 설정 표시 여부
- `enableCollaboration?: boolean` - 협업 설정 활성화
- `enableIntegrations?: boolean` - 통합 설정 활성화

## 고급 기능

### 프로젝트 검색 및 필터링

```typescript
import { ProjectSearch } from '@/components/projects/project-search'

<ProjectSearch
  onSearch={handleSearch}
  onFilter={handleFilter}
  filters={[
    {
      key: 'status',
      label: '상태',
      options: [
        { value: 'active', label: '진행 중' },
        { value: 'completed', label: '완료' },
        { value: 'paused', label: '일시 중단' }
      ]
    },
    {
      key: 'category',
      label: '카테고리',
      options: categories
    },
    {
      key: 'tags',
      label: '태그',
      options: tags,
      multiple: true
    }
  ]}
  sortOptions={[
    { key: 'createdAt', label: '생성일순' },
    { key: 'updatedAt', label: '수정일순' },
    { key: 'name', label: '이름순' },
    { key: 'progress', label: '진행률순' }
  ]}
/>
```

### 프로젝트 통계

```typescript
import { ProjectStats } from '@/components/projects/project-stats'

<ProjectStats
  project={project}
  showProgress={true}
  showTasks={true}
  showTeamMembers={true}
  showTimeline={true}
/>
```

### 프로젝트 협업

```typescript
import { ProjectCollaboration } from '@/components/projects/project-collaboration'

<ProjectCollaboration
  project={project}
  members={projectMembers}
  onInviteMember={handleInviteMember}
  onRemoveMember={handleRemoveMember}
  onUpdateRole={handleUpdateRole}
  permissions={userPermissions}
/>
```

### 프로젝트 타임라인

```typescript
import { ProjectTimeline } from '@/components/projects/project-timeline'

<ProjectTimeline
  project={project}
  events={timelineEvents}
  showMilestones={true}
  showTasks={true}
  showComments={true}
  interactive={true}
/>
```

## 폼 통합

### React Hook Form과 Zod 검증

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema } from '@/lib/validations/project'

const projectSchema = z.object({
  name: z.string().min(1, '프로젝트 이름을 입력해주세요').max(100, '이름은 100자 이하로 입력해주세요'),
  description: z.string().max(500, '설명은 500자 이하로 입력해주세요').optional(),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  tags: z.array(z.string()).max(10, '태그는 최대 10개까지 선택할 수 있습니다'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budget: z.number().min(0, '예산은 0 이상이어야 합니다').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['planning', 'active', 'paused', 'completed', 'cancelled']).default('planning'),
  isPublic: z.boolean().default(false)
}).refine(
  (data) => !data.endDate || !data.startDate || data.endDate >= data.startDate,
  {
    message: '종료일은 시작일보다 늦어야 합니다',
    path: ['endDate']
  }
)

function ProjectFormExample() {
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      tags: [],
      priority: 'medium',
      status: 'planning',
      isPublic: false
    }
  })

  return (
    <ProjectForm
      form={form}
      onSubmit={form.handleSubmit(handleSubmit)}
    />
  )
}
```

### 서버 액션 통합

```typescript
import { createProject, updateProject } from '@/lib/actions/project-actions'
import { useAction } from 'next-safe-action/hooks'

function ProjectFormWithAction() {
  const { execute: createProjectAction, isExecuting } = useAction(createProject)

  const handleSubmit = async (data: ProjectFormData) => {
    const result = await createProjectAction(data)

    if (result?.data) {
      router.push(`/projects/${result.data.id}`)
    }
  }

  return (
    <ProjectForm
      onSubmit={handleSubmit}
      isLoading={isExecuting}
    />
  )
}
```

## 상태 관리

### Zustand 스토어 통합

```typescript
import { useProjectsStore } from '@/store/projects-store'

function ProjectListWithStore() {
  const {
    projects,
    isLoading,
    filters,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
    setFilters
  } = useProjectsStore()

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects, filters])

  return (
    <div>
      <ProjectSearch
        onFilter={setFilters}
        currentFilters={filters}
      />
      <ProjectList
        projects={projects}
        isLoading={isLoading}
        onProjectUpdate={updateProject}
        onProjectDelete={deleteProject}
      />
    </div>
  )
}
```

## 성능 최적화

### 가상화된 목록

```typescript
import { FixedSizeList as List } from 'react-window'

function VirtualizedProjectList({ projects }: { projects: Project[] }) {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <ProjectCard project={projects[index]} variant="compact" />
    </div>
  )

  return (
    <List
      height={600}
      itemCount={projects.length}
      itemSize={150}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

### 메모이제이션

```typescript
import { memo, useMemo } from 'react'

const OptimizedProjectCard = memo(function ProjectCard({
  project,
  onClick
}: {
  project: Project
  onClick: () => void
}) {
  const formattedDate = useMemo(() =>
    new Intl.DateTimeFormat('ko-KR').format(project.createdAt),
    [project.createdAt]
  )

  const progressPercentage = useMemo(() =>
    Math.round((project.completedTasks / project.totalTasks) * 100),
    [project.completedTasks, project.totalTasks]
  )

  return (
    <Card onClick={onClick}>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>{formattedDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>{project.description}</p>
          <div className="flex items-center space-x-2">
            <Progress value={progressPercentage} className="flex-1" />
            <span className="text-sm text-muted-foreground">
              {progressPercentage}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
```

## 접근성 기능

### 키보드 네비게이션

```typescript
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'

function AccessibleProjectCard({ project }: { project: Project }) {
  const { handleKeyDown } = useKeyboardNavigation({
    onEnter: () => router.push(`/projects/${project.id}`),
    onSpace: () => router.push(`/projects/${project.id}`),
    onDelete: () => handleDeleteProject(project.id)
  })

  return (
    <Card
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="article"
      aria-labelledby={`project-title-${project.id}`}
      aria-describedby={`project-description-${project.id}`}
    >
      <CardHeader>
        <CardTitle id={`project-title-${project.id}`}>
          {project.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p id={`project-description-${project.id}`}>
          {project.description}
        </p>
        <div
          role="progressbar"
          aria-valuenow={project.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`프로젝트 진행률 ${project.progress}%`}
        >
          <Progress value={project.progress} />
        </div>
      </CardContent>
    </Card>
  )
}
```

### 스크린 리더 지원

```typescript
function AccessibleProjectList({ projects }: { projects: Project[] }) {
  return (
    <section
      role="main"
      aria-label="프로젝트 목록"
      aria-live="polite"
    >
      <h1>내 프로젝트</h1>
      <div
        role="list"
        aria-label={`총 ${projects.length}개의 프로젝트`}
      >
        {projects.map((project, index) => (
          <div key={project.id} role="listitem">
            <ProjectCard
              project={project}
              aria-posinset={index + 1}
              aria-setsize={projects.length}
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
import { ProjectCard } from '../project-card'

const mockProject = {
  id: '1',
  name: '테스트 프로젝트',
  description: '테스트 설명',
  status: 'active',
  progress: 75,
  createdAt: new Date(),
  updatedAt: new Date(),
  owner: { name: '소유자', email: 'owner@example.com' },
  category: { name: '웹 개발', slug: 'web' },
  tags: [{ name: 'React', slug: 'react' }]
}

describe('ProjectCard', () => {
  it('프로젝트 정보를 올바르게 렌더링한다', () => {
    render(<ProjectCard project={mockProject} />)

    expect(screen.getByText('테스트 프로젝트')).toBeInTheDocument()
    expect(screen.getByText('테스트 설명')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('클릭 이벤트가 올바르게 작동한다', async () => {
    const handleClick = vi.fn()
    render(<ProjectCard project={mockProject} onClick={handleClick} />)

    await userEvent.click(screen.getByRole('article'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('선택 기능이 올바르게 작동한다', async () => {
    const handleSelect = vi.fn()
    render(
      <ProjectCard
        project={mockProject}
        selectable={true}
        onSelect={handleSelect}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)
    expect(handleSelect).toHaveBeenCalledWith(true)
  })
})
```

## 타입 정의

```typescript
// src/types/project.ts
export interface Project {
  id: string
  name: string
  description?: string
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  progress: number
  startDate?: Date
  endDate?: Date
  budget?: number
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  owner: {
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
  members?: ProjectMember[]
  tasks?: Task[]
  _count?: {
    tasks: number
    completedTasks: number
    members: number
    comments: number
  }
}

export interface ProjectFormData {
  name: string
  description?: string
  category: string
  tags: string[]
  startDate?: Date
  endDate?: Date
  budget?: number
  priority: 'low' | 'medium' | 'high'
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
  isPublic: boolean
}

export interface ProjectFilters {
  status?: string[]
  category?: string
  tags?: string[]
  owner?: string
  priority?: string[]
  search?: string
}

export interface ProjectMember {
  id: string
  userId: string
  projectId: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  joinedAt: Date
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
}
```

## 모범 사례

1. **상태 관리**: 복잡한 프로젝트 상태는 Zustand 스토어로 관리
2. **성능**: 큰 목록에서는 가상화와 메모이제이션 활용
3. **접근성**: 키보드 네비게이션과 스크린 리더 지원
4. **사용자 경험**: 로딩 상태, 에러 처리, 낙관적 업데이트 제공
5. **협업**: 실시간 업데이트와 권한 관리 구현
