/**
 * GARIMPO IA™ — useAnalytics Hook (RPC-based)
 *
 * FIX: Substitui client-side aggregation (2000 rows) por 4 RPCs server-side.
 * Escala para qualquer volume sem degradar o cliente.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type {
  AnalyticsSummary,
  CategoryDistributionItem,
  StateDistributionItem,
  ScoreHistoryItem,
  Opportunity,
} from '@/types';

export interface AnalyticsData {
  summary: AnalyticsSummary;
  categories: CategoryDistributionItem[];
  states: StateDistributionItem[];
  history: ScoreHistoryItem[];
  recent: Pick<Opportunity, 'id' | 'title' | 'score' | 'current_bid' | 'closes_at'>[];
}

const EMPTY_SUMMARY: AnalyticsSummary = {
  total_opportunities: 0,
  avg_score: 0,
  avg_roi: 0,
  total_potential_profit: 0,
  active_count: 0,
  high_score_count: 0,
};

const empty: AnalyticsData = {
  summary: EMPTY_SUMMARY,
  categories: [],
  states: [],
  history: [],
  recent: [],
};

const RECENT_LIMIT = 10;

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!supabase) {
      setData(empty);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Todas as chamadas em paralelo — 4 RPCs server-side + 1 query paginada
      const [summaryRes, categoriesRes, statesRes, historyRes, recentRes] = await Promise.all([
        supabase.rpc('get_analytics_summary'),
        supabase.rpc('get_category_distribution'),
        supabase.rpc('get_state_distribution'),
        supabase.rpc('get_score_history'),
        supabase
          .from('opportunities')
          .select('id, title, score, current_bid, closes_at')
          .order('created_at', { ascending: false })
          .limit(RECENT_LIMIT),
      ]);

      if (summaryRes.error) throw summaryRes.error;

      setData({
        summary: (summaryRes.data as AnalyticsSummary) ?? EMPTY_SUMMARY,
        categories: (categoriesRes.data as CategoryDistributionItem[]) ?? [],
        states: (statesRes.data as StateDistributionItem[]) ?? [],
        history: (historyRes.data as ScoreHistoryItem[]) ?? [],
        recent: (recentRes.data ?? []) as AnalyticsData['recent'],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  return { data, loading, error, refetch: fetchAnalytics };
}
