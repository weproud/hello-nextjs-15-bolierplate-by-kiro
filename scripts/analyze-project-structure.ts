#!/usr/bin/env tsx

import * as fs from 'fs'
import * as path from 'path'

interface ImportInfo {
  line: string
  type: 'relative' | 'absolute' | 'external'
  source: string
  lineNumber: number
}

interface FileAnalysis {
  filePath: string
  imports: ImportInfo[]
  totalImports: number
  relativeImports: number
  absoluteImports: number
  externalImports: number
}

interface ProjectAnalysis {
  files: FileAnalysis[]
  summary: {
    totalFiles: number
    totalImports: number
    relativeImports: number
    absoluteImports: number
    externalImports: number
    relativePercentage: number
    absolutePercentage: number
    externalPercentage: number
  }
  problematicPatterns: {
    deepRelativePaths: Array<{ file: string; import: string; depth: number }>
    inconsistentPatterns: Array<{ file: string; issue: string }>
  }
}

class ProjectStructureAnalyzer {
  private readonly srcDir: string
  private readonly extensions = ['.ts', '.tsx', '.js', '.jsx']

  constructor(srcDir: string = 'src') {
    this.srcDir = srcDir
  }

  /**
   * 모든 TypeScript/JavaScript 파일을 스캔합니다.
   */
  private scanFiles(dir: string): string[] {
    const files: string[] = []

    const scan = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)

