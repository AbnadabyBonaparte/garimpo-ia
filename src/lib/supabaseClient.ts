/**
 * GARIMPO IA™ — Supabase Client (SSOT ÚNICO)
 *
 * LEI 3 ALSHAM: Este é o ÚNICO ponto de acesso ao Supabase.
 * Nenhum outro arquivo cria instância do cliente.
 */

import { createClient } from '@supabase/supabase-js';
import { envConfig } from '@/lib/env';

export const supabase = createClient(
  envConfig.SUPABASE_URL,
  envConfig.SUPABASE_ANON_KEY,
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
