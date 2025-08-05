import { NextRequest, NextResponse } from 'next/server'

// Web Vitals 메트릭 타입
interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  url: string
  userAgent: string
  timestamp: number
}

// 메트릭 저장소 (실제 환경에서는 데이터베이스 사용)
const metricsStore: WebVitalsMetric[] = []

export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalsMetric = await request.json()

    // 메트릭 유효성 검사
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      )
    }

    // 메트릭 저장
    metricsStore.push({
      ...metric,
      timestamp: Date.now(),
    })

    // 개발 환경에서 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Web Vitals] ${metric.name}: ${metric.value} (${metric.rating})`
      )
    }

    // 임계값 체크 및 알림
    await checkThresholds(metric)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing web vitals metric:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '24h'
    const metricName = searchParams.get('metric')

    // 시간 범위 계산
    const now = Date.now()
    const timeframes = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }

    const timeRange =
      timeframes[timeframe as keyof typeof timeframes] || timeframes['24h']
    const startTime = now - timeRange

    // 메트릭 필터링
    let filteredMetrics = metricsStore.filter(
      metric => metric.timestamp >= startTime
    )

    if (metricName) {
      filteredMetrics = filteredMetrics.filter(
        metric => metric.name === metricName
      )
    }

    // 통계 계산
    const stats = calculateStats(filteredMetrics)

    return NextResponse.json({
      metrics: filteredMetrics,
      stats,
      timeframe,
      count: filteredMetrics.length,
    })
  } catch (error) {
    console.error('Error fetching web vitals metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 통계 계산
function calculateStats(metrics: WebVitalsMetric[]) {
  if (metrics.length === 0) {
    return {
      average: 0,
      median: 0,
      p75: 0,
      p95: 0,
      good: 0,
      needsImprovement: 0,
      poor: 0,
    }
  }

  const values = metrics.map(m => m.value).sort((a, b) => a - b)
  const ratings = metrics.map(m => m.rating)

  return {
    average: values.reduce((sum, val) => sum + val, 0) / values.length,
    median: values[Math.floor(values.length / 2)],
    p75: values[Math.floor(values.length * 0.75)],
    p95: values[Math.floor(values.length * 0.95)],
    good: ratings.filter(r => r === 'good').length,
    needsImprovement: ratings.filter(r => r === 'needs-improvement').length,
    poor: ratings.filter(r => r === 'poor').length,
  }
}

// 임계값 체크 및 알림
async function checkThresholds(metric: WebVitalsMetric) {
  const thresholds = {
    CLS: { poor: 0.25, needsImprovement: 0.1 },
    FID: { poor: 300, needsImprovement: 100 },
    FCP: { poor: 3000, needsImprovement: 1800 },
    LCP: { poor: 4000, needsImprovement: 2500 },
    TTFB: { poor: 1800, needsImprovement: 800 },
  }

  const threshold = thresholds[metric.name as keyof typeof thresholds]
  if (!threshold) return

  // 성능이 나쁜 경우 알림
  if (metric.rating === 'poor') {
    console.warn(`[Performance Alert] ${metric.name} is poor: ${metric.value}`)

    // 실제 환경에서는 Slack, Discord, 이메일 등으로 알림 전송
    // await sendAlert({
    //   type: 'performance',
    //   metric: metric.name,
    //   value: metric.value,
    //   threshold: threshold.poor,
    //   url: metric.url,
    // })
  }
}
