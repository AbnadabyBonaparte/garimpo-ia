/**
 * GARIMPO IA™ — Analytics Page (Server-side RPC version)
 *
 * KPIs + charts. Toda agregação via Supabase RPC (nunca client-side).
 * LEI 5: Loading/Error/Empty states.
 */

import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { RefreshCw, TrendingUp, Target, Zap, Clock } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatBRL, formatPercent, getCategoryLabel } from '@/lib/utils';

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = 'amber',
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent?: 'amber' | 'cyan' | 'green';
}) {
  const accentClass = { amber: 'text-amber', cyan: 'text-cyan', green: 'text-green' }[
    accent
  ];
  return (
    <div className="rounded-xl border border-border bg-background-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-body text-xs text-foreground-muted">{label}</p>
        <Icon className={`h-4 w-4 ${accentClass}`} />
      </div>
      <p className={`font-mono-data text-2xl font-bold ${accentClass}`}>{value}</p>
      {sub && <p className="mt-1 font-body text-xs text-foreground-muted">{sub}</p>}
    </div>
  );
}

const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-background-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  color: 'var(--color-foreground)',
  fontSize: '12px',
  fontFamily: 'var(--font-mono-data)',
};

export function AnalyticsPage() {
  const { data, loading, error, refetch } = useAnalytics();
  const { summary, categories, states, history } = data;

  if (loading)
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );

  if (error)
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="mb-4 font-body text-red">{error}</p>
        <Button variant="outline" onClick={refetch}>
          <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
        </Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
              <TrendingUp className="h-6 w-6 text-cyan" /> Analytics
            </h1>
            <p className="mt-1 font-body text-sm text-foreground-muted">
              Agregações server-side em tempo real
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={refetch} title="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* KPI Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            label="Total de Oportunidades"
            value={String(summary.total_opportunities)}
            icon={Target}
            accent="amber"
          />
          <KpiCard
            label="Score Médio da IA"
            value={String(summary.avg_score)}
            sub="Em uma escala 0-100"
            icon={Zap}
            accent="cyan"
          />
          <KpiCard
            label="ROI Médio Identificado"
            value={formatPercent(summary.avg_roi)}
            icon={TrendingUp}
            accent="green"
          />
          <KpiCard
            label="Lucro Potencial Total"
            value={formatBRL(summary.total_potential_profit)}
            icon={TrendingUp}
            accent="green"
          />
          <KpiCard
            label="Oportunidades Ativas"
            value={String(summary.active_count)}
            sub="Abertas agora"
            icon={Clock}
            accent="amber"
          />
          <KpiCard
            label="Score Alto (≥ 70)"
            value={String(summary.high_score_count)}
            sub={
              summary.total_opportunities > 0
                ? `${((summary.high_score_count / summary.total_opportunities) * 100).toFixed(0)}% do total`
                : ''
            }
            icon={Zap}
            accent="cyan"
          />
        </div>

        {/* Score badges summary */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="high">Alta qualidade: {summary.high_score_count}</Badge>
          <Badge variant="medium">
            Média: {summary.total_opportunities - summary.high_score_count}
          </Badge>
          <Badge variant="ai">ROI médio: {formatPercent(summary.avg_roi)}</Badge>
        </div>

        {/* ── Gráfico: Distribuição por categoria ── */}
        {categories.length > 0 && (
          <div className="rounded-xl border border-border bg-background-surface p-6">
            <h2 className="mb-6 font-display text-lg font-bold text-foreground">
              Por Categoria
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={categories.map((c) => ({
                  ...c,
                  name: getCategoryLabel(c.category),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--color-foreground-muted)', fontSize: 11 }}
                />
                <YAxis tick={{ fill: 'var(--color-foreground-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar
                  dataKey="count"
                  fill="var(--color-amber)"
                  radius={[4, 4, 0, 0]}
                  name="Qtd"
                />
                <Bar
                  dataKey="avg_score"
                  fill="var(--color-cyan)"
                  radius={[4, 4, 0, 0]}
                  name="Score"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Gráfico: Top 15 estados ── */}
        {states.length > 0 && (
          <div className="rounded-xl border border-border bg-background-surface p-6">
            <h2 className="mb-6 font-display text-lg font-bold text-foreground">
              Top 15 Estados
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={states} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: 'var(--color-foreground-muted)', fontSize: 11 }}
                />
                <YAxis
                  dataKey="state"
                  type="category"
                  width={30}
                  tick={{ fill: 'var(--color-foreground-muted)', fontSize: 11 }}
                />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar
                  dataKey="count"
                  fill="var(--color-green)"
                  radius={[0, 4, 4, 0]}
                  name="Qtd"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Gráfico: Evolução do score ── */}
        {history.length > 0 && (
          <div className="rounded-xl border border-border bg-background-surface p-6">
            <h2 className="mb-6 font-display text-lg font-bold text-foreground">
              Score Médio — Últimos 30 Dias
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'var(--color-foreground-muted)', fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: 'var(--color-foreground-muted)', fontSize: 11 }}
                />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Line
                  type="monotone"
                  dataKey="avg_score"
                  stroke="var(--color-cyan)"
                  strokeWidth={2}
                  dot={false}
                  name="Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Empty: sem dados */}
        {categories.length === 0 &&
          states.length === 0 &&
          summary.total_opportunities === 0 && (
            <div className="rounded-xl border border-border bg-background-surface py-20 text-center">
              <TrendingUp className="mx-auto mb-3 h-12 w-12 text-foreground-muted" />
              <p className="font-display text-lg font-bold text-foreground">
                Sem dados ainda
              </p>
              <p className="mt-2 font-body text-sm text-foreground-muted">
                Os gráficos aparecerão quando houver oportunidades no banco.
              </p>
            </div>
          )}
      </motion.div>
    </div>
  );
}
