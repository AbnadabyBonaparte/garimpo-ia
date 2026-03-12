/**
 * GARIMPO IA™ — useAnalytics Hook (Phase 3)
 *
 * Aggregates for dashboard: total opportunities, avg score, by category, by state, recent.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Opportunity } from '@/types';

const SAMPLE_SIZE = 2000;
const RECENT_LIMIT = 10;

export interface AnalyticsData {
  total: number;
  avgScore: number;
  byCategory: { category: string; count: number }[];
  byState: { state: string; count: number }[];
  recent: Opportunity[];
}

const empty: AnalyticsData = {
  total: 0,
  avgScore: 0,
  byCategory: [],
  byState: [],
  recent: [],
};

function aggregate(rows: { score: number; category: string; state: string }[]): Omit<AnalyticsData, 'recent'> {
  const total = rows.length;
  const avgScore = total ? rows.reduce((s, r) => s + r.score, 0) / total : 0;
  const categoryMap = new Map<string, number>();
  const stateMap = new Map<string, number>();
  for (const r of rows) {
    categoryMap.set(r.category, (categoryMap.get(r.category) ?? 0) + 1);
    stateMap.set(r.state, (stateMap.get(r.state) ?? 0) + 1);
  }
  const byCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
  const byState = Array.from(stateMap.entries()).map(([state, count]) => ({ state, count })).sort((a, b) => b.count - a.count);
  return { total, avgScore, byCategory, byState };
}

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
      const [{ count: total }, { data: rows }] = await Promise.all([
        supabase.from('opportunities').select('*', { count: 'exact', head: true }),
        supabase.from('opportunities').select('id, title, score, category, state, current_bid, market_value, closes_at, created_at').order('created_at', { ascending: false }).limit(SAMPLE_SIZE),
      ]);

      const list = (rows ?? []) as { score: number; category: string; state: string }[] & Opportunity[];
      const agg = aggregate(list);
      const recent = (rows ?? []).slice(0, RECENT_LIMIT) as Opportunity[];
      setData({
        ...agg,
        total: total ?? list.length,
        recent,
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
