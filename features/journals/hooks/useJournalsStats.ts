'use client';

import useSWR from 'swr';
import type { JournalsStats } from '../lib/types';

const statsFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch journals stats');
  }
  const data = await res.json();
  return (data.stats ?? null) as JournalsStats | null;
};

export function useJournalsStats() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<JournalsStats | null>(
    '/api/journals/stats',
    statsFetcher,
    {
      revalidateOnFocus: true,
    },
  );

  return {
    stats: data,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
