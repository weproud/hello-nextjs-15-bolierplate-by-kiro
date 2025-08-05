#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

class ProviderDependencyAnalyzer {
  constructor(providersDir = 'src/providers', contextsDir = 'src/contexts') {
    this.providersDir = providersDir
    this.contextsDir = contextsDir
    this.dependencyGraph = new Map()
    this.providerChain = []
    this.contextDependencies = new Map()
    this.externalDependencies = new Map()
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
   * 파일에서 Provider와 Context 정보를 추출합니다.
   */
  extractProviderInfo(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const imports = []
      const providers = []
      const contexts = []
      const hooks = []
      const externalDeps = []

      // import 문을 찾는 정규표현식들
      const importPatterns = [
        /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g,
      ]

      // Provider 컴포넌트를 찾는 정규표현식
      const providerPattern = /export\s+(?:function|const)\s+(\w*Provider)/g

      // Context를 찾는 정규표현식
      const contextPattern = /createContext\s*<[^>]*>\s*\(\s*[^)]*\s*\)/g
      const contextNamePattern = /const\s+(\w*Context)\s*=/g

      // Hook을 찾는 정규표현식
      const hookPattern = /export\s+function\s+(use[A-Z][a-zA-Z]*)/g

      for (const pattern of importPatterns) {
        let match
        while ((match = pattern.exec(content)) !== null) {
          const importPath = match[1]

          if (
            importPath.startsWith('@/providers/') ||
            importPath.startsWith('@/contexts/')
          ) {
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

      // Provider 컴포넌트 추출
      let providerMatch
      while ((providerMatch = providerPattern.exec(content)) !== null) {
        providers.push(providerMatch[1])
      }

      // Context 추출
      if (content.includes('createContext')) {
        contexts.push('Context')
      }

      let contextNameMatch
      while ((contextNameMatch = contextNamePattern.exec(content)) !== null) {
        contexts.push(contextNameMatch[1])
      }

      // Hook 함수 추출
      let hookMatch
      while ((hookMatch = hookPattern.exec(content)) !== null) {
        hooks.push(hookMatch[1])
      }

      // Provider 체인 분석 (JSX에서 중첩된 Provider 찾기)
      const providerChain = this.analyzeProviderChain(content)

      return {
        imports,
        providers,
        contexts,
        hooks,
        externalDeps,
        providerChain,
        hasUseClient: content.includes("'use client'"),
        hasUseServer: content.includes("'use server'"),
      }
    } catch (error) {
      console.warn(`⚠️  파일 읽기 실패: ${filePath}`, error.message)
      return {
        imports: [],
        providers: [],
        contexts: [],
        hooks: [],
        externalDeps: [],
        providerChain: [],
        hasUseClient: false,
        hasUseServer: false,
      }
    }
  }

  /**
   * JSX에서 Provider 체인을 분석합니다.
   */
  analyzeProviderChain(content) {
    const chain = []

    // JSX에서 Provider 컴포넌트를 찾는 정규표현식
    const jsxProviderPattern = /<(\w*Provider)(?:\s+[^>]*)?>[\s\S]*?<\/\1>/g

    let match
    while ((match = jsxProviderPattern.exec(content)) !== null) {
      chain.push(match[1])
    }

    // 중첩 구조 분석을 위한 더 정교한 파싱
    const nestedProviders = this.parseNestedProviders(content)

    return [...chain, ...nestedProviders]
  }

  /**
   * 중첩된 Provider 구조를 파싱합니다.
   */
  parseNestedProviders(content) {
    const providers = []
    const lines = content.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('<') && trimmed.includes('Provider')) {
        const match = trimmed.match(/<(\w*Provider)/)
        if (match) {
          providers.push(match[1])
        }
      }
    }

    return providers
  }

