import { Card, CardContent } from '@/components/ui/card'

interface DashboardStatsProps {
  stats: {
    totalProjects: number
    activeProjects: number
    completedProjects: number
    totalPosts: number
    publishedPosts: number
    totalPhases: number
    completionRate: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <>
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">총 프로젝트</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">진행 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">완료됨</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">완료율</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats - Posts and Phases */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">총 게시글</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.publishedPosts}</div>
            <p className="text-xs text-muted-foreground">게시된 글</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.totalPhases}</div>
            <p className="text-xs text-muted-foreground">총 단계</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
