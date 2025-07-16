// Test file to verify ESLint TypeScript rules
import { useState } from 'react'

// This should trigger @typescript-eslint/no-unused-vars
const unusedVariable = 'test'

// This should trigger no-console warning
console.log('This should show a warning')

// This should be fine (console.error is allowed)
console.error('This is allowed')

// This should trigger @typescript-eslint/no-explicit-any
const anyValue: any = 'test'

// This should trigger @typescript-eslint/no-inferrable-types
const explicitString: string = 'test'

// This should be fine
const _ignoredVariable = 'this should not trigger unused var warning'

export function testFunction() {
  return 'test'
}
