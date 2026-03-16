/**
 * GARIMPO IA™ — Data Quality Validation (Phase 4)
 *
 * Validate payload before insert. Reject invalid entries.
 */

import type { OpportunityIngestionPayload, OpportunityCategory } from '@/types';

const VALID_CATEGORIES: OpportunityCategory[] = [
  'vehicle',
  'property',
  'agriculture',
  'machinery',
  'electronics',
  'other',
];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate opportunity payload. Returns valid: false and errors list if invalid.
 */
export function validateOpportunityPayload(payload: OpportunityIngestionPayload): ValidationResult {
  const errors: string[] = [];

  const title = String(payload.title ?? '').trim();
  if (!title || title.length < 2) {
    errors.push('Título inválido ou muito curto');
  }

  const category = String(payload.category ?? '').toLowerCase().trim();
  if (!VALID_CATEGORIES.includes(category as OpportunityCategory)) {
    errors.push('Categoria inválida');
  }

  try {
    if (payload.closes_at == null || payload.closes_at === '') {
      errors.push('Data de fechamento obrigatória');
    } else {
      const closesAt = typeof payload.closes_at === 'number'
        ? new Date(payload.closes_at)
        : new Date(payload.closes_at as string);
      if (Number.isNaN(closesAt.getTime())) {
        errors.push('Data de fechamento inválida');
      } else if (closesAt.getTime() < Date.now()) {
        errors.push('Data de fechamento já passou');
      }
    }
  } catch {
    errors.push('Data de fechamento inválida');
  }

  const auctionUrl = String(payload.auction_url ?? '').trim();
  if (!auctionUrl) {
    errors.push('URL do leilão obrigatória');
  } else {
    try {
      new URL(auctionUrl);
    } catch {
      errors.push('URL do leilão inválida');
    }
  }

  const currentBid = Number(payload.current_bid);
  const marketValue = Number(payload.market_value);
  if (Number.isNaN(currentBid) || currentBid < 0) {
    errors.push('Lance atual inválido');
  }
  if (Number.isNaN(marketValue) || marketValue < 0) {
    errors.push('Valor de mercado inválido');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Filter payloads to only valid ones. Returns valid payloads and list of validation errors per index.
 */
export function filterValidPayloads(
  payloads: OpportunityIngestionPayload[],
): { valid: OpportunityIngestionPayload[]; invalid: { index: number; errors: string[] }[] } {
  const valid: OpportunityIngestionPayload[] = [];
  const invalid: { index: number; errors: string[] }[] = [];
  payloads.forEach((p, i) => {
    const result = validateOpportunityPayload(p);
    if (result.valid) {
      valid.push(p);
    } else {
      invalid.push({ index: i, errors: result.errors });
    }
  });
  return { valid, invalid };
}
