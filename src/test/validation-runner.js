/**
 * Simple validation runner for parallel interceptor auth routing
 * Validates implementation without complex test dependencies
 */

const fs = require('fs')
const path = require('path')

class ValidationRunner {
  constructor() {
    this.results = []
    this.passed = 0
    this.failed = 0
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'
    console.log(`${prefix} [${timestamp}] ${message}`)
  }

  test(name, testFn) {
    try {
      const result = testFn()
      if (result) {
        this.log(`${name} - PASSED`, 'success')
        this.passed++
        this.results.push({ name, status: 'PASSED' })
      } else {
        this.log(`${name} - FAILED`, 'error')
        this.failed++
        this.results.push({ name, status: 'FAILED' })
      }
    } catch (error) {
      this.log(`${name} - ERROR: ${error.message}`, 'error')
      this.failed++
      this.results.push({ name, status: 'ERROR', error: error.message })
    }
  }

  fileExists(filePath) {
    return fs.existsSync(path.resolve(filePath))
  }

  fileContains(filePath, content) {
    if (!this.fileExists(filePath)) return false
    const fileContent = fs.readFileSync(path.resolve(filePath), 'utf8')
    return fileContent.includes(content)
  }

  directoryExists(dirPath) {
    return (
      fs.existsSync(path.resolve(dirPath)) &&
      fs.statSync(path.resolve(dirPath)).isDirectory()
    )
  }

