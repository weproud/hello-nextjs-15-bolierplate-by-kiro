#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

/**
 * TypeScript 에러 분석 및 분류 시스템
 *
 * 이 스크립트는 TypeScript 컴파일러의 에러 로그를 파싱하고
 * 카테고리별로 분류하여 우선순위를 매기는 시스템입니다.
 */

// 에러 카테고리 정의
const ERROR_CATEGORIES = {
  CRITICAL: 'critical',
  TYPE_SAFETY: 'type_safety',
  IMPORT_EXPORT: 'import_export',
  GENERIC: 'generic',
  MINOR: 'minor',
}

// 에러 우선순위 매트릭스
const PRIORITY_MATRIX = {
  [ERROR_CATEGORIES.CRITICAL]: 1,
  [ERROR_CATEGORIES.TYPE_SAFETY]: 2,
  [ERROR_CATEGORIES.IMPORT_EXPORT]: 3,
  [ERROR_CATEGORIES.GENERIC]: 4,
  [ERROR_CATEGORIES.MINOR]: 5,
}

// 에러 코드별 카테고리 매핑
const ERROR_CODE_MAPPING = {
  // Critical Errors - 빌드를 완전히 차단하는 에러
  TS2307: ERROR_CATEGORIES.CRITICAL, // Cannot find module
  TS2724: ERROR_CATEGORIES.CRITICAL, // has no exported member
  TS2305: ERROR_CATEGORIES.CRITICAL, // Module has no exported member
  TS2300: ERROR_CATEGORIES.CRITICAL, // Duplicate identifier
  TS2708: ERROR_CATEGORIES.CRITICAL, // Cannot use namespace as a value
  TS2694: ERROR_CATEGORIES.CRITICAL, // Namespace has no exported member

  // Type Safety Errors - 타입 안전성에 영향을 주는 에러
  TS2344: ERROR_CATEGORIES.TYPE_SAFETY, // Type does not satisfy constraint
  TS2345: ERROR_CATEGORIES.TYPE_SAFETY, // Argument of type is not assignable
  TS2322: ERROR_CATEGORIES.TYPE_SAFETY, // Type is not assignable
  TS2532: ERROR_CATEGORIES.TYPE_SAFETY, // Object is possibly undefined
  TS2551: ERROR_CATEGORIES.TYPE_SAFETY, // Property does not exist
  TS2769: ERROR_CATEGORIES.TYPE_SAFETY, // No overload matches this call
  TS2554: ERROR_CATEGORIES.TYPE_SAFETY, // Expected arguments but got
  TS2339: ERROR_CATEGORIES.TYPE_SAFETY, // Property does not exist on type
  TS7006: ERROR_CATEGORIES.TYPE_SAFETY, // Parameter implicitly has any type
  TS7030: ERROR_CATEGORIES.TYPE_SAFETY, // Not all code paths return a value

  // Import/Export Errors - 모듈 시스템 관련 에러
  TS2582: ERROR_CATEGORIES.IMPORT_EXPORT, // Cannot find name (test functions)
  TS2304: ERROR_CATEGORIES.IMPORT_EXPORT, // Cannot find name
  TS2353: ERROR_CATEGORIES.IMPORT_EXPORT, // Object literal may only specify known properties

  // Generic/Template Errors - 제네릭 타입 관련 에러
  TS4114: ERROR_CATEGORIES.GENERIC, // Override modifier required

  // Minor Type Errors - 기능에 영향을 주지 않는 경미한 에러
  TS2362: ERROR_CATEGORIES.MINOR, // The left-hand side of arithmetic operation
}

/**
 * TypeScript 에러 객체 정의
 */
class TypeScriptError {
  constructor(file, line, column, code, message, category, priority) {
    this.file = file
    this.line = parseInt(line) || 0
    this.column = parseInt(column) || 0
    this.code = code
    this.message = message
    this.category = category
    this.priority = priority
    this.dependencies = []
  }
}

