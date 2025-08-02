# 대시보드 컴포넌트 문서

대시보드 페이지의 UI 컴포넌트들입니다. 사용자의 활동 현황, 통계, 최근 활동 등을 시각적으로
표시합니다.

## 주요 컴포넌트

### DashboardStats

주요 통계 정보를 카드 형태로 표시하는 컴포넌트입니다.

```typescript
import { DashboardStats } from '@/components/dashboard/dashboard-stats'

// 기본 사용법
<DashboardStats
  stats={[
    { label: '총 프로젝트', value: 12, change: +2, changeType: 'increase' },
    { label: '완료된 작업', value: 48, change: +8, changeType: 'increase' },
    { label: '진행 중인 작업', value: 15, change: -3, changeType: 'decrease' },
    { label: '이번 달 수익', value: '$2,400', change: +12, changeType: 'increase', format: 'currency' }
  ]}
/>

// 커스텀 아이콘 포함
<DashboardStats
  stats={[
    {
      label: '총 프로젝트',
      value: 12,
      icon: <FolderIcon className="h-4 w-4" />,
      color: 'blue'
    },
    {
      label: '완료된 작업',
      value: 48,
      icon: <CheckCircleIcon className="h-4 w-4" />,
      color: 'green'
    }
  ]}
/>

// 로딩 상태
<DashboardStats
  stats={stats}
  isLoading={true}
/>
```

**Props:**

- `stats: StatItem[]` - 통계 데이터 배열
- `isLoading?: boolean` - 로딩 상태
- `className?: string` - 추가 CSS 클래스
- `columns?: ResponsiveValue<number>` - 그리드 컬럼 수

**StatItem 인터페이스:**

```typescript
interface StatItem {
  label: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  format?: 'number' | 'currency' | 'percentage'
  href?: string
}
```

### DashboardActivity

최근 활동을 타임라인 형태로 표시하는 컴포넌트입니다.

```typescript
import { DashboardActivity } from '@/components/dashboard/dashboard-activity'

// 기본 사용법
<DashboardActivity
  activities={[
    {
      id: '1',
      type: 'project_created',
      title: '새 프로젝트 생성',
      description: 'React 대시보드 프로젝트를 생성했습니다',
      timestamp: new Date(),
      user: { name: '홍길동', avatar: '/avatar.jpg' }
    },
    {
      id: '2',
      type: 'task_completed',
      title: '작업 완료',
      description: '로그인 페이지 구현을 완료했습니다',
      timestamp: new Date(Date.now() - 3600000),
      user: { name: '김철수', avatar: '/avatar2.jpg' }
    }
  ]}
/>

// 필터링 옵션 포함
<DashboardActivity
  activities={activities}
  showFilters={true}
  filterOptions={[
    { value: 'all', label: '전체' },
    { value: 'project', label: '프로젝트' },
    { value: 'task', label: '작업' },
    { value: 'comment', label: '댓글' }
  ]}
  onFilter={handleFilter}
/>

// 페이지네이션 포함
<DashboardActivity
  activities={activities}
  showPagination={true}
  pageSize={10}
  totalCount={totalActivities}
  onPageChange={handlePageChange}
/>
```

**Props:**

- `activities: Activity[]` - 활동 데이터 배열
- `showFilters?: boolean` - 필터 표시 여부
- `filterOptions?: FilterOption[]` - 필터 옵션들
- `onFilter?: (type: string) => void` - 필터 변경 콜백
- `showPagination?: boolean` - 페이지네이션 표시 여부
- `pageSize?: number` - 페이지당 아이템 수
- `totalCount?: number` - 전체 아이템 수
- `onPageChange?: (page: number) => void` - 페이지 변경 콜백
- `isLoading?: boolean` - 로딩 상태

### DashboardChart

차트를 표시하는 컴포넌트입니다.

```typescript
import { DashboardChart } from '@/components/dashboard/dashboard-chart'

// 라인 차트
<DashboardChart
  type="line"
  title="월별 프로젝트 진행률"
  data={[
    { month: '1월', value: 65 },
    { month: '2월', value: 72 },
    { month: '3월', value: 78 },
    { month: '4월', value: 85 }
  ]}
  xKey="month"
  yKey="value"
/>

// 바 차트
<DashboardChart
  type="bar"
  title="카테고리별 프로젝트 수"
  data={[
    { category: '웹 개발', count: 12 },
    { category: '모바일 앱', count: 8 },
    { category: 'API', count: 5 }
  ]}
  xKey="category"
  yKey="count"
  color="#3b82f6"
/>

// 도넛 차트
<DashboardChart
  type="doughnut"
  title="작업 상태 분포"
  data={[
    { status: '완료', count: 45, color: '#10b981' },
    { status: '진행 중', count: 23, color: '#f59e0b' },
    { status: '대기', count: 12, color: '#6b7280' }
  ]}
  labelKey="status"
  valueKey="count"
/>
```

**Props:**

