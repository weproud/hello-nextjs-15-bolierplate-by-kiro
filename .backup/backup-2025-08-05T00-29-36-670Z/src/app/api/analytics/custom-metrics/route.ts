import { NextRequest, NextResponse } from 'next/server'

// 커스텀 메트릭 타입
interface CustomMetric {
  name: string
  data: any
  url: string
  timestamp: number
}

// 메트릭 저장소 (실제 환경에서는 데이터베이스 사용)
const customMetricsStore: CustomMetric[] = []

export async function POST(request: NextRequest) {
  try {
    const metric: CustomMetric = await request.json()

    // 메트릭 유효성 검사
    if (!metric.name || !metric.data) {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      )
    }

    // 메트릭 저장
    customMetricsStore.push({
      ...metric,
      timestamp: Date.now(),
    })

    // 개발 환경에서 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Custom Metric] ${metric.name}:`, metric.data)
    }

    // 특정 메트릭에 대한 처리
    await processCustomMetric(metric)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing custom metric:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metricName = searchParams.get('metric')
    const timeframe = searchParams.get('timeframe') || '24h'

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
    let filteredMetrics = customMetricsStore.filter(
      metric => metric.timestamp >= startTime
    )

    if (metricName) {
      filteredMetrics = filteredMetrics.filter(
        metric => metric.name === metricName
      )
    }

    // 메트릭별 집계
    const aggregated = aggregateMetrics(filteredMetrics)

    return NextResponse.json({
      metrics: filteredMetrics,
      aggregated,
      timeframe,
      count: filteredMetrics.length,
    })
  } catch (error) {
    console.error('Error fetching custom metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 커스텀 메트릭 처리
async function processCustomMetric(metric: CustomMetric) {
  switch (metric.name) {
    case 'navigation-timing':
      await processNavigationTiming(metric.data)
      break
    case 'slow-resource':
      await processSlowResource(metric.data)
      break
    case 'long-task':
      await processLongTask(metric.data)
      break
    case 'memory-usage':
      await processMemoryUsage(metric.data)
      break
  }
}

// Navigation Timing 처리
async function processNavigationTiming(data: any) {
  // DOM 로딩이 너무 느린 경우 알림
  if (data.domComplete > 5000) {
    console.warn(`[Performance Alert] Slow DOM loading: ${data.domComplete}ms`)
  }

  // First Byte가 너무 느린 경우 알림
  if (data.firstByte > 1000) {
    console.warn(`[Performance Alert] Slow TTFB: ${data.firstByte}ms`)
  }
}

// 느린 리소스 처리
async function processSlowResource(data: any) {
  console.warn(
    `[Performance Alert] Slow resource: ${data.name} (${data.duration}ms, ${data.size} bytes)`
  )

  // 큰 이미지나 스크립트에 대한 최적화 제안
  if (data.type === 'image' && data.size > 500000) {
    console.warn('Consider optimizing large images or using next/image')
  }

  if (data.type === 'script' && data.size > 200000) {
    console.warn('Consider code splitting for large JavaScript bundles')
  }
}

// Long Task 처리
async function processLongTask(data: any) {
  if (data.duration > 100) {
    console.warn(`[Performance Alert] Long task detected: ${data.duration}ms`)
  }
}

// 메모리 사용량 처리
async function processMemoryUsage(data: any) {
  if (data.usagePercentage > 80) {
    console.warn(
      `[Performance Alert] High memory usage: ${data.usagePercentage.toFixed(1)}%`
    )
  }
}

// 메트릭 집계
function aggregateMetrics(metrics: CustomMetric[]) {
  const aggregated: Record<string, any> = {}

  metrics.forEach(metric => {
    if (!aggregated[metric.name]) {
      aggregated[metric.name] = {
        count: 0,
        data: [],
      }
    }

    aggregated[metric.name].count++
    aggregated[metric.name].data.push(metric.data)
  })

  // 각 메트릭 타입별 통계 계산
  Object.keys(aggregated).forEach(metricName => {
    const metricData = aggregated[metricName]

    switch (metricName) {
      case 'navigation-timing':
        metricData.stats = calculateNavigationStats(metricData.data)
        break
      case 'slow-resource':
        metricData.stats = calculateResourceStats(metricData.data)
        break
      case 'long-task':
        metricData.stats = calculateLongTaskStats(metricData.data)
        break
      case 'memory-usage':
        metricData.stats = calculateMemoryStats(metricData.data)
        break
    }
  })

  return aggregated
}

// Navigation Timing 통계
function calculateNavigationStats(data: any[]) {
  if (data.length === 0) return {}

  const domCompleteTimes = data.map(d => d.domComplete).filter(Boolean)
  const firstByteTimes = data.map(d => d.firstByte).filter(Boolean)

  return {
    domComplete: {
      average: average(domCompleteTimes),
      median: median(domCompleteTimes),
      p95: percentile(domCompleteTimes, 95),
    },
    firstByte: {
      average: average(firstByteTimes),
      median: median(firstByteTimes),
      p95: percentile(firstByteTimes, 95),
    },
  }
}

// 리소스 통계
function calculateResourceStats(data: any[]) {
  if (data.length === 0) return {}

  const sizes = data.map(d => d.size).filter(Boolean)
  const durations = data.map(d => d.duration).filter(Boolean)

  const typeGroups = data.reduce(
    (acc, d) => {
      if (!acc[d.type]) acc[d.type] = []
      acc[d.type].push(d)
      return acc
    },
    {} as Record<string, any[]>
  )

  return {
    totalResources: data.length,
    averageSize: average(sizes),
    averageDuration: average(durations),
    typeBreakdown: Object.keys(typeGroups).map(type => ({
      type,
      count: typeGroups[type].length,
      averageSize: average(typeGroups[type].map(d => d.size)),
    })),
  }
}

// Long Task 통계
function calculateLongTaskStats(data: any[]) {
  if (data.length === 0) return {}

  const durations = data.map(d => d.duration).filter(Boolean)

  return {
    totalLongTasks: data.length,
    averageDuration: average(durations),
    maxDuration: Math.max(...durations),
    tasksOver100ms: durations.filter(d => d > 100).length,
    tasksOver200ms: durations.filter(d => d > 200).length,
  }
}

// 메모리 통계
function calculateMemoryStats(data: any[]) {
  if (data.length === 0) return {}

  const usagePercentages = data.map(d => d.usagePercentage).filter(Boolean)
  const usedHeapSizes = data.map(d => d.usedJSHeapSize).filter(Boolean)

  return {
    averageUsage: average(usagePercentages),
    maxUsage: Math.max(...usagePercentages),
    averageHeapSize: average(usedHeapSizes),
    maxHeapSize: Math.max(...usedHeapSizes),
    highUsageCount: usagePercentages.filter(u => u > 80).length,
  }
}

// 유틸리티 함수들
function average(numbers: number[]): number {
  return numbers.length > 0
    ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length
    : 0
}

function median(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const sorted = [...numbers].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

function percentile(numbers: number[], p: number): number {
  if (numbers.length === 0) return 0
  const sorted = [...numbers].sort((a, b) => a - b)
  const index = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, index)]
}
