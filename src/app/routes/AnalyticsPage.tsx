/**
 * GARIMPO IA™ — Analytics Dashboard (Phase 3)
 *
 * Total opportunities, average score, top categories, by state, recent opportunities.
 */

import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Skeleton } from '@/components/ui/Skeleton';
import { getCategoryLabel, formatBRL } from '@/lib/utils';

const CHART_COLORS = ['var(--color-cyan)', 'var(--color-amber)', 'var(--color-green)', 'var(--color-alsham)'];

export function AnalyticsPage() {
  const { data, loading, error } = useAnalytics();

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <p className="font-body text-foreground-muted">{error}</p>
      </div>
    );
  }

  const { total, avgScore, byCategory, byState, recent } = data;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Analytics
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-background-surface p-4">
          <p className="font-body text-sm text-foreground-muted">Total de oportunidades</p>
          <p className="font-display text-2xl font-bold text-foreground">{total}</p>
        </div>
        <div className="rounded-lg border border-border bg-background-surface p-4">
          <p className="font-body text-sm text-foreground-muted">Score médio</p>
          <p className="font-display text-2xl font-bold text-cyan">{avgScore.toFixed(1)}</p>
        </div>
        <div className="rounded-lg border border-border bg-background-surface p-4">
          <p className="font-body text-sm text-foreground-muted">Categorias</p>
          <p className="font-display text-2xl font-bold text-foreground">{byCategory.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-background-surface p-4">
          <p className="font-body text-sm text-foreground-muted">Estados</p>
          <p className="font-display text-2xl font-bold text-foreground">{byState.length}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-background-surface p-4">
          <h2 className="font-body text-sm font-medium text-foreground-muted mb-4">
            Oportunidades por categoria
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory.map((c) => ({ name: getCategoryLabel(c.category as never), count: c.count }))} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-surface-alt)', border: '1px solid var(--color-border)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background-surface p-4">
          <h2 className="font-body text-sm font-medium text-foreground-muted mb-4">
            Oportunidades por estado
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byState.map((s) => ({ name: s.state, count: s.count }))} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-surface-alt)', border: '1px solid var(--color-border)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {byState.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background-surface p-4">
        <h2 className="font-body text-sm font-medium text-foreground-muted mb-4">
          Oportunidades recentes
        </h2>
        <ul className="space-y-2">
          {recent.map((opp) => (
            <li key={opp.id}>
              <Link
                to={`/opportunity/${opp.id}`}
                className="flex items-center justify-between rounded border border-border p-3 transition-colors hover:bg-background-surface-alt"
              >
                <span className="font-body text-foreground">{opp.title}</span>
                <span className="font-mono text-sm text-cyan">{opp.score}</span>
                <span className="font-mono text-sm text-foreground-muted">{formatBRL(opp.current_bid)}</span>
              </Link>
            </li>
          ))}
        </ul>
        {recent.length === 0 && (
          <p className="font-body text-foreground-muted">Nenhuma oportunidade recente.</p>
        )}
      </div>
    </div>
  );
}
