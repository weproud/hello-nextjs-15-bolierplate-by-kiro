#!/usr/bin/env node

/**
 * 빌드 시스템 검증 스크립트
 * 
 * Next.js 빌드 시스템의 상태를 검증합니다.
 */

const fs = require('fs')
const path = require('path')

class BuildValidator {
  constructor() {
    this.results = []
  }

  /**
   * 모든 검증을 실행합니다.
   */
  async runValidation() {
    console.log('🔍 빌드 시스템 검증을 시작합니다...\n')

    // 1. Next.js 설정 검증
    this.validateNextConfig()

    // 2. 패키지 의존성 검증
    this.validatePackageDependencies()

    // 3. 빌드 관련 스크립트 검증
    this.validateBuildScripts()

    // 4. 환경 설정 검증
    this.validateEnvironmentConfig()

    // 5. 정적 자산 검증
    this.validateStaticAssets()

    // 결과 출력
    this.printResults()
  }

  /**
   * Next.js 설정을 검증합니다.
   */
  validateNextConfig() {
    try {
      // next.config.ts 파일 존재 확인
      if (fs.existsSync('next.config.ts')) {
        const content = fs.readFileSync('next.config.ts', 'utf-8')
        
        // 기본 설정 확인
        const hasExperimentalConfig = content.includes('experimental')
        const hasOptimizePackageImports = content.includes('optimizePackageImports')
        const hasBundleAnalyzer = content.includes('withBundleAnalyzer')
        
        if (hasExperimentalConfig && hasOptimizePackageImports) {
          this.addResult('Next.js 설정', 'pass', 'Next.js 설정이 올바르게 구성되어 있습니다.')
        } else {
          this.addResult('Next.js 설정', 'warning', '일부 최적화 설정이 누락되었습니다.')
        }

        if (hasBundleAnalyzer) {
          this.addResult('번들 분석기', 'pass', '번들 분석기가 설정되어 있습니다.')
        } else {
          this.addResult('번들 분석기', 'warning', '번들 분석기가 설정되지 않았습니다.')
        }
      } else {
        this.addResult('Next.js 설정', 'fail', 'next.config.ts 파일이 없습니다.')
      }
    } catch (error) {
      this.addResult('Next.js 설정', 'fail', 'Next.js 설정 파일을 읽을 수 없습니다.')
    }
  }

  /**
   * 패키지 의존성을 검증합니다.
   */
  validatePackageDependencies() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      const deps = packageJson.dependencies || {}
      const devDeps = packageJson.devDependencies || {}

      // 필수 의존성 확인
      const requiredDeps = ['next', 'react', 'react-dom']
      const missingDeps = requiredDeps.filter(dep => !deps[dep])

      if (missingDeps.length === 0) {
        this.addResult('필수 의존성', 'pass', '모든 필수 의존성이 설치되어 있습니다.')
      } else {
        this.addResult('필수 의존성', 'fail', `누락된 의존성: ${missingDeps.join(', ')}`)
      }

      // TypeScript 관련 의존성 확인
      const hasTypeScript = devDeps['typescript'] || deps['typescript']
      const hasTypes = devDeps['@types/node'] && devDeps['@types/react']

      if (hasTypeScript && hasTypes) {
        this.addResult('TypeScript 의존성', 'pass', 'TypeScript 관련 의존성이 올바르게 설정되어 있습니다.')
      } else {
        this.addResult('TypeScript 의존성', 'warning', 'TypeScript 관련 의존성이 부족합니다.')
      }

      // 빌드 도구 확인
      const hasTailwind = deps['tailwindcss'] || devDeps['tailwindcss']
      const hasESLint = devDeps['eslint']
      const hasPrettier = devDeps['prettier']

      let buildToolsCount = 0
      if (hasTailwind) buildToolsCount++
      if (hasESLint) buildToolsCount++
      if (hasPrettier) buildToolsCount++

