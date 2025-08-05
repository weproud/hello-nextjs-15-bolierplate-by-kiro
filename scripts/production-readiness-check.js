#!/usr/bin/env node

/**
 * 프로덕션 배포 준비 상태 검증 스크립트
 * 
 * 프로덕션 환경에서의 빌드, 배포, 성능을 검증합니다.
 */

const fs = require('fs')
const path = require('path')

class ProductionReadinessChecker {
  constructor() {
    this.results = []
    this.recommendations = []
  }

  /**
   * 프로덕션 준비 상태를 검증합니다.
   */
  async checkProductionReadiness() {
    console.log('🚀 프로덕션 배포 준비 상태 검증을 시작합니다...\n')

    // 1. 환경 설정 검증
    this.checkEnvironmentConfiguration()

    // 2. 빌드 설정 검증
    this.checkBuildConfiguration()

    // 3. 보안 설정 검증
    this.checkSecurityConfiguration()

    // 4. 성능 설정 검증
    this.checkPerformanceConfiguration()

    // 5. 데이터베이스 설정 검증
    this.checkDatabaseConfiguration()

    // 6. 배포 스크립트 검증
    this.checkDeploymentScripts()

    // 7. 모니터링 및 로깅 검증
    this.checkMonitoringAndLogging()

    // 결과 출력
    this.printResults()
  }

  /**
   * 환경 설정을 검증합니다.
   */
  checkEnvironmentConfiguration() {
    console.log('🌍 환경 설정 검증 중...')

    // .env 파일들 확인
    const envFiles = ['.env.example', '.env.local']
    const existingEnvFiles = envFiles.filter(file => fs.existsSync(file))

    if (existingEnvFiles.length > 0) {
      this.addResult('환경 변수 파일', 'pass', `환경 설정 파일이 존재합니다: ${existingEnvFiles.join(', ')}`)
    } else {
      this.addResult('환경 변수 파일', 'warning', '환경 설정 파일이 없습니다.')
      this.addRecommendation('환경 변수 설정', '.env.example 파일을 생성하여 필요한 환경 변수를 문서화하세요.')
    }

    // Next.js 환경 변수 검증
    try {
      const nextConfig = fs.readFileSync('next.config.ts', 'utf-8')
      if (nextConfig.includes('process.env.NODE_ENV')) {
        this.addResult('환경별 설정', 'pass', '환경별 설정이 구현되어 있습니다.')
      } else {
        this.addResult('환경별 설정', 'warning', '환경별 설정을 추가하는 것을 권장합니다.')
      }
    } catch (error) {
      this.addResult('Next.js 설정', 'fail', 'next.config.ts를 읽을 수 없습니다.')
    }
  }

  /**
   * 빌드 설정을 검증합니다.
   */
  checkBuildConfiguration() {
    console.log('🔨 빌드 설정 검증 중...')

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      const scripts = packageJson.scripts || {}

      // 필수 빌드 스크립트 확인
      const requiredScripts = ['build', 'start']
      const missingScripts = requiredScripts.filter(script => !scripts[script])

      if (missingScripts.length === 0) {
        this.addResult('빌드 스크립트', 'pass', '모든 필수 빌드 스크립트가 존재합니다.')
      } else {
        this.addResult('빌드 스크립트', 'fail', `누락된 스크립트: ${missingScripts.join(', ')}`)
      }

      // 프로덕션 최적화 스크립트 확인
      const optimizationScripts = ['build:analyze', 'quality:ci']
      const existingOptScripts = optimizationScripts.filter(script => scripts[script])

      if (existingOptScripts.length > 0) {
        this.addResult('최적화 스크립트', 'pass', `최적화 스크립트가 설정되어 있습니다: ${existingOptScripts.join(', ')}`)
      } else {
        this.addResult('최적화 스크립트', 'warning', '번들 분석 및 품질 검사 스크립트를 추가하는 것을 권장합니다.')
      }
    } catch (error) {
      this.addResult('빌드 설정', 'fail', 'package.json을 읽을 수 없습니다.')
    }

