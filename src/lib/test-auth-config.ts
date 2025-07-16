// Test file to verify NextAuth.js configuration
import { auth } from './auth'

// This file is just to test that the auth configuration loads without errors
// It can be removed after verification

export async function testAuthConfig() {
  try {
    // Test that auth function exists and can be called
    const session = await auth()
    console.log('Auth configuration loaded successfully')
    return true
  } catch (error) {
    console.error('Auth configuration error:', error)
    return false
  }
}
