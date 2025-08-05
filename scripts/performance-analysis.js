#!/usr/bin/env node

/**
 * 성능 분석 스크립트
 * 
 * 프로젝트의 성능 상태를 분석하고 최적화 권장사항을 제공합니다.
 */

const fs = require('fs')
const path = require('path')

class PerformanceAnalyzer {
  constructor() {
    this.results = []
    this.recommendations = []
  }

  /**
   * 모든 성능 분석을 실행합니다.
   */
  async runAnalysis() {
    console.log('🔍 성능 분석을 시작합니다...\n')

    // 1. Next.js 최적화 설정 분석
    this.analyzeNextJsOptimizations()

    // 2. Import 최적화 분석
    this.analyzeImportOptimizations()

    // 3. 번들 설정 분석
    this.analyzeBundleConfiguration()

    // 4. 캐시 전략 분석
    this.analyzeCacheStrategy()

    // 5. 이미지 최적화 분석
    this.analyzeImageOptimization()

    // 6. 코드 분할 분석
    this.analyzeCodeSplitting()

    // 결과 출력
    this.printResults()
  }

  /**
   * Next.js 최적화 설정을 분석합니다.
   */
  analyzeNextJsOptimizations() {
    try {
      const nextConfig = fs.readFileSync('next.config.ts', 'utf-8')
      
      // optimizePackageImports 확인
      if (nextConfig.includes('optimizePackageImports')) {
        this.addResult('Next.js 패키지 최적화', 'pass', 'optimizePackageImports가 설정되어 있습니다.')
      } else {
        this.addResult('Next.js 패키지 최적화', 'warning', 'optimizePackageImports 설정을 권장합니다.')
        this.addRecommendation('패키지 Import 최적화', 
          'next.config.ts에 optimizePackageImports를 추가하여 번들 크기를 줄이세요.',
          ['lucide-react', 'react-hook-form', 'zod 등 주요 라이브러리 추가'])
      }

      // Turbo 설정 확인
      if (nextConfig.includes('turbo')) {
        this.addResult('Turbo 설정', 'pass', 'Turbo 설정이 활성화되어 있습니다.')
      } else {
        this.addResult('Turbo 설정', 'warning', 'Turbo 설정을 권장합니다.')
      }

      // 컴파일러 최적화 확인
      if (nextConfig.includes('removeConsole')) {
        this.addResult('프로덕션 최적화', 'pass', '프로덕션에서 console 제거가 설정되어 있습니다.')
      } else {
        this.addResult('프로덕션 최적화', 'warning', '프로덕션 console 제거 설정을 권장합니다.')
      }
    } catch (error) {
      this.addResult('Next.js 설정', 'fail', 'next.config.ts를 읽을 수 없습니다.')
    }
  }

  /**
   * Import 최적화를 분석합니다.
   */
  analyzeImportOptimizations() {
    // 샘플 파일들에서 import 패턴 분석
    const sampleFiles = [
      'src/app/page.tsx',
      'src/components/ui/button.tsx',
      'src/lib/utils.ts'
    ]

    let absoluteImports = 0
    let relativeImports = 0
    let namedImports = 0
    let defaultImports = 0

    for (const file of sampleFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8')
        const lines = content.split('\n')

        for (const line of lines) {
          if (line.trim().startsWith('import')) {
            if (line.includes("from '@/")) {
              absoluteImports++
            } else if (line.includes("from './") || line.includes("from '../")) {
              relativeImports++
            }

            if (line.includes('{') && line.includes('}')) {
              namedImports++
            } else if (!line.includes('*')) {
              defaultImports++
            }
          }
        }
      }
    }

    if (relativeImports === 0) {
      this.addResult('Import 경로 최적화', 'pass', '모든 import가 절대 경로를 사용합니다.')
    } else {
      this.addResult('Import 경로 최적화', 'warning', `${relativeImports}개의 상대 경로 import가 발견되었습니다.`)
    }

