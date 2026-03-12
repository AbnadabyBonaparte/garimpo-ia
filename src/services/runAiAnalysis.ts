/**
 * GARIMPO IA™ — Trigger Run AI Analysis
 *
 * Calls the run-ai-analysis Edge Function. Set VITE_RUN_AI_ANALYSIS_API_URL.
 */

import { envConfig } from '@/lib/env';

const API_URL = envConfig.RUN_AI_ANALYSIS_API_URL?.trim();

export async function triggerRunAiAnalysis(opportunityId: string): Promise<{ success: boolean; score?: number }> {
  if (!API_URL) {
    return { success: false };
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opportunityId }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `run-ai-analysis failed (${res.status})`);
  }
  return (await res.json()) as { success: boolean; score?: number };
}

export function isRunAiAnalysisConfigured(): boolean {
  return !!API_URL;
}
