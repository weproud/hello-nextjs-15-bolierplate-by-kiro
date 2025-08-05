#!/usr/bin/env tsx

/**
 * 빠른 프로젝트 검증 스크립트
 * 
 * 4. 전체 시스템 검증 및 최적화를 위한 빠른 검증 도구
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

interface ValidationResult {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: string[]
}

class QuickValidator {
  private results: ValidationResult[] = []

  /**
   * 모든 검증을 실행합니다.
   */
  public async runAllValidations(): Promise<void> {
    console.log('🔍 빠른 프로젝트 검증을 시작합니다...\n')

    // 1. 기본 파일 구조 검증
    this.validateProjectStructure()

    // 2. 주요 설정 파일 검증
    this.validateConfigFiles()

    // 3. Index 파일 검증
    this.validateIndexFiles()

    // 4. Import 경로 샘플링 검증
    this.validateImportPaths()

    // 5. 패키지 의존성 검증
    this.validateDependencies()

    // 결과 출력
    this.printResults()
  }

  /**
   * 프로젝트 구조를 검증합니다.
   */
  private validateProjectStructure(): void {
    const requiredDirs = [
      'src/app',
      'src/components',
      'src/hooks',
      'src/lib',
      'src/types',
      'src/providers',
      'src/services',
      'src/stores',
      'src/contexts',
      'src/data',
      'src/i18n',
      'src/test',
      'src/styles'
    ]

    const missingDirs: string[] = []
    
    for (const dir of requiredDirs) {
      if (!existsSync(dir)) {
        missingDirs.push(dir)
      }
    }

    if (missingDirs.length === 0) {
      this.results.push({
        name: '프로젝트 구조',
        status: 'pass',
        message: '모든 필수 디렉토리가 존재합니다.'
      })
    } else {
      this.results.push({
        name: '프로젝트 구조',
        status: 'fail',
        message: `누락된 디렉토리가 있습니다.`,
        details: missingDirs
      })
    }
  }

  /**
   * 주요 설정 파일을 검증합니다.
   */
  private validateConfigFiles(): void {
    const configFiles = [
      'package.json',
      'tsconfig.json',
      'next.config.ts',
      'tailwind.config.ts',
      '.eslintrc.json'
    ]

    const missingFiles: string[] = []
    
    for (const file of configFiles) {
      if (!existsSync(file)) {
        missingFiles.push(file)
      }
    }

    if (missingFiles.length === 0) {
      this.results.push({
        name: '설정 파일',
        status: 'pass',
        message: '모든 필수 설정 파일이 존재합니다.'
      })
    } else {
      this.results.push({
        name: '설정 파일',
        status: 'fail',
        message: `누락된 설정 파일이 있습니다.`,
        details: missingFiles
      })
    }

    // tsconfig.json의 path mapping 검증
    this.validateTsConfig()
  }

  /**
   * tsconfig.json의 path mapping을 검증합니다.
   */
  private validateTsConfig(): void {
    try {
      const tsconfig = JSON.parse(readFileSync('tsconfig.json', 'utf-8'))
      const paths = tsconfig.compilerOptions?.paths

      if (paths && paths['@/*']) {
        this.results.push({
          name: 'TypeScript Path Mapping',
          status: 'pass',
          message: '@/* 경로 매핑이 올바르게 설정되어 있습니다.'
        })
      } else {
        this.results.push({
          name: 'TypeScript Path Mapping',
          status: 'fail',
          message: '@/* 경로 매핑이 설정되지 않았습니다.'
        })
      }
    } catch (error) {
      this.results.push({
        name: 'TypeScript Path Mapping',
        status: 'fail',
        message: 'tsconfig.json 파일을 읽을 수 없습니다.'
      })
    }
  }

  /**
   * Index 파일들을 검증합니다.
   */
  private validateIndexFiles(): void {
    const indexFiles = [
      'src/components/index.ts',
      'src/hooks/index.ts',
      'src/lib/index.ts',
      'src/types/index.ts',
      'src/providers/index.ts',
      'src/services/index.ts',
      'src/stores/index.ts',
      'src/contexts/index.ts',
      'src/data/index.ts'
    ]

    const missingIndexFiles: string[] = []
    const validIndexFiles: string[] = []
    
    for (const file of indexFiles) {
      if (!existsSync(file)) {
        missingIndexFiles.push(file)
      } else {
        // 파일이 비어있지 않은지 확인
        const content = readFileSync(file, 'utf-8').trim()
        if (content.length > 0) {
          validIndexFiles.push(file)
        } else {
          missingIndexFiles.push(`${file} (empty)`)
        }
      }
    }

    if (missingIndexFiles.length === 0) {
      this.results.push({
        name: 'Index 파일',
        status: 'pass',
        message: `모든 Index 파일이 존재하고 내용이 있습니다. (${validIndexFiles.length}개)`
      })
    } else {
      this.results.push({
        name: 'Index 파일',
        status: 'warning',
        message: `일부 Index 파일이 누락되거나 비어있습니다.`,
        details: missingIndexFiles
      })
    }
  }

  /**
   * Import 경로를 샘플링하여 검증합니다.
   */
  private validateImportPaths(): void {
    const sampleFiles = [
      'src/app/page.tsx',
      'src/components/auth/navigation-header.tsx',
      'src/hooks/use-form.ts',
      'src/lib/utils.ts'
    ]

    let absoluteImports = 0
    let relativeImports = 0
    const issues: string[] = []

    for (const file of sampleFiles) {
      if (existsSync(file)) {
        const content = readFileSync(file, 'utf-8')
        const lines = content.split('\n')

        for (const line of lines) {
          if (line.trim().startsWith('import') && line.includes('from')) {
            if (line.includes("from '@/")) {
              absoluteImports++
            } else if (line.includes("from './") || line.includes("from '../")) {
              relativeImports++
              issues.push(`${file}: ${line.trim()}`)
            }
          }
        }
      }
    }

    if (relativeImports === 0) {
      this.results.push({
        name: 'Import 경로',
        status: 'pass',
        message: `모든 import가 절대 경로를 사용합니다. (절대: ${absoluteImports}, 상대: ${relativeImports})`
      })
    } else {
      this.results.push({
        name: 'Import 경로',
        status: 'warning',
        message: `일부 상대 경로 import가 발견되었습니다. (절대: ${absoluteImports}, 상대: ${relativeImports})`,
        details: issues.slice(0, 5) // 처음 5개만 표시
      })
    }
  }

  /**
   * 패키지 의존성을 검증합니다.
   */
  private validateDependencies(): void {
    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'))
      const deps = Object.keys(packageJson.dependencies || {})
      const devDeps = Object.keys(packageJson.devDependencies || {})

      this.results.push({
        name: '패키지 의존성',
        status: 'pass',
        message: `의존성: ${deps.length}개, 개발 의존성: ${devDeps.length}개`
      })
    } catch (error) {
      this.results.push({
        name: '패키지 의존성',
        status: 'fail',
        message: 'package.json을 읽을 수 없습니다.'
      })
    }
  }

  /**
   * 검증 결과를 출력합니다.
   */
  private printResults(): void {
    console.log('\n📊 검증 결과:\n')

    let passCount = 0
    let failCount = 0
    let warningCount = 0

    for (const result of this.results) {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'
      console.log(`${icon} ${result.name}: ${result.message}`)
      
      if (result.details && result.details.length > 0) {
        for (const detail of result.details) {
          console.log(`   - ${detail}`)
        }
      }

      if (result.status === 'pass') passCount++
      else if (result.status === 'fail') failCount++
      else warningCount++
    }

    console.log(`\n📈 요약: 통과 ${passCount}개, 경고 ${warningCount}개, 실패 ${failCount}개`)

    if (failCount === 0) {
      console.log('\n🎉 모든 필수 검증을 통과했습니다!')
    } else {
      console.log('\n🔧 일부 문제를 해결해야 합니다.')
    }
  }
}

// 스크립트 실행
async function main() {
  const validator = new QuickValidator()
  await validator.runAllValidations()
}

if (require.main === module) {
  main().catch(console.error)
}
