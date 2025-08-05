#!/usr/bin/env node

/**
 * Provider와 Context 의존성 분석 스크립트
 *
 * 이 스크립트는 다음을 분석합니다:
 * 1. Provider 체인의 구조와 순서
 * 2. Context 간의 의존성
 * 3. 순환 의존성 검사
 * 4. Import 경로 검증
 */

const fs = require('fs')
const path = require('path')

// 분석할 디렉토리들
const DIRECTORIES = ['src/providers', 'src/contexts']

// 파일 확장자
const EXTENSIONS = ['.ts', '.tsx']

/**
 * 파일에서 import 문을 추출하는 함수
 */
function extractImports(content, filePath) {
  const imports = []
  const importRegex =
    /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)?\s*(?:,\s*(?:{[^}]*}|\*\s+as\s+\w+|\w+))?\s*from\s+['"]([^'"]+)['"]/g

  let match
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1]
    imports.push({
      path: importPath,
      line: content.substring(0, match.index).split('\n').length,
      isRelative: importPath.startsWith('.'),
      isAbsolute: importPath.startsWith('@/'),
      isExternal: !importPath.startsWith('.') && !importPath.startsWith('@/'),
    })
  }

  return imports
}

/**
 * 파일에서 export 문을 추출하는 함수
 */
function extractExports(content) {
  const exports = []

  // export function/const/class 등
  const namedExportRegex =
    /export\s+(?:function|const|class|interface|type)\s+(\w+)/g
  let match
  while ((match = namedExportRegex.exec(content)) !== null) {
    exports.push({
      name: match[1],
      type: 'named',
      line: content.substring(0, match.index).split('\n').length,
    })
  }

  // export { ... }
  const exportBlockRegex = /export\s+{([^}]+)}/g
  while ((match = exportBlockRegex.exec(content)) !== null) {
    const exportNames = match[1]
      .split(',')
      .map(name => name.trim().split(' as ')[0].trim())
    exportNames.forEach(name => {
      if (name) {
        exports.push({
          name,
          type: 'named',
          line: content.substring(0, match.index).split('\n').length,
        })
      }
    })
  }

  // export * from
  const reExportRegex = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g
  while ((match = reExportRegex.exec(content)) !== null) {
    exports.push({
      name: '*',
      type: 'reexport',
      from: match[1],
      line: content.substring(0, match.index).split('\n').length,
    })
  }

  return exports
}

/**
 * 디렉토리의 모든 파일을 재귀적으로 스캔
 */
function scanDirectory(dirPath) {
  const files = []

  function scan(currentPath) {
    if (!fs.existsSync(currentPath)) return

    const items = fs.readdirSync(currentPath)

    for (const item of items) {
      const itemPath = path.join(currentPath, item)
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        scan(itemPath)
      } else if (EXTENSIONS.some(ext => item.endsWith(ext))) {
        files.push(itemPath)
      }
    }
  }

  scan(dirPath)
  return files
}

/**
 * 파일 분석
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const relativePath = path.relative(process.cwd(), filePath)

  return {
    path: relativePath,
    imports: extractImports(content, filePath),
    exports: extractExports(content),
    content: content,
  }
}

/**
 * Provider 체인 분석
 */
function analyzeProviderChain(files) {
  const providerFiles = files.filter(file => file.path.includes('providers'))
  const chains = []

  for (const file of providerFiles) {
    if (
      file.path.includes('client-providers') ||
      file.path.includes('server-providers')
    ) {
      // Provider 체인 구조 분석
      const providerImports = file.imports.filter(
        imp =>
          imp.path.includes('Provider') ||
          imp.path.includes('Context') ||
          imp.path.includes('providers') ||
          imp.path.includes('contexts')
      )

      chains.push({
        file: file.path,
        providers: providerImports,
        isMainChain: true,
      })
    }
  }

  return chains
}

/**
 * Context 의존성 분석
 */
function analyzeContextDependencies(files) {
  const contextFiles = files.filter(file => file.path.includes('contexts'))
  const dependencies = []

  for (const file of contextFiles) {
    const contextDeps = file.imports.filter(
      imp => imp.path.includes('contexts') || imp.path.includes('Context')
    )

    if (contextDeps.length > 0) {
      dependencies.push({
        file: file.path,
        dependencies: contextDeps,
      })
    }
  }

  return dependencies
}

/**
 * 순환 의존성 검사
 */
function checkCircularDependencies(files) {
  const graph = new Map()

  // 그래프 구성
  for (const file of files) {
    const deps = file.imports
      .filter(
        imp =>
          imp.isAbsolute &&
          (imp.path.includes('providers') || imp.path.includes('contexts'))
      )
      .map(imp => imp.path)

    graph.set(file.path, deps)
  }

  // DFS로 순환 의존성 검사
  function hasCycle(node, visited, recStack, path) {
    visited.add(node)
    recStack.add(node)
    path.push(node)

    const deps = graph.get(node) || []
    for (const dep of deps) {
      const depFile = files.find(f =>
        f.path.includes(dep.replace('@/', 'src/'))
      )
      if (!depFile) continue

      const depPath = depFile.path

      if (!visited.has(depPath)) {
        if (hasCycle(depPath, visited, recStack, [...path])) {
          return true
        }
      } else if (recStack.has(depPath)) {
        console.log('순환 의존성 발견:', [...path, depPath].join(' -> '))
        return true
      }
    }

    recStack.delete(node)
    return false
  }

  const visited = new Set()
  const cycles = []

  for (const [node] of graph) {
    if (!visited.has(node)) {
      if (hasCycle(node, visited, new Set(), [])) {
        cycles.push(node)
      }
    }
  }

  return cycles
}

