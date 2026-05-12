import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  const invalidKeys = parsedEnv.error.issues
    .map((issue) => issue.path.join('.') || issue.code)
    .join(', ');

  throw new Error(`Invalid frontend environment variables: ${invalidKeys}`);
}

export const env = Object.freeze(parsedEnv.data);
export const IS_PRODUCTION = import.meta.env.PROD;
