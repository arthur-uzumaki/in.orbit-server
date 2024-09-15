import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url().min(1),
  BASE_URL_WEB: z.string().url().min(1),
})

export const env = envSchema.parse(process.env)
