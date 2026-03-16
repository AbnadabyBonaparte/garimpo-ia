/**
 * GARIMPO IA™ — Utils Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  formatBRL,
  formatPercent,
  formatTimeRemaining,
  getCategoryLabel,
  getCategoryEmoji,
} from '../utils';

describe('formatBRL', () => {
  it('formats zero', () => {
    expect(formatBRL(0)).toBe('R$\u00a00');
  });

  it('formats thousands', () => {
    const result = formatBRL(1000);
    expect(result).toContain('1');
    expect(result).toContain('000');
  });

  it('formats millions', () => {
    const result = formatBRL(1_000_000);
    expect(result).toContain('1');
    expect(result).toContain('000');
  });

  it('handles negative values', () => {
    const result = formatBRL(-500);
    expect(result).toContain('-');
    expect(result).toContain('500');
  });
});

describe('formatPercent', () => {
  it('formats positive values with + prefix', () => {
    expect(formatPercent(42)).toBe('+42%');
  });

  it('formats negative values without +', () => {
    expect(formatPercent(-15)).toBe('-15%');
  });

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('+0%');
  });

  it('rounds decimals', () => {
    expect(formatPercent(12.7)).toBe('+13%');
  });
});

describe('formatTimeRemaining', () => {
  it('returns "Encerrado" for past dates', () => {
    const past = new Date(Date.now() - 60_000).toISOString();
    expect(formatTimeRemaining(past)).toBe('Encerrado');
  });

  it('returns hours and minutes for same-day future', () => {
    const inTwoHours = new Date(
      Date.now() + 2 * 60 * 60 * 1000 + 30 * 60 * 1000,
    ).toISOString();
    const result = formatTimeRemaining(inTwoHours);
    expect(result).toMatch(/h/);
    expect(result).toMatch(/min/);
  });

  it('returns days for far future dates', () => {
    const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatTimeRemaining(inThreeDays);
    expect(result).toMatch(/d/);
  });
});

describe('getCategoryLabel', () => {
  it('returns correct label for vehicle', () => {
    expect(getCategoryLabel('vehicle')).toBe('Veículo');
  });

  it('returns correct label for property', () => {
    expect(getCategoryLabel('property')).toBe('Imóvel');
  });

  it('returns correct label for agriculture', () => {
    expect(getCategoryLabel('agriculture')).toBe('Agronegócio');
  });

  it('returns correct label for machinery', () => {
    expect(getCategoryLabel('machinery')).toBe('Maquinário');
  });

  it('returns correct label for electronics', () => {
    expect(getCategoryLabel('electronics')).toBe('Eletrônicos');
  });

  it('returns correct label for other', () => {
    expect(getCategoryLabel('other')).toBe('Outros');
  });

  it('returns "Outros" for unknown categories', () => {
    expect(getCategoryLabel('unknown_category')).toBe('Outros');
  });
});

describe('getCategoryEmoji', () => {
  it('returns 🚗 for vehicle', () => {
    expect(getCategoryEmoji('vehicle')).toBe('🚗');
  });

  it('returns 🏠 for property', () => {
    expect(getCategoryEmoji('property')).toBe('🏠');
  });

  it('returns 🚜 for agriculture', () => {
    expect(getCategoryEmoji('agriculture')).toBe('🚜');
  });

  it('returns ⚙️ for machinery', () => {
    expect(getCategoryEmoji('machinery')).toBe('⚙️');
  });

  it('returns 💻 for electronics', () => {
    expect(getCategoryEmoji('electronics')).toBe('💻');
  });

  it('returns 📦 for unknown', () => {
    expect(getCategoryEmoji('xyz')).toBe('📦');
  });
});
