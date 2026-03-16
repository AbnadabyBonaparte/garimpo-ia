/**
 * GARIMPO IA™ — Duplicate Detection (Phase 4)
 *
 * Prevent duplicate opportunities by auction_url, title, source, closing_date.
 */

import { supabase } from '@/lib/supabaseClient';
import type { OpportunityIngestionPayload, OpportunityInsertRow } from '@/types';

function normalizeClosesAt(p: OpportunityIngestionPayload): string {
  if (p.closes_at == null || p.closes_at === '') return '';
  try {
    const d = typeof p.closes_at === 'number' ? new Date(p.closes_at) : new Date(p.closes_at as string);
    return d.toISOString();
  } catch {
    return '';
  }
}

/**
 * Check if an opportunity with the same signature already exists.
 * Signature: auction_url + title + auction_source + closes_at (normalized).
 */
export async function findDuplicateOpportunity(
  payload: OpportunityIngestionPayload | OpportunityInsertRow,
): Promise<string | null> {
  if (!supabase) return null;

  const auctionUrl = String((payload as OpportunityIngestionPayload).auction_url ?? '').trim();
  const title = String((payload as OpportunityIngestionPayload).title ?? '').trim();
  const source = String((payload as OpportunityIngestionPayload).auction_source ?? '').trim();
  const closesAt =
    'closes_at' in payload && typeof payload.closes_at === 'string'
      ? payload.closes_at
      : normalizeClosesAt(payload as OpportunityIngestionPayload);

  if (!auctionUrl && !title) return null;

  let query = supabase
    .from('opportunities')
    .select('id')
    .limit(1);
  if (auctionUrl) query = query.eq('auction_url', auctionUrl);
  if (title) query = query.eq('title', title);
  if (source) query = query.eq('auction_source', source);
  if (closesAt) query = query.eq('closes_at', closesAt);
  const { data } = await query.maybeSingle();
  return data?.id ?? null;
}

/**
 * Filter payloads to those that are not already in the database (by signature).
 */
export async function filterNewOpportunities(
  payloads: OpportunityIngestionPayload[],
): Promise<OpportunityIngestionPayload[]> {
  if (!supabase) return [];
  const newOnes: OpportunityIngestionPayload[] = [];
  for (const p of payloads) {
    const existingId = await findDuplicateOpportunity(p);
    if (!existingId) newOnes.push(p);
  }
  return newOnes;
}