    if (namedImports > defaultImports) {
      this.addResult('Tree Shaking 최적화', 'pass', 'Named import가 많이 사용되어 Tree Shaking에 유리합니다.')
    } else {
      this.addResult('Tree Shaking 최적화', 'warning', 'Named import 사용을 늘려 Tree Shaking을 개선하세요.')
      this.addRecommendation('Tree Shaking 개선',
        'Default import 대신 Named import를 사용하여 번들 크기를 줄이세요.',
        ['import { Button } from "@/components/ui/button"', '대신 import Button from "..." 사용 지양'])
    }
  }

  /**
   * 번들 설정을 분석합니다.
   */
  analyzeBundleConfiguration() {
    // Bundle analyzer 설정 확인
    try {
      const nextConfig = fs.readFileSync('next.config.ts', 'utf-8')
      if (nextConfig.includes('withBundleAnalyzer')) {
        this.addResult('번들 분석기', 'pass', '번들 분석기가 설정되어 있습니다.')
      } else {
        this.addResult('번들 분석기', 'warning', '번들 분석기 설정을 권장합니다.')
      }
    } catch (error) {
      this.addResult('번들 설정', 'fail', '번들 설정을 확인할 수 없습니다.')
    }

    // Performance config 확인
    if (fs.existsSync('performance.config.js')) {
      this.addResult('성능 설정', 'pass', '성능 설정 파일이 존재합니다.')
    } else {
      this.addResult('성능 설정', 'warning', '성능 설정 파일을 만드는 것을 권장합니다.')
    }
  }

  /**
   * 캐시 전략을 분석합니다.
   */
  analyzeCacheStrategy() {
    // 캐시 관련 파일들 확인
    const cacheFiles = [
      'src/lib/cache',
      'performance.config.js'
    ]

    let cacheImplementations = 0
    for (const file of cacheFiles) {
      if (fs.existsSync(file)) {
        cacheImplementations++
      }
    }

    if (cacheImplementations >= 1) {
      this.addResult('캐시 전략', 'pass', '캐시 전략이 구현되어 있습니다.')
    } else {
      this.addResult('캐시 전략', 'warning', '캐시 전략 구현을 권장합니다.')
      this.addRecommendation('캐시 전략 구현',
        '메모리 캐시와 Next.js 캐시를 활용하여 성능을 개선하세요.',
        ['React Query/SWR 도입', 'Next.js revalidate 설정', '메모리 캐시 구현'])
    }
  }

  /**
   * 이미지 최적화를 분석합니다.
   */
  analyzeImageOptimization() {
    try {
      const nextConfig = fs.readFileSync('next.config.ts', 'utf-8')
      
      if (nextConfig.includes('images')) {
        this.addResult('이미지 최적화', 'pass', 'Next.js 이미지 최적화가 설정되어 있습니다.')
      } else {
        this.addResult('이미지 최적화', 'warning', 'Next.js 이미지 최적화 설정을 권장합니다.')
      }

      // WebP/AVIF 지원 확인
      if (nextConfig.includes('webp') || nextConfig.includes('avif')) {
        this.addResult('최신 이미지 포맷', 'pass', '최신 이미지 포맷이 지원됩니다.')
      } else {
        this.addResult('최신 이미지 포맷', 'warning', 'WebP/AVIF 포맷 지원을 권장합니다.')
      }
    } catch (error) {
      this.addResult('이미지 최적화', 'fail', '이미지 설정을 확인할 수 없습니다.')
    }
  }

  /**
   * 코드 분할을 분석합니다.
   */
  analyzeCodeSplitting() {
    // 동적 import 사용 확인
    const files = [
      'src/components/lazy',
      'src/app'
    ]

    let dynamicImports = 0
    for (const dir of files) {
      if (fs.existsSync(dir)) {
        try {
          const files = this.getFilesRecursively(dir)
          for (const file of files) {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
              const content = fs.readFileSync(file, 'utf-8')
              if (content.includes('dynamic(') || content.includes('import(')) {
                dynamicImports++
              }
            }
          }
        } catch (error) {
          // 파일 읽기 오류 무시
        }
      }
    }

    if (dynamicImports > 0) {
      this.addResult('코드 분할', 'pass', `${dynamicImports}개의 동적 import가 발견되었습니다.`)
    } else {
      this.addResult('코드 분할', 'warning', '동적 import를 사용한 코드 분할을 권장합니다.')
      this.addRecommendation('코드 분할 구현',
        '큰 컴포넌트나 라이브러리를 동적으로 로드하여 초기 번들 크기를 줄이세요.',
        ['React.lazy() 사용', 'Next.js dynamic() 사용', '라우트 기반 분할'])
    }
  }

  /**
   * 디렉토리에서 모든 파일을 재귀적으로 가져옵니다.
   */
  getFilesRecursively(dir) {
    const files = []
    try {
      const items = fs.readdirSync(dir)
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
          files.push(...this.getFilesRecursively(fullPath))
        } else {
          files.push(fullPath)
        }
      }
    } catch (error) {
      // 디렉토리 읽기 오류 무시
    }
    return files
  }

  /**
   * 결과를 추가합니다.
   */
  addResult(name, status, message) {
    this.results.push({ name, status, message })
  }

  /**
   * 권장사항을 추가합니다.
   */
  addRecommendation(title, description, actions) {
    this.recommendations.push({ title, description, actions })
  }

  /**
   * 분석 결과를 출력합니다.
   */
  printResults() {
    console.log('\n📊 성능 분석 결과:\n')

    let passCount = 0
    let failCount = 0
    let warningCount = 0

    for (const result of this.results) {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'
      console.log(`${icon} ${result.name}: ${result.message}`)

      if (result.status === 'pass') passCount++
      else if (result.status === 'fail') failCount++
      else warningCount++
    }

    console.log(`\n📈 요약: 통과 ${passCount}개, 경고 ${warningCount}개, 실패 ${failCount}개`)

    if (this.recommendations.length > 0) {
      console.log('\n💡 최적화 권장사항:\n')
      for (const rec of this.recommendations) {
        console.log(`🔧 ${rec.title}`)
        console.log(`   ${rec.description}`)
        for (const action of rec.actions) {
          console.log(`   - ${action}`)
        }
        console.log()
      }
    }

    if (failCount === 0 && warningCount <= 2) {
      console.log('🎉 성능 최적화가 잘 되어 있습니다!')
    } else {
      console.log('🔧 성능 개선 여지가 있습니다.')
    }

    return failCount === 0
  }
}

// 스크립트 실행
async function main() {
  const analyzer = new PerformanceAnalyzer()
  const success = await analyzer.runAnalysis()
  process.exit(success ? 0 : 1)
}

if (require.main === module) {
  main().catch(console.error)
}
