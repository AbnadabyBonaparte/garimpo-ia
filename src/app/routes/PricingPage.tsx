/**
 * GARIMPO IA™ — Pricing Page (Redesign Supremo)
 *
 * 4 planos com PricingCard component. Hunter destacado.
 * Integração com Stripe Checkout via Edge Function.
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { PricingCard } from '@/components/cards/PricingCard';
import { redirectToCheckout, isCheckoutConfigured } from '@/services/stripeCheckout';
import type { SubscriptionTier } from '@/types';

const PLANS = [
  {
    id: 'free' as SubscriptionTier,
    name: 'Free',
    price: 'R$ 0',
    period: '/sempre',
    description: 'Explore sem compromisso',
    features: [
      { label: 'Ver feed de oportunidades', included: true },
      { label: 'Score visível em todos os cards', included: true },
      { label: 'Análise IA desbloqueada', included: false },
      { label: 'Link do leilão', included: false },
      { label: 'Alertas automáticos', included: false },
      { label: 'Acesso a todas as categorias', included: false },
    ],
    cta: 'Começar grátis',
    highlighted: false,
  },
  {
    id: 'explorer' as SubscriptionTier,
    name: 'Explorer',
    price: 'R$ 47',
    period: '/mês',
    description: 'Um vertical completo',
    features: [
      { label: 'Feed completo de oportunidades', included: true },
      { label: 'Análise IA (categoria Veículos)', included: true },
      { label: 'Link do leilão', included: true },
      { label: 'Alertas in-app (3 regras)', included: true },
      { label: 'Todas as categorias', included: false },
      { label: 'Alertas por email', included: false },
    ],
    cta: 'Assinar Explorer',
    highlighted: false,
  },
  {
    id: 'hunter' as SubscriptionTier,
    name: 'Hunter',
    price: 'R$ 97',
    period: '/mês',
    description: 'O arsenal completo do caçador',
    features: [
      { label: 'Todas as categorias desbloqueadas', included: true },
      { label: 'Análise IA completa', included: true },
      { label: 'Link do leilão', included: true },
      { label: 'Alertas in-app + email (10 regras)', included: true },
      { label: 'Suporte prioritário', included: true },
      { label: 'Acesso à API', included: false },
    ],
    cta: 'Assinar Hunter',
    highlighted: true,
  },
  {
    id: 'miner' as SubscriptionTier,
    name: 'Miner',
    price: 'R$ 197',
    period: '/mês',
    description: 'Poder máximo para mineradores sérios',
    features: [
      { label: 'Tudo do Hunter', included: true },
      { label: 'Alertas em todos os canais', included: true },
      { label: '50 regras de alerta', included: true },
      { label: 'Alertas prioritários (tempo real)', included: true },
      { label: 'Acesso à API + relatórios', included: true },
      { label: 'Gerente de conta dedicado', included: true },
    ],
    cta: 'Assinar Miner',
    highlighted: false,
  },
];

export function PricingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile, refetchProfile, isAuthenticated } = useApp();
  const { addToast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionTier | null>(null);

  const checkoutConfigured = isCheckoutConfigured();
  const currentTier = profile?.subscription_tier ?? 'free';

  useEffect(() => {
    const success = searchParams.get('success');
    const cancel = searchParams.get('cancel');
    if (success === '1') {
      addToast({ type: 'success', title: '🎉 Assinatura realizada com sucesso!', description: 'Seu acesso foi desbloqueado.' });
      void refetchProfile();
      setSearchParams({}, { replace: true });
    } else if (cancel === '1') {
      addToast({ type: 'info', title: 'Checkout cancelado.', description: 'Você pode assinar a qualquer momento.' });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, refetchProfile, addToast]);

  async function handleSubscribe(planId: SubscriptionTier) {
    if (planId === 'free') return;
    if (!isAuthenticated) {
      addToast({ type: 'info', title: 'Faça login primeiro', description: 'Crie sua conta gratuitamente para assinar.' });
      return;
    }
    if (!checkoutConfigured) {
      addToast({ type: 'info', title: 'Pagamento em configuração', description: 'Em breve disponível. Entre em contato.' });
      return;
    }
    setLoadingPlan(planId);
    try {
      await redirectToCheckout(planId);
    } catch (err) {
      addToast({ type: 'error', title: err instanceof Error ? err.message : 'Erro ao abrir checkout.' });
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-14 text-center"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/5 px-4 py-1.5">
          <Zap className="h-3.5 w-3.5 text-amber" />
          <span className="font-body text-xs font-medium text-amber">IA Analisa 24/7</span>
        </div>
        <h1 className="font-display text-4xl font-black text-foreground lg:text-5xl">
          Escolha seu nível de{' '}
          <span className="text-amber">garimpo</span>
        </h1>
        <p className="mt-4 font-body text-lg text-foreground-muted">
          Do Free ao Miner — cada plano desbloqueia mais oportunidades e análises.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan, i) => (
          <PricingCard
            key={plan.id}
            {...plan}
            isCurrent={currentTier === plan.id}
            isLoading={loadingPlan === plan.id}
            onSubscribe={handleSubscribe}
            index={i}
          />
        ))}
      </div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 flex flex-wrap items-center justify-center gap-6 text-foreground-muted"
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green" />
          <span className="font-body text-sm">Pagamento seguro via Stripe</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm">Cancele a qualquer momento</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm">Sem fidelidade</span>
        </div>
      </motion.div>

      <p className="mt-8 text-center">
        <Link to="/" className="font-body text-sm text-foreground-muted hover:text-amber">
          ← Voltar ao feed
        </Link>
      </p>
    </div>
  );
}
