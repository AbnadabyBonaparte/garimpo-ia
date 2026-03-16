/**
 * GARIMPO IA™ — Watchlist Page
 *
 * Grid de oportunidades favoritadas. Mesmo layout do FeedPage.
 * LEI 5: Loading, Error, Empty completos.
 */

import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, RefreshCw } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useWatchlist } from '@/hooks/useWatchlist';
import { OpportunityCard } from '@/components/cards/OpportunityCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { canAccessAI } from '@/lib/permissions';

export function WatchlistPage() {
  const { isAuthenticated, isLoading: appLoading, profile } = useApp();
  const { items, isLoading, error, refetch, removeFromWatchlist } = useWatchlist();

  if (appLoading)
    return (
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>
    );

  if (!isAuthenticated) return <Navigate to="/login?returnTo=/watchlist" replace />;

  const tier = profile?.subscription_tier ?? 'free';
  const hasAI = canAccessAI(tier);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-20">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
              <Star className="h-6 w-6 text-amber" /> Minha Watchlist
            </h1>
            <p className="mt-1 font-body text-sm text-foreground-muted">
              {items.length > 0
                ? `${items.length} oportunidade${items.length !== 1 ? 's' : ''} salva${items.length !== 1 ? 's' : ''}`
                : 'Oportunidades que você marcou para acompanhar'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={refetch} title="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="border-red/20 flex flex-col items-center gap-4 rounded-xl border bg-background-surface py-16 text-center">
            <p className="font-body text-red">{error}</p>
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
            </Button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && items.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-background-surface py-20 text-center">
            <Star className="h-12 w-12 text-foreground-muted" />
            <div>
              <p className="font-display text-lg font-bold text-foreground">
                Watchlist vazia
              </p>
              <p className="mt-1 font-body text-sm text-foreground-muted">
                Marque oportunidades com ★ no feed para acompanhar aqui.
              </p>
            </div>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && items.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((opp, i) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="group relative">
                  <OpportunityCard opportunity={opp} isUnlocked={hasAI} />
                  <button
                    onClick={() => removeFromWatchlist(opp.id)}
                    className="absolute right-3 top-3 rounded-full border border-border bg-background-surface p-1.5 opacity-0 transition-opacity hover:border-red hover:text-red group-hover:opacity-100"
                    title="Remover da watchlist"
                  >
                    <Star className="h-3.5 w-3.5 fill-amber text-amber" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
