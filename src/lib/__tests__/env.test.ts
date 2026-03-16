/**
 * GARIMPO IA™ — Env Schema Unit Tests
 *
 * Importa o schema Zod diretamente. Não usa loadEnv (que acessa import.meta).
 */

import { describe, it, expect } from 'vitest';
import { envSchema } from '../env';

describe('envSchema', () => {
  it('aceita config válida completa', () => {
    const result = envSchema.safeParse({
      SUPABASE_URL: 'https://abc.supabase.co',
      SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiJ9.test',
      STRIPE_PUBLIC_KEY: 'pk_test_abc123',
      STRIPE_CHECKOUT_API_URL:
        'https://abc.supabase.co/functions/v1/create-checkout-session',
      RUN_AI_ANALYSIS_API_URL: 'https://abc.supabase.co/functions/v1/run-ai-analysis',
      APP_URL: 'https://garimpo-ia.vercel.app',
    });
    expect(result.success).toBe(true);
  });

  it('aceita objeto vazio (todos os campos são opcionais)', () => {
    const result = envSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('aplica default vazio para SUPABASE_URL ausente', () => {
    const result = envSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.SUPABASE_URL).toBe('');
    }
  });

  it('aplica default vazio para SUPABASE_ANON_KEY ausente', () => {
    const result = envSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.SUPABASE_ANON_KEY).toBe('');
    }
  });

  it('aplica default vazio para RUN_AI_ANALYSIS_API_URL ausente', () => {
    const result = envSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.RUN_AI_ANALYSIS_API_URL).toBe('');
    }
  });

  it('aplica default vazio para STRIPE_CHECKOUT_API_URL ausente', () => {
    const result = envSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.STRIPE_CHECKOUT_API_URL).toBe('');
    }
  });

  it('aceita config parcial (apenas Supabase)', () => {
    const result = envSchema.safeParse({
      SUPABASE_URL: 'https://abc.supabase.co',
      SUPABASE_ANON_KEY: 'anon-key',
    });
    expect(result.success).toBe(true);
  });

  it('preserva os valores fornecidos sem alterar', () => {
    const input = {
      SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_ANON_KEY: 'test-key',
    };
    const result = envSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.SUPABASE_URL).toBe('https://test.supabase.co');
      expect(result.data.SUPABASE_ANON_KEY).toBe('test-key');
    }
  });
});
