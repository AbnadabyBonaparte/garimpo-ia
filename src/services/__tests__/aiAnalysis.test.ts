/**
 * GARIMPO IA™ — AI Analysis Schema Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { aiResponseSchema } from '../aiAnalysis';

describe('aiResponseSchema', () => {
  it('aceita resposta válida completa', () => {
    const result = aiResponseSchema.safeParse({
      score: 85,
      summary: 'Excelente oportunidade de veículo com alta liquidez.',
      risks: ['Débitos pendentes', 'Documentação incompleta'],
      recommendation: 'strong_buy',
      estimated_total_cost: 25000,
      estimated_net_profit: 12000,
    });
    expect(result.success).toBe(true);
  });

  it('aceita score 0 (mínimo)', () => {
    const result = aiResponseSchema.safeParse({ score: 0 });
    expect(result.success).toBe(true);
  });

  it('aceita score 100 (máximo)', () => {
    const result = aiResponseSchema.safeParse({ score: 100 });
    expect(result.success).toBe(true);
  });

  it('rejeita score maior que 100', () => {
    const result = aiResponseSchema.safeParse({ score: 101 });
    expect(result.success).toBe(false);
  });

  it('rejeita score menor que 0', () => {
    const result = aiResponseSchema.safeParse({ score: -1 });
    expect(result.success).toBe(false);
  });

  it('rejeita recommendation inválida', () => {
    const result = aiResponseSchema.safeParse({ score: 50, recommendation: 'comprar' });
    expect(result.success).toBe(false);
  });

  it('aceita todas as recommendations válidas', () => {
    const recs = ['strong_buy', 'buy', 'hold', 'avoid'] as const;
    for (const rec of recs) {
      const result = aiResponseSchema.safeParse({ score: 50, recommendation: rec });
      expect(result.success).toBe(true);
    }
  });

  it('aplica defaults para campos opcionais', () => {
    const result = aiResponseSchema.safeParse({ score: 70 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.summary).toBe('');
      expect(result.data.risks).toEqual([]);
      expect(result.data.recommendation).toBe('hold');
      expect(result.data.estimated_total_cost).toBe(0);
      expect(result.data.estimated_net_profit).toBe(0);
    }
  });

  it('rejeita score ausente', () => {
    const result = aiResponseSchema.safeParse({ recommendation: 'buy' });
    expect(result.success).toBe(false);
  });

  it('rejeita score não-numérico', () => {
    const result = aiResponseSchema.safeParse({ score: 'oitenta' });
    expect(result.success).toBe(false);
  });
});
