'use client';

import useSWR from 'swr';
import type { Journal } from '../lib/types';

const journalFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch journal');
  }
  const data = await res.json();
  return (data.journal ?? null) as Journal | null;
};

export function useJournal(id: number | null | undefined) {
  const url = id ? `/api/journals/${id}` : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<Journal | null>(
    url,
    journalFetcher,
    {
      revalidateOnFocus: true,
    },
  );

  return {
    journal: data,
    isLoading: Boolean(id) && isLoading,
    isValidating,
    error,
    mutate,
  };
}
