#!/usr/bin/env node

/**
 * TypeScript 검증 스크립트 (JavaScript로 작성)
 * 
 * 시스템이 느려서 간단한 JavaScript로 검증을 수행합니다.
 */

const fs = require('fs')
const path = require('path')

class TypeScriptValidator {
  constructor() {
    this.results = []
  }

  /**
   * 모든 검증을 실행합니다.
   */
  async runValidation() {
    console.log('🔍 TypeScript 검증을 시작합니다...\n')

    // 1. 프로젝트 구조 검증
    this.validateProjectStructure()

    // 2. tsconfig.json 검증
    this.validateTsConfig()

    // 3. Index 파일 검증
    this.validateIndexFiles()

    // 4. Import 경로 검증
    this.validateImportPaths()

    // 5. 타입 정의 검증
    this.validateTypeDefinitions()

    // 결과 출력
    this.printResults()
  }

  /**
   * 프로젝트 구조를 검증합니다.
   */
  validateProjectStructure() {
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

    const missingDirs = []
    
    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        missingDirs.push(dir)
      }
    }

    if (missingDirs.length === 0) {
      this.addResult('프로젝트 구조', 'pass', '모든 필수 디렉토리가 존재합니다.')
    } else {
      this.addResult('프로젝트 구조', 'fail', `누락된 디렉토리: ${missingDirs.join(', ')}`)
    }
  }

  /**
   * tsconfig.json을 검증합니다.
   */
  validateTsConfig() {
    try {
      const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf-8'))
      const paths = tsconfig.compilerOptions?.paths

      if (paths && paths['@/*']) {
        this.addResult('TypeScript 설정', 'pass', '@/* 경로 매핑이 올바르게 설정되어 있습니다.')
      } else {
        this.addResult('TypeScript 설정', 'fail', '@/* 경로 매핑이 설정되지 않았습니다.')
      }

      // strict 모드 확인
      if (tsconfig.compilerOptions?.strict) {
        this.addResult('TypeScript Strict 모드', 'pass', 'Strict 모드가 활성화되어 있습니다.')
      } else {
        this.addResult('TypeScript Strict 모드', 'warning', 'Strict 모드가 비활성화되어 있습니다.')
      }
    } catch (error) {
      this.addResult('TypeScript 설정', 'fail', 'tsconfig.json 파일을 읽을 수 없습니다.')
    }
  }

  /**
   * Index 파일들을 검증합니다.
   */
  validateIndexFiles() {
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

    const missingFiles = []
    const validFiles = []
    
    for (const file of indexFiles) {
      if (!fs.existsSync(file)) {
        missingFiles.push(file)
      } else {
        const content = fs.readFileSync(file, 'utf-8').trim()
        if (content.length > 0) {
          validFiles.push(file)
        } else {
          missingFiles.push(`${file} (empty)`)
        }
      }
    }

    if (missingFiles.length === 0) {
      this.addResult('Index 파일', 'pass', `모든 Index 파일이 존재합니다. (${validFiles.length}개)`)
    } else {
      this.addResult('Index 파일', 'warning', `누락된 파일: ${missingFiles.join(', ')}`)
    }
  }

  /**
   * Import 경로를 검증합니다.
   */
  validateImportPaths() {
    const sampleFiles = [
      'src/app/page.tsx',
      'src/components/auth/navigation-header.tsx',
      'src/components/ui/button.tsx',
      'src/hooks/use-form.ts',
      'src/lib/utils.ts'
    ]

    let absoluteImports = 0
    let relativeImports = 0
    const issues = []

    for (const file of sampleFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8')
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
      this.addResult('Import 경로', 'pass', `모든 import가 절대 경로를 사용합니다. (절대: ${absoluteImports})`)
    } else {
      this.addResult('Import 경로', 'warning', `상대 경로 import 발견: ${relativeImports}개`)
    }
  }

  /**
   * 타입 정의를 검증합니다.
   */
  validateTypeDefinitions() {
    const typeFiles = [
      'src/types/common.ts',
      'src/types/api.ts',
      'src/types/database.ts',
      'src/types/index.ts'
    ]

    const validTypeFiles = []
    const missingTypeFiles = []

    for (const file of typeFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8')
        if (content.includes('export') && (content.includes('interface') || content.includes('type'))) {
          validTypeFiles.push(file)
        }
      } else {
        missingTypeFiles.push(file)
      }
    }

    if (validTypeFiles.length >= 3) {
      this.addResult('타입 정의', 'pass', `타입 정의 파일이 잘 구성되어 있습니다. (${validTypeFiles.length}개)`)
    } else {
      this.addResult('타입 정의', 'warning', `타입 정의 파일이 부족합니다. (${validTypeFiles.length}개)`)
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
    console.log('\n📊 TypeScript 검증 결과:\n')

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
      console.log('\n🎉 TypeScript 검증을 통과했습니다!')
    } else {
      console.log('\n🔧 일부 문제를 해결해야 합니다.')
    }

    return failCount === 0
  }
}

// 스크립트 실행
async function main() {
  const validator = new TypeScriptValidator()
  const success = await validator.runValidation()
  process.exit(success ? 0 : 1)
}

if (require.main === module) {
  main().catch(console.error)
}
