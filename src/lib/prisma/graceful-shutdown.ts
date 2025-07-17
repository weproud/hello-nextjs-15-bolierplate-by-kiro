// src/lib/prisma/graceful-shutdown.ts
import { prisma } from '../prisma'

export function setupGracefulShutdown() {
  if (typeof process !== 'undefined' && process.on) {
    process.on('beforeExit', async () => {
      await prisma.$disconnect()
    })
  }
}
