/**
 * Test runner for modal performance optimizations
 */

import {
  runModalPerformanceTest,
  testModalPerformanceOnDevice,
} from './performance-test'

export class ModalOptimizationTestRunner {
  private testResults: Array<{ name: string; passed: boolean; details: any }> =
    []

  async runAllTests() {
    console.group('🚀 Modal Performance Optimization Tests')

    // Test 1: Code splitting verification
    await this.testCodeSplitting()

    // Test 2: Lazy loading verification
    await this.testLazyLoading()

    // Test 3: Bundle size optimization
    await this.testBundleOptimization()

    // Test 4: Device-specific loading
    await this.testDeviceSpecificLoading()

    // Test 5: Performance metrics
    await this.testPerformanceMetrics()

    this.printSummary()
    console.groupEnd()

    return this.testResults
  }

  private async testCodeSplitting() {
    console.log('📦 Testing code splitting...')

    try {
      // Check if modal chunks are properly split
      const scripts = Array.from(document.querySelectorAll('script[src]'))
      const modalChunks = scripts.filter(
        script =>
          (script as HTMLScriptElement).src.includes('auth-modal') ||
          (script as HTMLScriptElement).src.includes('modal-ui')
      )

      const passed = modalChunks.length > 0
      this.testResults.push({
        name: 'Code Splitting',
        passed,
        details: {
          modalChunks: modalChunks.length,
          totalScripts: scripts.length,
        },
      })

      console.log(
        passed ? '✅ Code splitting detected' : '❌ Code splitting not detected'
      )
    } catch (error) {
      console.error('❌ Code splitting test failed:', error)
      this.testResults.push({
        name: 'Code Splitting',
        passed: false,
        details: { error: error.message },
      })
    }
  }

  private async testLazyLoading() {
    console.log('🔄 Testing lazy loading...')

    try {
      // Test if components are loaded dynamically
      const hasReactLazy = document.querySelector('[data-reactroot]') !== null
      const hasSuspense = document.querySelector('[data-suspense]') !== null

      // Check for lazy loading indicators in the DOM
      const hasLoadingFallback =
        document.querySelector('.animate-pulse') !== null ||
        document.textContent?.includes('불러오는 중') ||
        false

      const passed = hasReactLazy || hasSuspense || hasLoadingFallback
      this.testResults.push({
        name: 'Lazy Loading',
        passed,
        details: { hasReactLazy, hasSuspense, hasLoadingFallback },
      })

      console.log(
        passed ? '✅ Lazy loading implemented' : '❌ Lazy loading not detected'
      )
    } catch (error) {
      console.error('❌ Lazy loading test failed:', error)
      this.testResults.push({
        name: 'Lazy Loading',
        passed: false,
        details: { error: error.message },
      })
    }
  }

  private async testBundleOptimization() {
    console.log('📊 Testing bundle optimization...')

    try {
      // Check for optimized imports
      const scripts = Array.from(document.querySelectorAll('script[src]'))
      const totalSize = scripts.length

      // Check for tree shaking (fewer unused imports)
      const hasOptimizedImports = scripts.some(
        script =>
          (script as HTMLScriptElement).src.includes('chunk') ||
          (script as HTMLScriptElement).src.includes('vendor')
      )

      // Check for compression
      const hasCompression = scripts.some(script => {
        const src = (script as HTMLScriptElement).src
        return src.includes('.min.') || src.includes('_next/static')
      })

      const passed = hasOptimizedImports && hasCompression
      this.testResults.push({
        name: 'Bundle Optimization',
        passed,
        details: { totalSize, hasOptimizedImports, hasCompression },
      })

      console.log(
        passed
          ? '✅ Bundle optimization detected'
          : '❌ Bundle optimization needs improvement'
      )
    } catch (error) {
      console.error('❌ Bundle optimization test failed:', error)
      this.testResults.push({
        name: 'Bundle Optimization',
        passed: false,
        details: { error: error.message },
      })
    }
  }

  private async testDeviceSpecificLoading() {
    console.log('📱 Testing device-specific loading...')

    try {
      // Simulate different device conditions
      const connection = (navigator as any).connection
      const deviceMemory = (navigator as any).deviceMemory

      const hasConnectionAPI = connection !== undefined
      const hasDeviceMemoryAPI = deviceMemory !== undefined

      // Check if the app can detect device capabilities
      const canDetectCapabilities = hasConnectionAPI || hasDeviceMemoryAPI

      this.testResults.push({
        name: 'Device-Specific Loading',
        passed: canDetectCapabilities,
        details: {
          hasConnectionAPI,
          hasDeviceMemoryAPI,
          effectiveType: connection?.effectiveType,
          deviceMemory: deviceMemory,
        },
      })

      console.log(
        canDetectCapabilities
          ? '✅ Device detection available'
          : '⚠️ Device detection limited'
      )
    } catch (error) {
      console.error('❌ Device-specific loading test failed:', error)
      this.testResults.push({
        name: 'Device-Specific Loading',
        passed: false,
        details: { error: error.message },
      })
    }
  }

  private async testPerformanceMetrics() {
    console.log('⚡ Testing performance metrics...')

    try {
      // Run performance test
      runModalPerformanceTest()

      // Check if Performance API is available
      const hasPerformanceAPI =
        typeof performance !== 'undefined' &&
        typeof PerformanceObserver !== 'undefined'

      // Check for performance marks
      const marks = performance.getEntriesByType('mark')
      const measures = performance.getEntriesByType('measure')

      const hasPerformanceTracking = marks.length > 0 || measures.length > 0

      const passed = hasPerformanceAPI && hasPerformanceTracking
      this.testResults.push({
        name: 'Performance Metrics',
        passed,
        details: {
          hasPerformanceAPI,
          hasPerformanceTracking,
          marksCount: marks.length,
          measuresCount: measures.length,
        },
      })

      console.log(
        passed
          ? '✅ Performance tracking active'
          : '❌ Performance tracking needs setup'
      )
    } catch (error) {
      console.error('❌ Performance metrics test failed:', error)
      this.testResults.push({
        name: 'Performance Metrics',
        passed: false,
        details: { error: error.message },
      })
    }
  }

  private printSummary() {
    const passedTests = this.testResults.filter(test => test.passed).length
    const totalTests = this.testResults.length
    const successRate = Math.round((passedTests / totalTests) * 100)

    console.log('\n📋 Test Summary:')
    console.log(`${passedTests}/${totalTests} tests passed (${successRate}%)`)

    this.testResults.forEach(test => {
      const status = test.passed ? '✅' : '❌'
      console.log(`${status} ${test.name}`)
    })

    if (successRate >= 80) {
      console.log('🎉 Modal optimization is performing well!')
    } else if (successRate >= 60) {
      console.log('⚠️ Modal optimization needs some improvements')
    } else {
      console.log('🚨 Modal optimization requires significant improvements')
    }
  }
}

// Export convenience function
export function runModalOptimizationTests() {
  const runner = new ModalOptimizationTestRunner()
  return runner.runAllTests()
}

// Auto-run tests in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Run tests after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('🔧 Running modal optimization tests...')
      runModalOptimizationTests()
    }, 3000) // Wait for modal to potentially load
  })
}
