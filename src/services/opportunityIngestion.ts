/**
 * GARIMPO IA™ — Opportunity Ingestion (Phase 3)
 *
 * Single and bulk insert with normalization. Triggers run-ai-analysis after insert.
 * Usable from: admin UI, scripts (with Supabase client), or an Edge Function that calls the same logic.
 */

import { supabase } from '@/lib/supabaseClient';
import { triggerRunAiAnalysis, isRunAiAnalysisConfigured } from '@/services/runAiAnalysis';
import type {
  OpportunityCategory,
  OpportunityIngestionPayload,
  OpportunityInsertRow,
  RiskLevel,
  LiquidityLevel,
} from '@/types';

const CATEGORIES: OpportunityCategory[] = [
  'vehicle',
  'property',
  'agriculture',
  'machinery',
  'electronics',
  'other',
];
const RISK_LEVELS: RiskLevel[] = ['low', 'medium', 'high'];
const LIQUIDITY_LEVELS: LiquidityLevel[] = ['high', 'medium', 'low'];

function toCategory(v: unknown): OpportunityCategory {
  const s = String(v ?? '').toLowerCase().trim();
  if (CATEGORIES.includes(s as OpportunityCategory)) return s as OpportunityCategory;
  return 'other';
}

function toRiskLevel(v: unknown): RiskLevel {
  const s = String(v ?? 'medium').toLowerCase().trim();
  if (RISK_LEVELS.includes(s as RiskLevel)) return s as RiskLevel;
  return 'medium';
}

function toLiquidity(v: unknown): LiquidityLevel {
  const s = String(v ?? 'medium').toLowerCase().trim();
  if (LIQUIDITY_LEVELS.includes(s as LiquidityLevel)) return s as LiquidityLevel;
  return 'medium';
}

/**
 * Normalize external/API payload into a valid opportunities insert row.
 */
export function normalizeOpportunityData(payload: OpportunityIngestionPayload): OpportunityInsertRow {
  const current_bid = Math.max(0, Number(payload.current_bid) || 0);
  const market_value = Math.max(0, Number(payload.market_value) || 0);
  let closes_at: string;
  if (payload.closes_at == null || payload.closes_at === '') {
    closes_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  } else if (typeof payload.closes_at === 'number') {
    closes_at = new Date(payload.closes_at).toISOString();
  } else {
    closes_at = new Date(payload.closes_at as string).toISOString();
  }

  return {
    title: String(payload.title ?? '').trim() || 'Sem título',
    category: toCategory(payload.category),
    location: String(payload.location ?? '').trim() || 'Não informado',
    state: String(payload.state ?? '').trim().toUpperCase().slice(0, 2) || 'BR',
    year: payload.year != null && payload.year !== '' ? Number(payload.year) : null,
    current_bid,
    market_value,
    auction_source: String(payload.auction_source ?? '').trim() || 'Manual',
    auction_url: String(payload.auction_url ?? '').trim() || '',
    closes_at,
    score: 0,
    risk_level: toRiskLevel(payload.risk_level),
    risk_notes: payload.risk_notes != null ? String(payload.risk_notes).trim() || null : null,
    liquidity: toLiquidity(payload.liquidity),
  };
}

export interface CreateOpportunityOptions {
  /** Trigger run-ai-analysis after insert (default true when URL configured). */
  triggerAi?: boolean;
}

/**
 * Insert one opportunity and optionally trigger AI analysis.
 * Returns the new opportunity id or null on failure.
 */
export async function createOpportunity(
  payload: OpportunityIngestionPayload,
  options: CreateOpportunityOptions = {},
): Promise<{ id: string } | null> {
  if (!supabase) return null;
  const row = normalizeOpportunityData(payload);
  const { data, error } = await supabase
    .from('opportunities')
    .insert(row)
    .select('id')
    .single();

  if (error || !data?.id) return null;

  const shouldTrigger =
    options.triggerAi !== false && isRunAiAnalysisConfigured();
  if (shouldTrigger) {
    triggerRunAiAnalysis(data.id).catch(() => {});
  }
  return { id: data.id };
}

export interface BulkInsertResult {
  ids: string[];
  errors: { index: number; message: string }[];
}

/**
 * Insert multiple opportunities and trigger AI analysis for each (non-blocking).
 */
export async function bulkInsertOpportunities(
  payloads: OpportunityIngestionPayload[],
  options: CreateOpportunityOptions = {},
): Promise<BulkInsertResult> {
  const ids: string[] = [];
  const errors: { index: number; message: string }[] = [];

  if (!supabase) {
    payloads.forEach((_, i) => errors.push({ index: i, message: 'Supabase not configured' }));
    return { ids, errors };
  }

  const rows = payloads.map((p) => normalizeOpportunityData(p));

  for (let i = 0; i < rows.length; i++) {
    const { data, error } = await supabase
      .from('opportunities')
      .insert(rows[i])
      .select('id')
      .single();

    if (error) {
      errors.push({ index: i, message: error.message });
      continue;
    }
    if (data?.id) {
      ids.push(data.id);
      if (options.triggerAi !== false && isRunAiAnalysisConfigured()) {
        triggerRunAiAnalysis(data.id).catch(() => {});
      }
    }
  }

  return { ids, errors };
}
