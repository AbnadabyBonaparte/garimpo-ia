/**
 * GARIMPO IA™ — useWatchlist Hook
 * Gerencia watchlist do usuário autenticado.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useApp } from '@/contexts/AppContext';
import type { Opportunity } from '@/types';

export function useWatchlist() {
  const { session } = useApp();
  const userId = session?.user?.id;

  const [items, setItems] = useState<Opportunity[]>([]);
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlist = useCallback(async () => {
    if (!supabase || !userId) {
      setItems([]);
      setIds(new Set());
      return;
    }
    setIsLoading(true);
    try {
      const { data, error: e } = await supabase
        .from('watchlist')
        .select('opportunity_id, opportunities(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (e) throw e;
      const opps = (data ?? [])
        .map(
          (r: { opportunity_id: string; opportunities: unknown }) =>
            r.opportunities as Opportunity,
        )
        .filter(Boolean);
      setItems(opps);
      setIds(new Set(opps.map((o) => o.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar watchlist.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const addToWatchlist = useCallback(
    async (opportunityId: string) => {
      if (!supabase || !userId) return;
      await supabase
        .from('watchlist')
        .upsert({ user_id: userId, opportunity_id: opportunityId });
      setIds((prev) => new Set([...prev, opportunityId]));
      void fetchWatchlist();
    },
    [userId, fetchWatchlist],
  );

  const removeFromWatchlist = useCallback(
    async (opportunityId: string) => {
      if (!supabase || !userId) return;
      await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('opportunity_id', opportunityId);
      setIds((prev) => {
        const s = new Set(prev);
        s.delete(opportunityId);
        return s;
      });
      setItems((prev) => prev.filter((o) => o.id !== opportunityId));
    },
    [userId],
  );

  const toggleWatchlist = useCallback(
    async (opportunityId: string) => {
      if (ids.has(opportunityId)) {
        await removeFromWatchlist(opportunityId);
      } else {
        await addToWatchlist(opportunityId);
      }
    },
    [ids, addToWatchlist, removeFromWatchlist],
  );

  const isInWatchlist = useCallback(
    (opportunityId: string) => ids.has(opportunityId),
    [ids],
  );

  useEffect(() => {
    void fetchWatchlist();
  }, [fetchWatchlist]);

  return {
    items,
    isLoading,
    error,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    refetch: fetchWatchlist,
  };
}
