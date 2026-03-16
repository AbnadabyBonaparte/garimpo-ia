/**
 * GARIMPO IA™ — Opportunity Detail Page (Redesign Supremo)
 *
 * Análise completa de UMA oportunidade.
 * Gating: plano free/explorer bloqueia análise IA + painel financeiro.
 * LEI 5: Loading/Error/Empty states.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Star,
  Share2,
  Clock,
  TrendingUp,
  Brain,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useOpportunity } from '@/hooks/useOpportunity';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { canAccessAI, canAccessCategory } from '@/lib/permissions';
import {
  formatBRL,
  formatPercent,
  formatTimeRemaining,
  getCategoryEmoji,
  getCategoryLabel,
} from '@/lib/utils';
import type { RiskLevel } from '@/types';

function ScoreRing({ score }: { score: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const timer = setInterval(() => {
      start += 3;
      if (start >= score) {
        setDisplay(score);
        clearInterval(timer);
      } else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [score]);

  const variant = score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low';
  const color = score >= 70 ? 'text-green' : score >= 50 ? 'text-amber' : 'text-red';
  const stroke =
    score >= 70 ? 'stroke-green' : score >= 50 ? 'stroke-amber' : 'stroke-red';
  const r = 28;
  const circ = 2 * Math.PI * r;
  const pct = (display / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="80" height="80" className="-rotate-90">
          <circle
            cx="40"
            cy="40"
            r={r}
            className="stroke-border"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r={r}
            className={stroke}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={circ - pct}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.016s linear' }}
          />
        </svg>
        <span
          className={`font-mono-data absolute inset-0 flex items-center justify-center text-xl font-bold ${color}`}
        >
          {display}
        </span>
      </div>
      <Badge variant={variant} className="mt-1">
        Score
      </Badge>
    </div>
  );
}

const RECOMMENDATION_MAP: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  strong_buy: { label: 'Compra Forte', color: 'text-green', icon: CheckCircle },
  buy: { label: 'Comprar', color: 'text-green', icon: TrendingUp },
  hold: { label: 'Aguardar', color: 'text-amber', icon: Clock },
  avoid: { label: 'Evitar', color: 'text-red', icon: AlertTriangle },
};

function parseAnalysis(text: string | null) {
  if (!text)
    return { summary: '', risks: [], recommendation: '', totalCost: 0, netProfit: 0 };
  const lines = text.split('\n').filter(Boolean);
  let recommendation = '';
  const risks: string[] = [];
  let summary = '';
  let totalCost = 0;
  let netProfit = 0;
  for (const line of lines) {
    if (line.startsWith('Recomendação:'))
      recommendation = line.replace('Recomendação:', '').trim();
    else if (line.startsWith('Riscos:'))
      risks.push(
        ...line
          .replace('Riscos:', '')
          .split(';')
          .map((r) => r.trim())
          .filter(Boolean),
      );
    else if (line.startsWith('Custo total'))
      totalCost = parseInt(line.replace(/\D/g, '')) || 0;
    else if (line.startsWith('Lucro'))
      netProfit = parseInt(line.replace(/[^\d-]/g, '')) || 0;
    else if (line.trim()) summary += (summary ? ' ' : '') + line.trim();
  }
  return { summary, risks, recommendation, totalCost, netProfit };
}

function getRiskVariant(level: RiskLevel) {
  return level === 'low' ? 'high' : level === 'high' ? 'low' : 'medium';
}

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile, isAuthenticated } = useApp();
  const { data: opp, isLoading, isError, error, refetch } = useOpportunity(id);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const tier = profile?.subscription_tier ?? 'free';
  const hasAI = canAccessAI(tier);
  const hasCategory = opp ? canAccessCategory(tier, opp.category) : false;
  const isLocked = !isAuthenticated || !hasAI || !hasCategory;

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  }, []);

  if (!id) return <Navigate to="/" replace />;

  if (isLoading)
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-8">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );

  if (isError || !opp)
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="mb-4 font-body text-red">
          {error ?? 'Oportunidade não encontrada.'}
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/">← Voltar ao feed</Link>
          </Button>
        </div>
      </div>
    );

  const { summary, risks, recommendation } = parseAnalysis(opp.ai_analysis);
  const recInfo = RECOMMENDATION_MAP[recommendation] ?? RECOMMENDATION_MAP['hold']!;
  const RecIcon = recInfo.icon;

  const inWatchlist = isInWatchlist(opp.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 font-body text-xs text-foreground-muted">
          <Link to="/" className="hover:text-amber">
            Feed
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="max-w-[200px] truncate text-foreground">{opp.title}</span>
        </div>

        {/* ── 1. Header ── */}
        <div className="rounded-xl border border-border bg-background-surface p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-xl">{getCategoryEmoji(opp.category)}</span>
                <Badge variant="ai">{getCategoryLabel(opp.category)}</Badge>
                <Badge variant={getRiskVariant(opp.risk_level)}>
                  Risco{' '}
                  {opp.risk_level === 'low'
                    ? 'Baixo'
                    : opp.risk_level === 'high'
                      ? 'Alto'
                      : 'Médio'}
                </Badge>
              </div>
              <h1 className="font-display text-xl font-bold text-foreground lg:text-2xl">
                {opp.title}
              </h1>
              <p className="mt-2 font-body text-sm text-foreground-muted">
                {opp.location}, {opp.state} {opp.year ? `• ${opp.year}` : ''} •{' '}
                {opp.auction_source}
              </p>
            </div>
            <ScoreRing score={opp.score} />
          </div>

          {/* Timer */}
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-background-deep px-4 py-2">
            <Clock className="h-4 w-4 text-amber" />
            <span className="font-mono-data text-sm text-foreground-muted">
              Encerramento:{' '}
              <span className="text-amber">{formatTimeRemaining(opp.closes_at)}</span>
            </span>
          </div>
        </div>

        {/* ── 2. Painel financeiro ── */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-background-surface">
          <div
            className={`grid grid-cols-2 gap-px bg-border lg:grid-cols-4 ${isLocked ? 'select-none blur-sm' : ''}`}
          >
            {[
              {
                label: 'Lance Atual',
                value: formatBRL(opp.current_bid),
                accent: 'text-foreground',
              },
              {
                label: 'Valor de Mercado',
                value: formatBRL(opp.market_value),
                accent: 'text-foreground',
              },
              {
                label: 'Lucro Potencial',
                value: formatBRL(opp.profit_potential),
                accent: 'text-green',
              },
              {
                label: 'ROI Estimado',
                value: formatPercent(opp.roi_percentage),
                accent: 'text-green',
              },
            ].map((item, i) => (
              <div key={i} className="bg-background-surface p-5">
                <p className="font-body text-xs text-foreground-muted">{item.label}</p>
                <p className={`font-mono-data mt-1 text-xl font-bold ${item.accent}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {isLocked && (
            <div className="bg-background-deep/80 absolute inset-0 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
              <Lock className="h-8 w-8 text-amber" />
              <p className="font-display text-base font-bold text-foreground">
                Análise bloqueada
              </p>
              <p className="px-4 text-center font-body text-sm text-foreground-muted">
                {!isAuthenticated
                  ? 'Faça login para ver a análise.'
                  : `Plano ${tier} não inclui esta categoria.`}
              </p>
              <Button variant="primary" size="sm" asChild>
                <Link
                  to={
                    !isAuthenticated ? `/login?returnTo=/opportunity/${id}` : '/pricing'
                  }
                >
                  {!isAuthenticated ? 'Fazer login' : 'Ver planos'}
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* ── 3. Análise da IA ── */}
        <div
          className={`relative rounded-xl border bg-background-surface p-6 ${isLocked ? '' : 'border-cyan/30'}`}
        >
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-cyan" />
            <h2 className="font-display text-lg font-bold text-foreground">
              Análise da IA
            </h2>
            {!isLocked && <div className="h-2 w-2 animate-pulse rounded-full bg-cyan" />}
          </div>

          {isLocked ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Lock className="h-8 w-8 text-foreground-muted" />
              <p className="font-body text-sm text-foreground-muted">
                Assine Hunter ou Miner para desbloquear a análise completa.
              </p>
              <Button variant="secondary" size="sm" asChild>
                <Link to="/pricing">Ver planos →</Link>
              </Button>
            </div>
          ) : opp.ai_analysis ? (
            <div className="space-y-4">
              <p className="font-body text-sm leading-relaxed text-foreground">
                {summary || opp.ai_analysis}
              </p>
              {risks.length > 0 && (
                <div>
                  <p className="mb-2 font-body text-xs font-semibold text-foreground-muted">
                    Riscos identificados:
                  </p>
                  <ul className="space-y-1">
                    {risks.map((risk, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 font-body text-xs text-foreground-muted"
                      >
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {recommendation && (
                <div
                  className={`border-current/20 bg-current/5 flex items-center gap-2 rounded-lg border px-4 py-3 ${recInfo.color}`}
                >
                  <RecIcon className="h-4 w-4" />
                  <span className="font-display text-sm font-bold">{recInfo.label}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-cyan" />
              <p className="font-body text-sm text-foreground-muted">
                Análise em processamento...
              </p>
            </div>
          )}
        </div>

        {/* ── 4. Ações ── */}
        <div className="flex flex-wrap gap-3">
          {opp.auction_url && (
            <Button variant="primary" asChild>
              <a href={opp.auction_url} target="_blank" rel="noopener noreferrer">
                Abrir no Site do Leilão <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </Button>
          )}
          {isAuthenticated && (
            <Button
              variant={inWatchlist ? 'secondary' : 'outline'}
              onClick={() => toggleWatchlist(opp.id)}
            >
              <Star
                className={`mr-2 h-4 w-4 ${inWatchlist ? 'fill-cyan text-cyan' : ''}`}
              />
              {inWatchlist ? 'Na Watchlist' : 'Adicionar à Watchlist'}
            </Button>
          )}
          <Button variant="ghost" onClick={copyLink}>
            <Share2 className="mr-2 h-4 w-4" /> Compartilhar
          </Button>
        </div>

        {/* ── 5. Detalhes adicionais ── */}
        {opp.risk_notes && (
          <div className="border-amber/20 bg-amber/5 rounded-xl border p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
              <div>
                <p className="mb-1 font-body text-xs font-semibold text-amber">
                  Notas de risco
                </p>
                <p className="font-body text-sm text-foreground-muted">
                  {opp.risk_notes}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
