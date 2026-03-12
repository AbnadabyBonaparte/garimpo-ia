/**
 * GARIMPO IA™ — Supabase Client (SSOT ÚNICO)
 *
 * LEI 3 ALSHAM: Este é o ÚNICO ponto de acesso ao Supabase.
 * Quando VITE_SUPABASE_* não estão configurados, retorna null (app funciona sem backend).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { envConfig, isSupabaseConfigured } from '@/lib/env';

function createSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createClient(
    envConfig.SUPABASE_URL!,
    envConfig.SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    },
  );
}

export const supabase = createSupabaseClient();
