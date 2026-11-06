'use client';

import useSWR from 'swr';
import type { SearchFilter, SearchResults, SearchTab } from '../lib/types';

const fetcher = async (url: string): Promise<SearchResults> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch search results');
  }
  return res.json();
};

export interface UseSearchOptions {
  q?: string;
  filter?: SearchFilter;
  tab?: SearchTab;
}

export function useSearch(options: UseSearchOptions = {}) {
  const { q = '', filter = 'availables', tab = 'all' } = options;
  const params = new URLSearchParams();

  if (q.trim()) {
    params.set('q', q.trim());
  }
  if (filter) {
    params.set('filter', filter);
  }
  if (tab) {
    params.set('tab', tab);
  }

  const queryString = params.toString();
  const url = `/api/search${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<SearchResults>(
    url,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 1000,
      keepPreviousData: true,
    },
  );

  const results: SearchResults = data ?? {
    todos: [],
    frameworks: [],
    journals: [],
    counts: { all: 0, todos: 0, framework: 0, journals: 0 },
  };

  return {
    results,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
