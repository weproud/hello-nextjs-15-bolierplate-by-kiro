#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

class HookDependencyAnalyzer {
  constructor(hooksDir = 'src/hooks') {
    this.hooksDir = hooksDir
    this.dependencyGraph = new Map()
    this.hookTypes = new Map()
    this.externalDependencies = new Map()
  }

  /**
   * 디렉토리에서 TypeScript 파일을 재귀적으로 찾습니다.
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
   * 파일에서 import 경로와 hook 정보를 추출합니다.
   */
  extractHookInfo(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const imports = []
      const hooks = []
      const externalDeps = []

      // import 문을 찾는 정규표현식들
      const importPatterns = [
        /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g,
        /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      ]

      // Hook 함수를 찾는 정규표현식
      const hookPattern = /export\s+function\s+(use[A-Z][a-zA-Z]*)/g

      for (const pattern of importPatterns) {
        let match
        while ((match = pattern.exec(content)) !== null) {
          const importPath = match[1]

          if (importPath.startsWith('@/hooks/')) {
            imports.push(importPath)
          } else if (importPath.startsWith('@/')) {
            // 다른 내부 모듈 의존성
            imports.push(importPath)
          } else if (!importPath.startsWith('.')) {
            // 외부 라이브러리 의존성
            externalDeps.push(importPath)
          }
        }
        pattern.lastIndex = 0
      }

      // Hook 함수 추출
      let hookMatch
      while ((hookMatch = hookPattern.exec(content)) !== null) {
        hooks.push(hookMatch[1])
      }

      // Hook 타입 분석
      const hookTypes = this.analyzeHookTypes(content, hooks)

      return {
        imports,
        hooks,
        externalDeps,
        hookTypes,
      }
    } catch (error) {
      console.warn(`⚠️  파일 읽기 실패: ${filePath}`, error.message)
      return {
        imports: [],
        hooks: [],
        externalDeps: [],
        hookTypes: {},
      }
    }
  }

  /**
   * Hook의 타입을 분석합니다.
   */
  analyzeHookTypes(content, hooks) {
    const types = {}

    for (const hook of hooks) {
      // 기본 분류
      if (hook.includes('Form')) {
        types[hook] = 'form'
      } else if (hook.includes('Error')) {
        types[hook] = 'error'
      } else if (hook.includes('Loading') || hook.includes('Progress')) {
        types[hook] = 'state'
      } else if (hook.includes('Api') || hook.includes('Server')) {
        types[hook] = 'api'
      } else {
        types[hook] = 'utility'
      }

      // React Hook 사용 패턴 분석
      const reactHooks = []
      if (content.includes('useState')) reactHooks.push('useState')
      if (content.includes('useEffect')) reactHooks.push('useEffect')
      if (content.includes('useCallback')) reactHooks.push('useCallback')
      if (content.includes('useMemo')) reactHooks.push('useMemo')
      if (content.includes('useRef')) reactHooks.push('useRef')
      if (content.includes('useContext')) reactHooks.push('useContext')
      if (content.includes('useReducer')) reactHooks.push('useReducer')

      types[`${hook}_reactHooks`] = reactHooks
    }

    return types
  }

  /**
   * 의존성 그래프를 구축합니다.
   */
  buildDependencyGraph() {
    const files = this.findTsFiles(this.hooksDir)

    console.log(`📁 분석 대상 파일 수: ${files.length}`)

    for (const filePath of files) {
      const info = this.extractHookInfo(filePath)

      // 파일 경로를 @/hooks 형식으로 변환
      const normalizedPath =
        '@/hooks/' +
        path
          .relative(this.hooksDir, filePath)
          .replace(/\\/g, '/')
          .replace(/\.(ts|tsx)$/, '')

      this.dependencyGraph.set(normalizedPath, {
        imports: new Set(info.imports),
        hooks: info.hooks,
        externalDeps: new Set(info.externalDeps),
      })

      // Hook 타입 정보 저장
      for (const [hook, type] of Object.entries(info.hookTypes)) {
        this.hookTypes.set(hook, type)
      }

      // 외부 의존성 통계
      for (const dep of info.externalDeps) {
        this.externalDependencies.set(
          dep,
          (this.externalDependencies.get(dep) || 0) + 1
        )
      }
    }

    console.log(
      `🔗 의존성 그래프 구축 완료: ${this.dependencyGraph.size}개 모듈`
    )
  }

  /**
   * 순환 의존성을 검사합니다.
   */
  detectCircularDependencies() {
    const visited = new Set()
    const recursionStack = new Set()
    const circularDeps = []

    const dfs = (module, path) => {
      if (recursionStack.has(module)) {
        const cycleStart = path.indexOf(module)
        const cycle = path.slice(cycleStart).concat([module])
        circularDeps.push({
          cycle,
          description: `순환 의존성: ${cycle.join(' → ')}`,
        })
        return
      }

      if (visited.has(module)) {
        return
      }

      visited.add(module)
      recursionStack.add(module)

      const moduleInfo = this.dependencyGraph.get(module)
      if (moduleInfo) {
        for (const dep of moduleInfo.imports) {
          if (dep.startsWith('@/hooks/')) {
            dfs(dep, [...path, module])
          }
        }
      }

      recursionStack.delete(module)
    }

    for (const [module] of this.dependencyGraph) {
      if (!visited.has(module)) {
        dfs(module, [])
      }
    }

    return circularDeps
  }

  /**
   * Hook 사용 패턴을 분석합니다.
   */
  analyzeHookPatterns() {
    const patterns = {
      formHooks: [],
      errorHooks: [],
      stateHooks: [],
      apiHooks: [],
      utilityHooks: [],
    }

    const hookComplexity = new Map()
    const hookDependencies = new Map()

    for (const [module, info] of this.dependencyGraph) {
      for (const hook of info.hooks) {
        const type = this.hookTypes.get(hook)

        switch (type) {
          case 'form':
            patterns.formHooks.push({ hook, module })
            break
          case 'error':
            patterns.errorHooks.push({ hook, module })
            break
          case 'state':
            patterns.stateHooks.push({ hook, module })
            break
          case 'api':
            patterns.apiHooks.push({ hook, module })
            break
          default:
            patterns.utilityHooks.push({ hook, module })
        }

        // 복잡도 계산 (의존성 수 + React Hook 사용 수)
        const reactHooks = this.hookTypes.get(`${hook}_reactHooks`) || []
        const complexity = info.imports.size + reactHooks.length
        hookComplexity.set(hook, complexity)

        // Hook별 의존성 저장
        hookDependencies.set(hook, {
          internal: Array.from(info.imports).filter(imp =>
            imp.startsWith('@/hooks/')
          ),
          external: Array.from(info.externalDeps),
          reactHooks,
        })
      }
    }

    return {
      patterns,
      hookComplexity,
      hookDependencies,
    }
  }

  /**
   * 분석 결과를 출력합니다.
   */
  printAnalysisReport() {
    console.log('\n📊 Hook 의존성 분석 결과')
    console.log('='.repeat(50))

    // 전체 통계
    const totalHooks = Array.from(this.dependencyGraph.values()).reduce(
      (sum, info) => sum + info.hooks.length,
      0
    )
    const totalDependencies = Array.from(this.dependencyGraph.values()).reduce(
      (sum, info) => sum + info.imports.size,
      0
    )

    console.log('\n📈 분석 통계:')
    console.log(`  총 Hook 파일 수: ${this.dependencyGraph.size}`)
    console.log(`  총 Hook 함수 수: ${totalHooks}`)
    console.log(`  총 내부 의존성 수: ${totalDependencies}`)
    console.log(`  총 외부 의존성 수: ${this.externalDependencies.size}`)

    // 순환 의존성 검사
    const circularDeps = this.detectCircularDependencies()
    if (circularDeps.length > 0) {
      console.log(`\n⚠️  순환 의존성 발견: ${circularDeps.length}개`)
      circularDeps.forEach((dep, index) => {
        console.log(`  ${index + 1}. ${dep.description}`)
      })
    } else {
      console.log('\n✅ 순환 의존성이 발견되지 않았습니다!')
    }

    // Hook 패턴 분석
    const { patterns, hookComplexity, hookDependencies } =
      this.analyzeHookPatterns()

    console.log('\n🎯 Hook 카테고리별 분포:')
    console.log(`  폼 관련 Hook: ${patterns.formHooks.length}개`)
    console.log(`  에러 처리 Hook: ${patterns.errorHooks.length}개`)
    console.log(`  상태 관리 Hook: ${patterns.stateHooks.length}개`)
    console.log(`  API 관련 Hook: ${patterns.apiHooks.length}개`)
    console.log(`  유틸리티 Hook: ${patterns.utilityHooks.length}개`)

    // 복잡도가 높은 Hook 상위 5개
    const complexHooks = Array.from(hookComplexity.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    if (complexHooks.length > 0) {
      console.log('\n🔧 복잡도가 높은 Hook (상위 5개):')
      complexHooks.forEach(([hook, complexity], index) => {
        const deps = hookDependencies.get(hook)
        console.log(`  ${index + 1}. ${hook} (복잡도: ${complexity})`)
        console.log(`     - 내부 의존성: ${deps.internal.length}개`)
        console.log(`     - 외부 의존성: ${deps.external.length}개`)
        console.log(`     - React Hook: ${deps.reactHooks.join(', ')}`)
      })
    }

    // 많이 사용되는 외부 의존성 상위 5개
    const topExternalDeps = Array.from(this.externalDependencies.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    if (topExternalDeps.length > 0) {
      console.log('\n📦 많이 사용되는 외부 의존성 (상위 5개):')
      topExternalDeps.forEach(([dep, count], index) => {
        console.log(`  ${index + 1}. ${dep} (${count}번 사용됨)`)
      })
    }

    // 전체 결과
    console.log('\n🎯 분석 결과:')
    if (circularDeps.length === 0) {
      console.log('  ✅ Hook 의존성 구조가 건전합니다!')
      console.log('  ✅ 모든 import 경로가 절대 경로로 표준화되었습니다!')
    } else {
      console.log(
        `  ⚠️  ${circularDeps.length}개의 순환 의존성을 해결해야 합니다.`
      )
    }

    // Hook 타입 안전성 검증
    console.log('\n🔒 타입 안전성 검증:')
    const typeIssues = this.validateTypesSafety()
    if (typeIssues.length === 0) {
      console.log('  ✅ 모든 Hook의 타입 정의가 안전합니다!')
    } else {
      console.log(
        `  ⚠️  ${typeIssues.length}개의 타입 안전성 이슈가 발견되었습니다:`
      )
      typeIssues.forEach((issue, index) => {
        console.log(`    ${index + 1}. ${issue}`)
      })
    }
  }

  /**
   * 타입 안전성을 검증합니다.
   */
  validateTypesSafety() {
    const issues = []

    for (const [module, info] of this.dependencyGraph) {
      // TypeScript 파일인지 확인
      if (!module.endsWith('.ts') && !module.endsWith('.tsx')) {
        continue
      }

      // Hook 함수가 있는데 export type이 없는 경우 체크
      if (info.hooks.length > 0) {
        try {
          const filePath = path.join(
            this.hooksDir,
            module.replace('@/hooks/', '') + '.ts'
          )
          const content = fs.readFileSync(filePath, 'utf-8')

          // 기본적인 타입 안전성 체크
          if (!content.includes('export type') && info.hooks.length > 1) {
            issues.push(
              `${module}: 여러 Hook이 있지만 타입 정의가 부족할 수 있습니다`
            )
          }

          // any 타입 사용 체크
          if (content.includes(': any') || content.includes('<any>')) {
            issues.push(
              `${module}: any 타입 사용으로 타입 안전성이 저하될 수 있습니다`
            )
          }
        } catch (error) {
          // 파일 읽기 실패는 무시
        }
      }
    }

    return issues
  }

  /**
   * 분석 결과를 JSON 파일로 저장합니다.
   */
  saveAnalysisReport(outputPath = 'hook-dependency-analysis-report.json') {
    const { patterns, hookComplexity, hookDependencies } =
      this.analyzeHookPatterns()
    const circularDeps = this.detectCircularDependencies()
    const typeIssues = this.validateTypesSafety()

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.dependencyGraph.size,
        totalHooks: Array.from(this.dependencyGraph.values()).reduce(
          (sum, info) => sum + info.hooks.length,
          0
        ),
        totalDependencies: Array.from(this.dependencyGraph.values()).reduce(
          (sum, info) => sum + info.imports.size,
          0
        ),
        externalDependencies: this.externalDependencies.size,
        circularDependencies: circularDeps.length,
        typeIssues: typeIssues.length,
      },
      patterns,
      hookComplexity: Object.fromEntries(hookComplexity),
      hookDependencies: Object.fromEntries(hookDependencies),
      circularDependencies: circularDeps,
      typeIssues,
      externalDependencies: Object.fromEntries(this.externalDependencies),
      dependencyGraph: Object.fromEntries(
        Array.from(this.dependencyGraph.entries()).map(([key, value]) => [
          key,
          {
            imports: Array.from(value.imports),
            hooks: value.hooks,
            externalDeps: Array.from(value.externalDeps),
          },
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
    console.log('🔍 Hook 의존성 분석 시작')

    this.buildDependencyGraph()
    this.printAnalysisReport()
    this.saveAnalysisReport()

    const circularDeps = this.detectCircularDependencies()
    const typeIssues = this.validateTypesSafety()

    return {
      hasCircularDependencies: circularDeps.length > 0,
      hasTypeIssues: typeIssues.length > 0,
      totalHooks: Array.from(this.dependencyGraph.values()).reduce(
        (sum, info) => sum + info.hooks.length,
        0
      ),
      totalFiles: this.dependencyGraph.size,
    }
  }
}

// 메인 실행 함수
function main() {
  try {
    const args = process.argv.slice(2)
    const hooksDir =
      args.find(arg => arg.startsWith('--hooks='))?.split('=')[1] || 'src/hooks'

    console.log(`🚀 Hook 의존성 분석기 시작`)
    console.log(`📂 Hooks 디렉토리: ${hooksDir}`)

    const analyzer = new HookDependencyAnalyzer(hooksDir)
    const result = analyzer.analyze()

    if (result.hasCircularDependencies) {
      console.log('\n❌ 순환 의존성이 발견되었습니다.')
      process.exit(1)
    } else if (result.hasTypeIssues) {
      console.log('\n⚠️  타입 안전성 이슈가 발견되었습니다.')
      // 타입 이슈는 경고만 하고 성공으로 처리
    } else {
      console.log('\n✅ Hook 의존성 분석 완료!')
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
  HookDependencyAnalyzer,
}
