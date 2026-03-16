/**
 * GARIMPO IA™ — Logger Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '../logger';

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('logger.info não lança erro', () => {
    expect(() => logger.info('mensagem de info')).not.toThrow();
  });

  it('logger.warn não lança erro', () => {
    expect(() => logger.warn('mensagem de aviso')).not.toThrow();
  });

  it('logger.error não lança erro', () => {
    expect(() => logger.error('mensagem de erro')).not.toThrow();
  });

  it('logger.captureError aceita objeto Error', () => {
    expect(() => logger.captureError(new Error('erro de teste'))).not.toThrow();
  });

  it('logger.captureError aceita string', () => {
    expect(() => logger.captureError('string de erro')).not.toThrow();
  });

  it('logger.captureError aceita valor desconhecido (null, number)', () => {
    expect(() => logger.captureError(null)).not.toThrow();
    expect(() => logger.captureError(42)).not.toThrow();
  });

  it('logger.info chama console.info', () => {
    logger.info('teste info');
    expect(console.info).toHaveBeenCalled();
  });

  it('logger.warn chama console.warn', () => {
    logger.warn('teste warn');
    expect(console.warn).toHaveBeenCalled();
  });

  it('logger.error chama console.error', () => {
    logger.error('teste error');
    expect(console.error).toHaveBeenCalled();
  });

  it('logger.info inclui prefixo [GARIMPO IA]', () => {
    logger.info('mensagem');
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('[GARIMPO IA]'),
      expect.any(String),
      expect.anything(),
    );
  });

  it('logger.info inclui context no prefixo quando fornecido', () => {
    logger.info('mensagem', 'MeuContexto');
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('[MeuContexto]'),
      expect.any(String),
      expect.anything(),
    );
  });

  it('logger.captureError extrai message de Error', () => {
    logger.captureError(new Error('erro específico'), 'TestContext');
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[TestContext]'),
      'erro específico',
      expect.anything(),
    );
  });
});