/**
 * 에러 로그 파싱 함수
 * @param {string} logContent - TypeScript 에러 로그 내용
 * @returns {TypeScriptError[]} - 파싱된 에러 배열
 */
function parseErrorLog(logContent) {
  const errors = []
  const lines = logContent.split('\n')

  // TypeScript 에러 패턴: file(line,column): error TSxxxx: message
  const errorPattern = /^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/

  for (const line of lines) {
    const match = line.match(errorPattern)
    if (match) {
      const [, file, lineNum, column, code, message] = match
      const category = categorizeError(code, message, file)
      const priority = PRIORITY_MATRIX[category]

      const error = new TypeScriptError(
        file,
        lineNum,
        column,
        code,
        message,
        category,
        priority
      )

      errors.push(error)
    }
  }

  return errors
}

/**
 * 에러 카테고리 분류 함수
 * @param {string} code - TypeScript 에러 코드
 * @param {string} message - 에러 메시지
 * @param {string} file - 파일 경로
 * @returns {string} - 에러 카테고리
 */
function categorizeError(code, message, file) {
  // 에러 코드 기반 분류
  if (ERROR_CODE_MAPPING[code]) {
    return ERROR_CODE_MAPPING[code]
  }

  // 파일 경로 기반 분류
  if (file.includes('__tests__') || file.includes('.test.')) {
    return ERROR_CATEGORIES.MINOR
  }

  if (file.includes('.next/types/')) {
    return ERROR_CATEGORIES.CRITICAL
  }

  // 메시지 기반 분류
  if (
    message.includes('Cannot find module') ||
    message.includes('has no exported member')
  ) {
    return ERROR_CATEGORIES.CRITICAL
  }

  if (
    message.includes('is not assignable') ||
    message.includes('does not exist')
  ) {
    return ERROR_CATEGORIES.TYPE_SAFETY
  }

  // 기본값
  return ERROR_CATEGORIES.MINOR
}

/**
 * 의존성 관계 매핑 함수
 * @param {TypeScriptError[]} errors - 에러 배열
 * @returns {TypeScriptError[]} - 의존성이 매핑된 에러 배열
 */
function mapDependencies(errors) {
  const fileErrorMap = new Map()

  // 파일별 에러 그룹핑
  errors.forEach(error => {
    if (!fileErrorMap.has(error.file)) {
      fileErrorMap.set(error.file, [])
    }
    fileErrorMap.get(error.file).push(error)
  })

  // 의존성 관계 설정
  errors.forEach(error => {
    // import/export 에러는 다른 파일의 타입 에러에 영향을 줄 수 있음
    if (error.category === ERROR_CATEGORIES.CRITICAL) {
      const relatedFiles = findRelatedFiles(error.file, errors)
      error.dependencies = relatedFiles
    }

    // 타입 정의 파일의 에러는 다른 파일에 영향을 줄 수 있음
    if (error.file.includes('types/') || error.file.includes('index.ts')) {
      const dependentFiles = findDependentFiles(error.file, errors)
      error.dependencies = dependentFiles
    }
  })

  return errors
}

/**
 * 관련 파일 찾기 함수
 * @param {string} file - 기준 파일
 * @param {TypeScriptError[]} errors - 전체 에러 배열
 * @returns {string[]} - 관련 파일 목록
 */
function findRelatedFiles(file, errors) {
  const related = []
  const baseName = path.basename(file, path.extname(file))

  errors.forEach(error => {
    if (error.file !== file && error.file.includes(baseName)) {
      related.push(error.file)
    }
  })

  return [...new Set(related)]
}

/**
 * 의존하는 파일 찾기 함수
 * @param {string} file - 기준 파일
 * @param {TypeScriptError[]} errors - 전체 에러 배열
 * @returns {string[]} - 의존하는 파일 목록
 */
function findDependentFiles(file, errors) {
  const dependent = []
  const directory = path.dirname(file)

  errors.forEach(error => {
    if (error.file !== file && error.file.startsWith(directory)) {
      dependent.push(error.file)
    }
  })

  return [...new Set(dependent)]
}

