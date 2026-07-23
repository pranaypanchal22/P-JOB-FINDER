import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1),

  // AI Providers (optional but at least one should be configured for Phase 5+)
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4-turbo-preview'),

  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-pro'),

  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default('gpt-4-turbo-preview'),

  OLLAMA_BASE_URL: z.string().url().optional(),
  OLLAMA_MODEL: z.string().default('mistral'),

  // Job Extractors
  ADZUNA_APP_ID: z.string().optional(),
  ADZUNA_APP_KEY: z.string().optional(),

  // Gmail (optional)
  GMAIL_CLIENT_ID: z.string().optional(),
  GMAIL_CLIENT_SECRET: z.string().optional(),
  GMAIL_REDIRECT_URI: z.string().url().optional(),

  // Auth
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
})

type Env = z.infer<typeof envSchema>

let validatedEnv: Env | null = null

export function getEnv(): Env {
  if (!validatedEnv) {
    const parsed = envSchema.safeParse(process.env)

    if (!parsed.success) {
      console.error('❌ Invalid environment variables:')
      Object.entries(parsed.error.flatten().fieldErrors).forEach(([key, errors]) => {
        console.error(`  ${key}: ${errors?.join(', ') || 'unknown error'}`)
      })
      throw new Error('Invalid environment variables. See details above.')
    }

    validatedEnv = parsed.data
    console.log('✓ Environment variables validated')
  }

  return validatedEnv
}

export function validateAiProviderConfigured(): boolean {
  const env = getEnv()
  return !!(env.OPENAI_API_KEY || env.GEMINI_API_KEY || env.OPENROUTER_API_KEY || env.OLLAMA_BASE_URL)
}
