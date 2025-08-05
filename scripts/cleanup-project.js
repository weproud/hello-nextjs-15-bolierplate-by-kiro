#!/usr/bin/env node

/**
 * 프로젝트 정리 스크립트
 * 
 * 불필요한 파일들을 식별하고 정리합니다.
 */

const fs = require('fs')
const path = require('path')

class ProjectCleaner {
  constructor() {
    this.filesToRemove = []
    this.filesToKeep = []
    this.summary = {
      removed: 0,
      kept: 0,
      totalSize: 0
    }
  }

  /**
   * 프로젝트 정리를 실행합니다.
   */
  async cleanup() {
    console.log('🧹 프로젝트 정리를 시작합니다...\n')

    // 1. 임시 파일 및 분석 보고서 식별
    this.identifyTemporaryFiles()

    // 2. 중복 파일 식별
    this.identifyDuplicateFiles()

    // 3. 사용되지 않는 스크립트 식별
    this.identifyUnusedScripts()

    // 4. 백업 파일 식별
    this.identifyBackupFiles()

    // 5. 정리 계획 출력
    this.printCleanupPlan()

    // 6. 사용자 확인 후 정리 실행
    await this.executeCleanup()
  }

  /**
   * 임시 파일 및 분석 보고서를 식별합니다.
   */
  identifyTemporaryFiles() {
    const temporaryPatterns = [
      // 분석 보고서들
      'components-circular-deps-report.json',
      'components-import-transformation-report.json',
      'hook-dependency-analysis-report.json',
      'import-transformation-report-v2.json',
      'import-transformation-report.json',
      'import-validation-report.json',
      'project-structure-analysis.json',
      'typescript-error-analysis.json',
      'typescript-errors.log',
      
      // 변환 요약 파일들
      'components-import-transformation-summary.md',
      'hooks-import-transformation-summary.md',
      'lib-import-transformation-summary.md',
      'providers-contexts-import-transformation-summary.md',
      'providers-contexts-validation-report.md',
      'services-stores-import-transformation-summary.md',
      'types-data-i18n-test-import-transformation-summary.md',
      
      // 기타 임시 파일들
      'SCHEMA_REFACTORING_SUMMARY.md',
      'TYPESCRIPT_ERROR_RESOLUTION_SUMMARY.md',
      'REF.md',
      'run-analysis.js',
      'validate-cache.js',
      
      // TypeScript 빌드 캐시
      'tsconfig.tsbuildinfo'
    ]

    for (const pattern of temporaryPatterns) {
      if (fs.existsSync(pattern)) {
        const stats = fs.statSync(pattern)
        this.filesToRemove.push({
          path: pattern,
          size: stats.size,
          type: 'temporary',
          reason: '임시 파일 또는 분석 보고서'
        })
      }
    }
  }

  /**
   * 중복 파일을 식별합니다.
   */
  identifyDuplicateFiles() {
    // scripts 디렉토리에서 중복 또는 사용되지 않는 스크립트 확인
    const scriptsToCheck = [
      'scripts/transform-components-simple.js', // 더 고급 버전이 있음
      'scripts/import-path-transformer.ts', // v2가 있음
    ]

    for (const script of scriptsToCheck) {
      if (fs.existsSync(script)) {
        const stats = fs.statSync(script)
        this.filesToRemove.push({
          path: script,
          size: stats.size,
          type: 'duplicate',
          reason: '더 나은 버전이 존재하는 중복 파일'
        })
      }
    }
  }

  /**
   * 사용되지 않는 스크립트를 식별합니다.
   */
  identifyUnusedScripts() {
    // 분석용으로만 사용된 스크립트들 (이제 필요 없음)
    const unusedScripts = [
      'scripts/check-circular-deps.js',
      'scripts/generate-error-matrix.js',
      'scripts/analyze-hook-dependencies.js',
      'scripts/analyze-provider-context-dependencies.js',
      'scripts/analyze-provider-dependencies.js',
      'scripts/analyze-typescript-errors.ts',
      'scripts/transform-components-imports.ts'
    ]

    for (const script of unusedScripts) {
      if (fs.existsSync(script)) {
        const stats = fs.statSync(script)
        this.filesToRemove.push({
          path: script,
          size: stats.size,
          type: 'unused',
          reason: '분석 완료 후 더 이상 필요하지 않은 스크립트'
        })
      }
    }
  }

