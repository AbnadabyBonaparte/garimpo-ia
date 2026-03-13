/**
 * GARIMPO IA™ — AI Analysis Service
 *
 * SEGURANÇA: A chave Gemini NÃO existe no frontend.
 * Toda chamada de IA passa pela Edge Function run-ai-analysis (server-side).
 * O frontend apenas envia o opportunityId e o JWT do usuário autenticado.
 */

import { z } from 'zod';
import { supabase } from '@/lib/supabaseClient';
import { envConfig } from '@/lib/env';
import type { AIAnalysisResponse } from '@/types';

const aiResponseSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string().optional().default(''),
  risks: z.array(z.string()).optional().default([]),
  recommendation: z.enum(['strong_buy', 'buy', 'hold', 'avoid']).optional().default('hold'),
  estimated_total_cost: z.number().optional().default(0),
  estimated_net_profit: z.number().optional().default(0),
});

/**
 * Dispara análise de IA via Edge Function (server-side).
 * Requer usuário autenticado — JWT é enviado no header Authorization.
 */
export async function analyzeOpportunity(
  opportunityId: string,
): Promise<AIAnalysisResponse> {
  if (!supabase) {
    throw new Error('Supabase não configurado.');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Autenticação necessária para análise de IA.');
  }

  const apiUrl = envConfig.RUN_AI_ANALYSIS_API_URL?.trim()
    || (envConfig.SUPABASE_URL ? `${envConfig.SUPABASE_URL}/functions/v1/run-ai-analysis` : '');

  if (!apiUrl) {
    throw new Error('Configure VITE_RUN_AI_ANALYSIS_API_URL no Vercel.');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ opportunityId }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Falha na análise de IA (${response.status})`);
  }

  const raw = (await response.json()) as unknown;
  const parsed = aiResponseSchema.parse(raw);
  return parsed as AIAnalysisResponse;
}

export function isAiAnalysisConfigured(): boolean {
  return !!(
    envConfig.RUN_AI_ANALYSIS_API_URL?.trim() ||
    envConfig.SUPABASE_URL?.trim()
  );
}