/**
 * 에러 통계 생성 함수
 * @param {TypeScriptError[]} errors - 에러 배열
 * @returns {Object} - 에러 통계 객체
 */
function generateErrorStats(errors) {
  const stats = {
    total: errors.length,
    byCategory: {},
    byPriority: {},
    byFile: {},
    topFiles: [],
    criticalCount: 0,
    resolutionEstimate: 0,
  }

  // 카테고리별 통계
  Object.values(ERROR_CATEGORIES).forEach(category => {
    stats.byCategory[category] = errors.filter(
      e => e.category === category
    ).length
  })

  // 우선순위별 통계
  Object.values(PRIORITY_MATRIX).forEach(priority => {
    stats.byPriority[priority] = errors.filter(
      e => e.priority === priority
    ).length
  })

  // 파일별 통계
  errors.forEach(error => {
    stats.byFile[error.file] = (stats.byFile[error.file] || 0) + 1
  })

  // 상위 에러 파일 목록
  stats.topFiles = Object.entries(stats.byFile)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([file, count]) => ({ file, count }))

  // 크리티컬 에러 수
  stats.criticalCount = stats.byCategory[ERROR_CATEGORIES.CRITICAL]

  // 해결 시간 추정 (에러당 평균 5분 가정)
  stats.resolutionEstimate = Math.ceil((errors.length * 5) / 60) // 시간 단위

  return stats
}

/**
 * 해결 계획 생성 함수
 * @param {TypeScriptError[]} errors - 에러 배열
 * @returns {Object} - 해결 계획 객체
 */
function generateResolutionPlan(errors) {
  // 우선순위별로 에러 정렬
  const sortedErrors = errors.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority
    }
    // 같은 우선순위면 파일별로 그룹핑
    return a.file.localeCompare(b.file)
  })

  const phases = [
    {
      name: 'Phase 1: Critical Infrastructure Errors',
      description: '빌드를 차단하는 핵심 에러 해결',
      errors: sortedErrors.filter(
        e => e.category === ERROR_CATEGORIES.CRITICAL
      ),
      estimatedTime: '2-4 hours',
    },
    {
      name: 'Phase 2: Type Safety Corrections',
      description: '타입 안전성 관련 에러 해결',
      errors: sortedErrors.filter(
        e => e.category === ERROR_CATEGORIES.TYPE_SAFETY
      ),
      estimatedTime: '4-8 hours',
    },
    {
      name: 'Phase 3: Import/Export Issues',
      description: '모듈 시스템 관련 에러 해결',
      errors: sortedErrors.filter(
        e => e.category === ERROR_CATEGORIES.IMPORT_EXPORT
      ),
      estimatedTime: '2-4 hours',
    },
    {
      name: 'Phase 4: Generic and Template Issues',
      description: '제네릭 타입 관련 에러 해결',
      errors: sortedErrors.filter(e => e.category === ERROR_CATEGORIES.GENERIC),
      estimatedTime: '1-2 hours',
    },
    {
      name: 'Phase 5: Minor Type Corrections',
      description: '경미한 타입 에러 해결',
      errors: sortedErrors.filter(e => e.category === ERROR_CATEGORIES.MINOR),
      estimatedTime: '2-4 hours',
    },
  ]

  return {
    phases: phases.filter(phase => phase.errors.length > 0),
    totalErrors: errors.length,
    estimatedTotalTime: '11-22 hours',
    riskLevel:
      errors.length > 300 ? 'high' : errors.length > 100 ? 'medium' : 'low',
  }
}

/**
 * 결과를 JSON 파일로 저장하는 함수
 * @param {Object} data - 저장할 데이터
 * @param {string} filename - 파일명
 */
function saveToFile(data, filename) {
  const outputPath = path.join(process.cwd(), filename)
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8')
  console.log(`✅ 결과가 ${filename}에 저장되었습니다.`)
}