  /**
   * 백업 파일을 식별합니다.
   */
  identifyBackupFiles() {
    // .bak 파일들 확인
    const findBackupFiles = (dir) => {
      try {
        const files = fs.readdirSync(dir)
        for (const file of files) {
          const fullPath = path.join(dir, file)
          const stats = fs.statSync(fullPath)
          
          if (stats.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            findBackupFiles(fullPath)
          } else if (file.endsWith('.bak') || file.endsWith('.backup')) {
            this.filesToRemove.push({
              path: fullPath,
              size: stats.size,
              type: 'backup',
              reason: '백업 파일'
            })
          }
        }
      } catch (error) {
        // 디렉토리 읽기 오류 무시
      }
    }

    findBackupFiles('src')
  }

  /**
   * 정리 계획을 출력합니다.
   */
  printCleanupPlan() {
    console.log('📋 정리 계획:\n')

    if (this.filesToRemove.length === 0) {
      console.log('✨ 정리할 파일이 없습니다. 프로젝트가 이미 깔끔합니다!')
      return
    }

    // 타입별로 그룹화
    const groupedFiles = {}
    let totalSize = 0

    for (const file of this.filesToRemove) {
      if (!groupedFiles[file.type]) {
        groupedFiles[file.type] = []
      }
      groupedFiles[file.type].push(file)
      totalSize += file.size
    }

    // 타입별 출력
    for (const [type, files] of Object.entries(groupedFiles)) {
      const typeNames = {
        temporary: '📄 임시 파일',
        duplicate: '📋 중복 파일',
        unused: '🗑️  사용되지 않는 파일',
        backup: '💾 백업 파일'
      }

      console.log(`${typeNames[type] || type}:`)
      for (const file of files) {
        const sizeKB = (file.size / 1024).toFixed(1)
        console.log(`  - ${file.path} (${sizeKB} KB) - ${file.reason}`)
      }
      console.log()
    }

    console.log(`📊 총 ${this.filesToRemove.length}개 파일, ${(totalSize / 1024).toFixed(1)} KB`)
    this.summary.totalSize = totalSize
  }

  /**
   * 정리를 실행합니다.
   */
  async executeCleanup() {
    if (this.filesToRemove.length === 0) {
      return
    }

    console.log('\n🗑️  파일 정리를 실행합니다...\n')

    let removedCount = 0
    let removedSize = 0

    for (const file of this.filesToRemove) {
      try {
        fs.unlinkSync(file.path)
        console.log(`✅ 삭제됨: ${file.path}`)
        removedCount++
        removedSize += file.size
      } catch (error) {
        console.log(`❌ 삭제 실패: ${file.path} - ${error.message}`)
      }
    }

    console.log(`\n🎉 정리 완료: ${removedCount}개 파일 삭제, ${(removedSize / 1024).toFixed(1)} KB 절약`)
    
    this.summary.removed = removedCount
    this.summary.kept = this.filesToRemove.length - removedCount
  }

  /**
   * 중요한 파일들을 보호합니다.
   */
  isProtectedFile(filePath) {
    const protectedPatterns = [
      'package.json',
      'package-lock.json',
      'pnpm-lock.yaml',
      'tsconfig.json',
      'next.config.ts',
      'eslint.config.ts',
      'vitest.config.ts',
      'postcss.config.mjs',
      'components.json',
      'performance.config.js',
      '.env',
      '.env.local',
      '.env.example',
      'README.md',
      'Makefile'
    ]

    return protectedPatterns.some(pattern => filePath.includes(pattern))
  }

  /**
   * 유용한 스크립트들을 식별합니다.
   */
  identifyUsefulScripts() {
    const usefulScripts = [
      'scripts/analyze-bundle.ts',
      'scripts/analyze-project-structure.ts',
      'scripts/backup-restore.ts',
      'scripts/import-path-transformer-v2.ts',
      'scripts/validate-imports.ts',
      'scripts/build-validation.js',
      'scripts/performance-analysis.js',
      'scripts/typescript-validation.js',
      'scripts/quick-validation.ts'
    ]

    console.log('\n📚 유지할 유용한 스크립트들:')
    for (const script of usefulScripts) {
      if (fs.existsSync(script)) {
        console.log(`  ✅ ${script}`)
        this.filesToKeep.push(script)
      }
    }
  }
}

// 스크립트 실행
async function main() {
  const cleaner = new ProjectCleaner()
  await cleaner.cleanup()
  
  // 유용한 스크립트들도 표시
  cleaner.identifyUsefulScripts()
  
  console.log('\n✨ 프로젝트 정리가 완료되었습니다!')
}

if (require.main === module) {
  main().catch(console.error)
}
