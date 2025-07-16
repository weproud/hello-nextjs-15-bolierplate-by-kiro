import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string(),
  AUTH_URL: z.string(),
  AUTH_SECRET: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
})

export const env = envSchema.parse(process.env)
