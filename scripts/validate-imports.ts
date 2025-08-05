#!/usr/bin/env tsx

import * as fs from 'fs'
import * as path from 'path'
import {
  ProjectStructureAnalyzer,
  type FileAnalysis,
} from './analyze-project-structure'

interface ImportValidationResult {
  isValid: boolean
  error?: string
  resolvedPath?: string
}

interface CircularDependency {
  cycle: string[]
  files: string[]
}

interface ValidationReport {
  totalFiles: number
  validImports: number
  invalidImports: number
  circularDependencies: CircularDependency[]
  invalidImportDetails: Array<{
    file: string
    import: string
    error: string
    lineNumber: number
  }>
  summary: {
    validationSuccess: boolean
    circularDependencyCount: number
    invalidImportCount: number
  }
}

class ImportValidator {
  private readonly srcDir: string
  private readonly projectRoot: string
  private readonly tsConfigPaths: Map<string, string[]>

  constructor(srcDir: string = 'src', projectRoot: string = '.') {
    this.srcDir = srcDir
    this.projectRoot = projectRoot
    this.tsConfigPaths = new Map()
    this.loadTsConfigPaths()
  }

  /**
   * tsconfig.json에서 path mapping을 로드합니다.
   */
  private loadTsConfigPaths(): void {
    try {
      // 하드코딩된 경로 매핑 사용 (tsconfig.json 파싱 대신)
      this.tsConfigPaths.set('@/*', ['./src/*'])
      this.tsConfigPaths.set('@/components/*', ['./src/components/*'])
      this.tsConfigPaths.set('@/lib/*', ['./src/lib/*'])
      this.tsConfigPaths.set('@/hooks/*', ['./src/hooks/*'])
      this.tsConfigPaths.set('@/types/*', ['./src/types/*'])
      this.tsConfigPaths.set('@/styles/*', ['./src/styles/*'])
      this.tsConfigPaths.set('@/test/*', ['./src/test/*'])
    } catch (error) {
      console.warn('⚠️  경로 매핑을 로드할 수 없습니다:', error)
    }
  }

