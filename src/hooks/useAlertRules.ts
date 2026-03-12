/**
 * GARIMPO IA™ — useAlertRules Hook
 *
 * Fetch and mutate alert rules for the current user. Phase 2.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useApp } from '@/contexts/AppContext';
import type { AlertRule, OpportunityCategory } from '@/types';

export interface CreateAlertRuleInput {
  min_score: number;
  categories: OpportunityCategory[];
  states: string[];
}

export function useAlertRules() {
  const { session } = useApp();
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user?.id;

  const fetchRules = useCallback(async () => {
    if (!supabase || !userId) {
      setRules([]);
      setStatus('success');
      return;
    }
    setStatus('loading');
    setError(null);
    try {
      const { data, error: e } = await supabase
        .from('alert_rules')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (e) throw e;
      setRules((data as AlertRule[]) ?? []);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar regras');
      setStatus('error');
    }
  }, [userId]);

  useEffect(() => {
    void fetchRules();
  }, [fetchRules]);

  const createRule = useCallback(
    async (input: CreateAlertRuleInput) => {
      if (!supabase || !userId) throw new Error('Faça login para criar alertas.');
      const { error: e } = await supabase.from('alert_rules').insert({
        user_id: userId,
        min_score: input.min_score,
        categories: input.categories,
        states: input.states,
      });
      if (e) throw e;
      await fetchRules();
    },
    [userId, fetchRules],
  );

  const deleteRule = useCallback(
    async (id: string) => {
      if (!supabase) return;
      const { error: e } = await supabase.from('alert_rules').delete().eq('id', id).eq('user_id', userId!);
      if (e) throw e;
      await fetchRules();
    },
    [userId, fetchRules],
  );

  return {
    rules,
    isLoading: status === 'loading',
    isError: status === 'error',
    error,
    refetch: fetchRules,
    createRule,
    deleteRule,
  };
}
