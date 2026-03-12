/**
 * GARIMPO IA™ — Example Auction Scraper (Phase 4)
 *
 * Simulates fetching auction data from an external site using mock HTML/JSON.
 * Use as template for real scrapers.
 */

import type { ScraperSource, RawScraperData, ParsedOpportunityItem } from './types';
import type { OpportunityIngestionPayload, OpportunityCategory } from '@/types';

/** Mock JSON response simulating an API or extracted JSON from a page */
const MOCK_JSON = {
  lots: [
    {
      title: 'Veículo Sedan 2020 - Leilão Judicial',
      category: 'vehicle',
      location: 'São Paulo',
      state: 'SP',
      year: 2020,
      current_bid: 45000,
      market_value: 72000,
      lot_url: 'https://example.com/leilao/lote-1',
      closes_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Imóvel Residencial - 120m²',
      category: 'property',
      location: 'Curitiba',
      state: 'PR',
      year: null,
      current_bid: 280000,
      market_value: 380000,
      lot_url: 'https://example.com/leilao/lote-2',
      closes_at: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Trator Agrícola 2018',
      category: 'agriculture',
      location: 'Ribeirão Preto',
      state: 'SP',
      year: 2018,
      current_bid: 95000,
      market_value: 120000,
      lot_url: 'https://example.com/leilao/lote-3',
      closes_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

export const exampleAuctionScraper: ScraperSource = {
  id: 'example_auction',
  name: 'Example Auction House',
  baseUrl: 'https://example.com/auctions',

  async fetchRawData(): Promise<RawScraperData> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 300));
    // In production: fetch(this.baseUrl) and return response.text() or response.json()
    return MOCK_JSON as unknown as RawScraperData;
  },

  parseOpportunities(raw: RawScraperData): ParsedOpportunityItem[] {
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw) as { lots?: ParsedOpportunityItem[] };
        return parsed.lots ?? [];
      } catch {
        return [];
      }
    }
    const obj = raw as { lots?: ParsedOpportunityItem[] };
    return obj.lots ?? [];
  },

  normalizeData(items: ParsedOpportunityItem[], sourceName: string): OpportunityIngestionPayload[] {
    return items.map((item) => ({
      title: String(item.title ?? 'Sem título').trim(),
      category: (item.category as OpportunityCategory | string) ?? 'other',
      location: String(item.location ?? 'Não informado').trim(),
      state: String(item.state ?? 'BR').trim().toUpperCase().slice(0, 2),
      year: item.year != null && item.year !== '' ? Number(item.year) : null,
      current_bid: Number(item.current_bid) || 0,
      market_value: Number(item.market_value) || 0,
      auction_source: sourceName,
      auction_url: String(item.auction_url ?? item.lot_url ?? '').trim(),
      closes_at: item.closes_at ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  },
};