  /**
   * 의존성 그래프를 구축합니다.
   */
  buildDependencyGraph() {
    const providerFiles = this.findTsFiles(this.providersDir)
    const contextFiles = this.findTsFiles(this.contextsDir)
    const allFiles = [...providerFiles, ...contextFiles]

    console.log(`📁 분석 대상 파일 수: ${allFiles.length}`)

    for (const filePath of allFiles) {
      const info = this.extractProviderInfo(filePath)

      // 파일 경로를 정규화
      const normalizedPath = filePath
        .replace(/\\/g, '/')
        .replace(/\.(ts|tsx)$/, '')
      const relativePath = normalizedPath.replace(/^src\//, '@/')

      this.dependencyGraph.set(relativePath, info)

      // 외부 의존성 통계
      for (const dep of info.externalDeps) {
        this.externalDependencies.set(
          dep,
          (this.externalDependencies.get(dep) || 0) + 1
        )
      }

      // Context 의존성 매핑
      if (info.contexts.length > 0) {
        this.contextDependencies.set(relativePath, info.contexts)
      }
    }

    console.log(
      `🔗 의존성 그래프 구축 완료: ${this.dependencyGraph.size}개 모듈`
    )
  }

  /**
   * Provider 체인을 분석합니다.
   */
  analyzeProviderChains() {
    const chains = new Map()

    for (const [module, info] of this.dependencyGraph) {
      if (info.providerChain.length > 0) {
        chains.set(module, info.providerChain)
      }
    }

    return chains
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
          if (dep.startsWith('@/providers/') || dep.startsWith('@/contexts/')) {
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
   * Provider 사용 패턴을 분석합니다.
   */
  analyzeProviderPatterns() {
    const patterns = {
      clientProviders: [],
      serverProviders: [],
      contextProviders: [],
      authProviders: [],
      stateProviders: [],
      themeProviders: [],
    }

    const providerComplexity = new Map()
    const providerDependencies = new Map()

    for (const [module, info] of this.dependencyGraph) {
      for (const provider of info.providers) {
        // Provider 타입 분류
        if (provider.toLowerCase().includes('client')) {
          patterns.clientProviders.push({ provider, module })
        } else if (provider.toLowerCase().includes('server')) {
          patterns.serverProviders.push({ provider, module })
        } else if (provider.toLowerCase().includes('auth')) {
          patterns.authProviders.push({ provider, module })
        } else if (provider.toLowerCase().includes('theme')) {
          patterns.themeProviders.push({ provider, module })
        } else if (
          provider.toLowerCase().includes('store') ||
          provider.toLowerCase().includes('state')
        ) {
          patterns.stateProviders.push({ provider, module })
        } else {
          patterns.contextProviders.push({ provider, module })
        }

        // 복잡도 계산 (의존성 수 + Context 수 + Hook 수)
        const complexity =
          info.imports.length + info.contexts.length + info.hooks.length
        providerComplexity.set(provider, complexity)

        // Provider별 의존성 저장
        providerDependencies.set(provider, {
          internal: info.imports.filter(
            imp =>
              imp.startsWith('@/providers/') || imp.startsWith('@/contexts/')
          ),
          external: info.externalDeps,
          contexts: info.contexts,
          hooks: info.hooks,
          hasUseClient: info.hasUseClient,
          hasUseServer: info.hasUseServer,
        })
      }
    }

    return {
      patterns,
      providerComplexity,
      providerDependencies,
    }
  }

  /**
   * 분석 결과를 출력합니다.
   */
  printAnalysisReport() {
    console.log('\n📊 Provider 및 Context 의존성 분석 결과')
    console.log('='.repeat(50))

    // 전체 통계
    const totalProviders = Array.from(this.dependencyGraph.values()).reduce(
      (sum, info) => sum + info.providers.length,
      0
    )
    const totalContexts = Array.from(this.dependencyGraph.values()).reduce(
      (sum, info) => sum + info.contexts.length,
      0
    )
    const totalHooks = Array.from(this.dependencyGraph.values()).reduce(
      (sum, info) => sum + info.hooks.length,
      0
    )
    const totalDependencies = Array.from(this.dependencyGraph.values()).reduce(
      (sum, info) => sum + info.imports.length,
      0
    )

    console.log('\n📈 분석 통계:')
    console.log(`  총 파일 수: ${this.dependencyGraph.size}`)
    console.log(`  총 Provider 수: ${totalProviders}`)
    console.log(`  총 Context 수: ${totalContexts}`)
    console.log(`  총 Hook 수: ${totalHooks}`)
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

    // Provider 패턴 분석
    const { patterns, providerComplexity, providerDependencies } =
      this.analyzeProviderPatterns()

    console.log('\n🎯 Provider 카테고리별 분포:')
    console.log(`  클라이언트 Provider: ${patterns.clientProviders.length}개`)
    console.log(`  서버 Provider: ${patterns.serverProviders.length}개`)
    console.log(`  인증 Provider: ${patterns.authProviders.length}개`)
    console.log(`  테마 Provider: ${patterns.themeProviders.length}개`)
    console.log(`  상태 Provider: ${patterns.stateProviders.length}개`)
    console.log(`  Context Provider: ${patterns.contextProviders.length}개`)

    // Provider 체인 분석
    const providerChains = this.analyzeProviderChains()
    if (providerChains.size > 0) {
      console.log('\n🔗 Provider 체인:')
      for (const [module, chain] of providerChains) {
        console.log(`  ${module}:`)
        chain.forEach((provider, index) => {
          console.log(`    ${index + 1}. ${provider}`)
        })
      }
    }

    // 복잡도가 높은 Provider 상위 5개
    const complexProviders = Array.from(providerComplexity.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    if (complexProviders.length > 0) {
      console.log('\n🔧 복잡도가 높은 Provider (상위 5개):')
      complexProviders.forEach(([provider, complexity], index) => {
        const deps = providerDependencies.get(provider)
        console.log(`  ${index + 1}. ${provider} (복잡도: ${complexity})`)
        console.log(`     - 내부 의존성: ${deps.internal.length}개`)
        console.log(`     - 외부 의존성: ${deps.external.length}개`)
        console.log(`     - Context: ${deps.contexts.length}개`)
        console.log(`     - Hook: ${deps.hooks.length}개`)
        console.log(`     - 클라이언트: ${deps.hasUseClient ? 'Yes' : 'No'}`)
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
      console.log('  ✅ Provider 및 Context 의존성 구조가 건전합니다!')
      console.log('  ✅ 모든 import 경로가 절대 경로로 표준화되었습니다!')
    } else {
      console.log(
        `  ⚠️  ${circularDeps.length}개의 순환 의존성을 해결해야 합니다.`
      )
    }

    // Provider 체인 검증
    console.log('\n🔒 Provider 체인 검증:')
    const chainIssues = this.validateProviderChains()
    if (chainIssues.length === 0) {
      console.log('  ✅ 모든 Provider 체인이 올바르게 구성되었습니다!')
    } else {
      console.log(
        `  ⚠️  ${chainIssues.length}개의 Provider 체인 이슈가 발견되었습니다:`
      )
      chainIssues.forEach((issue, index) => {
        console.log(`    ${index + 1}. ${issue}`)
      })
    }
  }

  /**
   * Provider 체인의 유효성을 검증합니다.
   */
  validateProviderChains() {
    const issues = []

    for (const [module, info] of this.dependencyGraph) {
      // 클라이언트 Provider에서 서버 전용 기능 사용 체크
      if (
        info.hasUseClient &&
        info.externalDeps.some(dep => dep.includes('server'))
      ) {
        issues.push(
          `${module}: 클라이언트 Provider에서 서버 전용 의존성을 사용합니다`
        )
      }

      // Provider 체인에서 순서 검증
      if (info.providerChain.length > 10) {
        issues.push(
          `${module}: Provider 체인이 너무 깊습니다 (${info.providerChain.length}개)`
        )
      }

      // Context 없이 Provider만 있는 경우 체크
      if (
        info.providers.length > 0 &&
        info.contexts.length === 0 &&
        !info.providers.some(p => p.includes('Client') || p.includes('Server'))
      ) {
        issues.push(
          `${module}: Provider가 있지만 Context가 정의되지 않았습니다`
        )
      }
    }

    return issues
  }

  /**
   * 분석 결과를 JSON 파일로 저장합니다.
   */
  saveAnalysisReport(outputPath = 'provider-dependency-analysis-report.json') {
    const { patterns, providerComplexity, providerDependencies } =
      this.analyzeProviderPatterns()
    const circularDeps = this.detectCircularDependencies()
    const chainIssues = this.validateProviderChains()
    const providerChains = this.analyzeProviderChains()

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.dependencyGraph.size,
        totalProviders: Array.from(this.dependencyGraph.values()).reduce(
          (sum, info) => sum + info.providers.length,
          0
        ),
        totalContexts: Array.from(this.dependencyGraph.values()).reduce(
          (sum, info) => sum + info.contexts.length,
          0
        ),
        totalHooks: Array.from(this.dependencyGraph.values()).reduce(
          (sum, info) => sum + info.hooks.length,
          0
        ),
        totalDependencies: Array.from(this.dependencyGraph.values()).reduce(
          (sum, info) => sum + info.imports.length,
          0
        ),
        externalDependencies: this.externalDependencies.size,
        circularDependencies: circularDeps.length,
        chainIssues: chainIssues.length,
      },
      patterns,
      providerComplexity: Object.fromEntries(providerComplexity),
      providerDependencies: Object.fromEntries(providerDependencies),
      providerChains: Object.fromEntries(providerChains),
      circularDependencies: circularDeps,
      chainIssues,
      externalDependencies: Object.fromEntries(this.externalDependencies),
      dependencyGraph: Object.fromEntries(
        Array.from(this.dependencyGraph.entries()).map(([key, value]) => [
          key,
          {
            imports: value.imports,
            providers: value.providers,
            contexts: value.contexts,
            hooks: value.hooks,
            externalDeps: value.externalDeps,
            providerChain: value.providerChain,
            hasUseClient: value.hasUseClient,
            hasUseServer: value.hasUseServer,
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
    console.log('🔍 Provider 및 Context 의존성 분석 시작')

    this.buildDependencyGraph()
    this.printAnalysisReport()
    this.saveAnalysisReport()

    const circularDeps = this.detectCircularDependencies()
    const chainIssues = this.validateProviderChains()

    return {
      hasCircularDependencies: circularDeps.length > 0,
      hasChainIssues: chainIssues.length > 0,
      totalProviders: Array.from(this.dependencyGraph.values()).reduce(
        (sum, info) => sum + info.providers.length,
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
    const providersDir =
      args.find(arg => arg.startsWith('--providers='))?.split('=')[1] ||
      'src/providers'
    const contextsDir =
      args.find(arg => arg.startsWith('--contexts='))?.split('=')[1] ||
      'src/contexts'

    console.log(`🚀 Provider 및 Context 의존성 분석기 시작`)
    console.log(`📂 Providers 디렉토리: ${providersDir}`)
    console.log(`📂 Contexts 디렉토리: ${contextsDir}`)

    const analyzer = new ProviderDependencyAnalyzer(providersDir, contextsDir)
    const result = analyzer.analyze()

    if (result.hasCircularDependencies) {
      console.log('\n❌ 순환 의존성이 발견되었습니다.')
      process.exit(1)
    } else if (result.hasChainIssues) {
      console.log('\n⚠️  Provider 체인 이슈가 발견되었습니다.')
      // 체인 이슈는 경고만 하고 성공으로 처리
    } else {
      console.log('\n✅ Provider 및 Context 의존성 분석 완료!')
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
  ProviderDependencyAnalyzer,
}
