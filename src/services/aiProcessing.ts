/**
 * GARIMPO IA™ — Background AI Processing (Phase 3)
 *
 * Fetch opportunities without ai_analysis and trigger run-ai-analysis for each.
 */

import { supabase } from '@/lib/supabaseClient';
import { triggerRunAiAnalysis, isRunAiAnalysisConfigured } from '@/services/runAiAnalysis';

const DEFAULT_BATCH_SIZE = 10;

export interface ProcessPendingResult {
  triggered: string[];
  failed: { id: string; error: string }[];
}

/**
 * Find opportunities that have no ai_analysis (or empty) or score <= 0,
 * then trigger run-ai-analysis for each, up to limit.
 */
export async function processPendingOpportunities(
  limit: number = DEFAULT_BATCH_SIZE,
): Promise<ProcessPendingResult> {
  const triggered: string[] = [];
  const failed: { id: string; error: string }[] = [];

  if (!supabase || !isRunAiAnalysisConfigured()) {
    return { triggered, failed };
  }

  const { data: rows, error: fetchError } = await supabase
    .from('opportunities')
    .select('id')
    .or('ai_analysis.is.null,score.lte.0')
    .limit(limit);

  if (fetchError || !rows?.length) return { triggered, failed };

  for (const row of rows) {
    if (!row.id) continue;
    try {
      await triggerRunAiAnalysis(row.id);
      triggered.push(row.id);
    } catch (e) {
      failed.push({ id: row.id, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return { triggered, failed };
}