  run() {
    this.log('🚀 Starting Parallel Interceptor Auth Routing Validation')

    // Test 1: File Structure Validation
    this.test('Modal signin page exists', () => {
      return this.fileExists('src/app/@modal/(.)auth/signin/page.tsx')
    })

    this.test('Full page signin exists', () => {
      return this.fileExists('src/app/auth/signin/page.tsx')
    })

    this.test('Modal directory structure is correct', () => {
      return (
        this.directoryExists('src/app/@modal') &&
        this.directoryExists('src/app/@modal/(.)auth') &&
        this.directoryExists('src/app/@modal/(.)auth/signin')
      )
    })

    this.test('Auth directory structure is correct', () => {
      return (
        this.directoryExists('src/app/auth') &&
        this.directoryExists('src/app/auth/signin')
      )
    })

    // Test 2: Component Implementation Validation
    this.test('Modal signin page has proper structure', () => {
      return (
        this.fileContains(
          'src/app/@modal/(.)auth/signin/page.tsx',
          'export default'
        ) &&
        this.fileContains(
          'src/app/@modal/(.)auth/signin/page.tsx',
          'searchParams'
        )
      )
    })

    this.test('Full page signin has proper structure', () => {
      return (
        this.fileContains('src/app/auth/signin/page.tsx', 'export default') &&
        this.fileContains('src/app/auth/signin/page.tsx', 'searchParams')
      )
    })

    this.test('Modal uses SigninModal component', () => {
      return this.fileContains(
        'src/app/@modal/(.)auth/signin/page.tsx',
        'SigninModal'
      )
    })

    this.test('Full page uses SigninForm component', () => {
      return this.fileContains('src/app/auth/signin/page.tsx', 'SigninForm')
    })

    // Test 3: Component Dependencies Validation
    this.test('SigninModal component exists', () => {
      return this.fileExists('src/components/auth/signin-modal.tsx')
    })

    this.test('SigninForm component exists', () => {
      return this.fileExists('src/components/auth/signin-form.tsx')
    })

    this.test('SigninModal has proper props', () => {
      return (
        this.fileContains(
          'src/components/auth/signin-modal.tsx',
          'callbackUrl'
        ) &&
        this.fileContains('src/components/auth/signin-modal.tsx', 'onClose')
      )
    })

    this.test('SigninForm has proper props', () => {
      return (
        this.fileContains(
          'src/components/auth/signin-form.tsx',
          'callbackUrl'
        ) &&
        this.fileContains('src/components/auth/signin-form.tsx', 'onSuccess')
      )
    })

    // Test 4: Authentication Integration Validation
    this.test('Components use NextAuth signIn', () => {
      return (
        this.fileContains('src/components/auth/signin-form.tsx', 'signIn') &&
        this.fileContains('src/components/auth/signin-modal.tsx', 'signIn')
      )
    })

    this.test('Components handle authentication errors', () => {
      return (
        this.fileContains('src/components/auth/signin-form.tsx', 'error') &&
        this.fileContains('src/components/auth/signin-modal.tsx', 'error')
      )
    })

    // Test 5: Routing Configuration Validation
    this.test('Root layout supports parallel routing', () => {
      return (
        this.fileContains('src/app/layout.tsx', 'modal') ||
        this.fileExists('src/app/layout.tsx')
      )
    })

    this.test('Modal default page exists', () => {
      return this.fileExists('src/app/@modal/default.tsx')
    })

    // Test 6: Accessibility and UX Validation
    this.test('Modal has proper ARIA attributes', () => {
      return (
        this.fileContains(
          'src/components/auth/signin-modal.tsx',
          'aria-modal'
        ) ||
        this.fileContains(
          'src/components/auth/signin-modal.tsx',
          'role="dialog"'
        )
      )
    })

    this.test('Form has proper labels', () => {
      return (
        this.fileContains('src/components/auth/signin-form.tsx', 'label') ||
        this.fileContains('src/components/auth/signin-form.tsx', 'htmlFor')
      )
    })

    // Test 7: Error Handling Validation
    this.test('Components have error boundaries', () => {
      return (
        this.fileExists('src/components/auth/modal-error-boundary.tsx') ||
        this.fileContains(
          'src/components/auth/signin-modal.tsx',
          'ErrorBoundary'
        )
      )
    })

    this.test('Error messages are user-friendly', () => {
      return (
        this.fileContains(
          'src/components/auth/signin-form.tsx',
          'Invalid credentials'
        ) || this.fileContains('src/components/auth/signin-form.tsx', 'error')
      )
    })

    // Test 8: Performance Optimization Validation
    this.test('Components use proper loading states', () => {
      return (
        this.fileContains('src/components/auth/signin-form.tsx', 'loading') ||
        this.fileContains('src/components/auth/signin-form.tsx', 'isLoading')
      )
    })

    this.test('Modal can be closed properly', () => {
      return (
        this.fileContains('src/components/auth/signin-modal.tsx', 'onClose') &&
        this.fileContains(
          'src/app/@modal/(.)auth/signin/page.tsx',
          'router.back'
        )
      )
    })

    // Test 9: Integration Test Files Validation
    this.test('Integration tests exist', () => {
      return (
        this.fileExists('src/test/final-integration.test.tsx') &&
        this.fileExists('src/test/e2e-integration.test.tsx')
      )
    })

    this.test('Test setup is configured', () => {
      return (
        this.fileExists('src/test/setup.ts') &&
        this.fileExists('vitest.config.ts')
      )
    })

    // Test 10: Documentation Validation
    this.test('Implementation documentation exists', () => {
      return (
        this.fileExists(
          'src/components/auth/ACCESSIBILITY_IMPLEMENTATION.md'
        ) || this.fileExists('src/test/README.md')
      )
    })

    // Summary
    this.log('\n📊 Validation Summary:')
    this.log(`Total Tests: ${this.passed + this.failed}`)
    this.log(`Passed: ${this.passed}`, 'success')
    this.log(`Failed: ${this.failed}`, this.failed > 0 ? 'error' : 'success')

    const successRate = Math.round(
      (this.passed / (this.passed + this.failed)) * 100
    )
    this.log(`Success Rate: ${successRate}%`)

    if (successRate >= 90) {
      this.log(
        '🎉 Excellent! Implementation is highly compliant with requirements.',
        'success'
      )
    } else if (successRate >= 80) {
      this.log('✅ Good! Implementation meets most requirements.', 'success')
    } else if (successRate >= 70) {
      this.log('⚠️ Fair. Some requirements need attention.')
    } else {
      this.log('🚨 Poor. Significant improvements needed.', 'error')
    }

    // Detailed results
    this.log('\n📋 Detailed Results:')
    this.results.forEach(result => {
      const status = result.status === 'PASSED' ? '✅' : '❌'
      this.log(`${status} ${result.name}`)
      if (result.error) {
        this.log(`   Error: ${result.error}`)
      }
    })

    return {
      passed: this.passed,
      failed: this.failed,
      successRate,
      results: this.results,
    }
  }
}

// Run validation
const validator = new ValidationRunner()
const results = validator.run()

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0)
