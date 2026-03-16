/**
 * GARIMPO IA™ — Scraper Pipeline (Phase 4)
 *
 * Runs scrapers → normalizes → validates → deduplicates → inserts → triggers AI.
 */

import type { ScraperSource } from '@/scrapers/types';
import { bulkInsertOpportunities } from '@/services/opportunityIngestion';
import { processPendingOpportunities } from '@/services/aiProcessing';
import { logScraperRun } from '@/services/scraperMonitoring';

export interface ScraperRunResult {
  sourceId: string;
  sourceName: string;
  fetched: number;
  parsed: number;
  inserted: number;
  duplicatesSkipped: number;
  invalidSkipped: number;
  errors: string[];
  durationMs: number;
}

export interface RunScraperOptions {
  dbSourceId?: string;
  dbSourceName?: string;
}

/**
 * Run a single scraper: fetch → parse → normalize → validate & dedup → insert → trigger AI.
 */
export async function runScraper(
  source: ScraperSource,
  options: RunScraperOptions = {},
): Promise<ScraperRunResult> {
  const start = Date.now();
  const sourceId = options.dbSourceId ?? source.id;
  const sourceName = options.dbSourceName ?? source.name;
  const result: ScraperRunResult = {
    sourceId,
    sourceName,
    fetched: 0,
    parsed: 0,
    inserted: 0,
    duplicatesSkipped: 0,
    invalidSkipped: 0,
    errors: [],
    durationMs: 0,
  };

  try {
    const raw = await source.fetchRawData();
    result.fetched = typeof raw === 'string' ? raw.length : JSON.stringify(raw).length;

    const parsed = source.parseOpportunities(raw);
    result.parsed = parsed.length;

    const payloads = source.normalizeData(parsed, source.name);
    if (payloads.length === 0) {
      result.durationMs = Date.now() - start;
      await logScraperRun({ ...result, success: true });
      return result;
    }

    const bulk = await bulkInsertOpportunities(payloads, {
      triggerAi: true,
      validate: true,
      skipDuplicate: true,
    });

    result.inserted = bulk.ids.length;
    result.duplicatesSkipped = bulk.duplicatesSkipped ?? 0;
    result.invalidSkipped = bulk.invalidSkipped ?? 0;
    bulk.errors.forEach((e) => result.errors.push(`[${e.index}]: ${e.message}`));
  } catch (e) {
    result.errors.push(e instanceof Error ? e.message : String(e));
  }

  result.durationMs = Date.now() - start;
  await logScraperRun({
    ...result,
    success: result.errors.length === 0,
  });
  if (options.dbSourceId) {
    const { updateSourceLastRun } = await import('@/services/auctionSourceRegistry');
    await updateSourceLastRun(options.dbSourceId);
  }
  return result;
}

/** Map scraper_type string to factory that returns ScraperSource */
const SCRAPER_REGISTRY: Record<string, () => Promise<ScraperSource>> = {
  example_auction: async () => {
    const m = await import('@/scrapers/exampleAuctionScraper');
    return m.exampleAuctionScraper;
  },
};

/**
 * Get scraper instance by type. Returns null if not registered.
 */
export async function getScraperByType(scraperType: string): Promise<ScraperSource | null> {
  const factory = SCRAPER_REGISTRY[scraperType];
  if (!factory) return null;
  return factory();
}

/**
 * Run all scrapers from a list of source configs (id + name + scraper_type).
 */
export async function runAllScrapers(
  sources: { id: string; name: string; scraper_type: string }[],
): Promise<ScraperRunResult[]> {
  const results: ScraperRunResult[] = [];
  for (const src of sources) {
    const scraper = await getScraperByType(src.scraper_type);
    if (!scraper) {
      results.push({
        sourceId: src.id,
        sourceName: src.name,
        fetched: 0,
        parsed: 0,
        inserted: 0,
        duplicatesSkipped: 0,
        invalidSkipped: 0,
        errors: [`Scraper type "${src.scraper_type}" not registered`],
        durationMs: 0,
      });
      continue;
    }
    const result = await runScraper(scraper, {
      dbSourceId: src.id,
      dbSourceName: src.name,
    });
    results.push(result);
  }
  return results;
}

/**
 * Schedule scrapers (entry point for cron / Vercel cron / Supabase scheduled).
 * Call runAllScrapers with active sources from the registry service.
 */
export async function scheduleScrapers(): Promise<ScraperRunResult[]> {
  const { getActiveAuctionSources } = await import('@/services/auctionSourceRegistry');
  const sources = await getActiveAuctionSources();
  const results = await runAllScrapers(sources);
  // Optionally trigger batch AI for any remaining pending
  processPendingOpportunities(20).catch(() => {});
  return results;
}
