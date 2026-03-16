/**
 * GARIMPO IA™ — useOpportunity Hook
 * Busca UMA oportunidade por ID.
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

  const fetch = useCallback(async () => {
    if (!id) {
      setState({ data: null, status: 'error', error: 'ID inválido.' });
      return;
    }
    if (!supabase) {
      setState({ data: null, status: 'error', error: 'Supabase não configurado.' });
      return;
    }
    setState((p) => ({ ...p, status: 'loading', error: null }));
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      setState({ data: null, status: 'error', error: error.message });
    } else {
      setState({ data: data as Opportunity, status: 'success', error: null });
    }
  }, [id]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return {
    data: state.data,
    isLoading: state.status === 'loading' || state.status === 'idle',
    isError: state.status === 'error',
    error: state.error,
    refetch: fetch,
  };
}