- `type: 'line' | 'bar' | 'doughnut' | 'area'` - 차트 타입
- `title?: string` - 차트 제목
- `data: any[]` - 차트 데이터
- `xKey?: string` - X축 데이터 키
- `yKey?: string` - Y축 데이터 키
- `labelKey?: string` - 라벨 데이터 키 (도넛 차트용)
- `valueKey?: string` - 값 데이터 키 (도넛 차트용)
- `color?: string` - 차트 색상
- `height?: number` - 차트 높이
- `showLegend?: boolean` - 범례 표시 여부
- `showGrid?: boolean` - 그리드 표시 여부

### DashboardWidget

재사용 가능한 위젯 컨테이너 컴포넌트입니다.

```typescript
import { DashboardWidget } from '@/components/dashboard/dashboard-widget'

// 기본 위젯
<DashboardWidget
  title="최근 프로젝트"
  description="최근에 업데이트된 프로젝트들"
>
  <ProjectList limit={5} />
</DashboardWidget>

// 액션 버튼 포함
<DashboardWidget
  title="작업 현황"
  actions={
    <Button variant="outline" size="sm">
      전체 보기
    </Button>
  }
>
  <TaskSummary />
</DashboardWidget>

// 로딩 상태
<DashboardWidget
  title="통계"
  isLoading={true}
  loadingHeight={200}
>
  <StatsContent />
</DashboardWidget>

// 에러 상태
<DashboardWidget
  title="데이터"
  error="데이터를 불러올 수 없습니다"
  onRetry={handleRetry}
>
  <DataContent />
</DashboardWidget>
```

**Props:**

- `title: string` - 위젯 제목
- `description?: string` - 위젯 설명
- `actions?: ReactNode` - 액션 버튼들
- `children: ReactNode` - 위젯 내용
- `isLoading?: boolean` - 로딩 상태
- `loadingHeight?: number` - 로딩 스켈레톤 높이
- `error?: string` - 에러 메시지
- `onRetry?: () => void` - 재시도 콜백
- `className?: string` - 추가 CSS 클래스

## 대시보드 레이아웃

### 그리드 레이아웃

```typescript
import { DashboardGrid } from '@/components/dashboard/dashboard-grid'

<DashboardGrid>
  <DashboardWidget title="통계" gridArea="stats">
    <DashboardStats stats={stats} />
  </DashboardWidget>

  <DashboardWidget title="차트" gridArea="chart">
    <DashboardChart type="line" data={chartData} />
  </DashboardWidget>

  <DashboardWidget title="최근 활동" gridArea="activity">
    <DashboardActivity activities={activities} />
  </DashboardWidget>
</DashboardGrid>
```

### 반응형 레이아웃

```typescript
function ResponsiveDashboard() {
  const { isMobile, isTablet } = useBreakpoint()

  if (isMobile) {
    return (
      <div className="space-y-4">
        <DashboardStats stats={stats} columns={1} />
        <DashboardWidget title="최근 활동">
          <DashboardActivity activities={activities.slice(0, 3)} />
        </DashboardWidget>
      </div>
    )
  }

  if (isTablet) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <DashboardStats stats={stats} columns={2} />
        </div>
        <DashboardWidget title="차트">
          <DashboardChart type="bar" data={chartData} />
        </DashboardWidget>
        <DashboardWidget title="활동">
          <DashboardActivity activities={activities} />
        </DashboardWidget>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4">
        <DashboardStats stats={stats} columns={4} />
      </div>
      <div className="col-span-3">
        <DashboardWidget title="프로젝트 진행률">
          <DashboardChart type="line" data={progressData} />
        </DashboardWidget>
      </div>
      <div className="col-span-1">
        <DashboardWidget title="최근 활동">
          <DashboardActivity activities={activities} />
        </DashboardWidget>
      </div>
    </div>
  )
}
```

## 데이터 통합

### 서버 컴포넌트에서 데이터 페칭

```typescript
// app/dashboard/page.tsx
import { getDashboardData } from '@/lib/actions/dashboard-actions'
import { DashboardStats, DashboardActivity } from '@/components/dashboard'

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      <DashboardStats stats={data.stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget title="프로젝트 현황">
          <DashboardChart
            type="doughnut"
            data={data.projectStatus}
            labelKey="status"
            valueKey="count"
          />
        </DashboardWidget>
        <DashboardWidget title="최근 활동">
          <DashboardActivity activities={data.recentActivities} />
        </DashboardWidget>
      </div>
    </div>
  )
}
```

### 클라이언트 컴포넌트에서 실시간 업데이트

```typescript
"use client"
import { useEffect, useState } from 'react'
import { useDashboardStore } from '@/store/dashboard-store'

export function RealTimeDashboard() {
  const {
    stats,
    activities,
    isLoading,
    fetchStats,
    fetchActivities,
    subscribeToUpdates
  } = useDashboardStore()

  useEffect(() => {
    fetchStats()
    fetchActivities()

    // 실시간 업데이트 구독
    const unsubscribe = subscribeToUpdates()
    return unsubscribe
  }, [])

  return (
    <div className="space-y-6">
      <DashboardStats stats={stats} isLoading={isLoading} />
      <DashboardActivity activities={activities} isLoading={isLoading} />
    </div>
  )
}
```

