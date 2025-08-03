#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// Type definitions for bundle analysis
interface BundleSizeLimits {
  [key: string]: number
}

interface PerformanceBudgets {
  totalJavaScript: number
  totalCSS: number
  totalImages: number
  chunkCount: number
}

interface Violation {
  type: 'bundle-size' | 'performance-budget'
  chunk?: string
  size?: number
  limit?: number
  excess?: number
  file?: string
  metric?: string
  value?: number
}

interface Recommendation {
  type: string
  title: string
  description: string
  actions: string[]
}

interface AnalysisResults {
  timestamp: string
  passed: boolean
  violations: Violation[]
  metrics: {
    totalJavaScript?: number
    totalCSS?: number
    chunkCount?: number
    pageCount?: number
  }
  recommendations: Recommendation[]
}

interface BuildManifest {
  pages?: Record<string, string[]>
  [key: string]: unknown
}

// Bundle size limits (in bytes)
const BUNDLE_SIZE_LIMITS: BundleSizeLimits = {
  // Main bundles
  'pages/_app': 250 * 1024, // 250KB
  'pages/index': 100 * 1024, // 100KB
  'pages/dashboard': 150 * 1024, // 150KB
  'pages/workspace': 150 * 1024, // 150KB
  'pages/projects': 120 * 1024, // 120KB
  'pages/posts': 120 * 1024, // 120KB

  // Component chunks
  'ui-components': 80 * 1024, // 80KB
  'form-components': 100 * 1024, // 100KB
  'auth-components': 60 * 1024, // 60KB
  editor: 200 * 1024, // 200KB (TipTap is heavy)

  // Vendor chunks
  vendors: 500 * 1024, // 500KB
  framework: 300 * 1024, // 300KB
}

// Performance budget thresholds
const PERFORMANCE_BUDGETS: PerformanceBudgets = {
  totalJavaScript: 1000 * 1024, // 1MB total JS
  totalCSS: 100 * 1024, // 100KB total CSS
  totalImages: 2000 * 1024, // 2MB total images
  chunkCount: 20, // Maximum number of chunks
}

class BundleAnalyzer {
  private readonly buildDir: string
  private readonly reportDir: string
  private results: AnalysisResults

  constructor() {
    this.buildDir = path.join(process.cwd(), '.next')
    this.reportDir = path.join(process.cwd(), 'reports')
    this.results = {
      timestamp: new Date().toISOString(),
      passed: true,
      violations: [],
      metrics: {},
      recommendations: [],
    }
  }

  async analyze(): Promise<void> {
    console.log('🔍 Starting bundle analysis...')

    try {
      // Ensure build exists
      if (!fs.existsSync(this.buildDir)) {
        console.log('📦 Building application first...')
        execSync('pnpm build', { stdio: 'inherit' })
      }

      // Create reports directory
      if (!fs.existsSync(this.reportDir)) {
        fs.mkdirSync(this.reportDir, { recursive: true })
      }

      // Run bundle analyzer
      console.log('📊 Generating bundle report...')
      process.env.ANALYZE = 'true'
      execSync('pnpm build', { stdio: 'inherit' })

      // Analyze build output
      await this.analyzeBuildOutput()

      // Check bundle sizes
      await this.checkBundleSizes()

      // Check performance budgets
      await this.checkPerformanceBudgets()

      // Generate recommendations
      this.generateRecommendations()

      // Save report
      await this.saveReport()

      // Print results
      this.printResults()

      // Exit with appropriate code
      process.exit(this.results.passed ? 0 : 1)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.error('❌ Bundle analysis failed:', errorMessage)
      process.exit(1)
    }
  }

  private async analyzeBuildOutput(): Promise<void> {
    const buildManifest = path.join(this.buildDir, 'build-manifest.json')

    if (!fs.existsSync(buildManifest)) {
      throw new Error('Build manifest not found. Please run build first.')
    }

    const manifestContent = fs.readFileSync(buildManifest, 'utf8')
    const manifest: BuildManifest = JSON.parse(manifestContent)

    // Analyze pages
    const pages = manifest.pages || {}
    this.results.metrics.pageCount = Object.keys(pages).length

    // Analyze static files
    const staticDir = path.join(this.buildDir, 'static')
    if (fs.existsSync(staticDir)) {
      this.analyzeStaticFiles(staticDir)
    }
  }

