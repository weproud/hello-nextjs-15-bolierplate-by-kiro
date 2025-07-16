import { prisma } from './prisma'

// Test function to verify database schema is working
export async function testDatabaseSchema() {
  try {
    // Test that we can access the models
    console.log('Testing database schema...')

    // Check if we can query users (should return empty array initially)
    const users = await prisma.user.findMany()
    console.log('Users query successful:', users.length, 'users found')

    // Check if we can query projects
    const projects = await prisma.project.findMany()
    console.log('Projects query successful:', projects.length, 'projects found')

    // Check if we can query phases
    const phases = await prisma.phase.findMany()
    console.log('Phases query successful:', phases.length, 'phases found')

    console.log('✅ Database schema test completed successfully!')
    return true
  } catch (error) {
    console.error('❌ Database schema test failed:', error)
    return false
  }
}

// Type exports to verify TypeScript integration
export type { User, Project, Phase } from '@prisma/client'