/**
 * Import 경로 검증
 */
function validateImportPaths(files) {
  const issues = []

  for (const file of files) {
    for (const imp of file.imports) {
      // 상대 경로 사용 검사
      if (
        imp.isRelative &&
        (imp.path.includes('providers') || imp.path.includes('contexts'))
      ) {
        issues.push({
          file: file.path,
          line: imp.line,
          issue: 'relative_path',
          import: imp.path,
          message: 'Provider/Context import에 상대 경로 사용',
        })
      }

      // 절대 경로 검증
      if (imp.isAbsolute) {
        const targetPath = imp.path.replace('@/', 'src/')
        const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx']
        let exists = false

        for (const ext of possibleExtensions) {
          if (
            fs.existsSync(targetPath + ext) ||
            fs.existsSync(path.join(targetPath, 'index' + ext))
          ) {
            exists = true
            break
          }
        }

        if (!exists) {
          issues.push({
            file: file.path,
            line: imp.line,
            issue: 'missing_file',
            import: imp.path,
            message: 'Import 대상 파일이 존재하지 않음',
          })
        }
      }
    }
  }

  return issues
}

/**
 * 메인 분석 함수
 */
function main() {
  console.log('🔍 Provider와 Context 의존성 분석 시작...\n')

  // 모든 파일 스캔
  const allFiles = []
  for (const dir of DIRECTORIES) {
    const files = scanDirectory(dir)
    allFiles.push(...files)
  }

  console.log(`📁 분석 대상 파일: ${allFiles.length}개`)
  allFiles.forEach(file =>
    console.log(`  - ${path.relative(process.cwd(), file)}`)
  )
  console.log()

  // 파일 분석
  const analyzedFiles = allFiles.map(analyzeFile)

  // Provider 체인 분석
  console.log('🔗 Provider 체인 분석:')
  const providerChains = analyzeProviderChain(analyzedFiles)
  providerChains.forEach(chain => {
    console.log(`\n  📄 ${chain.file}:`)
    chain.providers.forEach(provider => {
      console.log(`    - ${provider.path} (라인 ${provider.line})`)
    })
  })

  // Context 의존성 분석
  console.log('\n🔄 Context 의존성 분석:')
  const contextDeps = analyzeContextDependencies(analyzedFiles)
  if (contextDeps.length === 0) {
    console.log('  ✅ Context 간 의존성 없음')
  } else {
    contextDeps.forEach(dep => {
      console.log(`\n  📄 ${dep.file}:`)
      dep.dependencies.forEach(d => {
        console.log(`    - ${d.path} (라인 ${d.line})`)
      })
    })
  }

  // 순환 의존성 검사
  console.log('\n🔄 순환 의존성 검사:')
  const cycles = checkCircularDependencies(analyzedFiles)
  if (cycles.length === 0) {
    console.log('  ✅ 순환 의존성 없음')
  } else {
    console.log(`  ❌ ${cycles.length}개의 순환 의존성 발견`)
  }

  // Import 경로 검증
  console.log('\n📍 Import 경로 검증:')
  const pathIssues = validateImportPaths(analyzedFiles)
  if (pathIssues.length === 0) {
    console.log('  ✅ 모든 import 경로가 올바름')
  } else {
    console.log(`  ❌ ${pathIssues.length}개의 문제 발견:`)
    pathIssues.forEach(issue => {
      console.log(`    - ${issue.file}:${issue.line} - ${issue.message}`)
      console.log(`      Import: ${issue.import}`)
    })
  }

  // 요약 보고서
  console.log('\n📊 분석 요약:')
  console.log(`  - 총 파일 수: ${analyzedFiles.length}`)
  console.log(`  - Provider 체인: ${providerChains.length}개`)
  console.log(`  - Context 의존성: ${contextDeps.length}개`)
  console.log(`  - 순환 의존성: ${cycles.length}개`)
  console.log(`  - Import 경로 문제: ${pathIssues.length}개`)

  if (cycles.length === 0 && pathIssues.length === 0) {
    console.log('\n✅ Provider와 Context 구조가 올바르게 설정되어 있습니다!')
  } else {
    console.log(
      '\n⚠️  일부 문제가 발견되었습니다. 위의 세부사항을 확인해주세요.'
    )
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  analyzeFile,
  analyzeProviderChain,
  analyzeContextDependencies,
  checkCircularDependencies,
  validateImportPaths,
}
