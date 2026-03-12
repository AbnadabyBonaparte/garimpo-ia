/**
 * GARIMPO IA™ — UI State Components
 * LEI 5 ALSHAM: Error + Empty states obrigatórios.
 */

import { AlertTriangle, SearchX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Erro ao carregar dados. Tente novamente.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red/10">
        <AlertTriangle className="h-8 w-8 text-red" />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          Algo deu errado
        </h3>
        <p className="mt-1 max-w-sm text-sm text-foreground-muted">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title = 'Nenhuma oportunidade encontrada',
  description = 'Tente ajustar seus filtros ou volte mais tarde — o robô está minerando 24/7.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber/10">
        <SearchX className="h-8 w-8 text-amber" />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          {title}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-foreground-muted">
          {description}
        </p>
      </div>
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