      if (buildToolsCount >= 2) {
        this.addResult('빌드 도구', 'pass', `빌드 도구가 잘 설정되어 있습니다. (${buildToolsCount}개)`)
      } else {
        this.addResult('빌드 도구', 'warning', '일부 빌드 도구가 누락되었습니다.')
      }
    } catch (error) {
      this.addResult('패키지 의존성', 'fail', 'package.json을 읽을 수 없습니다.')
    }
  }

  /**
   * 빌드 관련 스크립트를 검증합니다.
   */
  validateBuildScripts() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      const scripts = packageJson.scripts || {}

      // 필수 스크립트 확인
      const requiredScripts = ['dev', 'build', 'start']
      const missingScripts = requiredScripts.filter(script => !scripts[script])

      if (missingScripts.length === 0) {
        this.addResult('빌드 스크립트', 'pass', '모든 필수 빌드 스크립트가 존재합니다.')
      } else {
        this.addResult('빌드 스크립트', 'fail', `누락된 스크립트: ${missingScripts.join(', ')}`)
      }

      // 추가 유용한 스크립트 확인
      const usefulScripts = ['lint', 'type-check', 'test']
      const existingUsefulScripts = usefulScripts.filter(script => scripts[script])

      if (existingUsefulScripts.length >= 2) {
        this.addResult('추가 스크립트', 'pass', `유용한 스크립트가 설정되어 있습니다. (${existingUsefulScripts.join(', ')})`)
      } else {
        this.addResult('추가 스크립트', 'warning', '추가 유용한 스크립트를 설정하는 것을 권장합니다.')
      }
    } catch (error) {
      this.addResult('빌드 스크립트', 'fail', 'package.json의 scripts를 읽을 수 없습니다.')
    }
  }

  /**
   * 환경 설정을 검증합니다.
   */
  validateEnvironmentConfig() {
    // .env 파일들 확인
    const envFiles = ['.env', '.env.local', '.env.example']
    const existingEnvFiles = envFiles.filter(file => fs.existsSync(file))

    if (existingEnvFiles.length > 0) {
      this.addResult('환경 설정', 'pass', `환경 설정 파일이 존재합니다. (${existingEnvFiles.join(', ')})`)
    } else {
      this.addResult('환경 설정', 'warning', '환경 설정 파일이 없습니다.')
    }

    // next-env.d.ts 확인
    if (fs.existsSync('next-env.d.ts')) {
      this.addResult('Next.js 타입 정의', 'pass', 'Next.js 타입 정의 파일이 존재합니다.')
    } else {
      this.addResult('Next.js 타입 정의', 'warning', 'next-env.d.ts 파일이 없습니다.')
    }
  }

  /**
   * 정적 자산을 검증합니다.
   */
  validateStaticAssets() {
    // public 디렉토리 확인
    if (fs.existsSync('public')) {
      const publicFiles = fs.readdirSync('public')
      this.addResult('정적 자산', 'pass', `public 디렉토리가 존재합니다. (${publicFiles.length}개 파일)`)
    } else {
      this.addResult('정적 자산', 'warning', 'public 디렉토리가 없습니다.')
    }

    // 스타일 파일 확인
    const styleFiles = ['src/app/globals.css', 'tailwind.config.ts']
    const existingStyleFiles = styleFiles.filter(file => fs.existsSync(file))

    if (existingStyleFiles.length >= 1) {
      this.addResult('스타일 설정', 'pass', `스타일 파일이 설정되어 있습니다. (${existingStyleFiles.join(', ')})`)
    } else {
      this.addResult('스타일 설정', 'warning', '스타일 설정 파일이 부족합니다.')
    }
  }

  /**
   * 결과를 추가합니다.
   */
  addResult(name, status, message) {
    this.results.push({ name, status, message })
  }

  /**
   * 검증 결과를 출력합니다.
   */
  printResults() {
    console.log('\n📊 빌드 시스템 검증 결과:\n')

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

    if (failCount === 0) {
      console.log('\n🎉 빌드 시스템 검증을 통과했습니다!')
    } else {
      console.log('\n🔧 일부 문제를 해결해야 합니다.')
    }

    return failCount === 0
  }
}

// 스크립트 실행
async function main() {
  const validator = new BuildValidator()
  const success = await validator.runValidation()
  process.exit(success ? 0 : 1)
}

if (require.main === module) {
  main().catch(console.error)
}
