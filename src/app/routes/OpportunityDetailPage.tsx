/**
 * GARIMPO IA™ — Opportunity Detail Page
 *
 * LEI 5: Loading, Error, Not-found. Paywall: full analysis + link only for subscribers.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { Lock, ExternalLink, Clock, ArrowLeft } from 'lucide-react';
import { useOpportunity } from '@/hooks/useOpportunity';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/StateDisplay';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  formatBRL,
  formatPercent,
  formatTimeRemaining,
  getCategoryEmoji,
  getCategoryLabel,
} from '@/lib/utils';
import type { Opportunity } from '@/types';

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Skeleton className="mb-6 h-6 w-32" />
      <Skeleton className="mb-2 h-10 w-3/4" />
      <Skeleton className="mb-6 h-4 w-1/2" />
      <div className="mb-6 grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

function AnalysisBlock({
  opportunity,
  isUnlocked,
  onSubscribe,
}: {
  opportunity: Opportunity;
  isUnlocked: boolean;
  onSubscribe: () => void;
}) {
  const hasAnalysis = !!opportunity.ai_analysis?.trim();

  if (isUnlocked) {
    return (
      <section className="rounded-lg border border-border bg-background-surface p-6">
        <h2 className="font-display mb-4 text-lg font-semibold text-foreground">
          Análise IA
        </h2>
        {hasAnalysis ? (
          <div className="font-body whitespace-pre-wrap text-sm text-foreground-muted">
            {opportunity.ai_analysis}
          </div>
        ) : (
          <p className="text-sm text-foreground-muted">
            Análise em processamento. Volte em breve.
          </p>
        )}
        {opportunity.auction_url && (
          <Button variant="primary" className="mt-4" asChild>
            <a href={opportunity.auction_url} target="_blank" rel="noopener noreferrer">
              Ver leilão <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </section>
    );
  }

  return (
    <section className="relative rounded-lg border border-border bg-background-surface p-6">
      <div className="pointer-events-none select-none blur-sm">
        <h2 className="font-display mb-4 text-lg font-semibold text-foreground">
          Análise IA
        </h2>
        <p className="font-body text-sm text-foreground-muted">
          Resumo completo, riscos e recomendação (strong_buy / buy / hold / avoid) disponíveis
          para assinantes. Link do leilão e detalhes do lote também são exclusivos.
        </p>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-lg bg-background-deep/80 backdrop-blur-sm">
        <Lock className="h-10 w-10 text-amber" />
        <p className="font-display text-center font-semibold text-amber">
          Assine para ver a análise completa e o link do leilão
        </p>
        <Button variant="primary" onClick={onSubscribe}>
          Ver planos — Assinar
        </Button>
      </div>
    </section>
  );
}

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: opportunity, isLoading, isError, isNotFound, error, refetch } = useOpportunity(id);
  const { profile, isAuthenticated } = useApp();

  const isSubscriber = isAuthenticated && profile?.subscription_tier !== 'free';

  if (isLoading) return <DetailSkeleton />;

  if (isError && opportunity === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ErrorState
          message={isNotFound ? 'Oportunidade não encontrada.' : (error ?? 'Erro ao carregar.')}
          onRetry={isNotFound ? undefined : () => refetch()}
        />
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
          Voltar ao feed
        </Button>
      </div>
    );
  }

  if (!opportunity) return null;

  const scoreVariant = opportunity.score >= 70 ? 'high' : opportunity.score >= 40 ? 'medium' : 'low';
  const liquidityVariant =
    opportunity.liquidity === 'high' ? 'high' : opportunity.liquidity === 'medium' ? 'medium' : 'low';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate('/')}>
        <ArrowLeft className="h-4 w-4" />
        Voltar ao feed
      </Button>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="rounded bg-background-surface-alt px-2 py-1 text-lg">
          {getCategoryEmoji(opportunity.category)}
        </span>
        <span className="font-body text-sm uppercase tracking-wider text-foreground-muted">
          {getCategoryLabel(opportunity.category)}
        </span>
        <Badge variant={scoreVariant}>★ {opportunity.score}</Badge>
        {opportunity.liquidity && (
          <Badge variant={liquidityVariant}>
            {opportunity.liquidity === 'high' ? 'Alta liquidez' : opportunity.liquidity === 'medium' ? 'Liquidez média' : 'Baixa liquidez'}
          </Badge>
        )}
      </div>

      <h1 className="font-display mb-2 text-2xl font-bold text-foreground">
        {opportunity.title}
      </h1>
      <p className="mb-6 flex items-center gap-2 text-sm text-foreground-muted">
        <span>📍 {opportunity.location}, {opportunity.state}</span>
        {opportunity.year && (
          <>
            <span>•</span>
            <span>{opportunity.year}</span>
          </>
        )}
      </p>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-background-surface p-4">
          <span className="block font-body text-xs text-foreground-muted">Lance atual</span>
          <span className="font-mono-data text-lg font-semibold text-foreground">
            {formatBRL(opportunity.current_bid)}
          </span>
        </div>
        <div className="rounded-lg border border-border bg-background-surface p-4">
          <span className="block font-body text-xs text-foreground-muted">Valor mercado</span>
          <span className="font-mono-data text-lg font-semibold text-foreground">
            {formatBRL(opportunity.market_value)}
          </span>
        </div>
        <div className="rounded-lg border border-border bg-background-surface p-4">
          <span className="block font-body text-xs text-foreground-muted">Lucro potencial</span>
          <span className="font-mono-data text-lg font-semibold text-green">
            {formatBRL(opportunity.profit_potential)} ({formatPercent(opportunity.roi_percentage)})
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background-surface p-4">
          <Clock className="h-4 w-4 text-foreground-muted" />
          <div>
            <span className="block font-body text-xs text-foreground-muted">Fecha em</span>
            <span className="font-mono-data text-sm font-semibold text-foreground">
              {formatTimeRemaining(opportunity.closes_at)}
            </span>
          </div>
        </div>
      </div>

      {opportunity.risk_notes && (
        <div className="mb-6 rounded-lg border border-border bg-background-surface-alt p-4">
          <span className="block font-body text-xs text-foreground-muted">Riscos</span>
          <p className="font-body text-sm text-foreground">{opportunity.risk_notes}</p>
        </div>
      )}

      <AnalysisBlock
        opportunity={opportunity}
        isUnlocked={!!isSubscriber}
        onSubscribe={() => navigate('/pricing')}
      />
    </div>
  );
}
