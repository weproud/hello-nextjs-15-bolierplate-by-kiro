#!/usr/bin/env tsx

import * as fs from 'fs'
import * as path from 'path'

interface ComponentImportTransformResult {
  filePath: string
  originalContent: string
  transformedContent: string
  transformedImports: Array<{
    original: string
    transformed: string
    lineNumber: number
  }>
  hasChanges: boolean
  circularDependencies: string[]
}

interface ComponentTransformReport {
  totalFiles: number
  transformedFiles: number
  totalImports: number
  transformedImports: number
  results: ComponentImportTransformResult[]
  errors: Array<{
    filePath: string
    error: string
  }>
  circularDependencies: Array<{
    files: string[]
    description: string
  }>
  summary: {
    success: boolean
    transformationRate: number
  }
}

class ComponentImportTransformer {
  private readonly componentsDir: string
  private readonly srcDir: string
  private readonly dryRun: boolean

  constructor(
    componentsDir: string = 'src/components',
    srcDir: string = 'src',
    dryRun: boolean = false
  ) {
    this.componentsDir = componentsDir
    this.srcDir = srcDir
    this.dryRun = dryRun
  }

  /**
   * 디렉토리에서 TypeScript/TSX 파일을 재귀적으로 찾습니다.
   */
  private findTsFiles(dir: string): string[] {
    const files: string[] = []

    if (!fs.existsSync(dir)) {
      return files
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        files.push(...this.findTsFiles(fullPath))
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        files.push(fullPath)
      }
    }

