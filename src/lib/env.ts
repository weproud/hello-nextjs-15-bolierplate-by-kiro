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
      const missingVars = error.issues
        .map((err: any) => err.path.join('.'))
        .join(', ')
      throw new Error(
        `Missing or invalid environment variables: ${missingVars}`
      )
    }
    throw error
  }
}

export const env = parseEnv()

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>

// Environment checks
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

// Database configuration
export const databaseConfig = {
  url: env.DATABASE_URL,
  directUrl: env.DIRECT_URL,
}

// Supabase configuration
export const supabaseConfig = {
  url: env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  bucketUrl: env.NEXT_PUBLIC_SUPABASE_BUCKET_URL,
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
}

// Auth configuration
export const authConfig = {
  secret: env.AUTH_SECRET,
  url: env.AUTH_URL,
  providers: {
    google: {
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    },
  },
}
