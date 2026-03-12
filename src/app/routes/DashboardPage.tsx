/**
 * GARIMPO IA™ — User Dashboard (Phase 3)
 *
 * Subscription, alert rules, recent alerts, recommended opportunities.
 */

import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAlertRules } from '@/hooks/useAlertRules';
import { useAlerts } from '@/hooks/useAlerts';
import { useOpportunities } from '@/hooks/useOpportunities';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatBRL } from '@/lib/utils';

const RECOMMENDED_MIN_SCORE = 70;
const RECOMMENDED_LIMIT = 5;

export function DashboardPage() {
  const { profile, isAuthenticated } = useApp();
  const { rules, isLoading: rulesLoading } = useAlertRules();
  const { alerts, loading: alertsLoading } = useAlerts();
  const { data: oppData, status: oppStatus } = useOpportunities({ min_score: RECOMMENDED_MIN_SCORE });

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="font-body text-foreground-muted">Faça login para acessar seu painel.</p>
        <Button variant="primary" className="mt-4" asChild>
          <Link to="/login">Entrar</Link>
        </Button>
      </div>
    );
  }

  const tier = profile?.subscription_tier ?? 'free';
  const recommended = oppData?.data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-foreground">Meu painel</h1>

      <section className="rounded-lg border border-border bg-background-surface p-4">
        <h2 className="font-body text-sm font-medium text-foreground-muted mb-2">Assinatura</h2>
        <p className="font-display text-lg font-bold text-foreground capitalize">{tier}</p>
        {tier === 'free' && (
          <Button variant="primary" size="sm" className="mt-2" asChild>
            <Link to="/pricing">Ver planos</Link>
          </Button>
        )}
      </section>

      <section className="rounded-lg border border-border bg-background-surface p-4">
        <h2 className="font-body text-sm font-medium text-foreground-muted mb-2">Regras de alerta</h2>
        {rulesLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <>
            <p className="font-body text-foreground">{rules.length} regra(s) ativa(s).</p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link to="/alerts">Configurar alertas</Link>
            </Button>
          </>
        )}
      </section>

      <section className="rounded-lg border border-border bg-background-surface p-4">
        <h2 className="font-body text-sm font-medium text-foreground-muted mb-2">Alertas recentes</h2>
        {alertsLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <>
            <p className="font-body text-foreground">{alerts.length} alerta(s) recente(s).</p>
            <ul className="mt-2 space-y-1">
              {alerts.slice(0, 3).map((a) => (
                <li key={a.id}>
                  <Link to={`/opportunity/${a.opportunity_id}`} className="font-body text-sm text-cyan hover:underline">
                    Ver oportunidade
                  </Link>
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link to="/alerts">Ver todos</Link>
            </Button>
          </>
        )}
      </section>

      <section className="rounded-lg border border-border bg-background-surface p-4">
        <h2 className="font-body text-sm font-medium text-foreground-muted mb-2">Oportunidades recomendadas (score ≥ {RECOMMENDED_MIN_SCORE})</h2>
        {oppStatus === 'loading' ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <ul className="space-y-2">
            {recommended.slice(0, RECOMMENDED_LIMIT).map((opp) => (
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
            {recommended.length === 0 && (
              <p className="font-body text-foreground-muted">Nenhuma oportunidade com score alto no momento.</p>
            )}
          </ul>
        )}
        <Button variant="outline" size="sm" className="mt-2" asChild>
          <Link to="/">Ver feed completo</Link>
        </Button>
      </section>
    </div>
  );
}
