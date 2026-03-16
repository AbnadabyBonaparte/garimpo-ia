/**
 * GARIMPO IA™ — Scraper Architecture (Phase 4)
 *
 * Base interface for auction source scrapers.
 * Each scraper outputs data compatible with OpportunityIngestionPayload.
 */

import type { OpportunityIngestionPayload } from '@/types';

/** Raw data as returned by fetch (HTML string, JSON, etc.) */
export type RawScraperData = string | Record<string, unknown>;

/** Parsed item before normalization (scraper-specific shape) */
export interface ParsedOpportunityItem {
  title?: string;
  category?: string;
  location?: string;
  state?: string;
  year?: number | string | null;
  current_bid?: number | string;
  market_value?: number | string;
  auction_url?: string;
  closes_at?: string | number | Date;
  auction_source?: string;
  [key: string]: unknown;
}

/**
 * Base interface for a scraper source.
 * Implement fetchRawData → parseOpportunities → normalizeData to produce OpportunityIngestionPayload[].
 */
export interface ScraperSource {
  /** Unique identifier for this source (e.g. "example_auction") */
  readonly id: string;
  /** Human-readable name */
  readonly name: string;
  /** Base URL or endpoint to fetch from */
  readonly baseUrl: string;

  /**
   * Fetch raw data from the external source (HTML, JSON, etc.).
   * Can simulate with mock data for testing.
   */
  fetchRawData(): Promise<RawScraperData>;

  /**
   * Parse raw data into an array of intermediate items (scraper-specific shape).
   */
  parseOpportunities(raw: RawScraperData): ParsedOpportunityItem[];

  /**
   * Normalize parsed items into OpportunityIngestionPayload[] for ingestion.
   * Must set auction_source to identify the source.
   */
  normalizeData(items: ParsedOpportunityItem[], sourceName: string): OpportunityIngestionPayload[];
}
