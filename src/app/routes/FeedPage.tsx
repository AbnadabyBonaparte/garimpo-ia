/**
 * GARIMPO IA™ — Feed Page (Oportunidades)
 *
 * LEI 5 ALSHAM: 3 estados obrigatórios:
 *   ✅ Loading (Skeleton cards)
 *   ✅ Error (com retry)
 *   ✅ Empty (com ação)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpportunities } from '@/hooks/useOpportunities';
import { useApp } from '@/contexts/AppContext';
import { OpportunityCard } from '@/components/cards/OpportunityCard';
import { OpportunityCardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState, EmptyState } from '@/components/ui/StateDisplay';
import { canAccessCategory } from '@/lib/permissions';
import type { OpportunityCategory } from '@/types';

const CATEGORIES: { value: OpportunityCategory; label: string }[] = [
  { value: 'vehicle', label: 'Veículos' },
  { value: 'property', label: 'Imóveis' },
  { value: 'agriculture', label: 'Agro' },
  { value: 'machinery', label: 'Maquinário' },
];

export function FeedPage() {
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useApp();
  const [selectedCategories, setSelectedCategories] = useState<OpportunityCategory[]>([]);

  const {
    data: opportunities,
    isLoading,
    isError,
    isEmpty,
    error,
    refetch,
  } = useOpportunities({ categories: selectedCategories });

  function toggleCategory(cat: OpportunityCategory) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Oportunidades{' '}
          {opportunities && <span className="text-amber">↑{opportunities.total}</span>}
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Monitoramento 24/7 em 50+ fontes de leilão
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => toggleCategory(cat.value)}
            className={`rounded-full border px-3 py-1.5 font-body text-xs font-medium transition-all duration-[var(--duration-normal)] ${
              selectedCategories.includes(cat.value)
                ? 'bg-amber/10 border-amber text-amber'
                : 'border-border bg-transparent text-foreground-muted hover:border-foreground-muted'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── STATE: Loading ── */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <OpportunityCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ── STATE: Error ── */}
      {isError && (
        <ErrorState
          message={error ?? 'Falha ao carregar oportunidades.'}
          onRetry={() => refetch(1)}
        />
      )}

      {/* ── STATE: Empty ── */}
      {isEmpty && (
        <EmptyState
          title="Nenhuma oportunidade encontrada"
          description="Tente ajustar seus filtros. O robô está minerando 24/7 — volte em breve."
          action={{
            label: 'Limpar filtros',
            onClick: () => setSelectedCategories([]),
          }}
        />
      )}

      {/* ── STATE: Success ── */}
      {opportunities && opportunities.data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.data.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              isUnlocked={
                isAuthenticated &&
                !!profile &&
                canAccessCategory(profile.subscription_tier, opp.category)
              }
              onViewAnalysis={(oppId) => navigate(`/opportunity/${oppId}`)}
              onSubscribe={() => navigate('/pricing')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
