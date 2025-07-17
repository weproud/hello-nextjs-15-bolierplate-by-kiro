// Re-export the enhanced prisma client
export { prisma, extendedPrisma } from './prisma/client'
export { DatabaseConnection } from './prisma/connection'
export {
  userQueries,
  projectQueries,
  phaseQueries,
  genericQueries,
} from './prisma/queries'
export type { ExtendedPrismaClient } from './prisma/extensions'
