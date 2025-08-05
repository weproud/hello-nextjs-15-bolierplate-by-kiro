#!/usr/bin/env node

/**
 * 코드 품질 최종 검토 스크립트
 * 
 * ESLint, Prettier, TypeScript 등을 실행하여 코드 품질을 검증합니다.
 */

const { execSync } = require('child_process')
const fs = require('fs')

class CodeQualityChecker {
  constructor() {
    this.results = []
    this.errors = []
  }

  /**
   * 코드 품질 검사를 실행합니다.
   */
  async runQualityCheck() {
    console.log('🔍 코드 품질 최종 검토를 시작합니다...\n')

    // 1. Prettier 포맷팅 검사
    await this.checkPrettierFormatting()

    // 2. ESLint 검사
    await this.runESLintCheck()

    // 3. TypeScript 타입 검사
    await this.runTypeScriptCheck()

    // 4. 패키지 의존성 검사
    await this.checkPackageDependencies()

    // 5. 파일 구조 검증
    await this.validateFileStructure()

    // 결과 출력
    this.printResults()
  }

  /**
   * Prettier 포맷팅을 검사합니다.
   */
  async checkPrettierFormatting() {
    console.log('🎨 Prettier 포맷팅 검사 중...')
    
    try {
      // Prettier 체크 (실제로 변경하지 않고 검사만)
      execSync('npx prettier --check .', { 
        stdio: 'pipe',
        timeout: 30000 
      })
      
      this.addResult('Prettier 포맷팅', 'pass', '모든 파일이 올바르게 포맷팅되어 있습니다.')
    } catch (error) {
      this.addResult('Prettier 포맷팅', 'warning', 'Prettier 포맷팅이 필요한 파일이 있습니다.')
      this.addError('Prettier', error.stdout?.toString() || error.message)
    }
  }

  /**
   * ESLint 검사를 실행합니다.
   */
  async runESLintCheck() {
    console.log('🔧 ESLint 검사 중...')
    
    try {
      // ESLint 실행 (경고 포함)
      execSync('npx eslint src --ext .ts,.tsx --max-warnings=0', { 
        stdio: 'pipe',
        timeout: 60000 
      })
      
      this.addResult('ESLint', 'pass', 'ESLint 검사를 통과했습니다.')
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || error.message
      
      if (output.includes('warning')) {
        this.addResult('ESLint', 'warning', 'ESLint 경고가 있습니다.')
      } else {
        this.addResult('ESLint', 'fail', 'ESLint 오류가 있습니다.')
      }
      
      this.addError('ESLint', output)
    }
  }

  /**
   * TypeScript 타입 검사를 실행합니다.
   */
  async runTypeScriptCheck() {
    console.log('📝 TypeScript 타입 검사 중...')
    
    try {
      // TypeScript 컴파일 검사
      execSync('npx tsc --noEmit', { 
        stdio: 'pipe',
        timeout: 120000 
      })
      
      this.addResult('TypeScript', 'pass', 'TypeScript 타입 검사를 통과했습니다.')
    } catch (error) {
      this.addResult('TypeScript', 'fail', 'TypeScript 타입 오류가 있습니다.')
      this.addError('TypeScript', error.stdout?.toString() || error.message)
    }
  }

  /**
   * 패키지 의존성을 검사합니다.
   */
  async checkPackageDependencies() {
    console.log('📦 패키지 의존성 검사 중...')
    
    try {
      // package.json 읽기
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      
      // 필수 스크립트 확인
      const requiredScripts = ['dev', 'build', 'start', 'lint', 'type-check']
      const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script])
      
      if (missingScripts.length === 0) {
        this.addResult('패키지 스크립트', 'pass', '모든 필수 스크립트가 존재합니다.')
      } else {
        this.addResult('패키지 스크립트', 'warning', `누락된 스크립트: ${missingScripts.join(', ')}`)
      }

      // 의존성 버전 확인
      const deps = packageJson.dependencies || {}
      const devDeps = packageJson.devDependencies || {}
      
      this.addResult('패키지 의존성', 'pass', 
        `의존성: ${Object.keys(deps).length}개, 개발 의존성: ${Object.keys(devDeps).length}개`)
        
    } catch (error) {
      this.addResult('패키지 의존성', 'fail', 'package.json을 읽을 수 없습니다.')
      this.addError('Package', error.message)
    }
  }

  /**
   * 파일 구조를 검증합니다.
   */
  async validateFileStructure() {
    console.log('📁 파일 구조 검증 중...')
    
    const requiredDirs = [
      'src/app',
      'src/components',
      'src/hooks',
      'src/lib',
      'src/types'
    ]
    
    const requiredFiles = [
      'src/components/index.ts',
      'src/hooks/index.ts',
      'src/lib/index.ts',
      'src/types/index.ts'
    ]
    
    let missingItems = []
    
    // 디렉토리 확인
    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        missingItems.push(dir)
      }
    }
    
    // 파일 확인
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        missingItems.push(file)
      }
    }
    
    if (missingItems.length === 0) {
      this.addResult('파일 구조', 'pass', '모든 필수 파일과 디렉토리가 존재합니다.')
    } else {
      this.addResult('파일 구조', 'fail', `누락된 항목: ${missingItems.join(', ')}`)
    }
  }

  /**
   * 결과를 추가합니다.
   */
  addResult(name, status, message) {
    this.results.push({ name, status, message })
  }

  /**
   * 오류를 추가합니다.
   */
  addError(category, message) {
    this.errors.push({ category, message })
  }

  /**
   * 검사 결과를 출력합니다.
   */
  printResults() {
    console.log('\n📊 코드 품질 검사 결과:\n')

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

    // 오류 상세 정보 출력
    if (this.errors.length > 0) {
      console.log('\n🔍 상세 오류 정보:\n')
      for (const error of this.errors) {
        console.log(`📋 ${error.category}:`)
        console.log(error.message.substring(0, 500) + (error.message.length > 500 ? '...' : ''))
        console.log()
      }
    }

    if (failCount === 0) {
      console.log('🎉 코드 품질 검사를 통과했습니다!')
    } else {
      console.log('🔧 일부 문제를 해결해야 합니다.')
    }

    return failCount === 0
  }

  /**
   * 자동 수정을 실행합니다.
   */
  async runAutoFix() {
    console.log('\n🔧 자동 수정을 실행합니다...\n')

    try {
      // Prettier 자동 포맷팅
      console.log('🎨 Prettier 자동 포맷팅...')
      execSync('npx prettier --write .', { stdio: 'inherit', timeout: 30000 })
      
      // ESLint 자동 수정
      console.log('🔧 ESLint 자동 수정...')
      execSync('npx eslint src --ext .ts,.tsx --fix', { stdio: 'inherit', timeout: 60000 })
      
      console.log('✅ 자동 수정이 완료되었습니다.')
    } catch (error) {
      console.log('❌ 자동 수정 중 오류가 발생했습니다:', error.message)
    }
  }
}

// 스크립트 실행
async function main() {
  const checker = new CodeQualityChecker()
  const success = await checker.runQualityCheck()
  
  if (!success) {
    console.log('\n🤔 자동 수정을 시도하시겠습니까? (일부 문제는 자동으로 해결될 수 있습니다)')
    // 실제 환경에서는 사용자 입력을 받을 수 있지만, 여기서는 자동으로 실행
    await checker.runAutoFix()
  }
  
  process.exit(success ? 0 : 1)
}

if (require.main === module) {
  main().catch(console.error)
}
