/**
 * GARIMPO IA™ — useAuth Schemas Unit Tests
 *
 * Testa os schemas Zod exportados. Não precisa mockar Supabase.
 */

import { describe, it, expect } from 'vitest';
import { signInSchema, signUpSchema, resetSchema } from '../useAuth';

describe('signInSchema', () => {
  it('valida email + password corretos', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: 'senha1234',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita email inválido', () => {
    const result = signInSchema.safeParse({
      email: 'nao-e-email',
      password: 'senha1234',
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0]?.message).toBe('Email inválido');
  });

  it('rejeita password com menos de 8 caracteres', () => {
    const result = signInSchema.safeParse({
      email: 'user@example.com',
      password: '1234567',
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0]?.message).toBe(
      'Senha deve ter no mínimo 8 caracteres',
    );
  });

  it('rejeita email vazio', () => {
    const result = signInSchema.safeParse({ email: '', password: 'senha1234' });
    expect(result.success).toBe(false);
  });

  it('rejeita password vazio', () => {
    const result = signInSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('signUpSchema', () => {
  it('valida nome + email + password corretos', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'senha1234',
      fullName: 'João Silva',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita fullName com menos de 2 caracteres', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'senha1234',
      fullName: 'J',
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0]?.message).toBe('Nome deve ter no mínimo 2 caracteres');
  });

  it('rejeita email inválido', () => {
    const result = signUpSchema.safeParse({
      email: 'invalido',
      password: 'senha1234',
      fullName: 'João Silva',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita password curto', () => {
    const result = signUpSchema.safeParse({
      email: 'user@example.com',
      password: 'curto',
      fullName: 'João Silva',
    });
    expect(result.success).toBe(false);
  });

  it('herda validação de email do signInSchema', () => {
    const result = signUpSchema.safeParse({
      email: 'nao@email',
      password: 'senha1234',
      fullName: 'João Silva',
    });
    expect(result.success).toBe(false);
  });
});

describe('resetSchema', () => {
  it('valida email correto', () => {
    const result = resetSchema.safeParse('user@example.com');
    expect(result.success).toBe(true);
  });

  it('rejeita email inválido', () => {
    const result = resetSchema.safeParse('nao-e-email');
    expect(result.success).toBe(false);
    expect(result.error?.errors[0]?.message).toBe('Email inválido');
  });

  it('rejeita string vazia', () => {
    const result = resetSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});