/**
 * 콘솔에 요약 정보를 출력하는 함수
 * @param {Object} stats - 에러 통계
 * @param {Object} plan - 해결 계획
 */
function printSummary(stats, plan) {
  console.log('\n🔍 TypeScript 에러 분석 결과')
  console.log('='.repeat(50))

  console.log(`\n📊 전체 통계:`)
  console.log(`  총 에러 수: ${stats.total}개`)
  console.log(`  크리티컬 에러: ${stats.criticalCount}개`)
  console.log(`  예상 해결 시간: ${stats.resolutionEstimate}시간`)
  console.log(`  위험도: ${plan.riskLevel}`)

  console.log(`\n📂 카테고리별 분포:`)
  Object.entries(stats.byCategory).forEach(([category, count]) => {
    if (count > 0) {
      console.log(`  ${category}: ${count}개`)
    }
  })

  console.log(`\n🏆 상위 에러 파일:`)
  stats.topFiles.slice(0, 5).forEach(({ file, count }, index) => {
    console.log(`  ${index + 1}. ${file}: ${count}개`)
  })

  console.log(`\n🚀 해결 계획:`)
  plan.phases.forEach((phase, index) => {
    console.log(`  ${index + 1}. ${phase.name}`)
    console.log(`     에러 수: ${phase.errors.length}개`)
    console.log(`     예상 시간: ${phase.estimatedTime}`)
  })

  console.log('\n💡 다음 단계:')
  console.log('  1. typescript-error-analysis.json 파일을 확인하세요')
  console.log('  2. Phase 1부터 순차적으로 에러를 해결하세요')
  console.log('  3. 각 단계 완료 후 `pnpm type-check`로 검증하세요')
}

/**
 * 메인 실행 함수
 */
function main() {
  try {
    console.log('🔍 TypeScript 에러 분석을 시작합니다...')

    // 에러 로그 파일 읽기
    const logPath = path.join(process.cwd(), 'typescript-errors.log')

    if (!fs.existsSync(logPath)) {
      console.error('❌ typescript-errors.log 파일을 찾을 수 없습니다.')
      console.log(
        '💡 먼저 다음 명령어를 실행하세요: pnpm type-check 2>&1 | tee typescript-errors.log'
      )
      process.exit(1)
    }

    const logContent = fs.readFileSync(logPath, 'utf8')

    // 에러 파싱 및 분류
    console.log('📝 에러 로그를 파싱하고 있습니다...')
    const errors = parseErrorLog(logContent)

    if (errors.length === 0) {
      console.log('🎉 TypeScript 에러가 발견되지 않았습니다!')
      return
    }

    console.log('🏷️  에러를 카테고리별로 분류하고 있습니다...')
    const categorizedErrors = mapDependencies(errors)

    console.log('📈 통계를 생성하고 있습니다...')
    const stats = generateErrorStats(categorizedErrors)

    console.log('📋 해결 계획을 수립하고 있습니다...')
    const plan = generateResolutionPlan(categorizedErrors)

    // 결과 저장
    const analysisResult = {
      timestamp: new Date().toISOString(),
      errors: categorizedErrors,
      statistics: stats,
      resolutionPlan: plan,
      metadata: {
        totalFiles: [...new Set(errors.map(e => e.file))].length,
        errorCodes: [...new Set(errors.map(e => e.code))],
        categories: Object.keys(stats.byCategory).filter(
          cat => stats.byCategory[cat] > 0
        ),
      },
    }

    saveToFile(analysisResult, 'typescript-error-analysis.json')

    // 요약 정보 출력
    printSummary(stats, plan)
  } catch (error) {
    console.error('❌ 에러 분석 중 오류가 발생했습니다:', error.message)
    process.exit(1)
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main()
}

module.exports = {
  parseErrorLog,
  categorizeError,
  mapDependencies,
  generateErrorStats,
  generateResolutionPlan,
  TypeScriptError,
  ERROR_CATEGORIES,
  PRIORITY_MATRIX,
}