## 성능 최적화

### 메모이제이션

```typescript
import { memo, useMemo } from 'react'

const OptimizedDashboardStats = memo(function DashboardStats({
  stats
}: {
  stats: StatItem[]
}) {
  const processedStats = useMemo(() =>
    stats.map(stat => ({
      ...stat,
      formattedValue: formatStatValue(stat.value, stat.format),
      changeColor: getChangeColor(stat.changeType)
    })),
    [stats]
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {processedStats.map((stat, index) => (
        <StatCard key={index} stat={stat} />
      ))}
    </div>
  )
})
```

### 지연 로딩

```typescript
import dynamic from 'next/dynamic'

const LazyDashboardChart = dynamic(
  () => import('@/components/dashboard/dashboard-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false
  }
)

export function DashboardWithLazyChart() {
  return (
    <DashboardWidget title="성과 차트">
      <LazyDashboardChart type="line" data={chartData} />
    </DashboardWidget>
  )
}
```

## 접근성 기능

### 키보드 네비게이션

```typescript
function AccessibleDashboard() {
  return (
    <main role="main" aria-label="대시보드">
      <h1 className="sr-only">대시보드 개요</h1>

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">주요 통계</h2>
        <DashboardStats stats={stats} />
      </section>

      <section aria-labelledby="activity-heading">
        <h2 id="activity-heading" className="sr-only">최근 활동</h2>
        <DashboardActivity activities={activities} />
      </section>
    </main>
  )
}
```

### 스크린 리더 지원

```typescript
function AccessibleStatCard({ stat }: { stat: StatItem }) {
  return (
    <Card
      role="region"
      aria-labelledby={`stat-${stat.label}`}
      tabIndex={0}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p
              id={`stat-${stat.label}`}
              className="text-sm font-medium text-muted-foreground"
            >
              {stat.label}
            </p>
            <p
              className="text-2xl font-bold"
              aria-label={`${stat.label}: ${stat.formattedValue}`}
            >
              {stat.formattedValue}
            </p>
          </div>
          {stat.change && (
            <div
              className={`flex items-center text-sm ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}
              aria-label={`변화량: ${stat.change > 0 ? '증가' : '감소'} ${Math.abs(stat.change)}`}
            >
              {stat.changeType === 'increase' ? '↑' : '↓'} {Math.abs(stat.change)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

## 테스트 예제

### 컴포넌트 테스트

```typescript
import { render, screen } from '@testing-library/react'
import { DashboardStats } from '../dashboard-stats'

const mockStats = [
  { label: '총 프로젝트', value: 12, change: 2, changeType: 'increase' as const },
  { label: '완료된 작업', value: 48, change: -3, changeType: 'decrease' as const }
]

describe('DashboardStats', () => {
  it('통계 정보를 올바르게 렌더링한다', () => {
    render(<DashboardStats stats={mockStats} />)

    expect(screen.getByText('총 프로젝트')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('완료된 작업')).toBeInTheDocument()
    expect(screen.getByText('48')).toBeInTheDocument()
  })

  it('변화량을 올바르게 표시한다', () => {
    render(<DashboardStats stats={mockStats} />)

    expect(screen.getByText('↑ 2')).toBeInTheDocument()
    expect(screen.getByText('↓ 3')).toBeInTheDocument()
  })

  it('로딩 상태를 올바르게 표시한다', () => {
    render(<DashboardStats stats={[]} isLoading={true} />)

    expect(screen.getAllByTestId('stat-skeleton')).toHaveLength(4)
  })
})
```

## 타입 정의

```typescript
// src/types/dashboard.ts
export interface StatItem {
  label: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: ReactNode
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
  format?: 'number' | 'currency' | 'percentage'
  href?: string
}

export interface Activity {
  id: string
  type: string
  title: string
  description: string
  timestamp: Date
  user: {
    name: string
    avatar?: string
  }
  metadata?: Record<string, any>
}

export interface ChartData {
  [key: string]: any
}

export interface DashboardData {
  stats: StatItem[]
  recentActivities: Activity[]
  chartData: ChartData[]
  projectStatus: { status: string; count: number; color: string }[]
}
```

## 모범 사례

1. **성능**: 큰 데이터셋에서는 가상화와 메모이제이션 활용
2. **접근성**: 적절한 ARIA 라벨과 키보드 네비게이션 제공
3. **반응형**: 모든 화면 크기에서 최적화된 레이아웃
4. **실시간**: WebSocket이나 Server-Sent Events로 실시간 업데이트
5. **사용자 경험**: 로딩 상태, 에러 처리, 스켈레톤 UI 제공
