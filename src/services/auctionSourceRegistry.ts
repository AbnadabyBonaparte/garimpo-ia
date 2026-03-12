/**
 * GARIMPO IA™ — Auction Source Registry (Phase 4)
 *
 * Load active sources from auction_sources table and run their scrapers.
 */

import { supabase } from '@/lib/supabaseClient';
import type { AuctionSource } from '@/types';

export interface AuctionSourceConfig {
  id: string;
  name: string;
  scraper_type: string;
}

/**
 * Load all active auction sources that have a scraper_type.
 */
export async function getActiveAuctionSources(): Promise<AuctionSourceConfig[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('auction_sources')
    .select('id, name, scraper_type')
    .eq('is_active', true)
    .not('scraper_type', 'is', null);

  const list = (data ?? []) as { id: string; name: string; scraper_type: string | null }[];
  return list
    .filter((r) => r.scraper_type)
    .map((r) => ({ id: r.id, name: r.name, scraper_type: r.scraper_type! }));
}

/**
 * Fetch full auction source list (for admin / dashboard).
 */
export async function getAuctionSources(): Promise<AuctionSource[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from('auction_sources')
    .select('*')
    .order('name');
  return (data ?? []) as AuctionSource[];
}

/**
 * Update last_run_at for a source after a scraper run.
 */
export async function updateSourceLastRun(sourceId: string): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('auction_sources')
    .update({
      last_run_at: new Date().toISOString(),
      last_scraped_at: new Date().toISOString(),
    })
    .eq('id', sourceId);
}
