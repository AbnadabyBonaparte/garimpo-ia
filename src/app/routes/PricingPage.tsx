/**
 * GARIMPO IA™ — Pricing Page
 *
 * Plan list (Free, Explorer, Hunter, Miner). CTA → Stripe Checkout when configured.
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { redirectToCheckout, isCheckoutConfigured } from '@/services/stripeCheckout';
import type { SubscriptionTier } from '@/types';

const PLANS: {
  id: SubscriptionTier;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}[] = [
  {
    id: 'free',
    name: 'Free',
    price: 'R$ 0',
    period: '/sempre',
    description: 'Conheça o produto',
    features: ['Ver oportunidades com dados limitados', 'Score visível', 'Análise bloqueada'],
    cta: 'Atual',
    highlighted: false,
  },
  {
    id: 'explorer',
    name: 'Explorer',
    price: 'R$ 47',
    period: '/mês',
    description: 'Acesso completo a uma vertical',
    features: ['Uma categoria (ex: Veículos)', 'Análise IA desbloqueada', 'Link do leilão'],
    cta: 'Assinar',
    highlighted: false,
  },
  {
    id: 'hunter',
    name: 'Hunter',
    price: 'R$ 97',
    period: '/mês',
    description: 'Alertas + análise completa',
    features: ['Todas as categorias', 'Alertas por email/push', 'Análise IA completa', 'Suporte prioritário'],
    cta: 'Assinar',
    highlighted: true,
  },
  {
    id: 'miner',
    name: 'Miner',
    price: 'R$ 197',
    period: '/mês',
    description: 'Múltiplas verticais e máximo poder',
    features: ['Tudo do Hunter', 'Múltiplas verticais', 'API e relatórios', 'Gerente de conta'],
    cta: 'Assinar',
    highlighted: false,
  },
];

export function PricingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile, refetchProfile } = useApp();
  const { addToast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionTier | null>(null);

  const checkoutConfigured = isCheckoutConfigured();
  const currentTier = profile?.subscription_tier ?? 'free';

  useEffect(() => {
    const success = searchParams.get('success');
    const cancel = searchParams.get('cancel');
    if (success === '1') {
      addToast({ type: 'success', title: 'Assinatura realizada!' });
      void refetchProfile();
      setSearchParams({}, { replace: true });
    } else if (cancel === '1') {
      addToast({ type: 'info', title: 'Checkout cancelado.' });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, refetchProfile]);

  async function handleSubscribe(planId: SubscriptionTier) {
    if (planId === 'free') return;
    if (!checkoutConfigured) {
      addToast({
        type: 'info',
        title: 'Checkout em configuração',
        description: 'Em breve você poderá assinar por aqui.',
      });
      return;
    }

    setLoadingPlan(planId);
    try {
      await redirectToCheckout(planId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao abrir checkout.';
      addToast({ type: 'error', title: message });
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Planos
        </h1>
        <p className="mt-2 font-body text-foreground-muted">
          Escolha o plano ideal e desbloqueie análises de IA em leilões.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrent = currentTier === plan.id;

          return (
            <div
              key={plan.id}
              className={`flex flex-col rounded-lg border bg-background-surface p-6 ${
                plan.highlighted ? 'border-amber shadow-glow-amber' : 'border-border'
              }`}
            >
              <div className="mb-4 flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold text-foreground">
                  {plan.name}
                </span>
                {plan.highlighted && (
                  <span className="rounded bg-amber/20 px-2 py-0.5 font-body text-xs font-medium text-amber">
                    Recomendado
                  </span>
                )}
              </div>
              <p className="mb-4 font-body text-sm text-foreground-muted">
                {plan.description}
              </p>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="font-mono-data text-3xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="font-body text-sm text-foreground-muted">{plan.period}</span>
              </div>

              <ul className="mb-6 flex-1 space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 font-body text-sm text-foreground-muted">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.id === 'free' ? (
                <Button variant="outline" className="w-full" disabled>
                  {isCurrent ? 'Seu plano' : 'Grátis'}
                </Button>
              ) : (
                <Button
                  variant={plan.highlighted ? 'primary' : 'outline'}
                  className="w-full"
                  disabled={isCurrent || loadingPlan !== null}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isCurrent ? (
                    'Seu plano'
                  ) : (
                    plan.cta
                  )}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center">
        <Link to="/" className="font-body text-sm text-foreground-muted hover:text-foreground">
          ← Voltar ao feed
        </Link>
      </p>
    </div>
  );
}
