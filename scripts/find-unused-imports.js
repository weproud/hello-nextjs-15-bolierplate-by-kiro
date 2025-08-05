#!/usr/bin/env node

/**
 * 사용되지 않는 import 찾기 스크립트
 * 
 * 프로젝트에서 사용되지 않는 import 문을 찾아서 정리합니다.
 */

const fs = require('fs')
const path = require('path')

class UnusedImportFinder {
  constructor() {
    this.unusedImports = []
    this.checkedFiles = 0
    this.totalIssues = 0
  }

  /**
   * 사용되지 않는 import를 찾습니다.
   */
  async findUnusedImports() {
    console.log('🔍 사용되지 않는 import를 찾고 있습니다...\n')

    // src 디렉토리의 모든 TypeScript/JavaScript 파일 검사
    await this.scanDirectory('src')

    this.printResults()
  }

  /**
   * 디렉토리를 재귀적으로 스캔합니다.
   */
  async scanDirectory(dir) {
    try {
      const files = fs.readdirSync(dir)
      
      for (const file of files) {
        const fullPath = path.join(dir, file)
        const stats = fs.statSync(fullPath)
        
        if (stats.isDirectory()) {
          await this.scanDirectory(fullPath)
        } else if (this.isTypeScriptFile(file)) {
          await this.analyzeFile(fullPath)
        }
      }
    } catch (error) {
      console.log(`⚠️  디렉토리 읽기 오류: ${dir}`)
    }
  }

  /**
   * TypeScript/JavaScript 파일인지 확인합니다.
   */
  isTypeScriptFile(filename) {
    return /\.(ts|tsx|js|jsx)$/.test(filename) && !filename.endsWith('.test.ts') && !filename.endsWith('.test.tsx')
  }

  /**
   * 파일을 분석합니다.
   */
  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      this.checkedFiles++
      
      // import 문 추출
      const imports = this.extractImports(content)
      
      // 각 import가 사용되는지 확인
      for (const importInfo of imports) {
        if (!this.isImportUsed(content, importInfo)) {
          this.unusedImports.push({
            file: filePath,
            line: importInfo.line,
            import: importInfo.text,
            type: importInfo.type
          })
          this.totalIssues++
        }
      }
    } catch (error) {
      console.log(`⚠️  파일 읽기 오류: ${filePath}`)
    }
  }

  /**
   * 파일에서 import 문을 추출합니다.
   */
  extractImports(content) {
    const imports = []
    const lines = content.split('\n')
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // import 문 패턴 매칭
      if (line.startsWith('import ') && line.includes('from ')) {
        const importInfo = this.parseImportLine(line, i + 1)
        if (importInfo) {
          imports.push(importInfo)
        }
      }
    }
    
    return imports
  }

  /**
   * import 문을 파싱합니다.
   */
  parseImportLine(line, lineNumber) {
    // Named imports: import { a, b } from 'module'
    const namedImportMatch = line.match(/import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/)
    if (namedImportMatch) {
      const imports = namedImportMatch[1].split(',').map(imp => imp.trim())
      return {
        line: lineNumber,
        text: line,
        type: 'named',
        imports: imports,
        module: namedImportMatch[2]
      }
    }

    // Default import: import Something from 'module'
    const defaultImportMatch = line.match(/import\s+(\w+)\s+from\s*['"]([^'"]+)['"]/)
    if (defaultImportMatch) {
      return {
        line: lineNumber,
        text: line,
        type: 'default',
        imports: [defaultImportMatch[1]],
        module: defaultImportMatch[2]
      }
    }

    // Namespace import: import * as Something from 'module'
    const namespaceImportMatch = line.match(/import\s*\*\s*as\s+(\w+)\s+from\s*['"]([^'"]+)['"]/)
    if (namespaceImportMatch) {
      return {
        line: lineNumber,
        text: line,
        type: 'namespace',
        imports: [namespaceImportMatch[1]],
        module: namespaceImportMatch[2]
      }
    }

    // Side effect import: import 'module'
    const sideEffectMatch = line.match(/import\s*['"]([^'"]+)['"]/)
    if (sideEffectMatch) {
      return {
        line: lineNumber,
        text: line,
        type: 'side-effect',
        imports: [],
        module: sideEffectMatch[1]
      }
    }

    return null
  }

  /**
   * import가 사용되는지 확인합니다.
   */
  isImportUsed(content, importInfo) {
    // Side effect import는 항상 사용된 것으로 간주
    if (importInfo.type === 'side-effect') {
      return true
    }

    // 타입 import는 별도 처리 필요 (간단히 사용된 것으로 간주)
    if (importInfo.text.includes('type ')) {
      return true
    }

    // React import는 JSX 사용 시 자동으로 필요 (React 17+에서는 불필요할 수 있음)
    if (importInfo.module === 'react' && content.includes('<')) {
      return true
    }

    // 각 import된 항목이 코드에서 사용되는지 확인
    for (const importedItem of importInfo.imports) {
      // 타입 정의나 인터페이스 제거
      const cleanItem = importedItem.replace(/^type\s+/, '').trim()
      
      // 코드에서 사용되는지 확인 (간단한 패턴 매칭)
      const usagePatterns = [
        new RegExp(`\\b${cleanItem}\\b`, 'g'), // 일반적인 사용
        new RegExp(`<${cleanItem}[\\s>]`, 'g'), // JSX 컴포넌트
        new RegExp(`${cleanItem}\\(`, 'g'), // 함수 호출
        new RegExp(`${cleanItem}\\.`, 'g'), // 메서드 호출
        new RegExp(`extends\\s+${cleanItem}`, 'g'), // 상속
        new RegExp(`implements\\s+${cleanItem}`, 'g'), // 구현
      ]

      for (const pattern of usagePatterns) {
        // import 문 자체는 제외하고 검색
        const contentWithoutImports = content.replace(/import.*from.*$/gm, '')
        if (pattern.test(contentWithoutImports)) {
          return true
        }
      }
    }

    return false
  }

  /**
   * 결과를 출력합니다.
   */
  printResults() {
    console.log(`\n📊 분석 결과: ${this.checkedFiles}개 파일 검사 완료\n`)

    if (this.unusedImports.length === 0) {
      console.log('✨ 사용되지 않는 import가 발견되지 않았습니다!')
      return
    }

    console.log(`🗑️  사용되지 않을 가능성이 있는 import: ${this.unusedImports.length}개\n`)

    // 파일별로 그룹화
    const groupedByFile = {}
    for (const unused of this.unusedImports) {
      if (!groupedByFile[unused.file]) {
        groupedByFile[unused.file] = []
      }
      groupedByFile[unused.file].push(unused)
    }

    // 파일별 출력
    for (const [file, imports] of Object.entries(groupedByFile)) {
      console.log(`📄 ${file}:`)
      for (const imp of imports) {
        console.log(`   Line ${imp.line}: ${imp.import}`)
      }
      console.log()
    }

    console.log('⚠️  주의: 이 결과는 간단한 패턴 매칭을 기반으로 하므로 수동 확인이 필요합니다.')
    console.log('   특히 타입 정의, 동적 import, 조건부 사용 등은 정확히 감지되지 않을 수 있습니다.')
  }
}

// 스크립트 실행
async function main() {
  const finder = new UnusedImportFinder()
  await finder.findUnusedImports()
}

if (require.main === module) {
  main().catch(console.error)
}
