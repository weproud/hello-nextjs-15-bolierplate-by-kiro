import { z } from 'zod'

// Environment variable schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.url(),
  DIRECT_URL: z.url().optional(),

  // App Configuration
  NEXT_PUBLIC_APP_URL: z.url(),

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_BUCKET_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Auth Configuration
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.url(),

  // OAuth Providers
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),

  // Environment
  NEXT_RUNTIME: z.string(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

// Parse and validate environment variables
function parseEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(err => err.path.join('.')).join(', ')
      throw new Error(
        `Missing or invalid environment variables: ${missingVars}`
      )
    }
    throw error
  }
}

export const Envs = parseEnv()

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>

// Environment checks
export const isDevelopment = Envs.NODE_ENV === 'development'
export const isProduction = Envs.NODE_ENV === 'production'
export const isTest = Envs.NODE_ENV === 'test'

// Database configuration
export const databaseConfig = {
  url: Envs.DATABASE_URL,
  directUrl: Envs.DIRECT_URL,
}

// Supabase configuration
export const supabaseConfig = {
  url: Envs.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: Envs.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  bucketUrl: Envs.NEXT_PUBLIC_SUPABASE_BUCKET_URL,
  serviceRoleKey: Envs.SUPABASE_SERVICE_ROLE_KEY,
}

// Auth configuration
export const authConfig = {
  secret: Envs.AUTH_SECRET,
  url: Envs.AUTH_URL,
  providers: {
    google: {
      clientId: Envs.AUTH_GOOGLE_ID,
      clientSecret: Envs.AUTH_GOOGLE_SECRET,
    },
  },
}