  /**
   * import 경로를 실제 파일 경로로 해석합니다.
   */
  private resolveImportPath(
    importPath: string,
    fromFile: string
  ): ImportValidationResult {
    try {
      // 외부 라이브러리는 검증하지 않음
      if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
        return { isValid: true, resolvedPath: importPath }
      }

      let resolvedPath: string

      if (importPath.startsWith('@/')) {
        // 절대 경로 (@/) 해석
        const relativePath = importPath.replace('@/', '')
        resolvedPath = path.join(this.srcDir, relativePath)
      } else {
        // 상대 경로 해석
        const fromDir = path.dirname(fromFile)
        resolvedPath = path.resolve(fromDir, importPath)
      }

      // 파일 확장자가 없으면 가능한 확장자들을 시도
      const extensions = ['.ts', '.tsx', '.js', '.jsx']
      const possiblePaths = [
        resolvedPath,
        ...extensions.map(ext => resolvedPath + ext),
        ...extensions.map(ext => path.join(resolvedPath, 'index' + ext)),
      ]

      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath) && fs.statSync(possiblePath).isFile()) {
          return { isValid: true, resolvedPath: possiblePath }
        }
      }

      return {
        isValid: false,
        error: `파일을 찾을 수 없습니다: ${resolvedPath}`,
      }
    } catch (error) {
      return {
        isValid: false,
        error: `경로 해석 오류: ${error}`,
      }
    }
  }

  /**
   * 순환 의존성을 탐지합니다.
   */
  private detectCircularDependencies(
    files: FileAnalysis[]
  ): CircularDependency[] {
    const dependencyGraph = new Map<string, Set<string>>()
    const circularDependencies: CircularDependency[] = []

    // 의존성 그래프 구축
    for (const file of files) {
      const dependencies = new Set<string>()

      for (const imp of file.imports) {
        if (imp.type === 'relative' || imp.type === 'absolute') {
          const validation = this.resolveImportPath(imp.source, file.filePath)
          if (validation.isValid && validation.resolvedPath) {
            // 경로를 정규화
            const normalizedPath = path
              .resolve(validation.resolvedPath)
              .replace(/\\/g, '/')
            const normalizedFile = path
              .resolve(file.filePath)
              .replace(/\\/g, '/')

            if (normalizedPath !== normalizedFile) {
              dependencies.add(normalizedPath)
            }
          }
        }
      }

      const normalizedFile = path.resolve(file.filePath).replace(/\\/g, '/')
      dependencyGraph.set(normalizedFile, dependencies)
    }

    // DFS를 사용한 순환 의존성 탐지
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const currentPath: string[] = []

    const dfs = (node: string): boolean => {
      if (recursionStack.has(node)) {
        // 순환 의존성 발견
        const cycleStart = currentPath.indexOf(node)
        const cycle = currentPath.slice(cycleStart)
        cycle.push(node) // 순환을 완성

        circularDependencies.push({
          cycle: cycle.map(f => path.relative(this.projectRoot, f)),
          files: cycle,
        })
        return true
      }

      if (visited.has(node)) {
        return false
      }

      visited.add(node)
      recursionStack.add(node)
      currentPath.push(node)

      const dependencies = dependencyGraph.get(node) || new Set()
      for (const dependency of dependencies) {
        if (dfs(dependency)) {
          // 순환 의존성이 발견되면 더 이상 탐색하지 않음
          break
        }
      }

      recursionStack.delete(node)
      currentPath.pop()
      return false
    }

    // 모든 노드에서 DFS 시작
    for (const node of dependencyGraph.keys()) {
      if (!visited.has(node)) {
        dfs(node)
      }
    }

    return circularDependencies
  }

  /**
   * 모든 import를 검증합니다.
   */
  public validateImports(): ValidationReport {
    console.log('🔍 Import 패턴 검증 시작...')

    const analyzer = new ProjectStructureAnalyzer(this.srcDir)
    const analysis = analyzer.analyze()

    let validImports = 0
    let invalidImports = 0
    const invalidImportDetails: ValidationReport['invalidImportDetails'] = []

    console.log('📋 Import 경로 유효성 검사 중...')

    for (const file of analysis.files) {
      for (const imp of file.imports) {
        const validation = this.resolveImportPath(imp.source, file.filePath)

        if (validation.isValid) {
          validImports++
        } else {
          invalidImports++
          invalidImportDetails.push({
            file: file.filePath,
            import: imp.source,
            error: validation.error || '알 수 없는 오류',
            lineNumber: imp.lineNumber,
          })
        }
      }
    }

    console.log('🔄 순환 의존성 탐지 중...')
    const circularDependencies = this.detectCircularDependencies(analysis.files)

    const report: ValidationReport = {
      totalFiles: analysis.files.length,
      validImports,
      invalidImports,
      circularDependencies,
      invalidImportDetails,
      summary: {
        validationSuccess:
          invalidImports === 0 && circularDependencies.length === 0,
        circularDependencyCount: circularDependencies.length,
        invalidImportCount: invalidImports,
      },
    }

    return report
  }

  /**
   * 검증 결과를 콘솔에 출력합니다.
   */
  public printValidationReport(report: ValidationReport): void {
    console.log('\n📊 Import 검증 결과')
    console.log('='.repeat(50))

    // 전체 통계
    console.log('\n📈 검증 통계:')
    console.log(`  총 파일 수: ${report.totalFiles}`)
    console.log(`  유효한 import: ${report.validImports}`)
    console.log(`  무효한 import: ${report.invalidImports}`)
    console.log(`  순환 의존성: ${report.circularDependencies.length}개`)

    const successRate =
      report.validImports + report.invalidImports > 0
        ? (
            (report.validImports /
              (report.validImports + report.invalidImports)) *
            100
          ).toFixed(1)
        : '0.0'
    console.log(`  성공률: ${successRate}%`)

    // 무효한 import 상세 정보
    if (report.invalidImports > 0) {
      console.log('\n❌ 무효한 Import 목록:')
      report.invalidImportDetails
        .slice(0, 20) // 상위 20개만 표시
        .forEach((detail, index) => {
          console.log(`  ${index + 1}. ${detail.file}:${detail.lineNumber}`)
          console.log(`     Import: ${detail.import}`)
          console.log(`     오류: ${detail.error}`)
          console.log()
        })

      if (report.invalidImportDetails.length > 20) {
        console.log(
          `     ... 그 외 ${report.invalidImportDetails.length - 20}개`
        )
      }
    }

    // 순환 의존성 상세 정보
    if (report.circularDependencies.length > 0) {
      console.log('\n🔄 순환 의존성 목록:')
      report.circularDependencies.forEach((cycle, index) => {
        console.log(
          `  ${index + 1}. 순환 의존성 (${cycle.cycle.length}개 파일):`
        )
        cycle.cycle.forEach((file, i) => {
          const arrow = i < cycle.cycle.length - 1 ? ' → ' : ''
          console.log(`     ${file}${arrow}`)
        })
        console.log()
      })
    }

    // 전체 결과
    console.log('\n🎯 전체 결과:')
    if (report.summary.validationSuccess) {
      console.log('  ✅ 모든 import가 유효하고 순환 의존성이 없습니다!')
    } else {
      console.log('  ⚠️  다음 문제들이 발견되었습니다:')
      if (report.summary.invalidImportCount > 0) {
        console.log(
          `     - 무효한 import: ${report.summary.invalidImportCount}개`
        )
      }
      if (report.summary.circularDependencyCount > 0) {
        console.log(
          `     - 순환 의존성: ${report.summary.circularDependencyCount}개`
        )
      }
    }
  }

  /**
   * 검증 결과를 JSON 파일로 저장합니다.
   */
  public saveValidationReport(
    report: ValidationReport,
    outputPath: string = 'import-validation-report.json'
  ): void {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
    console.log(`\n💾 검증 결과가 ${outputPath}에 저장되었습니다.`)
  }
}

// 메인 실행 함수
async function main() {
  try {
    const validator = new ImportValidator()
    const report = validator.validateImports()

    validator.printValidationReport(report)
    validator.saveValidationReport(report)

    console.log('\n✅ Import 검증이 완료되었습니다.')

    // 검증 실패 시 exit code 1로 종료
    if (!report.summary.validationSuccess) {
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ 검증 중 오류가 발생했습니다:', error)
    process.exit(1)
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main()
}

export { ImportValidator, type CircularDependency, type ValidationReport }
