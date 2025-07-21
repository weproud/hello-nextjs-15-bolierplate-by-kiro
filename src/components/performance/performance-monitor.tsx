'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  performanceMonitor,
  type PerformanceReport,
} from '@/lib/performance-monitor'

interface PerformanceMonitorProps {
  showDetails?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function PerformanceMonitor({
  showDetails = false,
  autoRefresh = true,
  refreshInterval = 30000, // 30초
}: PerformanceMonitorProps) {
  const [report, setReport] = useState<PerformanceReport | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 개발 환경에서만 표시
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true)
    }

    // 초기 리포트 생성
    const generateInitialReport = () => {
      setTimeout(() => {
        setReport(performanceMonitor.generateReport())
      }, 2000)
    }

    generateInitialReport()

    // 자동 새로고침
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        setReport(performanceMonitor.generateReport())
      }, refreshInterval)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [autoRefresh, refreshInterval])

  if (!isVisible || !report) {
    return null
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'bg-green-500'
      case 'needs-improvement':
        return 'bg-yellow-500'
      case 'poor':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getRatingBadgeVariant = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'default' as const
      case 'needs-improvement':
        return 'secondary' as const
      case 'poor':
        return 'destructive' as const
      default:
        return 'outline' as const
    }
  }

  const getOverallScore = () => {
    const { good, needsImprovement, poor } = report.summary
    const total = good + needsImprovement + poor
    if (total === 0) return 0
    return Math.round((good / total) * 100)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">성능 모니터</CardTitle>
            <Badge variant="outline" className="text-xs">
              실시간
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Core Web Vitals 및 성능 메트릭
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 전체 점수 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">전체 점수</span>
              <span className="text-sm font-bold">{getOverallScore()}/100</span>
            </div>
            <Progress value={getOverallScore()} className="h-2" />
          </div>

          {/* 메트릭 요약 */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium text-green-600">
                {report.summary.good}
              </div>
              <div className="text-muted-foreground">좋음</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-yellow-600">
                {report.summary.needsImprovement}
              </div>
              <div className="text-muted-foreground">개선 필요</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-red-600">
                {report.summary.poor}
              </div>
              <div className="text-muted-foreground">나쁨</div>
            </div>
          </div>

          {/* 상세 메트릭 */}
          {showDetails && report.metrics.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                상세 메트릭
              </div>
              <div className="space-y-1">
                {report.metrics.map((metric, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-medium">{metric.name}</span>
                    <div className="flex items-center gap-2">
                      <span>
                        {formatMetricValue(metric.name, metric.value)}
                      </span>
                      <Badge
                        variant={getRatingBadgeVariant(metric.rating)}
                        className="text-xs px-1 py-0"
                      >
                        {metric.rating === 'good'
                          ? '좋음'
                          : metric.rating === 'needs-improvement'
                            ? '개선'
                            : '나쁨'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 마지막 업데이트 시간 */}
          <div className="text-xs text-muted-foreground text-center">
            마지막 업데이트: {new Date(report.timestamp).toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 메트릭 값 포맷팅
function formatMetricValue(name: string, value: number): string {
  switch (name) {
    case 'CLS':
      return value.toFixed(3)
    case 'FID':
    case 'FCP':
    case 'LCP':
    case 'TTFB':
      return `${Math.round(value)}ms`
    default:
      return value.toString()
  }
}

// 성능 대시보드 컴포넌트
export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<any[]>([])
  const [customMetrics, setCustomMetrics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [webVitalsResponse, customMetricsResponse] = await Promise.all([
          fetch('/api/analytics/web-vitals?timeframe=24h'),
          fetch('/api/analytics/custom-metrics?timeframe=24h'),
        ])

        const webVitalsData = await webVitalsResponse.json()
        const customMetricsData = await customMetricsResponse.json()

        setMetrics(webVitalsData.metrics || [])
        setCustomMetrics(customMetricsData.metrics || [])
      } catch (error) {
        console.error('Failed to fetch performance metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()

    // 5분마다 새로고침
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-8 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">성능 대시보드</h2>
        <p className="text-muted-foreground">
          실시간 성능 메트릭 및 Core Web Vitals 모니터링
        </p>
      </div>

      {/* Core Web Vitals */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {['CLS', 'FID', 'FCP', 'LCP', 'TTFB'].map(metricName => {
          const metricData = metrics.filter(m => m.name === metricName)
          const latestMetric = metricData[metricData.length - 1]

          return (
            <Card key={metricName}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {metricName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestMetric ? (
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {formatMetricValue(metricName, latestMetric.value)}
                    </div>
                    <Badge variant={getRatingBadgeVariant(latestMetric.rating)}>
                      {latestMetric.rating === 'good'
                        ? '좋음'
                        : latestMetric.rating === 'needs-improvement'
                          ? '개선 필요'
                          : '나쁨'}
                    </Badge>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    데이터 없음
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 커스텀 메트릭 */}
      {customMetrics.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">커스텀 메트릭</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              'navigation-timing',
              'slow-resource',
              'long-task',
              'memory-usage',
            ].map(metricName => {
              const metricData = customMetrics.filter(
                m => m.name === metricName
              )

              return (
                <Card key={metricName}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium capitalize">
                      {metricName.replace('-', ' ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metricData.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      지난 24시간
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
