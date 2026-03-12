/**
 * GARIMPO IA™ — useOpportunities Hook
 *
 * LEI 3 ALSHAM: Dados 100% reais do Supabase.
 * LEI 5 ALSHAM: Retorna loading, error, e empty states.
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

  const fetchOpportunities = useCallback(
    async (page = 1) => {
      setState((prev) => ({ ...prev, status: 'loading', error: null }));

      try {
        let query = supabase
          .from('opportunities')
          .select('*', { count: 'exact' })
          .gte('score', mergedFilters.min_score)
          .lte('score', mergedFilters.max_score)
          .gte('roi_percentage', mergedFilters.min_roi)
          .order(mergedFilters.sort_by, {
            ascending: mergedFilters.sort_order === 'asc',
          })
          .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

        if (mergedFilters.categories.length > 0) {
          query = query.in('category', mergedFilters.categories);
        }

        if (mergedFilters.states.length > 0) {
          query = query.in('state', mergedFilters.states);
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
    [
      mergedFilters.min_score,
      mergedFilters.max_score,
      mergedFilters.min_roi,
      mergedFilters.sort_by,
      mergedFilters.sort_order,
      mergedFilters.categories,
      mergedFilters.states,
    ],
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