        if (entry.isDirectory()) {
          // node_modules, .next 등 제외
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            scan(fullPath)
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name)
          if (this.extensions.includes(ext)) {
            files.push(fullPath)
          }
        }
      }
    }

    scan(dir)
    return files
  }

  /**
   * 파일에서 import 문을 추출하고 분석합니다.
   */
  private analyzeImports(filePath: string): ImportInfo[] {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    const imports: ImportInfo[] = []

    // import 문을 찾는 정규표현식들
    const importPatterns = [
      // import ... from '...'
      /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g,
      // require('...')
      /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      // dynamic import()
      /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    ]

    lines.forEach((line, index) => {
      for (const pattern of importPatterns) {
        let match
        while ((match = pattern.exec(line)) !== null) {
          const source = match[1]
          const type = this.categorizeImport(source)

          imports.push({
            line: line.trim(),
            type,
            source,
            lineNumber: index + 1,
          })
        }
        pattern.lastIndex = 0 // 정규표현식 상태 리셋
      }
    })

    return imports
  }

  /**
   * import 경로를 카테고리별로 분류합니다.
   */
  private categorizeImport(
    source: string
  ): 'relative' | 'absolute' | 'external' {
    if (source.startsWith('./') || source.startsWith('../')) {
      return 'relative'
    } else if (source.startsWith('@/')) {
      return 'absolute'
    } else {
      return 'external'
    }
  }

  /**
   * 상대 경로의 깊이를 계산합니다.
   */
  private calculateRelativeDepth(source: string): number {
    const parts = source.split('/')
    return parts.filter(part => part === '..').length
  }

  /**
   * 문제가 될 수 있는 패턴을 식별합니다.
   */
  private identifyProblematicPatterns(
    files: FileAnalysis[]
  ): ProjectAnalysis['problematicPatterns'] {
    const deepRelativePaths: Array<{
      file: string
      import: string
      depth: number
    }> = []
    const inconsistentPatterns: Array<{ file: string; issue: string }> = []

    for (const file of files) {
      // 깊은 상대 경로 식별 (3단계 이상)
      for (const imp of file.imports) {
        if (imp.type === 'relative') {
          const depth = this.calculateRelativeDepth(imp.source)
          if (depth >= 3) {
            deepRelativePaths.push({
              file: file.filePath,
              import: imp.source,
              depth,
            })
          }
        }
      }

      // 일관성 없는 패턴 식별
      const hasRelative = file.relativeImports > 0
      const hasAbsolute = file.absoluteImports > 0

      if (hasRelative && hasAbsolute) {
        inconsistentPatterns.push({
          file: file.filePath,
          issue: `상대 경로(${file.relativeImports})와 절대 경로(${file.absoluteImports})가 혼재`,
        })
      }
    }

    return {
      deepRelativePaths,
      inconsistentPatterns,
    }
  }

  /**
   * 프로젝트 전체를 분석합니다.
   */
  public analyze(): ProjectAnalysis {
    console.log(`🔍 프로젝트 구조 분석 시작: ${this.srcDir}`)

    const filePaths = this.scanFiles(this.srcDir)
    console.log(`📁 발견된 파일 수: ${filePaths.length}`)

    const files: FileAnalysis[] = []

    for (const filePath of filePaths) {
      const imports = this.analyzeImports(filePath)
      const relativeImports = imports.filter(
        imp => imp.type === 'relative'
      ).length
      const absoluteImports = imports.filter(
        imp => imp.type === 'absolute'
      ).length
      const externalImports = imports.filter(
        imp => imp.type === 'external'
      ).length

      files.push({
        filePath,
        imports,
        totalImports: imports.length,
        relativeImports,
        absoluteImports,
        externalImports,
      })
    }

    // 전체 통계 계산
    const totalImports = files.reduce((sum, file) => sum + file.totalImports, 0)
    const totalRelative = files.reduce(
      (sum, file) => sum + file.relativeImports,
      0
    )
    const totalAbsolute = files.reduce(
      (sum, file) => sum + file.absoluteImports,
      0
    )
    const totalExternal = files.reduce(
      (sum, file) => sum + file.externalImports,
      0
    )

    const summary = {
      totalFiles: files.length,
      totalImports,
      relativeImports: totalRelative,
      absoluteImports: totalAbsolute,
      externalImports: totalExternal,
      relativePercentage:
        totalImports > 0 ? (totalRelative / totalImports) * 100 : 0,
      absolutePercentage:
        totalImports > 0 ? (totalAbsolute / totalImports) * 100 : 0,
      externalPercentage:
        totalImports > 0 ? (totalExternal / totalImports) * 100 : 0,
    }

    const problematicPatterns = this.identifyProblematicPatterns(files)

    return {
      files,
      summary,
      problematicPatterns,
    }
  }

  /**
   * 분석 결과를 콘솔에 출력합니다.
   */
  public printAnalysis(analysis: ProjectAnalysis): void {
    console.log('\n📊 프로젝트 구조 분석 결과')
    console.log('='.repeat(50))

    // 전체 통계
    console.log('\n📈 전체 통계:')
    console.log(`  총 파일 수: ${analysis.summary.totalFiles}`)
    console.log(`  총 import 수: ${analysis.summary.totalImports}`)
    console.log(
      `  상대 경로: ${analysis.summary.relativeImports} (${analysis.summary.relativePercentage.toFixed(1)}%)`
    )
    console.log(
      `  절대 경로: ${analysis.summary.absoluteImports} (${analysis.summary.absolutePercentage.toFixed(1)}%)`
    )
    console.log(
      `  외부 라이브러리: ${analysis.summary.externalImports} (${analysis.summary.externalPercentage.toFixed(1)}%)`
    )

    // 문제가 될 수 있는 패턴
    console.log('\n⚠️  문제가 될 수 있는 패턴:')

    if (analysis.problematicPatterns.deepRelativePaths.length > 0) {
      console.log(
        `\n  깊은 상대 경로 (${analysis.problematicPatterns.deepRelativePaths.length}개):`
      )
      analysis.problematicPatterns.deepRelativePaths
        .slice(0, 10) // 상위 10개만 표시
        .forEach(item => {
          console.log(`    ${item.file}: ${item.import} (깊이: ${item.depth})`)
        })
      if (analysis.problematicPatterns.deepRelativePaths.length > 10) {
        console.log(
          `    ... 그 외 ${analysis.problematicPatterns.deepRelativePaths.length - 10}개`
        )
      }
    }

    if (analysis.problematicPatterns.inconsistentPatterns.length > 0) {
      console.log(
        `\n  일관성 없는 패턴 (${analysis.problematicPatterns.inconsistentPatterns.length}개):`
      )
      analysis.problematicPatterns.inconsistentPatterns
        .slice(0, 10) // 상위 10개만 표시
        .forEach(item => {
          console.log(`    ${item.file}: ${item.issue}`)
        })
      if (analysis.problematicPatterns.inconsistentPatterns.length > 10) {
        console.log(
          `    ... 그 외 ${analysis.problematicPatterns.inconsistentPatterns.length - 10}개`
        )
      }
    }

    // 디렉토리별 통계
    console.log('\n📂 디렉토리별 통계:')
    const dirStats = new Map<
      string,
      { files: number; imports: number; relative: number; absolute: number }
    >()

    for (const file of analysis.files) {
      const dir = path.dirname(file.filePath).replace(/\\/g, '/')
      const existing = dirStats.get(dir) || {
        files: 0,
        imports: 0,
        relative: 0,
        absolute: 0,
      }

      dirStats.set(dir, {
        files: existing.files + 1,
        imports: existing.imports + file.totalImports,
        relative: existing.relative + file.relativeImports,
        absolute: existing.absolute + file.absoluteImports,
      })
    }

    const sortedDirs = Array.from(dirStats.entries())
      .sort((a, b) => b[1].imports - a[1].imports)
      .slice(0, 15) // 상위 15개 디렉토리

    for (const [dir, stats] of sortedDirs) {
      const relativePercent =
        stats.imports > 0
          ? ((stats.relative / stats.imports) * 100).toFixed(1)
          : '0.0'
      const absolutePercent =
        stats.imports > 0
          ? ((stats.absolute / stats.imports) * 100).toFixed(1)
          : '0.0'
      console.log(
        `  ${dir}: ${stats.files}파일, ${stats.imports}imports (상대:${relativePercent}%, 절대:${absolutePercent}%)`
      )
    }
  }

  /**
   * 분석 결과를 JSON 파일로 저장합니다.
   */
  public saveAnalysis(
    analysis: ProjectAnalysis,
    outputPath: string = 'project-structure-analysis.json'
  ): void {
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2))
    console.log(`\n💾 분석 결과가 ${outputPath}에 저장되었습니다.`)
  }
}

// 메인 실행 함수
async function main() {
  try {
    const analyzer = new ProjectStructureAnalyzer()
    const analysis = analyzer.analyze()

    analyzer.printAnalysis(analysis)
    analyzer.saveAnalysis(analysis)

    console.log('\n✅ 프로젝트 구조 분석이 완료되었습니다.')
  } catch (error) {
    console.error('❌ 분석 중 오류가 발생했습니다:', error)
    process.exit(1)
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main()
}

export {
  ProjectStructureAnalyzer,
  type FileAnalysis,
  type ImportInfo,
  type ProjectAnalysis,
}
