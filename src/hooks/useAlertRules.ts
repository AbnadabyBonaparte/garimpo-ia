/**
 * GARIMPO IA™ — useAlertRules Hook
 * CRUD de regras de alerta do usuário.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useApp } from '@/contexts/AppContext';
import type { AlertRule, OpportunityCategory, AlertChannel } from '@/types';

export interface CreateAlertRuleInput {
  categories?: OpportunityCategory[];
  states?: string[];
  min_score?: number;
  min_roi?: number;
  channels?: AlertChannel[];
}

export function useAlertRules() {
  const { session } = useApp();
  const userId = session?.user?.id;

  const [rules, setRules] = useState<AlertRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    if (!supabase || !userId) {
      setRules([]);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error: e } = await supabase
        .from('alert_rules')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (e) throw e;
      setRules((data ?? []) as AlertRule[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar regras.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const createRule = useCallback(
    async (input: CreateAlertRuleInput): Promise<boolean> => {
      if (!supabase || !userId) return false;
      const { error: e } = await supabase.from('alert_rules').insert({
        user_id: userId,
        categories: input.categories ?? [],
        states: input.states ?? [],
        min_score: input.min_score ?? 0,
        min_roi: input.min_roi ?? 0,
        channels: input.channels ?? ['in_app'],
        is_active: true,
      });
      if (e) {
        setError(e.message);
        return false;
      }
      await fetchRules();
      return true;
    },
    [userId, fetchRules],
  );

  const deleteRule = useCallback(
    async (ruleId: string): Promise<boolean> => {
      if (!supabase || !userId) return false;
      const { error: e } = await supabase
        .from('alert_rules')
        .delete()
        .eq('id', ruleId)
        .eq('user_id', userId);
      if (e) {
        setError(e.message);
        return false;
      }
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      return true;
    },
    [userId],
  );

  useEffect(() => {
    void fetchRules();
  }, [fetchRules]);

  return { rules, isLoading, error, fetchRules, createRule, deleteRule };
}
