/**
 * GARIMPO IA™ — Logger Centralizado
 *
 * Camada de abstração para logging e error tracking.
 * Hoje: console estruturado.
 * Amanhã: Sentry, Datadog, ou equivalente.
 *
 * NUNCA use console.log/console.error diretamente nos componentes.
 * Use logger.info(), logger.error(), logger.warn().
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

function createEntry(
  level: LogLevel,
  message: string,
  context?: string,
  data?: Record<string, unknown>,
): LogEntry {
  return {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
  };
}

function emit(entry: LogEntry) {
  const prefix = `[GARIMPO IA] [${entry.level.toUpperCase()}]${entry.context ? ` [${entry.context}]` : ''}`;

  switch (entry.level) {
    case 'error':
      console.error(prefix, entry.message, entry.data ?? '');
      // TODO: Sentry.captureException() ou equivalente
      break;
    case 'warn':
      console.warn(prefix, entry.message, entry.data ?? '');
      break;
    case 'info':
      console.info(prefix, entry.message, entry.data ?? '');
      break;
  }
}

export const logger = {
  info: (message: string, context?: string, data?: Record<string, unknown>) =>
    emit(createEntry('info', message, context, data)),

  warn: (message: string, context?: string, data?: Record<string, unknown>) =>
    emit(createEntry('warn', message, context, data)),

  error: (message: string, context?: string, data?: Record<string, unknown>) =>
    emit(createEntry('error', message, context, data)),

  /** Log de erro com objeto Error */
  captureError: (error: unknown, context?: string) => {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    emit(createEntry('error', message, context, { stack }));
  },
};
