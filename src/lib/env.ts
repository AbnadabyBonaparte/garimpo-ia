/**
 * GARIMPO IA™ — Environment Configuration
 *
 * Valida TODAS as env vars com Zod no startup.
 * Se faltar alguma, o app não sobe.
 */

import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'VITE_SUPABASE_ANON_KEY is required'),
  GEMINI_API_KEY: z.string().min(1, 'VITE_GEMINI_API_KEY is required'),
  STRIPE_PUBLIC_KEY: z.string().min(1, 'VITE_STRIPE_PUBLIC_KEY is required'),
  APP_URL: z.string().url().default('http://localhost:5173'),
});

function loadEnv() {
  const raw = {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
    STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
    APP_URL: import.meta.env.VITE_APP_URL,
  };

  const parsed = envSchema.safeParse(raw);

  if (!parsed.success) {
    console.error(
      '❌ [GARIMPO IA] Invalid environment variables:',
      parsed.error.flatten().fieldErrors,
    );
    throw new Error('Missing or invalid environment variables. Check .env.example');
  }

  return parsed.data;
}

export const envConfig = loadEnv();
