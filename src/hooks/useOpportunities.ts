/**
 * GARIMPO IA™ — useOpportunities Hook
 *
 * LEI 3 ALSHAM: Dados 100% reais do Supabase.
 * LEI 5 ALSHAM: Retorna loading, error, e empty states.
 *
 * FIX: Dependency array usa JSON.stringify para evitar loop infinito
 *      quando categories/states são arrays novos a cada render.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type {
  Opportunity,
  AsyncState,
  FilterOptions,
  PaginatedResponse,
} from '@/types';

const DEFAULT_FILTERS: FilterOptions = {
  categories: [],
  states: [],
  min_score: 0,
  max_score: 100,
  min_roi: 0,
  sort_by: 'score',
  sort_order: 'desc',
};

const PAGE_SIZE = 20;

export function useOpportunities(filters: Partial<FilterOptions> = {}) {
  const [state, setState] = useState<AsyncState<PaginatedResponse<Opportunity>>>({
    data: null,
    status: 'idle',
    error: null,
  });

  const mergedFilters = { ...DEFAULT_FILTERS, ...filters };

  // Serializar filtros para evitar loop infinito com arrays novos a cada render
  const filtersKey = JSON.stringify(mergedFilters);

  const fetchOpportunities = useCallback(
    async (page = 1) => {
      const f: FilterOptions = JSON.parse(filtersKey) as FilterOptions;

      if (!supabase) {
        setState({
          data: { data: [], total: 0, page: 1, per_page: PAGE_SIZE, has_more: false },
          status: 'success',
          error: null,
        });
        return;
      }
      setState((prev) => ({ ...prev, status: 'loading', error: null }));

      try {
        let query = supabase
          .from('opportunities')
          .select('*', { count: 'exact' })
          .gte('score', f.min_score)
          .lte('score', f.max_score)
          .gte('roi_percentage', f.min_roi)
          .order(f.sort_by, { ascending: f.sort_order === 'asc' })
          .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

        if (f.categories.length > 0) {
          query = query.in('category', f.categories);
        }

        if (f.states.length > 0) {
          query = query.in('state', f.states);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        setState({
          data: {
            data: (data as Opportunity[]) ?? [],
            total: count ?? 0,
            page,
            per_page: PAGE_SIZE,
            has_more: (count ?? 0) > page * PAGE_SIZE,
          },
          status: 'success',
          error: null,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar oportunidades';
        setState({ data: null, status: 'error', error: message });
      }
    },
    [filtersKey], // string serializada — sem re-render loop
  );

  useEffect(() => {
    void fetchOpportunities(1);
  }, [fetchOpportunities]);

  return {
    ...state,
    refetch: fetchOpportunities,
    isLoading: state.status === 'loading',
    isEmpty: state.status === 'success' && (state.data?.data.length ?? 0) === 0,
    isError: state.status === 'error',
  };
}
