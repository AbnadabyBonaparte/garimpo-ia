/**
 * GARIMPO IA™ — Opportunity Card
 *
 * O "coração do produto" (Brandbook §07).
 * Dois estados: Desbloqueado (assinante) e Bloqueado (visitante).
 * Zero cores hardcoded. Tudo via design tokens.
 */

import { motion } from 'framer-motion';
import { Lock, ExternalLink, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  formatBRL,
  formatPercent,
  formatTimeRemaining,
  getCategoryEmoji,
  getCategoryLabel,
} from '@/lib/utils';
import type { Opportunity } from '@/types';

interface OpportunityCardProps {
  opportunity: Opportunity;
  isUnlocked: boolean;
  onViewAnalysis?: (id: string) => void;
  onSubscribe?: () => void;
}

export function OpportunityCard({
  opportunity,
  isUnlocked,
  onViewAnalysis,
  onSubscribe,
}: OpportunityCardProps) {
  const {
    id,
    title,
    category,
    score,
    location,
    state,
    year,
    current_bid,
    market_value,
    profit_potential,
    roi_percentage,
    closes_at,
    risk_level,
    liquidity,
  } = opportunity;

  const scoreVariant =
    score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  const liquidityVariant =
    liquidity === 'high' ? 'high' : liquidity === 'medium' ? 'medium' : 'low';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-md border border-border bg-background-surface p-6 transition-all duration-[var(--duration-normal)] hover:border-amber hover:shadow-glow-amber"
    >
      {/* ── Header ── */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded bg-background-surface-alt px-1.5 py-1 text-base">
            {getCategoryEmoji(category)}
          </span>
          <span className="font-body text-xs uppercase tracking-wider text-foreground-muted">
            {getCategoryLabel(category)}
          </span>
        </div>
        <Badge variant={scoreVariant}>★ {score}</Badge>
      </div>

      {/* ── Title & Meta ── */}
      <h3 className="mb-1 font-display text-lg font-bold text-foreground">
        {title}
      </h3>
      <p className="mb-4 flex items-center gap-2 text-xs text-foreground-muted">
        <span>📍 {location}, {state}</span>
        {year && (
          <>
            <span>•</span>
            <span>{year}</span>
          </>
        )}
      </p>

      {/* ── Data Grid ── */}
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-background-surface-alt p-3">
        <div>
          <span className="block font-body text-[11px] text-foreground-muted">
            Lance Atual
          </span>
          <span className="font-mono-data text-sm font-semibold text-foreground">
            {formatBRL(current_bid)}
          </span>
        </div>
        <div>
          <span className="block font-body text-[11px] text-foreground-muted">
            Valor Mercado
          </span>
          <span className="font-mono-data text-sm font-semibold text-foreground">
            {formatBRL(market_value)}
          </span>
        </div>
        <div className="col-span-2 border-t border-border pt-2">
          <span className="block font-body text-[11px] text-foreground-muted">
            Lucro Potencial Estimado
          </span>
          <span className="font-mono-data text-sm font-bold text-green">
            {formatPercent(roi_percentage)} ({formatBRL(profit_potential)}) ↗
          </span>
        </div>
      </div>

      {/* ── Badges ── */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {liquidity && <Badge variant={liquidityVariant}>{liquidity === 'high' ? 'Alta Liquidez' : liquidity === 'medium' ? 'Liquidez Média' : 'Baixa Liquidez'}</Badge>}
        <Badge variant="ai">Análise IA</Badge>
        {risk_level === 'high' && <Badge variant="low">⚠️ Risco Alto</Badge>}
      </div>

      {/* ── Timer ── */}
      <div className="mb-4 flex items-center gap-1.5 text-xs text-foreground-muted">
        <Clock className="h-3.5 w-3.5" />
        <span>Fecha em {formatTimeRemaining(closes_at)}</span>
      </div>

      {/* ── CTA ── */}
      {isUnlocked ? (
        <Button
          variant="primary"
          className="w-full"
          onClick={() => onViewAnalysis?.(id)}
        >
          Ver Análise Completa
          <ExternalLink className="h-4 w-4" />
        </Button>
      ) : (
        <Button variant="primary" className="w-full" onClick={onSubscribe}>
          <Lock className="h-4 w-4" />
          Desbloquear — Assinar
        </Button>
      )}

      {/* ── Locked Overlay (visitors) ── */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-md bg-background-deep/85 backdrop-blur-sm">
          <Lock className="h-8 w-8 text-amber" />
          <span className="font-display text-base font-semibold text-amber">
            Oportunidade Detectada
          </span>
          <span className="text-center text-xs text-foreground-muted">
            Score {score} · Análise bloqueada
          </span>
          <Button variant="primary" size="sm" onClick={onSubscribe}>
            Assinar — R$ 97/mês
          </Button>
        </div>
      )}
    </motion.div>
  );
}