    // Next.js 빌드 최적화 확인
    try {
      const nextConfig = fs.readFileSync('next.config.ts', 'utf-8')
      
      const optimizations = [
        { key: 'optimizePackageImports', name: '패키지 Import 최적화' },
        { key: 'removeConsole', name: '프로덕션 Console 제거' },
        { key: 'images', name: '이미지 최적화' }
      ]

      for (const opt of optimizations) {
        if (nextConfig.includes(opt.key)) {
          this.addResult(opt.name, 'pass', `${opt.name}이 설정되어 있습니다.`)
        } else {
          this.addResult(opt.name, 'warning', `${opt.name} 설정을 권장합니다.`)
        }
      }
    } catch (error) {
      this.addResult('Next.js 최적화', 'fail', 'Next.js 설정을 확인할 수 없습니다.')
    }
  }

  /**
   * 보안 설정을 검증합니다.
   */
  checkSecurityConfiguration() {
    console.log('🔒 보안 설정 검증 중...')

    try {
      const nextConfig = fs.readFileSync('next.config.ts', 'utf-8')

      // 보안 헤더 확인
      if (nextConfig.includes('headers()')) {
        this.addResult('보안 헤더', 'pass', '보안 헤더가 설정되어 있습니다.')
      } else {
        this.addResult('보안 헤더', 'warning', '보안 헤더 설정을 권장합니다.')
        this.addRecommendation('보안 헤더', 'X-Frame-Options, X-Content-Type-Options 등의 보안 헤더를 설정하세요.')
      }

      // 이미지 보안 정책 확인
      if (nextConfig.includes('contentSecurityPolicy')) {
        this.addResult('이미지 보안', 'pass', '이미지 보안 정책이 설정되어 있습니다.')
      } else {
        this.addResult('이미지 보안', 'warning', '이미지 보안 정책 설정을 권장합니다.')
      }
    } catch (error) {
      this.addResult('보안 설정', 'fail', '보안 설정을 확인할 수 없습니다.')
    }

    // 환경 변수 보안 확인
    if (fs.existsSync('.env.example')) {
      this.addResult('환경 변수 보안', 'pass', '.env.example 파일로 환경 변수가 문서화되어 있습니다.')
    } else {
      this.addResult('환경 변수 보안', 'warning', '환경 변수 예시 파일을 생성하는 것을 권장합니다.')
    }
  }

  /**
   * 성능 설정을 검증합니다.
   */
  checkPerformanceConfiguration() {
    console.log('⚡ 성능 설정 검증 중...')

    // 성능 설정 파일 확인
    if (fs.existsSync('performance.config.js')) {
      this.addResult('성능 설정', 'pass', '성능 설정 파일이 존재합니다.')
    } else {
      this.addResult('성능 설정', 'warning', '성능 설정 파일을 생성하는 것을 권장합니다.')
    }

    // 번들 분석기 확인
    try {
      const nextConfig = fs.readFileSync('next.config.ts', 'utf-8')
      if (nextConfig.includes('withBundleAnalyzer')) {
        this.addResult('번들 분석', 'pass', '번들 분석기가 설정되어 있습니다.')
      } else {
        this.addResult('번들 분석', 'warning', '번들 분석기 설정을 권장합니다.')
      }
    } catch (error) {
      this.addResult('번들 분석', 'fail', '번들 분석 설정을 확인할 수 없습니다.')
    }

    // 캐시 전략 확인
    if (fs.existsSync('src/lib/cache')) {
      this.addResult('캐시 전략', 'pass', '캐시 전략이 구현되어 있습니다.')
    } else {
      this.addResult('캐시 전략', 'warning', '캐시 전략 구현을 권장합니다.')
    }
  }

  /**
   * 데이터베이스 설정을 검증합니다.
   */
  checkDatabaseConfiguration() {
    console.log('🗄️  데이터베이스 설정 검증 중...')

    // Prisma 설정 확인
    if (fs.existsSync('prisma/schema.prisma')) {
      this.addResult('Prisma 스키마', 'pass', 'Prisma 스키마 파일이 존재합니다.')
    } else {
      this.addResult('Prisma 스키마', 'warning', 'Prisma 스키마 파일이 없습니다.')
    }

    // 마이그레이션 확인
    if (fs.existsSync('prisma/migrations')) {
      this.addResult('데이터베이스 마이그레이션', 'pass', '마이그레이션 파일이 존재합니다.')
    } else {
      this.addResult('데이터베이스 마이그레이션', 'warning', '마이그레이션 파일이 없습니다.')
    }

    // 시드 파일 확인
    if (fs.existsSync('prisma/seed.ts')) {
      this.addResult('데이터베이스 시드', 'pass', '시드 파일이 존재합니다.')
    } else {
      this.addResult('데이터베이스 시드', 'warning', '시드 파일 생성을 권장합니다.')
    }
  }

  /**
   * 배포 스크립트를 검증합니다.
   */
  checkDeploymentScripts() {
    console.log('🚀 배포 스크립트 검증 중...')

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      const scripts = packageJson.scripts || {}

      // 배포 관련 스크립트 확인
      const deploymentScripts = ['pre-push', 'quality:ci', 'db:migrate:deploy']
      const existingDeployScripts = deploymentScripts.filter(script => scripts[script])

      if (existingDeployScripts.length > 0) {
        this.addResult('배포 스크립트', 'pass', `배포 관련 스크립트가 설정되어 있습니다: ${existingDeployScripts.join(', ')}`)
      } else {
        this.addResult('배포 스크립트', 'warning', '배포 자동화 스크립트를 추가하는 것을 권장합니다.')
        this.addRecommendation('배포 자동화', 'pre-push, quality:ci 등의 스크립트를 추가하여 배포 전 검증을 자동화하세요.')
      }
    } catch (error) {
      this.addResult('배포 스크립트', 'fail', '배포 스크립트를 확인할 수 없습니다.')
    }

    // Docker 설정 확인 (선택사항)
    if (fs.existsSync('Dockerfile') || fs.existsSync('docker-compose.yml')) {
      this.addResult('컨테이너화', 'pass', 'Docker 설정이 존재합니다.')
    } else {
      this.addResult('컨테이너화', 'info', 'Docker 설정이 없습니다. (선택사항)')
    }
  }

  /**
   * 모니터링 및 로깅을 검증합니다.
   */
  checkMonitoringAndLogging() {
    console.log('📊 모니터링 및 로깅 검증 중...')

    // 로깅 라이브러리 확인
    if (fs.existsSync('src/lib/logger.ts')) {
      this.addResult('로깅 시스템', 'pass', '로깅 시스템이 구현되어 있습니다.')
    } else {
      this.addResult('로깅 시스템', 'warning', '로깅 시스템 구현을 권장합니다.')
    }

    // 에러 처리 시스템 확인
    if (fs.existsSync('src/lib/error-handler.ts')) {
      this.addResult('에러 처리', 'pass', '에러 처리 시스템이 구현되어 있습니다.')
    } else {
      this.addResult('에러 처리', 'warning', '에러 처리 시스템 구현을 권장합니다.')
    }

    // 성능 모니터링 확인
    if (fs.existsSync('src/lib/performance-monitor.ts')) {
      this.addResult('성능 모니터링', 'pass', '성능 모니터링이 구현되어 있습니다.')
    } else {
      this.addResult('성능 모니터링', 'warning', '성능 모니터링 구현을 권장합니다.')
    }
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
  addRecommendation(title, description) {
    this.recommendations.push({ title, description })
  }

  /**
   * 검증 결과를 출력합니다.
   */
  printResults() {
    console.log('\n📊 프로덕션 배포 준비 상태 검증 결과:\n')

    let passCount = 0
    let failCount = 0
    let warningCount = 0
    let infoCount = 0

    for (const result of this.results) {
      const icons = {
        pass: '✅',
        fail: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      }
      
      const icon = icons[result.status] || '❓'
      console.log(`${icon} ${result.name}: ${result.message}`)

      if (result.status === 'pass') passCount++
      else if (result.status === 'fail') failCount++
      else if (result.status === 'warning') warningCount++
      else infoCount++
    }

    console.log(`\n📈 요약: 통과 ${passCount}개, 경고 ${warningCount}개, 실패 ${failCount}개, 정보 ${infoCount}개`)

    // 권장사항 출력
    if (this.recommendations.length > 0) {
      console.log('\n💡 배포 최적화 권장사항:\n')
      for (const rec of this.recommendations) {
        console.log(`🔧 ${rec.title}: ${rec.description}`)
      }
    }

    // 최종 판정
    if (failCount === 0) {
      console.log('\n🎉 프로덕션 배포 준비가 완료되었습니다!')
      if (warningCount > 0) {
        console.log('⚠️  일부 권장사항을 적용하면 더 나은 배포 환경을 구축할 수 있습니다.')
      }
    } else {
      console.log('\n🔧 프로덕션 배포 전에 해결해야 할 문제가 있습니다.')
    }

    return failCount === 0
  }
}

// 스크립트 실행
async function main() {
  const checker = new ProductionReadinessChecker()
  const success = await checker.checkProductionReadiness()
  process.exit(success ? 0 : 1)
}

if (require.main === module) {
  main().catch(console.error)
}
