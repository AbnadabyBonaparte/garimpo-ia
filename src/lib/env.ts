/**
 * GARIMPO IA™ — Environment Configuration
 *
 * Variáveis opcionais: o app sobe mesmo sem Supabase/Stripe.
 * GEMINI_API_KEY foi removido do frontend — chamadas de IA exclusivamente via Edge Function.
 * Configure no Vercel quando criar os projetos.
 */

import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_ANON_KEY: z.string().optional().default(''),
  STRIPE_PUBLIC_KEY: z.string().optional().default(''),
  STRIPE_CHECKOUT_API_URL: z.string().optional().default(''),
  RUN_AI_ANALYSIS_API_URL: z.string().optional().default(''),
  APP_URL: z.string().optional().default(''),
});

function loadEnv() {
  const raw = {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ?? '',
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
    STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY ?? '',
    STRIPE_CHECKOUT_API_URL: import.meta.env.VITE_STRIPE_CHECKOUT_API_URL ?? '',
    RUN_AI_ANALYSIS_API_URL: import.meta.env.VITE_RUN_AI_ANALYSIS_API_URL ?? '',
    APP_URL: import.meta.env.VITE_APP_URL ?? '',
  };

  const parsed = envSchema.safeParse(raw);
  const data = parsed.success ? parsed.data : envSchema.parse({});
  if (!parsed.success && typeof window !== 'undefined') {
    console.warn(
      '[GARIMPO IA] Env opcional: configure VITE_SUPABASE_*, VITE_STRIPE_PUBLIC_KEY quando estiver pronto.',
    );
  }
  return data;
}

export const envConfig = loadEnv();

/** True se Supabase está configurado e pode ser usado. */
export function isSupabaseConfigured(): boolean {
  return !!(
    envConfig.SUPABASE_URL?.trim() &&
    envConfig.SUPABASE_ANON_KEY?.trim()
  );
}
