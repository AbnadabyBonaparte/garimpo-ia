/**
 * GARIMPO IA™ — useOpportunity Hook
 *
 * Fetch single opportunity by id. LEI 5: loading, error, not-found.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Opportunity, AsyncState } from '@/types';

export function useOpportunity(id: string | undefined) {
  const [state, setState] = useState<AsyncState<Opportunity>>({
    data: null,
    status: 'idle',
    error: null,
  });

  const fetchOpportunity = useCallback(async () => {
    if (!id) {
      setState({ data: null, status: 'error', error: 'ID não informado' });
      return;
    }
    if (!supabase) {
      setState({ data: null, status: 'success', error: null });
      return;
    }

    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setState({ data: null, status: 'error', error: 'Oportunidade não encontrada' });
          return;
        }
        throw error;
      }

      setState({ data: data as Opportunity, status: 'success', error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar oportunidade';
      setState({ data: null, status: 'error', error: message });
    }
  }, [id]);

  useEffect(() => {
    void fetchOpportunity();
  }, [fetchOpportunity]);

  return {
    ...state,
    refetch: fetchOpportunity,
    isLoading: state.status === 'loading',
    isError: state.status === 'error',
    isNotFound: state.status === 'error' && state.error === 'Oportunidade não encontrada',
  };
}