    return files
  }

  /**
   * 상대 경로를 절대 경로로 변환합니다.
   */
  private transformRelativeToAbsolute(
    importPath: string,
    fromFile: string
  ): string | null {
    // 현재 디렉토리 내 파일 참조는 변환하지 않음
    if (importPath.startsWith('./')) {
      return null
    }

    // 외부 라이브러리는 변환하지 않음
    if (!importPath.startsWith('../')) {
      return null
    }

    try {
      // 파일의 현재 위치를 기준으로 절대 경로 계산
      const fromDir = path.dirname(fromFile)
      const resolvedPath = path.resolve(fromDir, importPath)
      const relativePath = path.relative(this.srcDir, resolvedPath)

      // src 디렉토리 밖의 파일은 변환하지 않음
      if (relativePath.startsWith('../')) {
        return null
      }

      // 절대 경로로 변환
      const absolutePath = '@/' + relativePath.replace(/\\/g, '/')
      return absolutePath
    } catch (error) {
      console.warn(
        `⚠️  경로 변환 실패: ${importPath} (from ${fromFile})`,
        error
      )
      return null
    }
  }

  /**
   * 파일 내용에서 import 경로를 변환합니다.
   */
  private transformFileContent(
    filePath: string,
    content: string
  ): ComponentImportTransformResult {
    let transformedContent = content
    const transformedImports: ComponentImportTransformResult['transformedImports'] =
      []
    let hasChanges = false

    // import 문을 찾는 정규표현식들
    const importPatterns = [
      // import ... from '...'
      /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g,
      // require('...')
      /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      // dynamic import()
      /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    ]

    const lines = content.split('\n')

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]
      let modifiedLine = line

      for (const pattern of importPatterns) {
        let match
        while ((match = pattern.exec(line)) !== null) {
          const originalImport = match[0]
          const importPath = match[1]

          const transformedPath = this.transformRelativeToAbsolute(
            importPath,
            filePath
          )

          if (transformedPath) {
            const transformedImport = originalImport.replace(
              importPath,
              transformedPath
            )

            transformedImports.push({
              original: originalImport,
              transformed: transformedImport,
              lineNumber: lineIndex + 1,
            })

            modifiedLine = modifiedLine.replace(
              originalImport,
              transformedImport
            )
            hasChanges = true
          }
        }
        pattern.lastIndex = 0 // 정규표현식 상태 리셋
      }

      lines[lineIndex] = modifiedLine
    }

    transformedContent = lines.join('\n')

    return {
      filePath,
      originalContent: content,
      transformedContent,
      transformedImports,
      hasChanges,
      circularDependencies: [], // 나중에 구현
    }
  }

  /**
   * 변환된 경로가 유효한지 검증합니다.
   */
  private validateTransformedPath(
    transformedPath: string,
    fromFile: string
  ): boolean {
    try {
      // @/ 경로를 실제 경로로 변환
      if (transformedPath.startsWith('@/')) {
        const relativePath = transformedPath.replace('@/', '')
        const resolvedPath = path.join(this.srcDir, relativePath)

        // 파일 확장자가 없으면 가능한 확장자들을 시도
        const extensions = ['.ts', '.tsx', '.js', '.jsx']
        const possiblePaths = [
          resolvedPath,
          ...extensions.map(ext => resolvedPath + ext),
          ...extensions.map(ext => path.join(resolvedPath, 'index' + ext)),
        ]

        return possiblePaths.some(
          possiblePath =>
            fs.existsSync(possiblePath) && fs.statSync(possiblePath).isFile()
        )
      }

      return true // 외부 라이브러리나 기타 경로는 유효하다고 가정
    } catch (error) {
      console.warn(
        `⚠️  경로 검증 실패: ${transformedPath} (from ${fromFile})`,
        error
      )
      return false
    }
  }

  /**
   * 순환 의존성을 검사합니다.
   */
  private detectCircularDependencies(
    results: ComponentImportTransformResult[]
  ): Array<{ files: string[]; description: string }> {
    const dependencies = new Map<string, Set<string>>()

    // 의존성 그래프 구축
    for (const result of results) {
      const deps = new Set<string>()

      for (const imp of result.transformedImports) {
        const pathMatch = imp.transformed.match(/['"]([^'"]+)['"]/)
        if (pathMatch) {
          const importPath = pathMatch[1]
          if (importPath.startsWith('@/components/')) {
            deps.add(importPath)
          }
        }
      }

      dependencies.set(result.filePath, deps)
    }

    // 순환 의존성 검사 (간단한 구현)
    const circularDeps: Array<{ files: string[]; description: string }> = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const dfs = (file: string, path: string[]): void => {
      if (recursionStack.has(file)) {
        const cycleStart = path.indexOf(file)
        const cycle = path.slice(cycleStart).concat([file])
        circularDeps.push({
          files: cycle,
          description: `순환 의존성 발견: ${cycle.join(' → ')}`,
        })
        return
      }

      if (visited.has(file)) {
        return
      }

      visited.add(file)
      recursionStack.add(file)

      const deps = dependencies.get(file) || new Set()
      for (const dep of deps) {
        dfs(dep, [...path, file])
      }

      recursionStack.delete(file)
    }

    for (const file of dependencies.keys()) {
      if (!visited.has(file)) {
        dfs(file, [])
      }
    }

    return circularDeps
  }

  /**
   * 단일 파일을 변환합니다.
   */
  public transformFile(
    filePath: string
  ): ComponentImportTransformResult | null {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`파일을 찾을 수 없습니다: ${filePath}`)
      }

      const content = fs.readFileSync(filePath, 'utf-8')
      const result = this.transformFileContent(filePath, content)

      // 변환된 경로들의 유효성 검증
      for (const transformed of result.transformedImports) {
        const pathMatch = transformed.transformed.match(/['"]([^'"]+)['"]/)
        if (pathMatch) {
          const transformedPath = pathMatch[1]
          if (!this.validateTransformedPath(transformedPath, filePath)) {
            console.warn(
              `⚠️  변환된 경로가 유효하지 않을 수 있습니다: ${transformedPath} (${filePath}:${transformed.lineNumber})`
            )
          }
        }
      }

      // 실제 파일 쓰기 (dry run이 아닌 경우)
      if (result.hasChanges && !this.dryRun) {
        fs.writeFileSync(filePath, result.transformedContent, 'utf-8')
        console.log(
          `✅ 변환 완료: ${filePath} (${result.transformedImports.length}개 import 변경)`
        )
      } else if (result.hasChanges && this.dryRun) {
        console.log(
          `🔍 변환 예정: ${filePath} (${result.transformedImports.length}개 import 변경)`
        )
      }

      return result
    } catch (error) {
      console.error(`❌ 파일 변환 실패: ${filePath}`, error)
      return null
    }
  }

  /**
   * components 디렉토리의 모든 파일을 변환합니다.
   */
  public transformComponents(): ComponentTransformReport {
    console.log(
      `🔄 Components Import 경로 변환 시작 (${this.dryRun ? 'DRY RUN' : '실제 변환'})`
    )

    // components 디렉토리의 모든 TypeScript/TSX 파일 찾기
    const filePaths = this.findTsFiles(this.componentsDir)

    console.log(`📁 대상 파일 수: ${filePaths.length}`)

    const results: ComponentImportTransformResult[] = []
    const errors: ComponentTransformReport['errors'] = []
    let totalImports = 0
    let transformedImports = 0

    for (const filePath of filePaths) {
      const result = this.transformFile(filePath)

      if (result) {
        results.push(result)
        totalImports += result.transformedImports.length
        if (result.hasChanges) {
          transformedImports += result.transformedImports.length
        }
      } else {
        errors.push({
          filePath,
          error: '파일 변환 실패',
        })
      }
    }

    // 순환 의존성 검사
    const circularDependencies = this.detectCircularDependencies(results)

    const transformedFiles = results.filter(r => r.hasChanges).length
    const transformationRate =
      filePaths.length > 0 ? (transformedFiles / filePaths.length) * 100 : 0

    return {
      totalFiles: filePaths.length,
      transformedFiles,
      totalImports,
      transformedImports,
      results,
      errors,
      circularDependencies,
      summary: {
        success: errors.length === 0,
        transformationRate,
      },
    }
  }

  /**
   * 변환 결과를 콘솔에 출력합니다.
   */
  public printTransformationReport(report: ComponentTransformReport): void {
    console.log('\n📊 Components Import 경로 변환 결과')
    console.log('='.repeat(50))

    // 전체 통계
    console.log('\n📈 변환 통계:')
    console.log(`  총 파일 수: ${report.totalFiles}`)
    console.log(`  변환된 파일 수: ${report.transformedFiles}`)
    console.log(`  변환된 import 수: ${report.transformedImports}`)
    console.log(`  변환율: ${report.summary.transformationRate.toFixed(1)}%`)

    // 순환 의존성 정보
    if (report.circularDependencies.length > 0) {
      console.log('\n⚠️  순환 의존성 발견:')
      report.circularDependencies.forEach((dep, index) => {
        console.log(`  ${index + 1}. ${dep.description}`)
      })
    } else {
      console.log('\n✅ 순환 의존성이 발견되지 않았습니다.')
    }

    // 오류 정보
    if (report.errors.length > 0) {
      console.log('\n❌ 변환 오류:')
      report.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.filePath}: ${error.error}`)
      })
    }

    // 변환된 파일들의 상세 정보 (상위 10개)
    const changedFiles = report.results.filter(r => r.hasChanges)
    if (changedFiles.length > 0) {
      console.log('\n🔄 변환된 파일들:')
      changedFiles.slice(0, 10).forEach((result, index) => {
        console.log(
          `  ${index + 1}. ${result.filePath} (${result.transformedImports.length}개 변경)`
        )

        // 변경된 import들 표시 (상위 3개)
        result.transformedImports.slice(0, 3).forEach(imp => {
          console.log(
            `     L${imp.lineNumber}: ${imp.original} → ${imp.transformed}`
          )
        })

        if (result.transformedImports.length > 3) {
          console.log(
            `     ... 그 외 ${result.transformedImports.length - 3}개`
          )
        }
        console.log()
      })

      if (changedFiles.length > 10) {
        console.log(`     ... 그 외 ${changedFiles.length - 10}개 파일`)
      }
    }

    // 전체 결과
    console.log('\n🎯 변환 결과:')
    if (report.summary.success && report.transformedFiles > 0) {
      console.log(
        `  ✅ ${report.transformedFiles}개 파일의 import 경로가 성공적으로 변환되었습니다!`
      )
    } else if (report.summary.success && report.transformedFiles === 0) {
      console.log('  ℹ️  변환이 필요한 import 경로가 없습니다.')
    } else {
      console.log(
        `  ⚠️  변환 중 ${report.errors.length}개의 오류가 발생했습니다.`
      )
    }
  }

  /**
   * 변환 결과를 JSON 파일로 저장합니다.
   */
  public saveTransformationReport(
    report: ComponentTransformReport,
    outputPath: string = 'components-import-transformation-report.json'
  ): void {
    // 파일 내용은 너무 크므로 저장하지 않음
    const reportToSave = {
      ...report,
      results: report.results.map(result => ({
        filePath: result.filePath,
        transformedImports: result.transformedImports,
        hasChanges: result.hasChanges,
        circularDependencies: result.circularDependencies,
      })),
    }

    fs.writeFileSync(outputPath, JSON.stringify(reportToSave, null, 2))
    console.log(`\n💾 변환 결과가 ${outputPath}에 저장되었습니다.`)
  }
}

// 메인 실행 함수
async function main() {
  try {
    const args = process.argv.slice(2)
    const dryRun = args.includes('--dry-run') || args.includes('-d')
    const componentsDir =
      args.find(arg => arg.startsWith('--components='))?.split('=')[1] ||
      'src/components'

    console.log(`🚀 Components Import 경로 변환기 시작`)
    console.log(`📂 Components 디렉토리: ${componentsDir}`)
    console.log(`🔍 모드: ${dryRun ? 'DRY RUN (미리보기)' : '실제 변환'}`)

    const transformer = new ComponentImportTransformer(
      componentsDir,
      'src',
      dryRun
    )
    const report = transformer.transformComponents()

    transformer.printTransformationReport(report)
    transformer.saveTransformationReport(report)

    if (dryRun) {
      console.log(
        '\n💡 실제 변환을 수행하려면 --dry-run 옵션을 제거하고 다시 실행하세요.'
      )
    } else {
      console.log('\n✅ Components Import 경로 변환이 완료되었습니다.')
    }

    // 오류가 있으면 exit code 1로 종료
    if (!report.summary.success) {
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ 변환 중 오류가 발생했습니다:', error)
    process.exit(1)
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main()
}

export {
  ComponentImportTransformer,
  type ComponentImportTransformResult,
  type ComponentTransformReport,
}
