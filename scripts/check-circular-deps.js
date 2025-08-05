#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

class CircularDependencyChecker {
  constructor(componentsDir = 'src/components') {
    this.componentsDir = componentsDir
    this.dependencyGraph = new Map()
    this.visited = new Set()
    this.recursionStack = new Set()
    this.circularDeps = []
  }

  /**
   * 디렉토리에서 TypeScript/TSX 파일을 재귀적으로 찾습니다.
   */
  findTsFiles(dir) {
    const files = []

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
   * 파일에서 import 경로를 추출합니다.
   */
  extractImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const imports = []

      // import 문을 찾는 정규표현식들
      const importPatterns = [
        /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g,
        /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
        /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      ]

      for (const pattern of importPatterns) {
        let match
        while ((match = pattern.exec(content)) !== null) {
          const importPath = match[1]

          // @/components로 시작하는 import만 관심 있음
          if (importPath.startsWith('@/components/')) {
            imports.push(importPath)
          }
        }
        pattern.lastIndex = 0
      }

      return imports
    } catch (error) {
      console.warn(`⚠️  파일 읽기 실패: ${filePath}`, error.message)
      return []
    }
  }

  /**
   * 의존성 그래프를 구축합니다.
   */
  buildDependencyGraph() {
    const files = this.findTsFiles(this.componentsDir)

    console.log(`📁 분석 대상 파일 수: ${files.length}`)

    for (const filePath of files) {
      const imports = this.extractImports(filePath)

      // 파일 경로를 @/components 형식으로 변환
      const normalizedPath =
        '@/components/' +
        path
          .relative(this.componentsDir, filePath)
          .replace(/\\/g, '/')
          .replace(/\.(ts|tsx)$/, '')

      this.dependencyGraph.set(normalizedPath, new Set(imports))
    }

    console.log(
      `🔗 의존성 그래프 구축 완료: ${this.dependencyGraph.size}개 모듈`
    )
  }

  /**
   * DFS를 사용하여 순환 의존성을 검사합니다.
   */
  detectCircularDependencies() {
    this.visited.clear()
    this.recursionStack.clear()
    this.circularDeps = []

    for (const [module] of this.dependencyGraph) {
      if (!this.visited.has(module)) {
        this.dfs(module, [])
      }
    }

    return this.circularDeps
  }

  /**
   * 깊이 우선 탐색으로 순환 의존성을 찾습니다.
   */
  dfs(module, path) {
    if (this.recursionStack.has(module)) {
      // 순환 의존성 발견
      const cycleStart = path.indexOf(module)
      const cycle = path.slice(cycleStart).concat([module])

      this.circularDeps.push({
        cycle,
        description: `순환 의존성: ${cycle.join(' → ')}`,
      })
      return
    }

    if (this.visited.has(module)) {
      return
    }

    this.visited.add(module)
    this.recursionStack.add(module)

    const dependencies = this.dependencyGraph.get(module) || new Set()
    for (const dep of dependencies) {
      this.dfs(dep, [...path, module])
    }

    this.recursionStack.delete(module)
  }

  /**
   * 분석 결과를 출력합니다.
   */
  printAnalysisReport() {
    console.log('\n📊 Components 순환 의존성 분석 결과')
    console.log('='.repeat(50))

    // 전체 통계
    console.log('\n📈 분석 통계:')
    console.log(`  총 모듈 수: ${this.dependencyGraph.size}`)
    console.log(
      `  총 의존성 수: ${Array.from(this.dependencyGraph.values()).reduce((sum, deps) => sum + deps.size, 0)}`
    )

    // 순환 의존성 결과
    if (this.circularDeps.length > 0) {
      console.log(`\n⚠️  순환 의존성 발견: ${this.circularDeps.length}개`)
      this.circularDeps.forEach((dep, index) => {
        console.log(`  ${index + 1}. ${dep.description}`)
      })
    } else {
      console.log('\n✅ 순환 의존성이 발견되지 않았습니다!')
    }

    // 의존성이 많은 모듈 상위 5개
    const modulesByDependencies = Array.from(this.dependencyGraph.entries())
      .sort(([, a], [, b]) => b.size - a.size)
      .slice(0, 5)

    if (modulesByDependencies.length > 0) {
      console.log('\n📦 의존성이 많은 모듈 (상위 5개):')
      modulesByDependencies.forEach(([module, deps], index) => {
        console.log(`  ${index + 1}. ${module} (${deps.size}개 의존성)`)
      })
    }

    // 많이 참조되는 모듈 상위 5개
    const referenceCounts = new Map()
    for (const [, deps] of this.dependencyGraph) {
      for (const dep of deps) {
        referenceCounts.set(dep, (referenceCounts.get(dep) || 0) + 1)
      }
    }

    const mostReferenced = Array.from(referenceCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    if (mostReferenced.length > 0) {
      console.log('\n🎯 많이 참조되는 모듈 (상위 5개):')
      mostReferenced.forEach(([module, count], index) => {
        console.log(`  ${index + 1}. ${module} (${count}번 참조됨)`)
      })
    }

    // 전체 결과
    console.log('\n🎯 분석 결과:')
    if (this.circularDeps.length === 0) {
      console.log(
        '  ✅ Components 디렉토리에서 순환 의존성이 발견되지 않았습니다!'
      )
    } else {
      console.log(
        `  ⚠️  ${this.circularDeps.length}개의 순환 의존성을 해결해야 합니다.`
      )
    }
  }

  /**
   * 분석 결과를 JSON 파일로 저장합니다.
   */
  saveAnalysisReport(outputPath = 'components-circular-deps-report.json') {
    const report = {
      timestamp: new Date().toISOString(),
      totalModules: this.dependencyGraph.size,
      totalDependencies: Array.from(this.dependencyGraph.values()).reduce(
        (sum, deps) => sum + deps.size,
        0
      ),
      circularDependencies: this.circularDeps,
      dependencyGraph: Object.fromEntries(
        Array.from(this.dependencyGraph.entries()).map(([key, value]) => [
          key,
          Array.from(value),
        ])
      ),
    }

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
    console.log(`\n💾 분석 결과가 ${outputPath}에 저장되었습니다.`)
  }

  /**
   * 전체 분석을 실행합니다.
   */
  analyze() {
    console.log('🔍 Components 순환 의존성 분석 시작')

    this.buildDependencyGraph()
    this.detectCircularDependencies()
    this.printAnalysisReport()
    this.saveAnalysisReport()

    return {
      hasCircularDependencies: this.circularDeps.length > 0,
      circularDependencies: this.circularDeps,
      totalModules: this.dependencyGraph.size,
    }
  }
}

// 메인 실행 함수
function main() {
  try {
    const args = process.argv.slice(2)
    const componentsDir =
      args.find(arg => arg.startsWith('--components='))?.split('=')[1] ||
      'src/components'

    console.log(`🚀 Components 순환 의존성 검사기 시작`)
    console.log(`📂 Components 디렉토리: ${componentsDir}`)

    const checker = new CircularDependencyChecker(componentsDir)
    const result = checker.analyze()

    if (result.hasCircularDependencies) {
      console.log('\n❌ 순환 의존성이 발견되었습니다.')
      process.exit(1)
    } else {
      console.log('\n✅ 순환 의존성 검사 완료!')
    }
  } catch (error) {
    console.error('❌ 분석 중 오류가 발생했습니다:', error)
    process.exit(1)
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main()
}

module.exports = {
  CircularDependencyChecker,
}
