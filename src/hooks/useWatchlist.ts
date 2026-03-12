/**
 * GARIMPO IA™ — useWatchlist Hook (Phase 3)
 *
 * Add/remove opportunity from watchlist; list saved opportunities.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useApp } from '@/contexts/AppContext';
import type { WatchlistItem } from '@/types';

export function useWatchlist() {
  const { session } = useApp();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;

  const fetchWatchlist = useCallback(async () => {
    if (!supabase || !userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('watchlist')
      .select('id, user_id, opportunity_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) setItems([]);
    else setItems((data as WatchlistItem[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = useCallback(
    async (opportunityId: string) => {
      if (!supabase || !userId) return false;
      const { error } = await supabase.from('watchlist').insert({ user_id: userId, opportunity_id: opportunityId });
      if (error) return false;
      await fetchWatchlist();
      return true;
    },
    [userId, fetchWatchlist],
  );

  const removeFromWatchlist = useCallback(
    async (opportunityId: string) => {
      if (!supabase || !userId) return false;
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('opportunity_id', opportunityId);
      if (error) return false;
      await fetchWatchlist();
      return true;
    },
    [userId, fetchWatchlist],
  );

  const isOnWatchlist = useCallback(
    (opportunityId: string) => items.some((w) => w.opportunity_id === opportunityId),
    [items],
  );

  return {
    items,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    isOnWatchlist,
    refetch: fetchWatchlist,
  };
}
