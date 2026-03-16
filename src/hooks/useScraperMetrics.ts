/**
 * GARIMPO IA™ — Scraper & AI Metrics for Dashboard (Phase 4)
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getScraperMetrics } from '@/services/scraperMonitoring';

export interface ScraperMetricsData {
  totalRuns: number;
  successCount: number;
  totalInserted: number;
  totalDuplicatesSkipped: number;
  totalInvalidSkipped: number;
  successRate: number;
  bySource: { source_id: string; source_name: string; runs: number; inserted: number }[];
  aiAnalysisCount: number;
}

const empty: ScraperMetricsData = {
  totalRuns: 0,
  successCount: 0,
  totalInserted: 0,
  totalDuplicatesSkipped: 0,
  totalInvalidSkipped: 0,
  successRate: 0,
  bySource: [],
  aiAnalysisCount: 0,
};

export function useScraperMetrics() {
  const [data, setData] = useState<ScraperMetricsData>(empty);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    if (!supabase) {
      setData(empty);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [scraper, { count: aiCount }] = await Promise.all([
        getScraperMetrics(),
        supabase.from('opportunities').select('id', { count: 'exact', head: true }).not('ai_analysis', 'is', null),
      ]);
      setData({
        ...scraper,
        successRate: scraper.totalRuns > 0 ? (scraper.successCount / scraper.totalRuns) * 100 : 0,
        aiAnalysisCount: aiCount ?? 0,
      });
    } catch {
      setData(empty);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMetrics();
  }, [fetchMetrics]);

  return { data, loading, refetch: fetchMetrics };
}
