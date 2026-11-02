'use client';

import useSWR from 'swr';
import type { Journal, JournalCategory } from '../lib/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch journals');
  }
  const data = await res.json();
  return (data.journals ?? []) as Journal[];
};

export function useJournals(category?: JournalCategory | 'all' | string, tag?: string) {
  const params = new URLSearchParams();
  if (category && category !== 'all') {
    params.set('category', category);
  }
  if (tag && tag.toLowerCase() !== 'all') {
    params.set('tag', tag);
  }
  const queryString = params.toString();
  const url = `/api/journals${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<Journal[]>(url, fetcher, {
    revalidateOnFocus: true,
  });

  const journals = data ?? [];

  return {
    journals,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
