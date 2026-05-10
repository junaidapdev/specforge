import { z } from 'zod';

const envSchema = z
  .object({
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
    ANTHROPIC_API_KEY: z.string().min(1),
    ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
    AI_TEST_ENABLED: z.enum(['true', 'false']).default('false').transform((value) =>
      value === 'true'
    ),
    ALLOWED_ORIGINS: z.string().min(1).default('*'),
  })
  .superRefine((value, context) => {
    if (value.ENVIRONMENT === 'production' && value.ALLOWED_ORIGINS.trim() === '*') {
      context.addIssue({
        code: 'custom',
        message: 'ALLOWED_ORIGINS must be explicit in production.',
        path: ['ALLOWED_ORIGINS'],
      });
    }
  });

const rawEnv = {
  SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
  SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  OPENAI_API_KEY: Deno.env.get('OPENAI_API_KEY'),
  ANTHROPIC_API_KEY: Deno.env.get('ANTHROPIC_API_KEY'),
  ENVIRONMENT: Deno.env.get('ENVIRONMENT'),
  AI_TEST_ENABLED: Deno.env.get('AI_TEST_ENABLED'),
  ALLOWED_ORIGINS: Deno.env.get('ALLOWED_ORIGINS'),
};

const parsedEnv = envSchema.safeParse(rawEnv);

if (!parsedEnv.success) {
  const invalidKeys = parsedEnv.error.issues
    .map((issue) => issue.path.join('.') || issue.code)
    .join(', ');

  throw new Error(`Invalid backend environment variables: ${invalidKeys}`);
}

export const env = Object.freeze(parsedEnv.data);