  private analyzeStaticFiles(staticDir: string): void {
    const chunks = path.join(staticDir, 'chunks')
    if (!fs.existsSync(chunks)) return

    let totalJSSize = 0
    let totalCSSSize = 0
    let chunkCount = 0

    const analyzeDirectory = (dir: string): void => {
      const files = fs.readdirSync(dir)

      for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
          analyzeDirectory(filePath)
        } else if (stat.isFile()) {
          const size = stat.size

          if (file.endsWith('.js')) {
            totalJSSize += size
            chunkCount++
          } else if (file.endsWith('.css')) {
            totalCSSSize += size
          }
        }
      }
    }

    analyzeDirectory(chunks)

    this.results.metrics.totalJavaScript = totalJSSize
    this.results.metrics.totalCSS = totalCSSSize
    this.results.metrics.chunkCount = chunkCount
  }

  private async checkBundleSizes(): Promise<void> {
    console.log('📏 Checking bundle sizes against limits...')

    const chunksDir = path.join(this.buildDir, 'static', 'chunks')
    if (!fs.existsSync(chunksDir)) return

    const checkDirectory = (dir: string, prefix = ''): void => {
      const files = fs.readdirSync(dir)

      for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
          checkDirectory(filePath, `${prefix}${file}/`)
        } else if (file.endsWith('.js')) {
          const chunkName = this.getChunkName(prefix + file)
          const size = stat.size
          const limit = BUNDLE_SIZE_LIMITS[chunkName]

          if (limit && size > limit) {
            this.results.passed = false
            this.results.violations.push({
              type: 'bundle-size',
              chunk: chunkName,
              size: size,
              limit: limit,
              excess: size - limit,
              file: prefix + file,
            })
          }
        }
      }
    }

    checkDirectory(chunksDir)
  }

  private getChunkName(filename: string): string {
    // Extract meaningful chunk names from filenames
    if (filename.includes('pages/_app')) return 'pages/_app'
    if (filename.includes('pages/index')) return 'pages/index'
    if (filename.includes('pages/dashboard')) return 'pages/dashboard'
    if (filename.includes('pages/workspace')) return 'pages/workspace'
    if (filename.includes('pages/projects')) return 'pages/projects'
    if (filename.includes('pages/posts')) return 'pages/posts'
    if (filename.includes('ui-components')) return 'ui-components'
    if (filename.includes('form-components')) return 'form-components'
    if (filename.includes('auth-components')) return 'auth-components'
    if (filename.includes('editor')) return 'editor'
    if (filename.includes('vendors')) return 'vendors'
    if (filename.includes('framework')) return 'framework'

    return 'other'
  }

  private async checkPerformanceBudgets(): Promise<void> {
    console.log('💰 Checking performance budgets...')

    const metrics = this.results.metrics

    // Check total JavaScript size
    if (
      metrics.totalJavaScript &&
      metrics.totalJavaScript > PERFORMANCE_BUDGETS.totalJavaScript
    ) {
      this.results.passed = false
      this.results.violations.push({
        type: 'performance-budget',
        metric: 'totalJavaScript',
        value: metrics.totalJavaScript,
        limit: PERFORMANCE_BUDGETS.totalJavaScript,
        excess: metrics.totalJavaScript - PERFORMANCE_BUDGETS.totalJavaScript,
      })
    }

    // Check total CSS size
    if (metrics.totalCSS && metrics.totalCSS > PERFORMANCE_BUDGETS.totalCSS) {
      this.results.passed = false
      this.results.violations.push({
        type: 'performance-budget',
        metric: 'totalCSS',
        value: metrics.totalCSS,
        limit: PERFORMANCE_BUDGETS.totalCSS,
        excess: metrics.totalCSS - PERFORMANCE_BUDGETS.totalCSS,
      })
    }

    // Check chunk count
    if (
      metrics.chunkCount &&
      metrics.chunkCount > PERFORMANCE_BUDGETS.chunkCount
    ) {
      this.results.passed = false
      this.results.violations.push({
        type: 'performance-budget',
        metric: 'chunkCount',
        value: metrics.chunkCount,
        limit: PERFORMANCE_BUDGETS.chunkCount,
        excess: metrics.chunkCount - PERFORMANCE_BUDGETS.chunkCount,
      })
    }
  }

  private generateRecommendations(): void {
    const violations = this.results.violations

    // Bundle size recommendations
    const bundleViolations = violations.filter(v => v.type === 'bundle-size')
    if (bundleViolations.length > 0) {
      this.results.recommendations.push({
        type: 'bundle-optimization',
        title: 'Optimize large bundles',
        description:
          'Some bundles exceed size limits. Consider code splitting or removing unused dependencies.',
        actions: [
          'Use dynamic imports for heavy components',
          'Remove unused dependencies',
          'Enable tree shaking',
          'Use lighter alternatives for heavy libraries',
        ],
      })
    }

    // Performance budget recommendations
    const budgetViolations = violations.filter(
      v => v.type === 'performance-budget'
    )
    if (budgetViolations.length > 0) {
      this.results.recommendations.push({
        type: 'performance-optimization',
        title: 'Reduce overall bundle size',
        description: 'Total bundle size exceeds performance budget.',
        actions: [
          'Implement lazy loading for non-critical components',
          'Use CDN for large libraries',
          'Optimize images and assets',
          'Enable compression (gzip/brotli)',
        ],
      })
    }

    // General recommendations
    this.results.recommendations.push({
      type: 'monitoring',
      title: 'Set up continuous monitoring',
      description: 'Monitor bundle sizes in CI/CD pipeline.',
      actions: [
        'Add bundle size checks to CI',
        'Set up performance monitoring',
        'Use bundle analyzer in development',
        'Track Core Web Vitals',
      ],
    })
  }

  private async saveReport(): Promise<void> {
    const reportPath = path.join(
      this.reportDir,
      `bundle-analysis-${Date.now()}.json`
    )
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2))

    // Also save a latest report
    const latestPath = path.join(this.reportDir, 'bundle-analysis-latest.json')
    fs.writeFileSync(latestPath, JSON.stringify(this.results, null, 2))

    console.log(`📄 Report saved to: ${reportPath}`)
  }

  private printResults(): void {
    console.log('\n' + '='.repeat(60))
    console.log('📊 BUNDLE ANALYSIS RESULTS')
    console.log('='.repeat(60))

    // Print metrics
    console.log('\n📈 Metrics:')
    console.log(
      `  Total JavaScript: ${this.formatBytes(this.results.metrics.totalJavaScript || 0)}`
    )
    console.log(
      `  Total CSS: ${this.formatBytes(this.results.metrics.totalCSS || 0)}`
    )
    console.log(`  Chunk Count: ${this.results.metrics.chunkCount || 0}`)
    console.log(`  Page Count: ${this.results.metrics.pageCount || 0}`)

    // Print violations
    if (this.results.violations.length > 0) {
      console.log('\n❌ Violations:')
      this.results.violations.forEach((violation, index) => {
        console.log(`  ${index + 1}. ${violation.type.toUpperCase()}`)
        if (violation.chunk) {
          console.log(`     Chunk: ${violation.chunk}`)
          console.log(
            `     Size: ${this.formatBytes(violation.size || 0)} (limit: ${this.formatBytes(violation.limit || 0)})`
          )
          console.log(`     Excess: ${this.formatBytes(violation.excess || 0)}`)
        } else if (violation.metric) {
          console.log(`     Metric: ${violation.metric}`)
          console.log(
            `     Value: ${this.formatValue(violation.metric, violation.value || 0)}`
          )
          console.log(
            `     Limit: ${this.formatValue(violation.metric, violation.limit || 0)}`
          )
        }
      })
    } else {
      console.log('\n✅ No violations found!')
    }

    // Print recommendations
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      this.results.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec.title}`)
        console.log(`     ${rec.description}`)
        rec.actions.forEach(action => {
          console.log(`     • ${action}`)
        })
      })
    }

    // Print final result
    console.log('\n' + '='.repeat(60))
    if (this.results.passed) {
      console.log('✅ BUNDLE ANALYSIS PASSED')
    } else {
      console.log('❌ BUNDLE ANALYSIS FAILED')
    }
    console.log('='.repeat(60))
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private formatValue(metric: string, value: number): string {
    if (
      metric.includes('Size') ||
      metric.includes('JavaScript') ||
      metric.includes('CSS')
    ) {
      return this.formatBytes(value)
    }
    return value.toString()
  }
}

// Run analysis if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new BundleAnalyzer()
  analyzer.analyze().catch(console.error)
}

export default BundleAnalyzer
