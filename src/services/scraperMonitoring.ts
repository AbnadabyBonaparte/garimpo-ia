/**
 * GARIMPO IA™ — Scraper Monitoring & Logging (Phase 4)
 *
 * Track scraper runs, errors, counts (new, duplicates skipped), AI processing.
 */

import { supabase } from '@/lib/supabaseClient';
import type { ScraperRunRecord } from '@/types';

export interface ScraperRunLogPayload {
  sourceId: string;
  sourceName: string;
  success: boolean;
  fetched?: number;
  parsed: number;
  inserted: number;
  duplicatesSkipped?: number;
  invalidSkipped?: number;
  errors?: string[];
  durationMs: number;
}

/**
 * Log a scraper run to the database for monitoring and dashboard metrics.
 */
export async function logScraperRun(payload: ScraperRunLogPayload): Promise<void> {
  if (!supabase) return;
  const errorMessage =
    payload.errors && payload.errors.length > 0
      ? payload.errors.slice(0, 3).join('; ')
      : null;
  await supabase.from('scraper_runs').insert({
    source_id: payload.sourceId,
    source_name: payload.sourceName,
    success: payload.success,
    fetched_count: payload.fetched ?? 0,
    parsed_count: payload.parsed,
    inserted_count: payload.inserted,
    duplicates_skipped: payload.duplicatesSkipped ?? 0,
    invalid_skipped: payload.invalidSkipped ?? 0,
    error_message: errorMessage,
    duration_ms: payload.durationMs,
  });
}

/**
 * Fetch recent scraper runs for dashboard.
 */
export async function getRecentScraperRuns(limit = 50): Promise<ScraperRunRecord[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('scraper_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as ScraperRunRecord[];
}

/**
 * Aggregate metrics: total scraped, per source, success rate.
 */
export async function getScraperMetrics(): Promise<{
  totalRuns: number;
  successCount: number;
  totalInserted: number;
  totalDuplicatesSkipped: number;
  totalInvalidSkipped: number;
  bySource: { source_id: string; source_name: string; runs: number; inserted: number }[];
}> {
  if (!supabase) {
    return {
      totalRuns: 0,
      successCount: 0,
      totalInserted: 0,
      totalDuplicatesSkipped: 0,
      totalInvalidSkipped: 0,
      bySource: [],
    };
  }
  const { data: runs } = await supabase
    .from('scraper_runs')
    .select('source_id, source_name, success, inserted_count, duplicates_skipped, invalid_skipped');

  const list = (runs ?? []) as ScraperRunRecord[];
  const totalRuns = list.length;
  const successCount = list.filter((r) => r.success).length;
  const totalInserted = list.reduce((s, r) => s + r.inserted_count, 0);
  const totalDuplicatesSkipped = list.reduce((s, r) => s + r.duplicates_skipped, 0);
  const totalInvalidSkipped = list.reduce((s, r) => s + r.invalid_skipped, 0);

  const bySourceMap = new Map<string, { source_name: string; runs: number; inserted: number }>();
  for (const r of list) {
    const cur = bySourceMap.get(r.source_id) ?? {
      source_name: r.source_name,
      runs: 0,
      inserted: 0,
    };
    cur.runs += 1;
    cur.inserted += r.inserted_count;
    bySourceMap.set(r.source_id, cur);
  }
  const bySource = Array.from(bySourceMap.entries()).map(([source_id, v]) => ({
    source_id,
    source_name: v.source_name,
    runs: v.runs,
    inserted: v.inserted,
  }));

  return {
    totalRuns,
    successCount,
    totalInserted,
    totalDuplicatesSkipped,
    totalInvalidSkipped,
    bySource,
  };
}
