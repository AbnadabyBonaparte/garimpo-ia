/**
 * GARIMPO IA™ — Opportunity Ingestion (Phase 3)
 *
 * Single and bulk insert with normalization.
 * FIX: bulkInsert agora usa batch insert único (não N round trips).
 */

import { supabase } from '@/lib/supabaseClient';
import { triggerRunAiAnalysis, isRunAiAnalysisConfigured } from '@/services/runAiAnalysis';
import { validateOpportunityPayload, filterValidPayloads } from '@/services/opportunityValidation';
import { findDuplicateOpportunity, filterNewOpportunities } from '@/services/opportunityDeduplication';
import type {
  OpportunityCategory,
  OpportunityIngestionPayload,
  OpportunityInsertRow,
  RiskLevel,
  LiquidityLevel,
} from '@/types';

const CATEGORIES: OpportunityCategory[] = [
  'vehicle', 'property', 'agriculture', 'machinery', 'electronics', 'other',
];
const RISK_LEVELS: RiskLevel[] = ['low', 'medium', 'high'];
const LIQUIDITY_LEVELS: LiquidityLevel[] = ['high', 'medium', 'low'];

function toCategory(v: unknown): OpportunityCategory {
  const s = String(v ?? '').toLowerCase().trim();
  return CATEGORIES.includes(s as OpportunityCategory) ? (s as OpportunityCategory) : 'other';
}

function toRiskLevel(v: unknown): RiskLevel {
  const s = String(v ?? 'medium').toLowerCase().trim();
  return RISK_LEVELS.includes(s as RiskLevel) ? (s as RiskLevel) : 'medium';
}

function toLiquidity(v: unknown): LiquidityLevel {
  const s = String(v ?? 'medium').toLowerCase().trim();
  return LIQUIDITY_LEVELS.includes(s as LiquidityLevel) ? (s as LiquidityLevel) : 'medium';
}

export function normalizeOpportunityData(
  payload: OpportunityIngestionPayload,
): OpportunityInsertRow {
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
  triggerAi?: boolean;
  /** Skip insert if duplicate exists (auction_url, title, source, closes_at). */
  skipDuplicate?: boolean;
  /** Validate payload before insert; return null if invalid. */
  validate?: boolean;
}

export async function createOpportunity(
  payload: OpportunityIngestionPayload,
  options: CreateOpportunityOptions = {},
): Promise<{ id: string } | null> {
  if (!supabase) return null;

  if (options.validate) {
    const { valid } = validateOpportunityPayload(payload);
    if (!valid) return null;
  }

  if (options.skipDuplicate) {
    const existingId = await findDuplicateOpportunity(payload);
    if (existingId) return null;
  }

  const row = normalizeOpportunityData(payload);
  const { data, error } = await supabase
    .from('opportunities')
    .insert(row)
    .select('id')
    .single();

  if (error || !data?.id) return null;

  const shouldTrigger = options.triggerAi !== false && isRunAiAnalysisConfigured();
  if (shouldTrigger) {
    triggerRunAiAnalysis(data.id).catch(() => {});
  }
  return { id: data.id };
}

export interface BulkInsertResult {
  ids: string[];
  errors: { index: number; message: string }[];
  duplicatesSkipped?: number;
  invalidSkipped?: number;
}

/**
 * Insert múltiplas oportunidades em BATCH ÚNICO (um round trip).
 * FIX: Substituiu loop sequencial por insert em batch.
 */
export async function bulkInsertOpportunities(
  payloads: OpportunityIngestionPayload[],
  options: CreateOpportunityOptions = {},
): Promise<BulkInsertResult> {
  const ids: string[] = [];
  const errors: { index: number; message: string }[] = [];
  let duplicatesSkipped = 0;
  let invalidSkipped = 0;

  if (!supabase) {
    payloads.forEach((_, i) => errors.push({ index: i, message: 'Supabase not configured' }));
    return { ids, errors };
  }

  let toInsert = payloads;
  if (options.validate) {
    const { valid, invalid } = filterValidPayloads(payloads);
    invalidSkipped = invalid.length;
    toInsert = valid;
  }
  if (options.skipDuplicate) {
    const before = toInsert.length;
    toInsert = await filterNewOpportunities(toInsert);
    duplicatesSkipped = before - toInsert.length;
  }

  const rows = toInsert.map((p) => normalizeOpportunityData(p));

  // Batch insert único — O(1) round trips em vez de O(n)
  const { data, error } = await supabase
    .from('opportunities')
    .insert(rows)
    .select('id');

  if (error) {
    payloads.forEach((_, i) => errors.push({ index: i, message: error.message }));
    return { ids, errors };
  }

  const insertedIds = (data ?? []).map((r: { id: string }) => r.id);
  ids.push(...insertedIds);

  if (options.triggerAi !== false && isRunAiAnalysisConfigured()) {
    for (const id of insertedIds) {
      triggerRunAiAnalysis(id).catch(() => {});
    }
  }

  return {
    ids,
    errors,
    ...(duplicatesSkipped > 0 && { duplicatesSkipped }),
    ...(invalidSkipped > 0 && { invalidSkipped }),
  };
}
