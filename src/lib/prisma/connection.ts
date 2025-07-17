import { PrismaClient } from '@prisma/client'

export interface DatabaseConfig {
  url: string
  maxConnections?: number
  connectionTimeout?: number
}

export class DatabaseConnection {
  private static instance: PrismaClient | null = null
  private static isConnected = false

  static getInstance(): PrismaClient {
    if (!this.instance) {
      this.instance = new PrismaClient({
        log:
          process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
        errorFormat: 'pretty',
      })
    }
    return this.instance
  }

  static async connect(): Promise<void> {
    if (this.isConnected) return

    try {
      const client = this.getInstance()
      await client.$connect()
      this.isConnected = true
      console.log('Database connected successfully')
    } catch (error) {
      console.error('Failed to connect to database:', error)
      throw error
    }
  }

  static async disconnect(): Promise<void> {
    if (!this.instance || !this.isConnected) return

    try {
      await this.instance.$disconnect()
      this.isConnected = false
      console.log('Database disconnected successfully')
    } catch (error) {
      console.error('Failed to disconnect from database:', error)
      throw error
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const client = this.getInstance()
      await client.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error('Database health check failed:', error)
      return false
    }
  }

  static isConnectionActive(): boolean {
    return this.isConnected
  }
}

// Graceful shutdown handling
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await DatabaseConnection.disconnect()
  })

  process.on('SIGINT', async () => {
    await DatabaseConnection.disconnect()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await DatabaseConnection.disconnect()
    process.exit(0)
  })
}
